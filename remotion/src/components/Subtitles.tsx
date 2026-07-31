import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { palette, fonts } from "../theme";
import subtitles from "../subtitles.json";

type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };

const cues = subtitles as Cue[];

// binary search would be overkill for ~120 cues; linear scan is plenty
const findCue = (frame: number): Cue | null => {
  for (const c of cues) {
    if (frame >= c.startFrame && frame < c.endFrame) return c;
  }
  return null;
};

export const Subtitles: React.FC<{ globalFrame: number }> = ({ globalFrame }) => {
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
          bottom: 14,
          display: "flex",
          justifyContent: "center",
          opacity,
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            textAlign: "center",
            padding: "6px 20px",
            borderRadius: 10,
            background: "rgba(11,13,16,0.6)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.35)",
            fontFamily: fonts.body,
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: 0.1,
          }}
        >
          {cue.words.map((w, i) => {
            const active = globalFrame >= w.startFrame && globalFrame < w.endFrame + 2;
            const spoken = globalFrame >= w.endFrame;
            const color = active ? palette.primary : spoken ? palette.ink : `${palette.ink}99`;
            return (
              <span
                key={i}
                style={{
                  color,
                  display: "inline-block",
                  transition: "none",
                  textShadow: active ? `0 0 18px ${palette.primary}77` : "none",
                  marginRight: 14,
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
