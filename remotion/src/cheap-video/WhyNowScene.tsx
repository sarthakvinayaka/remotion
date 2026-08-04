import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 5885. Local anchors (global - 5885):
 *    0 (5885) "That's the how, but I don't think it's the whole story"
 *   80 (5965) "Because getting cheaper to run doesn't force you to charge less"
 *  165 (6050) "You could keep the extra money"
 *  219 (6104) "They cut prices because they're under pressure"
 *  304 (6189) "Companies have gotten nervous about AI bills"
 *  377 (6262) "Uber apparently burned through its entire yearly AI budget
 *              in four months"
 *  500 (6385) "Amazon's engineering side started capping spending after going over"
 *
 * This is the editorial turn the script explicitly protects: efficiency
 * created the OPTION, competition created the DECISION. The two are held
 * apart visually rather than shown as cause and effect.
 */

const CHOICE_AT = 80;
const KEEP_AT = 165;
const PRESSURE_AT = 219;
const UBER_AT = 377;
const AMAZON_AT = 500;

export const WhyNowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const choiceIn = ramp(frame, CHOICE_AT, 22);
  const keepIn = ease(frame, KEEP_AT, fps, "SETTLE");
  const pressureIn = ramp(frame, PRESSURE_AT, 24);
  const uberIn = ease(frame, UBER_AT, fps, "SETTLE");
  const amazonIn = ease(frame, AMAZON_AT, fps, "SETTLE");

  const pulse = idlePulse(frame, 92, 1);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.expensive} />
      <AmbientGlow color={c.expensive} seed={8} />

      <Scene chip="but why now" chipColor={c.expensive}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            Getting cheaper to run doesn't <span style={{ color: c.accent }}>force</span> you to charge less
          </Sub>

          {/* the fork: keep the money, or cut the price */}
          {choiceIn > 0.05 && pressureIn < 0.6 && (
            <div style={{ display: "flex", gap: space.lg, opacity: choiceIn * (1 - pressureIn) }}>
              {[
                { label: "Keep the extra margin", color: c.muted, at: KEEP_AT },
                { label: "Cut the price", color: c.cheap, at: KEEP_AT + 20 },
              ].map((o) => {
                const oIn = ease(frame, o.at, fps, "SETTLE");
                return (
                  <div
                    key={o.label}
                    style={{
                      opacity: oIn,
                      transform: `translateY(${interpolate(oIn, [0, 1], [16, 0])}px)`,
                      padding: "20px 38px",
                      borderRadius: radius.lg,
                      background: c.panel,
                      border: `1.5px solid ${o.color}55`,
                      ...type.sub,
                      fontSize: 34,
                      color: o.color,
                    }}
                  >
                    {o.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* the real reason: pressure */}
          {pressureIn > 0.05 && (
            <div
              style={{
                opacity: pressureIn,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: space.lg,
              }}
            >
              <div
                style={{
                  ...type.sub,
                  fontSize: 52,
                  color: c.ink,
                  transform: `scale(${1 + pulse * 0.006})`,
                }}
              >
                They cut because they're <span style={{ color: c.expensive }}>under pressure</span>
              </div>

              {/* real reported enterprise cost pain */}
              <div style={{ display: "flex", gap: space.md }}>
                {[
                  {
                    who: "Uber",
                    what: "burned its entire yearly AI budget",
                    when: "in four months",
                    at: UBER_AT,
                    fill: 1,
                  },
                  {
                    who: "Amazon",
                    what: "engineering started capping spend",
                    when: "after going over",
                    at: AMAZON_AT,
                    fill: 0.82,
                  },
                ].map((x, i) => {
                  const xIn = i === 0 ? uberIn : amazonIn;
                  const burn = ramp(frame, x.at + 10, 40) * x.fill;
                  return (
                    <div
                      key={x.who}
                      style={{
                        opacity: xIn,
                        transform: `translateY(${interpolate(xIn, [0, 1], [18, 0])}px)`,
                        width: 700,
                        padding: space.lg,
                        borderRadius: radius.lg,
                        background: c.panel,
                        border: `1.5px solid ${c.expensive}44`,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                      }}
                    >
                      <div style={{ ...type.sub, color: c.expensive, textAlign: "left" }}>{x.who}</div>
                      <div style={{ ...type.body, color: c.inkDim, textAlign: "left", marginTop: 6 }}>
                        {x.what}
                      </div>
                      {/* budget burning down */}
                      <div
                        style={{
                          marginTop: space.sm,
                          height: 12,
                          borderRadius: radius.pill,
                          background: `${c.muted}22`,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${burn * 100}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, ${c.accent}, ${c.expensive})`,
                          }}
                        />
                      </div>
                      <div style={{ ...type.meta, color: c.muted, marginTop: space.xs }}>{x.when}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
