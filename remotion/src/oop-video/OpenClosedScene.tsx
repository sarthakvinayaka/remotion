import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Hero, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 6614. Local = global - 6614.
 *    0 (6614) "The point is which code you had to open"
 *   51 (6665) "In the first three versions you had to modify NotificationService"
 *  165 (6779) "That's code that already worked"
 *  223 (6837) "that other things already depend on"
 *  282 (6896) "Every time you edit it you can break something unrelated"
 *  384 (6998) "In version four you didn't open it at all"
 *  462 (7076) "You added new code instead of changing old code"
 *  630 (7244) "It's the open-closed principle"
 *  698 (7312) "open to extension, closed to modification"
 */

const MODIFY_AT = 51;
const BREAK_AT = 282;
const V4_AT = 384;
const ADDED_AT = 462;
const PRINCIPLE_AT = 630;
const OPEN_CLOSED_AT = 698;

export const OpenClosedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const modifyIn = ease(frame, MODIFY_AT, fps, "SETTLE");
  const breakIn = ease(frame, BREAK_AT, fps, "SETTLE");
  const v4In = ease(frame, V4_AT, fps, "SETTLE");
  const addedIn = ease(frame, ADDED_AT, fps, "SETTLE");
  const openClosedIn = ease(frame, OPEN_CLOSED_AT, fps, "SLOW");
  const toPrinciple = ramp(frame, PRINCIPLE_AT, 26);
  const pulse = idlePulse(frame, 90, 2);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={toPrinciple > 0.5 ? c.hit : c.noise} />
      <AmbientGlow color={toPrinciple > 0.5 ? c.hit : c.noise} seed={7} />

      <Scene chip="open / closed" chipColor={toPrinciple > 0.5 ? c.hit : c.noise}>
        {toPrinciple < 0.5 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%", opacity: 1 - toPrinciple * 2 }}>
            <Sub style={{ opacity: introIn }}>
              Which code did you have to <span style={{ color: c.accent }}>open</span>?
            </Sub>

            <div style={{ display: "flex", gap: space.lg, width: "100%", maxWidth: 1420, justifyContent: "center" }}>
              {/* v1-v3: you edited working code */}
              <div
                style={{
                  flex: 1,
                  opacity: modifyIn,
                  transform: `translateY(${interpolate(modifyIn, [0, 1], [20, 0])}px)`,
                  padding: space.lg,
                  borderRadius: radius.lg,
                  ...surface(c.noise, true),
                  minHeight: 330,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ ...type.meta, color: c.noise }}>VERSIONS 1–3</div>
                <div style={{ ...type.sub, fontSize: 42, color: c.ink, marginTop: 8 }}>
                  You edited
                  <br />
                  <span style={{ color: c.noise }}>working code</span>
                </div>
                {breakIn > 0.02 && (
                  <div style={{ opacity: breakIn, ...type.body, fontSize: 23, color: c.inkDim, marginTop: space.sm }}>
                    other things already depend on it
                  </div>
                )}
              </div>

              {/* v4: you added new code */}
              {v4In > 0.02 && (
                <div
                  style={{
                    flex: 1,
                    opacity: v4In,
                    transform: `translateY(${interpolate(v4In, [0, 1], [20, 0])}px)`,
                    padding: space.lg,
                    borderRadius: radius.lg,
                    ...surface(c.hit, true),
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 44px rgba(0,0,0,0.55), 0 0 ${14 + pulse * 18}px ${c.hit}26`,
                    minHeight: 330,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <div style={{ ...type.meta, color: c.hit }}>VERSION 4</div>
                  <div style={{ ...type.sub, fontSize: 42, color: c.ink, marginTop: 8 }}>
                    You added
                    <br />
                    <span style={{ color: c.hit }}>new code</span>
                  </div>
                  {addedIn > 0.02 && (
                    <div style={{ opacity: addedIn, ...type.body, fontSize: 23, color: c.inkDim, marginTop: space.sm }}>
                      nothing that worked was touched
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: toPrinciple }}>
            <div style={{ ...type.meta, color: c.hit }}>IT HAS A NAME</div>
            <Hero style={{ fontSize: 88 }}>
              The <span style={{ color: c.hit }}>open–closed</span> principle
            </Hero>
            {openClosedIn > 0.02 && (
              <div
                style={{
                  opacity: openClosedIn,
                  transform: `translateY(${interpolate(openClosedIn, [0, 1], [16, 0])}px)`,
                  display: "flex",
                  gap: space.lg,
                  marginTop: space.md,
                }}
              >
                {[
                  { k: "OPEN", v: "to extension", color: c.hit },
                  { k: "CLOSED", v: "to modification", color: c.noise },
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
                    <div style={{ fontFamily: fonts.display, fontSize: 48, fontWeight: 700, color: x.color }}>{x.k}</div>
                    <div style={{ ...type.body, fontSize: 24, color: c.inkDim }}>{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
