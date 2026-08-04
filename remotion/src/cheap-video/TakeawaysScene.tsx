import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 7516. Local anchors (global - 7516):
 *    0 (7516) "Two takeaways"
 *   40 (7556) "The practical one"
 *   73 (7589) "If you build anything with AI, especially where one task
 *              quietly triggers dozens of AI calls behind the scenes"
 *  214 (7730) "a bunch of ideas that were too expensive last month
 *              are now affordable"
 *
 * The fan-out illustration shows one user task expanding into many
 * background calls -- hand-authored, sized to the point being made.
 */

const PRACTICAL_AT = 40;
const FANOUT_AT = 73;
const AFFORDABLE_AT = 214;

const CALLS = 12;

export const TakeawaysScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const practicalIn = ease(frame, PRACTICAL_AT, fps, "SETTLE");
  const fanIn = ramp(frame, FANOUT_AT, 30);
  const affordableIn = ease(frame, AFFORDABLE_AT, fps, "SLOW");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.cool} />
      <AmbientGlow color={affordableIn > 0.4 ? c.cheap : c.cool} seed={10} />

      <Scene chip="takeaway 1 · practical" chipColor={c.cool}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            One task quietly triggers <span style={{ color: c.cool }}>dozens of AI calls</span>
          </Sub>

          {/* one task fanning out into many background calls */}
          <div style={{ display: "flex", alignItems: "center", gap: space.xl, opacity: practicalIn }}>
            <div
              style={{
                padding: "20px 34px",
                borderRadius: radius.lg,
                background: c.bgLift,
                border: `1.5px solid ${c.ink}44`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                ...type.sub,
                fontSize: 32,
                color: c.ink,
              }}
            >
              one user task
            </div>

            <div style={{ ...type.sub, fontSize: 40, color: c.muted }}>→</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: space.sm,
              }}
            >
              {Array.from({ length: CALLS }).map((_, i) => {
                const callIn = ease(frame, FANOUT_AT + i * 6, fps, "ENTER");
                const pulse = idlePulse(frame, 76, i);
                const cheapNow = affordableIn > 0.4;
                const color = cheapNow ? c.cheap : c.cool;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: callIn,
                      transform: `scale(${interpolate(callIn, [0, 1], [0.6, 1])})`,
                      width: 104,
                      height: 66,
                      borderRadius: radius.sm,
                      background: `${color}1A`,
                      border: `1px solid ${color}66`,
                      boxShadow: `0 0 ${6 + pulse * 10}px ${color}1A`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: fonts.mono,
                      fontSize: 19,
                      color,
                    }}
                  >
                    call
                  </div>
                );
              })}
            </div>
          </div>

          {affordableIn > 0.02 && (
            <div
              style={{
                opacity: affordableIn,
                transform: `translateY(${interpolate(affordableIn, [0, 1], [18, 0])}px)`,
                padding: "16px 40px",
                borderRadius: radius.pill,
                background: `${c.cheap}12`,
                border: `1.5px solid ${c.cheap}55`,
                boxShadow: `0 0 ${20 + idlePulse(frame, 90, 4) * 20}px ${c.cheap}22`,
                ...type.sub,
                fontSize: 38,
                color: c.cheap,
              }}
            >
              Ideas that were too expensive last month are now affordable
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
