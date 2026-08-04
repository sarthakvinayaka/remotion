import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 6499. Local anchors (global - 6499):
 *    0 (6499) "And cheap Chinese AI models have gotten pretty good"
 *   87 (6586) "One Berkeley professor said the gap used to be around
 *              six to nine months behind, and it's now closer to two or three"
 *  273 (6772) "You can see people moving too"
 *  331 (6830) "on one platform where developers pick between models,
 *              Chinese models went from about eleven percent of usage
 *              to sitting above thirty, sometimes hitting forty six"
 *  573 (7072) "So looking at the price cut again, the cheap high volume model
 *              got slashed eighty percent, and the expensive flagship got nothing"
 *  845 (7344) "Nobody's really threatening the flagship, the competition is
 *              at the cheap end, so that's where they defended"
 *
 * The usage curve is a hand-authored illustration of the figures stated in
 * narration (11% -> 30%+, peaking 46%) -- the shape between those anchor
 * points is drawn, not sampled from the real platform series.
 */

const GAP_AT = 87;
const MOVING_AT = 331;
const PRICE_RECALL_AT = 573;
const DEFENDED_AT = 845;

// anchor points stated out loud; intermediate shape is illustrative
const SERIES = [11, 14, 19, 24, 28, 33, 46, 38, 34];
const PEAK_INDEX = 6;

const Chart: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const reveal = ramp(frame, MOVING_AT, 90);
  const shown = reveal * (SERIES.length - 1);
  const W = 1420;
  const H = 430;
  const maxV = 50;

  const pts = SERIES.map((v, i) => ({
    x: (i / (SERIES.length - 1)) * W,
    y: H - (v / maxV) * H,
    v,
  }));

  const visible = pts.filter((_, i) => i <= shown);
  const path = visible.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = visible.length > 1 ? `${path} L${visible[visible.length - 1].x},${H} L0,${H} Z` : "";

  const head = visible[visible.length - 1];
  const pulse = idlePulse(frame, 70, 2);
  const peakReached = shown >= PEAK_INDEX;

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        {/* gridlines -- drawn only as far as the reveal has progressed, so the
            axis never extends past the line and read as a clipped graphic */}
        {[0, 25, 50].map((g) => (
          <g key={g}>
            <line x1={0} x2={head ? head.x : 0} y1={H - (g / maxV) * H} y2={H - (g / maxV) * H} stroke={c.panelLine} strokeWidth={1} />
            <text x={-14} y={H - (g / maxV) * H + 6} fill={c.inkDim} fontSize={22} fontFamily={fonts.mono} textAnchor="end">
              {g}%
            </text>
          </g>
        ))}

        {areaPath && <path d={areaPath} fill={`${c.rival}1A`} />}
        {path && <path d={path} fill="none" stroke={c.rival} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />}

        {/* peak marker at 46% -- the number spoken out loud */}
        {peakReached && (
          <g>
            <circle cx={pts[PEAK_INDEX].x} cy={pts[PEAK_INDEX].y} r={7 + pulse * 3} fill={c.rival} opacity={0.9} />
            <text
              x={pts[PEAK_INDEX].x}
              y={pts[PEAK_INDEX].y - 22}
              fill={c.rival}
              fontSize={30}
              fontWeight={700}
              fontFamily={fonts.display}
              textAnchor="middle"
            >
              46%
            </text>
          </g>
        )}

        {/* live head of the line */}
        {head && (
          <circle cx={head.x} cy={head.y} r={6} fill={c.rival} stroke={c.bg} strokeWidth={2} />
        )}
      </svg>

      {/* start / end labels */}
      <div style={{ position: "absolute", left: 0, bottom: -40, ...type.meta, color: c.muted }}>~11% OF USAGE</div>
      {shown >= SERIES.length - 1.5 && (
        <div style={{ position: "absolute", right: 0, bottom: -40, ...type.meta, color: c.rival }}>ABOVE 30%</div>
      )}
    </div>
  );
};

export const CompetitionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const gapIn = ease(frame, GAP_AT, fps, "SETTLE");
  const toChart = ramp(frame, MOVING_AT - 40, 24);
  const toRecall = ramp(frame, PRICE_RECALL_AT, 26);
  const defendedIn = ease(frame, DEFENDED_AT, fps, "SLOW");

  // The gap closing from "six to nine months" to "two or three".
  // Deliberately a DISCRETE swap, not an interpolated counter: a decimal
  // ticking through 6.3 / 3.8 shows numbers the script never states, and
  // contradicts the narration while it animates.
  const gapShrink = ramp(frame, GAP_AT + 60, 60);
  const gapClosed = gapShrink > 0.5;

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.rival} />
      <AmbientGlow color={c.rival} seed={9} />

      <Scene chip="the competition" chipColor={c.rival}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          {toRecall < 0.5 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, opacity: 1 - toRecall * 2 }}>
              {toChart < 0.5 ? (
                <>
                  <Sub style={{ opacity: introIn }}>
                    Cheap <span style={{ color: c.rival }}>Chinese models</span> have gotten good
                  </Sub>
                  {/* the closing gap -- only the two figures the script
                      actually states, swapped discretely */}
                  <div style={{ opacity: gapIn, display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
                    <div style={{ ...type.meta, color: c.muted }}>HOW FAR BEHIND THE FRONTIER</div>
                    <div style={{ display: "flex", alignItems: "center", gap: space.lg }}>
                      <div
                        style={{
                          fontFamily: fonts.display,
                          fontSize: 96,
                          fontWeight: 700,
                          color: gapClosed ? c.muted : c.rival,
                          letterSpacing: -2,
                          textDecoration: gapClosed ? "line-through" : "none",
                          opacity: gapClosed ? 0.5 : 1,
                        }}
                      >
                        6–9
                      </div>
                      {gapClosed && (
                        <>
                          <div style={{ ...type.sub, color: c.muted }}>→</div>
                          <div
                            style={{
                              fontFamily: fonts.display,
                              fontSize: 120,
                              fontWeight: 700,
                              color: c.rival,
                              letterSpacing: -2,
                              textShadow: `0 0 40px ${c.rival}44`,
                            }}
                          >
                            2–3
                          </div>
                        </>
                      )}
                      <div style={{ ...type.sub, color: c.inkDim, alignSelf: "flex-end", paddingBottom: 14 }}>
                        months
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.xl, opacity: toChart }}>
                  <Sub>
                    Share of usage on one developer platform
                  </Sub>
                  <Chart frame={frame} fps={fps} />
                </div>
              )}
            </div>
          ) : (
            /* the editorial payoff: they defended the cheap end */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, opacity: toRecall }}>
              <Sub>Look at the price cut again</Sub>
              <div style={{ display: "flex", gap: space.lg }}>
                {[
                  { name: "Luna", note: "cheap, high volume", cut: "−80%", color: c.luna, focal: true },
                  { name: "Sol", note: "expensive flagship", cut: "nothing", color: c.muted, focal: false },
                ].map((m, i) => {
                  const mIn = ease(frame, PRICE_RECALL_AT + i * 26, fps, "SETTLE");
                  const pulse = idlePulse(frame, 86, i);
                  return (
                    <div
                      key={m.name}
                      style={{
                        opacity: mIn,
                        transform: `translateY(${interpolate(mIn, [0, 1], [20, 0])}px) scale(${m.focal ? 1 + pulse * 0.01 : 1})`,
                        width: 460,
                        padding: space.lg,
                        borderRadius: radius.lg,
                        background: m.focal ? c.bgLift : c.panel,
                        border: `1.5px solid ${m.color}${m.focal ? "77" : "33"}`,
                        boxShadow: m.focal
                          ? `0 12px 44px rgba(0,0,0,0.5), 0 0 ${22 + pulse * 22}px ${m.color}22`
                          : "0 8px 24px rgba(0,0,0,0.35)",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ ...type.sub, fontSize: 40, color: m.color }}>{m.name}</div>
                      <div style={{ ...type.meta, color: c.muted, marginTop: 4 }}>{m.note}</div>
                      <div
                        style={{
                          marginTop: space.sm,
                          fontFamily: fonts.display,
                          fontSize: 62,
                          fontWeight: 700,
                          color: m.focal ? c.cheap : c.muted,
                        }}
                      >
                        {m.cut}
                      </div>
                    </div>
                  );
                })}
              </div>

              {defendedIn > 0.02 && (
                <div
                  style={{
                    opacity: defendedIn,
                    transform: `translateY(${interpolate(defendedIn, [0, 1], [16, 0])}px)`,
                    ...type.body,
                    fontSize: 34,
                    color: c.ink,
                    textAlign: "center",
                    maxWidth: 1150,
                  }}
                >
                  Nobody's threatening the flagship. The competition is at the
                  <span style={{ color: c.rival }}> cheap end</span> — so that's where they defended.
                </div>
              )}
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
