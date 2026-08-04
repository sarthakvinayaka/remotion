import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "./Theme";

export const AnimatedGrid: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Calculate a slow scrolling offset
  const offset = (frame * 0.5) % 40;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Background base */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: colors.bg }} />
      
      {/* Dot Grid */}
      <div style={{
        position: "absolute",
        left: -40, top: -40, right: -40, bottom: -40,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `0px ${offset}px`,
      }} />

      {/* Radial vignette mask for depth */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at center, transparent 30%, ${colors.bg} 85%)`,
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
