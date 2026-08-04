import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 7918. Local anchors (global - 7918):
 *    0 (7918) "This is the first time we've publicly seen an AI rewrite
 *              the code that runs itself, have that checked and approved,
 *              and show up in what customers actually pay"
 *  265 (8183) "OpenAI's engineers described it as a loop"
 *  355 (8273) "better models make their own infrastructure cheaper,
 *              which pays for the next round of better models"
 *  489 (8407) "If that loop holds, prices don't only drop when new chips show up
 *              or when humans get around to optimizing things"
 *  705 (8623) "They also drop when the AI gets good enough to optimize itself"
 *
 * This is the thesis of the video, so the loop IS the visual: a real
 * circulating cycle, sized to the frame, with a token travelling it.
 */

const LOOP_AT = 265;
const CYCLE_AT = 355;
const CHIPS_AT = 489;
const ITSELF_AT = 705;

const NODES = [
  { label: "better models", color: c.violet },
  { label: "cheaper infrastructure", color: c.cool },
  { label: "pays for the next round", color: c.cheap },
];

const R = 300;
const CX = 0;
const CY = 0;

const nodePos = (i: number) => {
  // start at top, go clockwise. Labels sit slightly OUTSIDE the ring so the
  // two lower nodes don't collide across the bottom of the circle.
  const a = -Math.PI / 2 + (i / NODES.length) * Math.PI * 2;
  const rLabel = R + 44;
  return { x: CX + Math.cos(a) * rLabel, y: CY + Math.sin(a) * rLabel, angle: a };
};

export const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const toLoop = ramp(frame, LOOP_AT, 26);
  const cycleIn = ramp(frame, CYCLE_AT, 24);
  const chipsIn = ease(frame, CHIPS_AT, fps, "SETTLE");
  const itselfIn = ease(frame, ITSELF_AT, fps, "SLOW");

  // the travelling token -- keeps circulating so the thesis never sits still
  const travelStart = CYCLE_AT;
  const period = 150;
  const t = frame > travelStart ? ((frame - travelStart) % period) / period : 0;
  const tokenAngle = -Math.PI / 2 + t * Math.PI * 2;
  const tokenX = Math.cos(tokenAngle) * R;
  const tokenY = Math.sin(tokenAngle) * R;
  const activeNode = Math.floor(t * NODES.length);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.violet} speed={0.2} />
      <AmbientGlow color={c.violet} seed={11} />

      <Scene chip="takeaway 2 · the loop" chipColor={c.violet}>
        {toLoop < 0.5 ? (
          <div style={{ opacity: 1 - toLoop * 2, display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
            <Sub style={{ opacity: introIn, fontSize: 52 }}>
              First time we've publicly seen an AI
              <br />
              <span style={{ color: c.violet }}>rewrite the code that runs itself</span>
            </Sub>
            <div style={{ ...type.body, color: c.inkDim, opacity: ease(frame, 120, fps, "SETTLE") }}>
              …have it checked and approved, and show up in what customers pay.
            </div>
          </div>
        ) : (
          <div style={{ opacity: toLoop, display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
            <Sub>
              Their engineers described it as a <span style={{ color: c.violet }}>loop</span>
            </Sub>

            {/* The loop fills the frame while it is the only thing on screen.
                Once the closing chips + payoff line appear beneath it, the
                ring scales down to make room -- otherwise the stack overflows
                into the caption safe area. */}
            <div
              style={{
                position: "relative",
                width: 900,
                height: 700,
                opacity: cycleIn,
                marginBottom: -40,
              }}
            >
              <svg
                width={900}
                height={700}
                viewBox="-450 -350 900 700"
                style={{ position: "absolute", inset: 0, overflow: "visible" }}
              >
                {/* the ring */}
                <circle cx={0} cy={0} r={R} fill="none" stroke={c.panelLineBright} strokeWidth={2} />
                {/* the energised arc following the token */}
                <circle
                  cx={0}
                  cy={0}
                  r={R}
                  fill="none"
                  stroke={c.violet}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * R * 0.16} ${2 * Math.PI * R}`}
                  strokeDashoffset={-(t * 2 * Math.PI * R)}
                  transform="rotate(-90)"
                  opacity={0.9}
                />
                {/* travelling token */}
                <circle cx={tokenX} cy={tokenY} r={11} fill={c.violet} />
                <circle cx={tokenX} cy={tokenY} r={11 + idlePulse(frame, 40, 0) * 9} fill={c.violet} opacity={0.25} />
              </svg>

              {/* nodes sit on the ring, wrapping their own labels */}
              {NODES.map((n, i) => {
                const p = nodePos(i);
                const nIn = ease(frame, CYCLE_AT + i * 18, fps, "ENTER");
                const isActive = activeNode === i && frame > travelStart;
                const pulse = idlePulse(frame, 84, i);
                return (
                  <div
                    key={n.label}
                    style={{
                      position: "absolute",
                      left: 450 + p.x,
                      top: 350 + p.y,
                      transform: `translate(-50%, -50%) scale(${interpolate(nIn, [0, 1], [0.8, 1]) * (isActive ? 1 + pulse * 0.02 : 1)})`,
                      opacity: nIn,
                      padding: "14px 22px",
                      borderRadius: radius.lg,
                      background: isActive ? c.bgLift : c.panel,
                      border: `1.5px solid ${n.color}${isActive ? "88" : "44"}`,
                      boxShadow: isActive
                        ? `0 12px 40px rgba(0,0,0,0.5), 0 0 ${20 + pulse * 22}px ${n.color}33`
                        : "0 8px 24px rgba(0,0,0,0.4)",
                      color: n.color,
                      fontFamily: fonts.display,
                      fontSize: 32,
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: 260,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.label}
                  </div>
                );
              })}
            {/* What changes if the loop holds. These live INSIDE the ring --
                the circle's interior is otherwise empty, and stacking them
                below the ring pushed the payoff line into the caption. */}
            {chipsIn > 0.02 && (
              <div
                style={{
                  position: "absolute",
                  left: 450,
                  top: 350,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: space.md,
                  opacity: chipsIn,
                  width: 470,
                }}
              >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: space.sm }}>
                {[
                  { label: "new chips", struck: true },
                  { label: "humans optimising", struck: true },
                  { label: "the AI optimising itself", struck: false },
                ].map((x, i) => {
                  const xIn = ease(frame, (x.struck ? CHIPS_AT : ITSELF_AT) + i * 14, fps, "SETTLE");
                  const color = x.struck ? c.muted : c.cheap;
                  return (
                    <div
                      key={x.label}
                      style={{
                        opacity: xIn,
                        transform: `translateY(${interpolate(xIn, [0, 1], [12, 0])}px)`,
                        padding: "10px 22px",
                        borderRadius: radius.pill,
                        border: `1px solid ${color}55`,
                        background: `${color}12`,
                        color,
                        fontFamily: fonts.body,
                        fontSize: 24,
                        fontWeight: 600,
                        textDecoration: x.struck ? "line-through" : "none",
                        boxShadow: x.struck ? "none" : `0 0 ${14 + idlePulse(frame, 88, 5) * 16}px ${color}22`,
                      }}
                    >
                      {x.label}
                    </div>
                  );
                })}
              </div>

                {itselfIn > 0.02 && (
                  <div style={{ opacity: itselfIn, ...type.body, fontSize: 30, color: c.ink, textAlign: "center" }}>
                    Prices also drop when the AI gets good enough to
                    <span style={{ color: c.cheap }}> optimise itself</span>.
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
