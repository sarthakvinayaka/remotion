import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type, VERSIONS } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 5793. Local = global - 5793.
 *    0 (5793) "So let's line up all four with the same question"
 *   73 (5866) "What does it take to add Slack?"
 *  139 (5932) "Version one. You edit the function itself..."
 *  310 (6103) "Version two. Three separate edits..."
 *  467 (6260) "Version three. Two edits..."
 *  612 (6405) "Version four. One edit. Write the class. That's it."
 *  718 (6511) "But the number of edits isn't really the point"
 *
 * This is the script's own suggested visual: four columns lighting up red for
 * "modified existing code" and green for "only added new code". Every value
 * comes from VERSIONS in theme.ts, which mirrors the script's verified table.
 */

const QUESTION_AT = 73;
const V_AT = [139, 310, 467, 612];
const NOT_THE_POINT_AT = 718;

export const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const questionIn = ease(frame, QUESTION_AT, fps, "SETTLE");
  const pointIn = ease(frame, NOT_THE_POINT_AT, fps, "SLOW");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={pointIn > 0.4 ? c.hit : c.accent} seed={6} />

      <Scene chip="the comparison" chipColor={c.accent}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            What does it take to add <span style={{ color: c.accent }}>Slack</span>?
          </Sub>

          <div style={{ display: "flex", gap: space.md, width: "100%", maxWidth: 1620, opacity: questionIn }}>
            {VERSIONS.map((v, i) => {
              const vIn = ease(frame, V_AT[i], fps, "ENTER");
              const color = v.modified ? c.noise : c.hit;
              const focal = frame >= V_AT[i] && frame < (V_AT[i + 1] ?? NOT_THE_POINT_AT);
              const pulse = idlePulse(frame, 86, i);
              // the verdict is the payoff -- it must land, not pre-spoil
              const verdict = ease(frame, V_AT[i] + 34, fps, "ENTER");
              const flare = 1 - Math.min(1, Math.max(0, (frame - (V_AT[i] + 34)) / 18));
              return (
                <div
                  key={v.n}
                  style={{
                    flex: 1,
                    opacity: vIn,
                    transform: `translateY(${interpolate(vIn, [0, 1], [24, 0])}px) scale(${focal ? 1 + pulse * 0.012 : 1})`,
                    padding: space.md,
                    borderRadius: radius.lg,
                    ...surface(color, focal),
                    boxShadow: focal
                      ? `inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 44px rgba(0,0,0,0.55), 0 0 ${16 + pulse * 20}px ${color}2A`
                      : "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)",
                    minHeight: 430,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: space.sm,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: fonts.display, fontSize: 62, fontWeight: 700, color, lineHeight: 1 }}>
                    v{v.n}
                  </div>
                  <div style={{ ...type.meta, color: c.muted }}>{v.label}</div>

                  <div style={{ flex: 1 }} />

                  <div style={{ ...type.body, fontSize: 22, color: c.inkDim, minHeight: 62 }}>{v.edits}</div>

                  {/* the verdict that actually matters */}
                  <div
                    style={{
                      width: "100%",
                      opacity: verdict,
                      transform: `scale(${interpolate(verdict, [0, 1], [1.15, 1])})`,
                      padding: "12px 8px",
                      borderRadius: radius.md,
                      background: v.modified ? `${c.noise}1F` : `${c.hit}1F`,
                      border: `1.5px solid ${color}66`,
                      boxShadow: flare > 0 ? `0 0 0 ${flare * 18}px ${color}00, 0 0 ${flare * 26}px ${color}55` : "none",
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      fontSize: 25,
                      color,
                      lineHeight: 1.15,
                    }}
                  >
                    {v.modified ? "MODIFIED" : "ONLY ADDED"}
                    <div style={{ ...type.meta, color: c.muted, fontSize: 17, marginTop: 3 }}>
                      {v.modified ? "existing code" : "new code"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pointIn > 0.02 && (
            <div
              style={{
                opacity: pointIn,
                transform: `translateY(${interpolate(pointIn, [0, 1], [18, 0])}px)`,
                ...type.body,
                fontSize: 32,
                color: c.ink,
                textAlign: "center",
              }}
            >
              The count isn't the point — <span style={{ color: c.accent }}>which code you had to open</span> is.
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
