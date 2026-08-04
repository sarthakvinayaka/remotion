import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { c, CHANNELS, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp } from "./motion";
import { SideTitle } from "./OopCodeScene";

/**
 * The diagram the script explicitly asked for: "a running diagram of
 * NotificationService with arrows to each notifier".
 *
 * Real SVG geometry, not text glyphs. The dispatch traces DRAW down each wire
 * just before that channel's line prints in the terminal, so the panel and the
 * terminal are cause and effect rather than two unrelated things on screen.
 *
 * `dispatchAt` are LOCAL frames (already offset by the caller) and come from
 * TERMINAL_FRAMES in oopTypingSchedule.ts -- no new timing anchors.
 *
 * `injected` flips the wiring for v4: instead of the service owning its
 * notifiers, they are passed IN, so the arrows reverse and a fourth node can
 * appear without the service changing.
 */

const W = 620;
const H = 470;
const TOP_W = 300;
const TOP_H = 82;
const TOP_X = (W - TOP_W) / 2;
const TOP_Y = 14;
const CH_W = 168;
const CH_H = 74;
const CH_Y = 330;
const CH_X = [10, 226, 442];

/** Cubic bezier from the service's bottom edge down to a child's top edge. */
const wirePath = (i: number) => {
  const sx = TOP_X + TOP_W / 2;
  const sy = TOP_Y + TOP_H;
  const tx = CH_X[i] + CH_W / 2;
  const ty = CH_Y;
  const midY = (sy + ty) / 2;
  return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
};

export const ServiceGraph: React.FC<{
  startAt: number;
  /** local frames at which each channel dispatches (drives the wire trace) */
  dispatchAt?: number[];
  /** v4: notifiers are injected INTO the service, so arrows reverse */
  injected?: boolean;
  /** v4_slack: a fourth notifier arrives without touching the service */
  slackAt?: number;
}> = ({ startAt, dispatchAt, injected = false, slackAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;

  const accent = injected ? c.hit : c.cool;
  const servicePulse = idlePulse(frame, 100, 0);
  const showSlack = slackAt !== undefined && frame >= slackAt - 10;
  const slackIn = slackAt !== undefined ? ease(frame, slackAt, fps, "ENTER") : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: panelIn }}>
      <SideTitle color={accent}>
        {injected ? "notifiers passed in" : "one call, three destinations"}
      </SideTitle>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <marker id="oopArrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill={c.panelLineBright} />
          </marker>
        </defs>

        {/* --- wires (base) --- */}
        {CHANNELS.map((_, i) => (
          <path
            key={`base-${i}`}
            d={wirePath(i)}
            fill="none"
            stroke={c.panelLineBright}
            strokeWidth={2}
            markerEnd={injected ? undefined : "url(#oopArrow)"}
            opacity={0.9}
          />
        ))}

        {/* --- dispatch traces: draw down the wire just before the terminal
                prints that channel's line --- */}
        {CHANNELS.map((_, i) => {
          const at = dispatchAt?.[i];
          if (at === undefined) return null;
          const draw = ramp(frame, at - 14, 14);
          if (draw <= 0) return null;
          const LEN = 420; // generous upper bound on path length
          return (
            <path
              key={`trace-${i}`}
              d={wirePath(i)}
              fill="none"
              stroke={c.hit}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={LEN}
              strokeDashoffset={LEN * (1 - draw)}
              opacity={0.95}
            />
          );
        })}

        {/* --- the service node --- */}
        <g>
          <rect
            x={TOP_X}
            y={TOP_Y}
            width={TOP_W}
            height={TOP_H}
            rx={14}
            fill={c.bgLift}
            stroke={`${accent}88`}
            strokeWidth={1.5}
            style={{ filter: `drop-shadow(0 10px 24px rgba(0,0,0,0.5))` }}
          />
          <text
            x={W / 2}
            y={TOP_Y + 34}
            textAnchor="middle"
            fill={accent}
            fontFamily={fonts.mono}
            fontSize={20}
            fontWeight={700}
          >
            NotificationService
          </text>
          <text
            x={W / 2}
            y={TOP_Y + 60}
            textAnchor="middle"
            fill={c.muted}
            fontFamily={fonts.mono}
            fontSize={16}
          >
            {injected ? "receives notifiers" : "notifiers[kind].send(...)"}
          </text>
          {/* breathing rim so the focal node never sits dead */}
          <rect
            x={TOP_X}
            y={TOP_Y}
            width={TOP_W}
            height={TOP_H}
            rx={14}
            fill="none"
            stroke={accent}
            strokeWidth={1.5}
            opacity={0.16 + servicePulse * 0.22}
          />
        </g>

        {/* --- the channel nodes --- */}
        {CHANNELS.map((ch, i) => {
          const nodeIn = ease(frame, startAt + 20 + i * 14, fps, "ENTER");
          const at = dispatchAt?.[i];
          const fired = at !== undefined && frame >= at;
          const flash = at !== undefined ? 1 - Math.min(1, Math.max(0, (frame - at) / 26)) : 0;
          const bob = idlePulse(frame, 200 + i * 23, i) * 2 - 1;
          const col = fired ? c.hit : accent;
          return (
            <g key={ch} opacity={nodeIn} transform={`translate(0, ${bob * 2})`}>
              <rect
                x={CH_X[i]}
                y={CH_Y}
                width={CH_W}
                height={CH_H}
                rx={12}
                fill={fired ? `${c.hit}18` : c.panel}
                stroke={`${col}${fired ? "AA" : "55"}`}
                strokeWidth={1.5}
                style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.45))" }}
              />
              {flash > 0 && (
                <rect
                  x={CH_X[i]}
                  y={CH_Y}
                  width={CH_W}
                  height={CH_H}
                  rx={12}
                  fill="none"
                  stroke={c.hit}
                  strokeWidth={2.5}
                  opacity={flash * 0.9}
                />
              )}
              <text
                x={CH_X[i] + CH_W / 2}
                y={CH_Y + 34}
                textAnchor="middle"
                fill={col}
                fontFamily={fonts.mono}
                fontSize={19}
                fontWeight={700}
              >
                {ch}
              </text>
              <text
                x={CH_X[i] + CH_W / 2}
                y={CH_Y + 56}
                textAnchor="middle"
                fill={c.muted}
                fontFamily={fonts.mono}
                fontSize={14}
              >
                send()
              </text>
            </g>
          );
        })}

        {/* --- v4: Slack arrives, and the service does not change --- */}
        {showSlack && (
          <g opacity={slackIn} transform={`translate(0, ${interpolate(slackIn, [0, 1], [26, 0])})`}>
            <path
              d={`M ${CH_X[2] + CH_W / 2 + 96} ${CH_Y + CH_H / 2} L ${TOP_X + TOP_W} ${TOP_Y + TOP_H / 2}`}
              fill="none"
              stroke={c.hit}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              opacity={0.75}
            />
            <rect
              x={CH_X[2] + 96}
              y={CH_Y + 96}
              width={CH_W}
              height={CH_H}
              rx={12}
              fill={`${c.hit}18`}
              stroke={c.hit}
              strokeWidth={2}
              style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}
            />
            <text
              x={CH_X[2] + 96 + CH_W / 2}
              y={CH_Y + 96 + 34}
              textAnchor="middle"
              fill={c.hit}
              fontFamily={fonts.mono}
              fontSize={19}
              fontWeight={700}
            >
              SLACK
            </text>
            <text
              x={CH_X[2] + 96 + CH_W / 2}
              y={CH_Y + 96 + 56}
              textAnchor="middle"
              fill={c.muted}
              fontFamily={fonts.mono}
              fontSize={14}
            >
              new — nothing else changed
            </text>
          </g>
        )}
      </svg>

      <div style={{ ...type.body, fontSize: 23, color: c.inkDim, textAlign: "center" }}>
        {injected ? (
          <>the service <span style={{ color: c.hit }}>never names</span> a notifier</>
        ) : (
          <>it just knows the thing <span style={{ color: c.hit }}>has send()</span></>
        )}
      </div>
    </div>
  );
};
