import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Hero, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 7390. Local = global - 7390.
 *    0 (7390) "Now a caveat, because I don't want to oversell this"
 *   51 (7441) "Version four is not always the right answer"
 *  165 (7555) "If you have two notification types and you're never adding more,
 *              version one is genuinely fine"
 *  328 (7718) "All of this structure has a cost"
 *  390 (7780) "More files, more indirection, more to hold in your head"
 *  497 (7887) "The reason to add it is that you know change is coming"
 *  593 (7983) "So the honest rule is: don't apply patterns because they're correct"
 *  718 (8108) "Apply them when the pain shows up"
 *  775 (8165) "Write version one. When adding a feature starts feeling
 *              dangerous, that's your signal to move"
 *
 * The script's note: KEEP THIS. Ending on "v4 is not always right" is what
 * makes the video credible instead of dogmatic.
 */

const NOT_ALWAYS_AT = 51;
const COST_AT = 328;
const COSTS_AT = 390;
const RULE_AT = 593;
const PAIN_AT = 718;

const COSTS = ["more files", "more indirection", "more to hold in your head"];

export const CaveatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const notAlwaysIn = ease(frame, NOT_ALWAYS_AT, fps, "SETTLE");
  const costIn = ease(frame, COST_AT, fps, "SETTLE");
  const painIn = ease(frame, PAIN_AT, fps, "SLOW");
  const toRule = ramp(frame, RULE_AT, 26);
  const pulse = idlePulse(frame, 88, 4);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={c.accent} seed={8} />

      <Scene chip="the honest caveat" chipColor={c.accent}>
        {toRule < 0.5 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%", opacity: 1 - toRule * 2 }}>
            <Sub style={{ opacity: introIn }}>
              Version 4 is <span style={{ color: c.accent }}>not always</span> the right answer
            </Sub>

            {notAlwaysIn > 0.02 && (
              <div
                style={{
                  opacity: notAlwaysIn,
                  transform: `translateY(${interpolate(notAlwaysIn, [0, 1], [16, 0])}px)`,
                  padding: `${space.md}px ${space.lg}px`,
                  borderRadius: radius.lg,
                  ...surface(c.hit, true),
                  textAlign: "center",
                }}
              >
                <div style={{ ...type.body, fontSize: 30, color: c.ink }}>
                  Two types and never adding more?
                </div>
                <div style={{ ...type.sub, fontSize: 38, color: c.hit, marginTop: 6 }}>
                  Version 1 is genuinely fine
                </div>
              </div>
            )}

            {costIn > 0.02 && (
              <div style={{ opacity: costIn, display: "flex", flexDirection: "column", alignItems: "center", gap: space.sm }}>
                <div style={{ ...type.meta, color: c.noise }}>STRUCTURE HAS A COST</div>
                <div style={{ display: "flex", gap: space.sm, flexWrap: "wrap", justifyContent: "center" }}>
                  {COSTS.map((x, i) => {
                    const xIn = ease(frame, COSTS_AT + i * 30, fps, "SETTLE");
                    return (
                      <div
                        key={x}
                        style={{
                          opacity: xIn,
                          transform: `translateY(${interpolate(xIn, [0, 1], [12, 0])}px)`,
                          padding: "12px 26px",
                          borderRadius: radius.pill,
                          border: `1px solid ${c.noise}44`,
                          background: `${c.noise}10`,
                          ...type.body,
                          fontSize: 25,
                          color: c.noise,
                        }}
                      >
                        {x}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: toRule }}>
            <div style={{ ...type.meta, color: c.accent }}>THE HONEST RULE</div>
            <Hero style={{ fontSize: 74 }}>
              Don't apply patterns
              <br />
              because they're <span style={{ color: c.noise }}>correct</span>
            </Hero>
            {painIn > 0.02 && (
              <div
                style={{
                  opacity: painIn,
                  transform: `translateY(${interpolate(painIn, [0, 1], [18, 0])}px)`,
                  marginTop: space.sm,
                  padding: `${space.md}px ${space.lg}px`,
                  borderRadius: radius.lg,
                  ...surface(c.hit, true),
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 40px rgba(0,0,0,0.5), 0 0 ${14 + pulse * 18}px ${c.hit}22`,
                  ...type.sub,
                  fontSize: 44,
                  color: c.hit,
                  textAlign: "center",
                }}
              >
                Apply them when the pain shows up
              </div>
            )}
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
