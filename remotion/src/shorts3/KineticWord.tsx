import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { s3Fonts } from "./theme";

// Single reusable hero-text component. `frame` passed in is the composition's
// global frame (not scene-local) so callers don't need to re-derive offsets.
export const KineticWord: React.FC<{
  text: string;
  color: string;
  enterFrame: number;
  holdFrames: number;
  exitFrame?: number;
  size?: number;
  rotateSettle?: boolean;
}> = ({ text, color, enterFrame, holdFrames, exitFrame, size = 120, rotateSettle = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;
  const computedExit = exitFrame !== undefined ? exitFrame - enterFrame : holdFrames;

  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 200 } });
  const exit = interpolate(local, [computedExit, computedExit + 12], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(enter, exit);
  const scale = interpolate(enter, [0, 1], [0.8, 1]) * interpolate(exit, [0, 1], [1.08, 1]);
  const rotate = rotateSettle ? interpolate(enter, [0, 1], [-6, 0]) : 0;
  const translateY = interpolate(enter, [0, 1], [40, 0]);

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: s3Fonts.display,
          fontSize: size,
          color,
          textTransform: "uppercase",
          letterSpacing: -1,
          textAlign: "center",
          opacity,
          transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
          textShadow: `0 0 50px ${color}66`,
        }}
      >
        {text}
      </div>
    </div>
  );
};
