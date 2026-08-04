import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Hero, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 8360. Local = global - 8360.
 *    0 (8360) "So that's one feature, four versions"
 *   63 (8423) "Classes alone aren't OOP"
 *  102 (8462) "If you're still checking types, you're not there yet"
 *  161 (8521) "Polymorphism removes the if-else. Injection removes the wiring."
 *  344 (8704) "To add something new, do you edit old code or just write new code?"
 *  492 (8852) "All four versions are in the description"
 *  563 (8923) "If you want a follow-up... payment system... comments"
 *  702 (9062) "See you in the next one"
 */

const CLASSES_AT = 63;
const REMOVES_AT = 161;
const TEST_AT = 344;
const CODE_AT = 492;
const CTA_AT = 563;
const SIGNOFF_AT = 702;

export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const classesIn = ease(frame, CLASSES_AT, fps, "SETTLE");
  const removesIn = ease(frame, REMOVES_AT, fps, "SETTLE");
  const testIn = ease(frame, TEST_AT, fps, "SLOW");
  const codeIn = ease(frame, CODE_AT, fps, "SETTLE");
  const ctaIn = ramp(frame, CTA_AT, 26);
  const signoffIn = ease(frame, SIGNOFF_AT, fps, "SLOW");
  const pulse = idlePulse(frame, 88, 5);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.hit} />
      <AmbientGlow color={c.hit} seed={9} />

      <Scene chip="wrap up" chipColor={c.hit}>
        {signoffIn < 0.4 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
            <Sub style={{ opacity: introIn * (1 - ctaIn * 0.5) }}>
              Classes alone <span style={{ color: c.noise }}>aren't</span> OOP
            </Sub>

            {classesIn > 0.02 && ctaIn < 0.5 && (
              <div style={{ opacity: classesIn * (1 - ctaIn * 2), ...type.body, fontSize: 30, color: c.inkDim, textAlign: "center" }}>
                If you're still checking types, you're not there yet.
              </div>
            )}

            {removesIn > 0.02 && ctaIn < 0.5 && (
              <div style={{ display: "flex", gap: space.md, opacity: removesIn * (1 - ctaIn * 2) }}>
                {[
                  { k: "Polymorphism", v: "removes the if/else", color: c.violet },
                  { k: "Injection", v: "removes the wiring", color: c.cool },
                ].map((x) => (
                  <div
                    key={x.k}
                    style={{
                      padding: `${space.md}px ${space.lg}px`,
                      borderRadius: radius.lg,
                      ...surface(x.color, true),
                      textAlign: "center",
                    }}
                  >
                    <div style={{ ...type.sub, fontSize: 36, color: x.color }}>{x.k}</div>
                    <div style={{ ...type.body, fontSize: 24, color: c.inkDim, marginTop: 2 }}>{x.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* the test, restated as the takeaway */}
            {testIn > 0.02 && ctaIn < 0.5 && (
              <div
                style={{
                  opacity: testIn * (1 - ctaIn * 2),
                  transform: `translateY(${interpolate(testIn, [0, 1], [16, 0])}px)`,
                  padding: `${space.md}px ${space.lg}px`,
                  borderRadius: radius.lg,
                  ...surface(c.accent, true),
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 40px rgba(0,0,0,0.5), 0 0 ${12 + pulse * 16}px ${c.accent}22`,
                  ...type.sub,
                  fontSize: 40,
                  color: c.ink,
                  textAlign: "center",
                  maxWidth: 1300,
                }}
              >
                Edit <span style={{ color: c.noise }}>old code</span> — or just write{" "}
                <span style={{ color: c.hit }}>new code</span>?
              </div>
            )}

            {ctaIn > 0.05 && (
              <div
                style={{
                  opacity: ctaIn,
                  transform: `translateY(${interpolate(ctaIn, [0, 1], [20, 0])}px)`,
                  padding: `${space.md}px ${space.lg}px`,
                  borderRadius: radius.lg,
                  ...surface(c.cool, true),
                  textAlign: "center",
                }}
              >
                <div style={{ ...type.meta, color: c.muted, marginBottom: space.xs }}>WANT A FOLLOW-UP?</div>
                <div style={{ ...type.sub, fontSize: 40, color: c.ink }}>
                  The same thing with a <span style={{ color: c.cool }}>payment system</span>
                </div>
                <div style={{ ...type.body, fontSize: 24, color: c.inkDim, marginTop: 4 }}>
                  All four versions are in the description.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ opacity: signoffIn, transform: `scale(${interpolate(signoffIn, [0, 1], [0.94, 1])})` }}>
            <Hero style={{ fontSize: 76 }}>
              See you in the <span style={{ color: c.hit }}>next one</span>
            </Hero>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
