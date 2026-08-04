import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 3970. Local anchors (global - 3970):
 *    0 (3970) "The second thing it fixed is easier to picture"
 *   93 (4063) "Normally an AI writes one word at a time, which is slow,
 *              because it does a full round of thinking for every single word"
 *  293 (4263) "There's a trick to speed that up"
 *  352 (4322) "You have a small fast model guess the next few words ahead,
 *              and the big smart model just checks those guesses"
 *  588 (4558) "It's like having a junior assistant who finishes your sentences,
 *              and you just go yep, yep, yep, correct"
 *  832 (4802) "Faster than saying every word yourself"
 *  862 (4832) "But it only works if the junior is decent at guessing"
 *  957 (4927) "If it guesses wrong, you throw the guesses out,
 *              and you've wasted that effort"
 * 1092 (5062) "So Sol ran hundreds of experiments improving that little guesser,
 *              and got it more than fifteen percent more efficient"
 * 1278 (5248) "Better guesses, fewer wasted rounds, cheaper to run"
 *
 * The sentence being drafted is hand-authored illustration of speculative
 * decoding, not captured model output.
 */

const SLOW_AT = 93;
const TRICK_AT = 293;
const GUESS_AT = 352;
const JUNIOR_AT = 588;
const WRONG_AT = 957;
const SOL_TUNES_AT = 1092;
const PAYOFF_AT = 1278;

// one word at a time, the slow way
const SLOW_WORDS = ["The", "cat", "sat", "on", "the", "mat"];

// the junior's drafted run: most accepted, one rejected -- hardcoded so the
// on-screen tally always matches the narration.
const DRAFT: { word: string; accepted: boolean }[] = [
  { word: "The", accepted: true },
  { word: "cat", accepted: true },
  { word: "sat", accepted: true },
  { word: "on", accepted: true },
  { word: "the", accepted: true },
  { word: "sofa", accepted: false },
];

const SlowRow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
    <div style={{ ...type.meta, color: c.expensive }}>ONE WORD, ONE FULL ROUND OF THINKING</div>
    <div style={{ display: "flex", gap: space.sm }}>
      {SLOW_WORDS.map((w, i) => {
        // deliberately slow cadence -- 34 frames per word
        const at = SLOW_AT + 40 + i * 34;
        const wIn = ease(frame, at, fps, "SETTLE");
        return (
          <div
            key={i}
            style={{
              opacity: wIn,
              transform: `scale(${interpolate(wIn, [0, 1], [0.8, 1])})`,
              padding: "26px 42px",
              borderRadius: radius.md,
              background: c.panel,
              border: `1.5px solid ${c.expensive}44`,
              fontFamily: fonts.mono,
              fontSize: 48,
              color: c.ink,
            }}
          >
            {w}
          </div>
        );
      })}
    </div>
  </div>
);

/** Junior drafts ahead; senior stamps each guess accepted or rejected. */
const DraftRow: React.FC<{ frame: number; fps: number; showVerdict: boolean }> = ({ frame, fps, showVerdict }) => (
  <div style={{ display: "flex", gap: space.sm }}>
    {DRAFT.map((d, i) => {
      const draftAt = GUESS_AT + 60 + i * 11; // junior is FAST
      const stampAt = JUNIOR_AT + 40 + i * 26;
      const draftIn = ease(frame, draftAt, fps, "ENTER");
      const stamp = showVerdict ? ease(frame, stampAt, fps, "SETTLE") : 0;
      const rejected = !d.accepted && stamp > 0.5;
      const accepted = d.accepted && stamp > 0.5;
      const color = rejected ? c.expensive : accepted ? c.cheap : c.violet;
      const pulse = idlePulse(frame, 70, i);

      return (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.xs }}>
          <div
            style={{
              opacity: draftIn * (rejected ? 0.45 : 1),
              transform: `translateY(${interpolate(draftIn, [0, 1], [16, 0])}px) scale(${accepted ? 1 + pulse * 0.01 : 1})`,
              padding: "26px 42px",
              borderRadius: radius.md,
              background: c.panel,
              border: `1.5px solid ${color}${stamp > 0.5 ? "88" : "44"}`,
              boxShadow: accepted ? `0 8px 26px rgba(0,0,0,0.4), 0 0 ${16 + pulse * 14}px ${color}22` : "0 8px 24px rgba(0,0,0,0.4)",
              fontFamily: fonts.mono,
              fontSize: 48,
              color: rejected ? c.muted : c.ink,
              textDecoration: rejected ? "line-through" : "none",
            }}
          >
            {d.word}
          </div>
          {/* verdict stamp */}
          <div
            style={{
              opacity: stamp,
              transform: `scale(${interpolate(stamp, [0, 1], [0.5, 1])})`,
              fontFamily: fonts.mono,
              fontSize: 38,
              fontWeight: 700,
              color,
            }}
          >
            {d.accepted ? "✓" : "✕"}
          </div>
        </div>
      );
    })}
  </div>
);

export const SpeculativeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const toTrick = ramp(frame, TRICK_AT, 24);
  const juniorIn = ramp(frame, JUNIOR_AT - 30, 22);
  const wrongIn = ease(frame, WRONG_AT, fps, "SETTLE");
  const solIn = ease(frame, SOL_TUNES_AT, fps, "SLOW");
  const payoffIn = ease(frame, PAYOFF_AT, fps, "SETTLE");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.violet} />
      <AmbientGlow color={toTrick > 0.5 ? c.cheap : c.expensive} seed={6} />

      <Scene chip="how it guesses" chipColor={c.violet}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          {toTrick < 0.5 ? (
            <>
              <Sub style={{ opacity: introIn }}>
                Normally an AI writes <span style={{ color: c.expensive }}>one word at a time</span>
              </Sub>
              <SlowRow frame={frame} fps={fps} />
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, opacity: toTrick }}>
              <Sub>
                A <span style={{ color: c.violet }}>small fast model</span> guesses ahead —
                <br />
                the big one just <span style={{ color: c.cheap }}>checks</span> the guesses
              </Sub>

              {/* the two roles */}
              <div style={{ display: "flex", gap: space.xl, alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.xs }}>
                  <div style={{ ...type.meta, color: c.violet }}>JUNIOR · DRAFTS FAST</div>
                  <div style={{ ...type.meta, color: c.muted }}>guesses the next few words</div>
                </div>
                <div style={{ width: 2, height: 54, background: c.panelLineBright }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.xs }}>
                  <div style={{ ...type.meta, color: c.cheap }}>SENIOR · CHECKS</div>
                  <div style={{ ...type.meta, color: c.muted }}>yep, yep, yep — correct</div>
                </div>
              </div>

              <DraftRow frame={frame} fps={fps} showVerdict={juniorIn > 0.4} />

              {/* wrong guesses get thrown out */}
              {wrongIn > 0.02 && solIn < 0.4 && (
                <div
                  style={{
                    opacity: wrongIn * (1 - solIn * 2.2),
                    ...type.body,
                    color: c.expensive,
                    textAlign: "center",
                  }}
                >
                  Guess wrong → throw it out → that effort was wasted
                </div>
              )}

              {/* Sol tunes the guesser */}
              {solIn > 0.02 && (
                <div
                  style={{
                    opacity: solIn,
                    transform: `translateY(${interpolate(solIn, [0, 1], [18, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: space.lg,
                    padding: "16px 38px",
                    borderRadius: radius.lg,
                    background: c.bgLift,
                    border: `1.5px solid ${c.cheap}55`,
                    boxShadow: `0 12px 44px rgba(0,0,0,0.5), 0 0 ${22 + idlePulse(frame, 90, 3) * 22}px ${c.cheap}22`,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ ...type.meta, color: c.muted }}>SOL RAN HUNDREDS OF EXPERIMENTS</div>
                    <div style={{ ...type.sub, fontSize: 40, color: c.cheap }}>
                      +15% more efficient guesser
                    </div>
                  </div>
                </div>
              )}

              {payoffIn > 0.02 && (
                <div style={{ opacity: payoffIn, ...type.body, color: c.inkDim }}>
                  Better guesses → fewer wasted rounds → cheaper to run
                </div>
              )}
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
