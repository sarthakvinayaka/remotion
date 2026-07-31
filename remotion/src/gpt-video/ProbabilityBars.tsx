import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import type { CandidateEvent } from "./gptEvents";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// A single candidates event rendered as a bar chart: heights = relative
// probability, ordered descending, the sampled bar visually "wins" (glow +
// scale + checkmark) once the sampling moment arrives. Entirely driven by
// one real CandidateEvent from the trace -- no word/probability is
// hardcoded, so this is reusable for any candidates event in any future
// video in this series.
export const ProbabilityBars: React.FC<{
  candidateEvent: CandidateEvent | null;
  startAt: number; // local frame the bars should start growing in
  sampleRevealAt?: number; // local frame the "winner" reveal should trigger; defaults to startAt + 30
  width?: number;
}> = ({ candidateEvent, startAt, sampleRevealAt, width = 280 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!candidateEvent || frame < startAt) return null;

  const revealAt = sampleRevealAt ?? startAt + 30;
  const sorted = [...candidateEvent.candidates].sort((a, b) => b.probability - a.probability);
  const maxP = sorted[0]?.probability ?? 1;
  // These are the focal visual during the sampling chapter. Give them enough
  // scale to read instantly on a 1080p player instead of leaving the right
  // half of the frame as dead space.
  const barAreaH = 140;
  const barW = Math.min(90, (width - (sorted.length - 1) * 10) / sorted.length);

  const hasWinner = frame >= revealAt;
  const winnerId = candidateEvent.sampled_id;

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
        next-token probabilities
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: barAreaH }}>
        {sorted.map((c, i) => {
          const growIn = ease(frame, startAt + i * 4, fps, 14, 210);
          const h = interpolate(growIn, [0, 1], [0, (c.probability / maxP) * barAreaH]);
          const isWinner = hasWinner && c.id === winnerId;
          const winnerPulse = isWinner ? ease(frame, revealAt, fps, 11, 240) : 0;
          const fade = hasWinner && !isWinner ? 0.35 : 1;
          const color = isWinner ? cv.terminalGreen : cv.func;
          return (
            <div key={c.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: barW }}>
              {isWinner && (
                <div style={{ opacity: winnerPulse, fontSize: 14, color: cv.terminalGreen }}>&#10003;</div>
              )}
              <div
                style={{
                  width: barW,
                  height: Math.max(2, h),
                  background: `${color}${isWinner ? "33" : "22"}`,
                  border: `1.5px solid ${color}`,
                  borderRadius: "6px 6px 2px 2px",
                  opacity: fade,
                  transform: isWinner ? `scale(${interpolate(winnerPulse, [0, 1], [1, 1.08])})` : "none",
                  boxShadow: isWinner ? `0 0 16px ${cv.terminalGreen}66` : "none",
                }}
              />
              <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: isWinner ? cv.terminalGreen : cv.muted, opacity: fade, fontWeight: isWinner ? 700 : 400 }}>
                {c.word}
              </div>
              <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, opacity: fade * 0.8 }}>
                {(c.probability * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
