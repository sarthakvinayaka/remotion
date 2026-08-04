import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Hero, Scene, Sub } from "./ui";

/**
 * Segment starts at global 8920. Local = global - 8920.
 *    0 (8920) "That's a working search engine in about 30 lines"
 *   86 (9006) "An inverted index so you never scan everything"
 *  174 (9094) "And TF-IDF so the ranking actually makes sense"
 *  274 (9194) "Full code is in the description if you want to run it yourself"
 *  364 (9284) "If you want a follow-up where we add PageRank..."
 *  510 (9430) "See you in the next one"
 */

const IDEA1_AT = 86;
const IDEA2_AT = 174;
const CODE_AT = 274;
const CTA_AT = 364;
const SIGNOFF_AT = 510;

export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const i1 = ease(frame, IDEA1_AT, fps, "SETTLE");
  const i2 = ease(frame, IDEA2_AT, fps, "SETTLE");
  const codeIn = ease(frame, CODE_AT, fps, "SETTLE");
  const ctaIn = ramp(frame, CTA_AT, 26);
  const signoffIn = ease(frame, SIGNOFF_AT, fps, "SLOW");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={c.accent} seed={9} />

      <Scene chip="wrap up" chipColor={c.accent}>
        {signoffIn < 0.4 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
            <Sub style={{ opacity: introIn * (1 - ctaIn * 0.5) }}>
              A working search engine in <span style={{ color: c.hit }}>~30 lines</span>
            </Sub>

            <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: 1 - ctaIn * 0.55, width: "100%", maxWidth: 1220 }}>
              {[
                { at: i1, label: "An inverted index", tail: "so you never scan everything", color: c.accent },
                { at: i2, label: "TF-IDF", tail: "so the ranking actually makes sense", color: c.hit },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    opacity: r.at,
                    transform: `translateX(${interpolate(r.at, [0, 1], [-20, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: space.md,
                    padding: `${space.sm}px ${space.lg}px`,
                    borderRadius: radius.lg,
                    background: c.panel,
                    border: `1.5px solid ${r.color}44`,
                    boxShadow: `0 8px 26px rgba(0,0,0,0.4), 0 0 ${10 + idlePulse(frame, 92, r.label.length) * 12}px ${r.color}14`,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: radius.pill,
                      background: r.color,
                      boxShadow: `0 0 10px ${r.color}`,
                    }}
                  />
                  <span style={{ ...type.sub, fontSize: 38, color: c.ink, textAlign: "left" }}>
                    {r.label}
                    <span style={{ ...type.body, fontSize: 24, color: c.inkDim, display: "block", marginTop: 2 }}>
                      {r.tail}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {codeIn > 0.02 && ctaIn < 0.5 && (
              <div
                style={{
                  opacity: codeIn * (1 - ctaIn * 2),
                  ...type.body,
                  fontSize: 28,
                  color: c.inkDim,
                }}
              >
                Full code is in the description.
              </div>
            )}

            {ctaIn > 0.05 && (
              <div
                style={{
                  opacity: ctaIn,
                  transform: `translateY(${interpolate(ctaIn, [0, 1], [20, 0])}px)`,
                  padding: `${space.md}px ${space.lg}px`,
                  borderRadius: radius.lg,
                  background: c.bgLift,
                  border: `1.5px solid ${c.cool}55`,
                  boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 ${18 + idlePulse(frame, 86, 3) * 18}px ${c.cool}1A`,
                  textAlign: "center",
                }}
              >
                <div style={{ ...type.meta, color: c.muted, marginBottom: space.xs }}>WANT A FOLLOW-UP?</div>
                <div style={{ ...type.sub, fontSize: 40, color: c.ink }}>
                  Adding <span style={{ color: c.cool }}>PageRank</span> — ranking by links
                </div>
                <div style={{ ...type.body, fontSize: 24, color: c.inkDim, marginTop: 4 }}>
                  Let me know in the comments.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              opacity: signoffIn,
              transform: `scale(${interpolate(signoffIn, [0, 1], [0.94, 1])})`,
            }}
          >
            <Hero style={{ fontSize: 76 }}>
              See you in the <span style={{ color: c.accent }}>next one</span>
            </Hero>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
