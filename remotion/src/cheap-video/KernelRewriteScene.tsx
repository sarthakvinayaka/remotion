import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, seeded, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 2342. Local anchors (global - 2342):
 *    0 (2342) "Here's what they actually did"
 *   51 (2393) "After their top model Sol was finished and shipped"
 *  132 (2474) "they pointed it at their own infrastructure and basically said,
 *              go make yourself cheaper to run"
 *  311 (2653) "Specifically at the low level code that does the actual number
 *              crunching on the graphics cards"
 *  459 (2801) "If the AI is a factory, this code is the individual machines
 *              on the factory floor"
 *  613 (2955) "The things physically doing the work"
 *  692 (3034) "Normally that's very specialist stuff, expensive humans hand
 *              tuning it for months"
 *  959 (3301) "So they had the AI rewrite it instead"
 * 1041 (3383) "And it worked"
 * 1078 (3420) "Running everything got about 20% cheaper"
 *
 * The factory-floor metaphor is the script's own suggested visual. Machine
 * contents are hand-authored illustration, not captured output.
 */

const SOL_POINTS_AT = 132;
const LOW_LEVEL_AT = 311;
const FACTORY_AT = 459;
const HAND_TUNE_AT = 692;
const AI_REWRITES_AT = 959;
const WORKED_AT = 1078;

const MACHINE_COUNT = 6;

/** One machine on the factory floor = one GPU kernel. */
const Machine: React.FC<{
  index: number;
  frame: number;
  fps: number;
  rewritten: boolean;
}> = ({ index, frame, fps, rewritten }) => {
  const appearAt = FACTORY_AT + index * 9;
  const machineIn = ease(frame, appearAt, fps, "ENTER");

  // each machine gets rewritten in sequence once Sol starts working
  const rewriteAt = AI_REWRITES_AT + index * 12;
  const rewrite = rewritten ? ease(frame, rewriteAt, fps, "SETTLE") : 0;

  // pistons keep running the whole time -- this is the thing the narration
  // is about, so it stays alive rather than freezing
  const speed = rewrite > 0.5 ? 26 : 44; // rewritten machines run faster
  const piston = idlePulse(frame, speed, index);
  const color = rewrite > 0.5 ? c.cheap : c.cool;

  return (
    <div
      style={{
        opacity: machineIn,
        transform: `translateY(${interpolate(machineIn, [0, 1], [26, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space.xs,
      }}
    >
      <div
        style={{
          width: 262,
          height: 250,
          borderRadius: radius.md,
          background: c.panel,
          border: `1.5px solid ${color}${rewrite > 0.5 ? "88" : "44"}`,
          boxShadow: rewrite > 0.5 ? `0 10px 30px rgba(0,0,0,0.45), 0 0 26px ${color}22` : "0 8px 24px rgba(0,0,0,0.4)",
          padding: space.md,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* piston head -- physical work happening */}
        <div style={{ height: 76, display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              width: "100%",
              height: 20 + piston * 44,
              borderRadius: 5,
              background: `linear-gradient(180deg, ${color}, ${color}44)`,
            }}
          />
        </div>

        {/* throughput bars */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 68 }}>
          {Array.from({ length: 7 }).map((_, b) => {
            const h = 12 + idlePulse(frame, speed, index * 7 + b) * 52;
            return (
              <div
                key={b}
                style={{
                  flex: 1,
                  height: h,
                  borderRadius: 3,
                  background: `${color}${rewrite > 0.5 ? "AA" : "55"}`,
                }}
              />
            );
          })}
        </div>

        <div style={{ fontFamily: fonts.mono, fontSize: 20, color: rewrite > 0.5 ? c.cheap : c.muted }}>
          {rewrite > 0.5 ? "rewritten" : `kernel_${index}`}
        </div>

        {/* the AI's rewrite sweeping through the machine */}
        {rewrite > 0 && rewrite < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, transparent ${rewrite * 100 - 18}%, ${c.violet}55 ${rewrite * 100}%, transparent ${rewrite * 100 + 18}%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export const KernelRewriteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const solIn = ease(frame, SOL_POINTS_AT, fps, "ENTER");
  const lowLevelIn = ramp(frame, LOW_LEVEL_AT, 24);
  const factoryIn = ramp(frame, FACTORY_AT, 26);
  const handTuneIn = ease(frame, HAND_TUNE_AT, fps, "SETTLE");
  const rewriteIn = ramp(frame, AI_REWRITES_AT, 24);
  const workedIn = ease(frame, WORKED_AT, fps, "SLOW");

  const solPulse = idlePulse(frame, 90, 0);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.violet} speed={0.35} />
      <AmbientGlow color={rewriteIn > 0.4 ? c.violet : c.cool} seed={4} />

      <Scene chip="the machinery" chipColor={c.violet}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          {factoryIn < 0.5 ? (
            /* Sol pointed at its own infrastructure */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
              <Sub style={{ opacity: introIn }}>
                They pointed <span style={{ color: c.sol }}>Sol</span> at their own infrastructure
              </Sub>
              <div
                style={{
                  opacity: solIn,
                  transform: `scale(${interpolate(solIn, [0, 1], [0.85, 1])})`,
                  padding: "26px 52px",
                  borderRadius: radius.lg,
                  background: c.bgLift,
                  border: `2px solid ${c.violet}66`,
                  boxShadow: `0 14px 50px rgba(0,0,0,0.5), 0 0 ${28 + solPulse * 26}px ${c.violet}33`,
                  fontFamily: fonts.mono,
                  fontSize: 40,
                  color: c.violet,
                }}
              >
                "go make yourself cheaper to run"
              </div>
              <div
                style={{
                  opacity: lowLevelIn,
                  ...type.body,
                  color: c.inkDim,
                  textAlign: "center",
                }}
              >
                Specifically the low-level code doing the
                <br />
                actual number crunching on the graphics cards
              </div>
            </div>
          ) : (
            /* the factory floor itself */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: factoryIn }}>
              <Sub>
                {rewriteIn > 0.4 ? (
                  <>
                    So they had the <span style={{ color: c.violet }}>AI</span> rewrite them instead
                  </>
                ) : (
                  <>
                    This code is the <span style={{ color: c.cool }}>machines on the factory floor</span>
                  </>
                )}
              </Sub>

              {/* factory floor: 6 machines, always running */}
              <div style={{ display: "flex", gap: space.md, alignItems: "flex-end" }}>
                {Array.from({ length: MACHINE_COUNT }).map((_, i) => (
                  <Machine key={i} index={i} frame={frame} fps={fps} rewritten={rewriteIn > 0} />
                ))}
              </div>

              {/* the floor line */}
              <div
                style={{
                  width: 1740,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${c.panelLineBright}, transparent)`,
                }}
              />

              {/* "expensive humans hand-tuning for months" */}
              {handTuneIn > 0.02 && rewriteIn < 0.4 && (
                <div
                  style={{
                    opacity: handTuneIn * (1 - rewriteIn * 2.2),
                    ...type.body,
                    color: c.expensive,
                    textAlign: "center",
                  }}
                >
                  Normally: expensive humans hand-tuning this for months
                </div>
              )}

              {/* the payoff */}
              {workedIn > 0.02 && (
                <div
                  style={{
                    opacity: workedIn,
                    transform: `translateY(${interpolate(workedIn, [0, 1], [16, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: space.md,
                    padding: "14px 34px",
                    borderRadius: radius.pill,
                    background: `${c.cheap}12`,
                    border: `1.5px solid ${c.cheap}55`,
                    boxShadow: `0 0 ${20 + solPulse * 22}px ${c.cheap}22`,
                  }}
                >
                  <span style={{ ...type.hero, fontSize: 92, color: c.cheap }}>−20%</span>
                  <span style={{ ...type.body, color: c.ink }}>cheaper to run everything</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
