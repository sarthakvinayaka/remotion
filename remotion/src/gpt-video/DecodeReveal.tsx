import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import type { DecodedEvent } from "./gptEvents";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

const FRAMES_PER_FLIP = 12; // ~0.4s @ 30fps, deliberately slower than the other components

// The payoff: each number chip in the final decoded sequence flips over
// (card flip) to reveal its word, left to right, ending on the full
// readable sentence. Driven entirely by one real DecodedEvent -- ids and
// words both come from the trace, nothing hardcoded.
export const DecodeReveal: React.FC<{
  decodedEvent: DecodedEvent | null;
  startAt: number;
  width?: number;
}> = ({ decodedEvent, startAt, width = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!decodedEvent || frame < startAt) return null;

  const local = frame - startAt;

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
        decoding back to words
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {decodedEvent.ids.map((id, i) => {
          const flipStart = i * FRAMES_PER_FLIP;
          const flipT = interpolate(local, [flipStart, flipStart + FRAMES_PER_FLIP], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const rotation = interpolate(flipT, [0, 1], [0, 180]);
          const showWord = flipT >= 0.5;
          const settleIn = ease(frame, startAt + flipStart, fps, 13, 220);

          return (
            <div
              key={i}
              style={{
                opacity: settleIn,
                perspective: 400,
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 44,
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${rotation}deg)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1.5px solid ${cv.keyword}`,
                    background: `${cv.keyword}1a`,
                    borderRadius: 8,
                    fontFamily: cvFonts.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: cv.keyword,
                  }}
                >
                  {id}
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1.5px solid ${cv.terminalGreen}`,
                    background: `${cv.terminalGreen}1a`,
                    borderRadius: 8,
                    fontFamily: cvFonts.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: cv.terminalGreen,
                    padding: "0 4px",
                    textAlign: "center",
                  }}
                >
                  {decodedEvent.words[i]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {local >= decodedEvent.ids.length * FRAMES_PER_FLIP && (
        <div
          style={{
            opacity: ease(frame, startAt + decodedEvent.ids.length * FRAMES_PER_FLIP, fps, 14, 200),
            fontFamily: cvFonts.display,
            fontSize: 20,
            fontWeight: 700,
            color: cv.ink,
            marginTop: 4,
          }}
        >
          "{decodedEvent.words.join(" ")}"
        </div>
      )}
    </div>
  );
};
