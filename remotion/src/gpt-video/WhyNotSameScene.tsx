import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";
import { ProbabilityBars } from "./ProbabilityBars";
import type { CandidateEvent } from "./gptEvents";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "One more thing before we build this"):
//   "it's sampling from a probability distribution" 192-280
//   "if cat comes up 70%, dog comes up 30%" 286-433
//   "won't always pick cat, most of the time it will, sometimes dog" 433-616
//   "that's why you can ask the same question twice, different answers" 621-754
//
// This 70/30 cat/dog example is the script's own illustrative teaching
// device (stated before any code exists yet) -- not a real trace event, so
// it's the one place in this video with an intentionally hand-authored
// CandidateEvent, reusing the same ProbabilityBars component the real
// generation events drive later, so the visual callback in three_runs
// literally re-uses this exact component.
const TEASER_EVENT: CandidateEvent = {
  type: "candidates",
  context_ids: [],
  candidates: [
    { id: 0, word: "cat", probability: 0.7 },
    { id: 1, word: "dog", probability: 0.3 },
  ],
  sampled_id: 0,
  order: 0,
};

export const WhyNotSameScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = ease(frame, 60, fps, 14, 220);
  const showBars = frame >= 286;
  const sameTwiceIn = ease(frame, 621, fps, 13, 220);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.number} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Why it's not always the same answer" color={cv.number} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        {frame < 286 && (
          <div
            style={{
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 42,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 850,
            }}
          >
            It's not just picking the most likely word. It's <span style={{ color: cv.number }}>sampling</span>.
          </div>
        )}

        {showBars && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <ProbabilityBars candidateEvent={TEASER_EVENT} startAt={286} sampleRevealAt={999999} width={320} />
            {sameTwiceIn > 0 && (
              <div
                style={{
                  opacity: sameTwiceIn,
                  fontFamily: cvFonts.mono,
                  fontSize: 18,
                  color: cv.terminalGreen,
                  textAlign: "center",
                  maxWidth: 700,
                }}
              >
                Ask the same question twice &mdash; you can get slightly different answers.
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
