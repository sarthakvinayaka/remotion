import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 8813. Local anchors (global - 8813):
 *    0 (8813) "Anyway, that's the story. Eighty percent cut, partly paid for by
 *              an AI tuning up its own machinery, and pushed by competition
 *              at the cheap end of the market"
 *  294 (9107) "If you want a follow up where I build a tiny version of that
 *              guessing trick in Python so you can watch it work,
 *              tell me in the comments"
 *  483 (9296) "See you in the next one"
 *  513 (9326) "Peace"
 */

const RECAP_ITEMS = [
  { label: "80% cut", color: c.cheap, at: 20 },
  { label: "an AI tuning its own machinery", color: c.violet, at: 105 },
  { label: "competition at the cheap end", color: c.rival, at: 170 },
];

const CTA_AT = 294;
const SIGNOFF_AT = 483;

export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const ctaIn = ramp(frame, CTA_AT, 26);
  const signoffIn = ease(frame, SIGNOFF_AT, fps, "SLOW");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={c.accent} seed={12} />

      <Scene chip="wrap up" chipColor={c.accent}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          {signoffIn < 0.4 ? (
            <>
              <Sub style={{ opacity: introIn * (1 - ctaIn * 0.5) }}>That's the story</Sub>

              <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: 1 - ctaIn * 0.6 }}>
                {RECAP_ITEMS.map((r) => {
                  const rIn = ease(frame, r.at, fps, "SETTLE");
                  const pulse = idlePulse(frame, 92, r.at);
                  return (
                    <div
                      key={r.label}
                      style={{
                        opacity: rIn,
                        transform: `translateX(${interpolate(rIn, [0, 1], [-22, 0])}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: space.md,
                        padding: "14px 30px",
                        borderRadius: radius.lg,
                        background: c.panel,
                        border: `1.5px solid ${r.color}44`,
                        boxShadow: `0 8px 26px rgba(0,0,0,0.4), 0 0 ${10 + pulse * 12}px ${r.color}14`,
                      }}
                    >
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: radius.pill,
                          background: r.color,
                          boxShadow: `0 0 10px ${r.color}`,
                        }}
                      />
                      <span style={{ ...type.sub, fontSize: 34, color: c.ink, textAlign: "left" }}>{r.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* the CTA: a follow-up building the guessing trick in Python */}
              {ctaIn > 0.05 && (
                <div
                  style={{
                    opacity: ctaIn,
                    transform: `translateY(${interpolate(ctaIn, [0, 1], [20, 0])}px)`,
                    marginTop: space.md,
                    padding: `${space.md}px ${space.lg}px`,
                    borderRadius: radius.lg,
                    background: c.bgLift,
                    border: `1.5px solid ${c.cool}55`,
                    boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 ${18 + idlePulse(frame, 84, 2) * 18}px ${c.cool}1A`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ ...type.meta, color: c.muted, marginBottom: space.xs }}>WANT A FOLLOW-UP?</div>
                  <div style={{ ...type.sub, fontSize: 36, color: c.ink }}>
                    Building that <span style={{ color: c.cool }}>guessing trick</span> in Python
                  </div>
                  <div style={{ ...type.body, fontSize: 24, color: c.inkDim, marginTop: 4 }}>
                    Tell me in the comments.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                opacity: signoffIn,
                transform: `scale(${interpolate(signoffIn, [0, 1], [0.94, 1])})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: space.md,
              }}
            >
              <div
                style={{
                  ...type.hero,
                  fontSize: 76,
                  color: c.ink,
                  textAlign: "center",
                }}
              >
                See you in the <span style={{ color: c.accent }}>next one</span>
              </div>
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
