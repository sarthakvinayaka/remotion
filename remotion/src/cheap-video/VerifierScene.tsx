import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 3505. Local anchors (global - 3505):
 *    0 (3505) "One detail I liked though, they didn't just trust it"
 *   79 (3584) "They ran the AI's rewritten code through a separate tool
 *              that checks the math is still correct"
 *  242 (3747) "before letting it near production, which seems like the right call"
 *  349 (3854) "You probably shouldn't let a model rewrite the engine and just hope"
 *
 * The pipeline stages are hand-authored illustration of the described
 * process (the checker is FpSan, deliberately unnamed in narration).
 */

const CHECKER_AT = 79;
const PRODUCTION_AT = 242;
const HOPE_AT = 349;

type Stage = { label: string; sub: string; color: string; at: number };

const STAGES: Stage[] = [
  { label: "AI rewrites", sub: "new kernel code", color: c.violet, at: CHECKER_AT },
  { label: "Checker", sub: "is the math still correct?", color: c.accent, at: CHECKER_AT + 46 },
  { label: "Production", sub: "only if it passes", color: c.cheap, at: PRODUCTION_AT },
];

export const VerifierScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const hopeIn = ease(frame, HOPE_AT, fps, "SETTLE");

  // a packet travelling the pipeline, looping so the diagram never freezes
  const travelStart = CHECKER_AT + 60;
  const loopLen = 96;
  const travel = frame > travelStart ? ((frame - travelStart) % loopLen) / loopLen : 0;
  const showPacket = frame > travelStart;

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={c.accent} seed={5} />

      <Scene chip="they didn't just trust it" chipColor={c.accent}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.xl, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            The rewritten code goes through a <span style={{ color: c.accent }}>separate checker</span> first
          </Sub>

          {/* pipeline */}
          <div style={{ display: "flex", alignItems: "center", gap: space.md, position: "relative" }}>
            {STAGES.map((s, i) => {
              const stageIn = ease(frame, s.at, fps, "ENTER");
              const isChecker = i === 1;
              const pulse = idlePulse(frame, 80, i);
              const active = showPacket && Math.floor(travel * 3) === i;
              return (
                <React.Fragment key={s.label}>
                  {i > 0 && (
                    <div
                      style={{
                        width: 110,
                        height: 3,
                        background: c.panelLineBright,
                        opacity: stageIn,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(90deg, transparent, ${c.cheap}, transparent)`,
                          opacity: active ? 0.9 : 0,
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      opacity: stageIn,
                      transform: `translateY(${interpolate(stageIn, [0, 1], [22, 0])}px) scale(${isChecker ? 1 + pulse * 0.014 : 1})`,
                      width: 400,
                      padding: `${space.lg}px ${space.md}px`,
                      borderRadius: radius.lg,
                      background: isChecker ? c.bgLift : c.panel,
                      border: `1.5px solid ${s.color}${isChecker ? "77" : "44"}`,
                      boxShadow: isChecker
                        ? `0 12px 44px rgba(0,0,0,0.5), 0 0 ${24 + pulse * 24}px ${s.color}26`
                        : "0 8px 24px rgba(0,0,0,0.4)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ ...type.sub, fontSize: 34, color: s.color, marginBottom: space.xs }}>{s.label}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 22, color: c.inkDim }}>{s.sub}</div>

                    {isChecker && (
                      <div style={{ display: "flex", justifyContent: "center", gap: space.xs, marginTop: space.sm }}>
                        {["≈", "=", "✓"].map((glyph, g) => (
                          <span
                            key={g}
                            style={{
                              fontFamily: fonts.mono,
                              fontSize: 22,
                              color: c.cheap,
                              opacity: 0.4 + idlePulse(frame, 60, g * 2) * 0.6,
                            }}
                          >
                            {glyph}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* the closing judgement */}
          {hopeIn > 0.02 && (
            <div
              style={{
                opacity: hopeIn,
                transform: `translateY(${interpolate(hopeIn, [0, 1], [16, 0])}px)`,
                ...type.body,
                fontSize: 34,
                color: c.ink,
                textAlign: "center",
                maxWidth: 1100,
              }}
            >
              You probably shouldn't let a model rewrite the engine
              <br />
              and <span style={{ color: c.expensive }}>just hope</span>.
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
