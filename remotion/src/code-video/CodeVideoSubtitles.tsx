import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { cv, cvFonts } from "./theme";
import subtitles from "../codevideo-subtitles.json";

type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };

const cues = subtitles as Cue[];

const findCue = (frame: number): Cue | null => {
  for (const c of cues) {
    if (frame >= c.startFrame && frame < c.endFrame) return c;
  }
  return null;
};

export const CodeVideoSubtitles: React.FC<{ globalFrame: number }> = ({ globalFrame }) => {
  const cue = findCue(globalFrame);
  if (!cue) return null;

  const fadeIn = interpolate(globalFrame, [cue.startFrame, cue.startFrame + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(globalFrame, [cue.endFrame - 4, cue.endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 18,
          display: "flex",
          justifyContent: "center",
          opacity,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            textAlign: "center",
            padding: "8px 22px",
            borderRadius: 10,
            background: "rgba(11,14,20,0.65)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.4)",
            fontFamily: cvFonts.display,
            fontSize: 26,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {cue.words.map((w, i) => {
            const active = globalFrame >= w.startFrame && globalFrame < w.endFrame + 2;
            const spoken = globalFrame >= w.endFrame;
            const color = active ? cv.terminalGreen : spoken ? cv.ink : `${cv.ink}99`;
            return (
              <span
                key={i}
                style={{
                  color,
                  display: "inline-block",
                  textShadow: active ? `0 0 16px ${cv.terminalGreen}66` : "none",
                  marginRight: 12,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
