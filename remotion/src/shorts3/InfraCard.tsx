import React from "react";
import { s3, s3Fonts } from "./theme";

// A single reusable card object. Scenes 1, 2 and 4 all render the SAME 10
// InfraCard instances and only change their x/y/scale/rotation/outline over
// time, so "10 cards become 1 card" reads as continuous motion rather than a
// cut between different elements.
export const InfraCard: React.FC<{
  x: number;
  y: number;
  scale: number;
  rotate?: number;
  outline: string;
  opacity?: number;
  tag?: string | null;
  tagBright?: boolean;
  size?: number;
  glow?: number;
}> = ({ x, y, scale, rotate = 0, outline, opacity = 1, tag = null, tagBright = true, size = 150, glow = 0 }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: size * 0.16,
          background: s3.ink,
          border: `${size * 0.02}px solid ${outline}`,
          boxShadow: glow > 0 ? `0 0 ${glow}px ${outline}` : "none",
        }}
      />
      {tag && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -size * 0.28,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontFamily: s3Fonts.mono,
            fontWeight: 700,
            fontSize: size * 0.16,
            color: tagBright ? s3.alarm : `${s3.dim}`,
            opacity: tagBright ? 1 : 0.4,
            letterSpacing: 1,
          }}
        >
          {tag}
          <div
            style={{
              marginTop: 4,
              height: 2,
              background: tagBright ? s3.alarm : "transparent",
              width: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
};
