import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";
import { LostUpdateVisual } from "./LostUpdateVisual";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "Quick gut check"):
//   "server A's counter at 5, server B's at 5" 93-241  "A bumped, B bumped" 295-383
//   "A's now at 6, B's now at 6, they match" 405-555   "should be 7" 560-608
//   "sync those two 6s, quietly lose one increment" 751-928   "no error, just off" 935-1059
export const WhyBreaksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = ease(frame, 10, fps, 15, 210);
  const startAtFive = frame >= 93;
  const fiveIn = ease(frame, 93, fps, 14, 210);

  // Slow warning-tint scanlines drifting through the background -- keeps
  // the large empty margins around the centered demo quietly alive, and
  // telegraphs "something's off here" ahead of the bug reveal.
  const scanY = (frame * 1.1) % 1200;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.terminalRed} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY - 100,
          height: 200,
          background: `linear-gradient(180deg, transparent, ${cv.terminalRed}09, transparent)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Why a plain counter breaks" color={cv.terminalRed} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        {frame < 93 && (
          <div
            style={{
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 46,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Quick gut check before we jump into the fix.
          </div>
        )}

        {startAtFive && (
          <div style={{ opacity: fiveIn }}>
            <LostUpdateVisual incrementAt={295 - 93} syncAt={751 - 93} revealBugAt={935 - 93} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
