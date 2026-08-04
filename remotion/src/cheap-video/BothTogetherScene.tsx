import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 5410. Local anchors (global - 5410):
 *    0 (5410) "And those two fixes matter more together than separately"
 *  102 (5512) "One made each round of thinking cheaper,
 *              the other made it need fewer rounds"
 *  219 (5629) "So you're paying less per step, and taking fewer steps"
 *  340 (5750) "That adds up"
 *  374 (5784) "And that's where the room came from to cut the price"
 *
 * The step grid is an illustration of the compounding effect, not a
 * measured benchmark -- the two published figures (20% cheaper kernels,
 * 15% better guesser) are stated separately and not multiplied on screen.
 */

const TWO_FIXES_AT = 102;
const MULTIPLY_AT = 219;
const ADDS_UP_AT = 340;
const ROOM_AT = 374;

const COLS = 10;
const ROWS = 4;

export const BothTogetherScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const fixesIn = ramp(frame, TWO_FIXES_AT, 22);
  const shrinkIn = ramp(frame, MULTIPLY_AT, 40);
  const roomIn = ease(frame, ROOM_AT, fps, "SLOW");

  // "less per step" -> each cell shrinks; "fewer steps" -> columns drop away
  const perStepScale = interpolate(shrinkIn, [0, 1], [1, 0.62]);
  const keptCols = Math.max(4, Math.round(COLS - shrinkIn * (COLS - 5)));

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.cheap} />
      <AmbientGlow color={c.cheap} seed={7} />

      <Scene chip="the two fixes compound" chipColor={c.cheap}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            The two fixes matter more <span style={{ color: c.cheap }}>together</span>
          </Sub>

          {/* the two labelled axes of the saving */}
          <div style={{ display: "flex", gap: space.xl, opacity: fixesIn }}>
            {[
              { label: "less per step", sub: "cheaper kernels", color: c.cool },
              { label: "fewer steps", sub: "better guessing", color: c.violet },
            ].map((x, i) => {
              const xIn = ease(frame, TWO_FIXES_AT + i * 22, fps, "SETTLE");
              const pulse = idlePulse(frame, 88, i);
              return (
                <div
                  key={x.label}
                  style={{
                    opacity: xIn,
                    transform: `translateY(${interpolate(xIn, [0, 1], [16, 0])}px) scale(${1 + pulse * 0.008})`,
                    padding: "14px 30px",
                    borderRadius: radius.lg,
                    background: c.panel,
                    border: `1.5px solid ${x.color}55`,
                    boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 ${16 + pulse * 16}px ${x.color}1A`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ ...type.sub, fontSize: 36, color: x.color }}>{x.label}</div>
                  <div style={{ ...type.meta, color: c.muted }}>{x.sub}</div>
                </div>
              );
            })}
          </div>

          {/* the work grid: cells get smaller AND there are fewer of them */}
          <div
            style={{
              display: "flex",
              gap: 11,
              alignItems: "flex-end",
              height: 330,
              opacity: fixesIn,
            }}
          >
            {Array.from({ length: COLS }).map((_, col) => {
              const dropped = col >= keptCols;
              const dropIn = dropped ? shrinkIn : 0;
              return (
                <div
                  key={col}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 11,
                    opacity: dropped ? 1 - dropIn : 1,
                    transform: `translateY(${dropped ? dropIn * 40 : 0}px)`,
                  }}
                >
                  {Array.from({ length: ROWS }).map((_, row) => {
                    const size = 74 * (dropped ? 1 : perStepScale);
                    const pulse = idlePulse(frame, 110, col * ROWS + row);
                    return (
                      <div
                        key={row}
                        style={{
                          width: size,
                          height: size,
                          borderRadius: radius.sm,
                          background: dropped ? `${c.muted}22` : `${c.cheap}${shrinkIn > 0.5 ? "44" : "26"}`,
                          border: `1px solid ${dropped ? `${c.muted}44` : `${c.cheap}66`}`,
                          boxShadow: dropped ? "none" : `0 0 ${6 + pulse * 8}px ${c.cheap}18`,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div style={{ ...type.body, color: c.inkDim, opacity: ease(frame, ADDS_UP_AT, fps, "SETTLE") }}>
            Paying less per step, and taking fewer steps.
          </div>

          {roomIn > 0.02 && (
            <div
              style={{
                opacity: roomIn,
                transform: `translateY(${interpolate(roomIn, [0, 1], [16, 0])}px)`,
                ...type.sub,
                color: c.ink,
                textAlign: "center",
              }}
            >
              That's where the <span style={{ color: c.accent }}>room to cut the price</span> came from
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
