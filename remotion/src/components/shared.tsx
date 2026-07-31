import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";

// A tiny shared helper: reveal a word-by-word phrase
export const KineticWords: React.FC<{
  text: string;
  startFrame?: number;
  perWord?: number;
  size?: number;
  color?: string;
  weight?: number;
  family?: string;
  lineHeight?: number;
  maxWidth?: number;
}> = ({ text, startFrame = 0, perWord = 4, size = 72, color = palette.ink, weight = 700, family = fonts.display, lineHeight = 1.05, maxWidth = 1100 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", maxWidth, lineHeight, fontSize: size, rowGap: size * 0.15, columnGap: size * 0.28 }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - startFrame - i * perWord, fps, config: { damping: 18, stiffness: 180 } });
        const y = interpolate(s, [0, 1], [24, 0]);
        const blur = interpolate(s, [0, 1], [10, 0]);
        return (
          <span key={i} style={{
            display: "inline-block",
            fontSize: size, fontFamily: family, fontWeight: weight, color,
            opacity: s, transform: `translateY(${y}px)`, filter: `blur(${blur}px)`,
            letterSpacing: -0.5,
            whiteSpace: "nowrap",
          }}>{w}</span>
        );
      })}
    </div>
  );
};

export const Chip: React.FC<{ label: string; color?: string }> = ({ label, color = palette.primary }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "6px 14px", borderRadius: 999,
    border: `1px solid ${color}55`, background: `${color}12`,
    color, fontFamily: fonts.mono, fontSize: 14, fontWeight: 500, letterSpacing: 0.5,
    textTransform: "uppercase",
  }}>
    <span style={{ width: 6, height: 6, background: color, borderRadius: 999, boxShadow: `0 0 8px ${color}` }} />
    {label}
  </div>
);

export const GridBg: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.06, color = palette.ink }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.4) % 60;
  return (
    <div style={{
      position: "absolute", inset: -80,
      backgroundImage: `linear-gradient(${color}88 1px, transparent 1px), linear-gradient(90deg, ${color}88 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      transform: `translate(${-shift}px, ${-shift}px)`,
      opacity,
    }} />
  );
};

export const useEnter = (startFrame = 0, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config: { damping, stiffness: 180 } });
};
