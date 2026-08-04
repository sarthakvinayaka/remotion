import React from "react";
import { colors } from "./Theme";
import { useCurrentFrame, interpolate } from "remotion";

interface FlowArrowProps {
  /** SVG path relative to a 0,0 origin — keep small, e.g. "M 0 0 L 0 60" */
  d: string;
  viewBox: string; // e.g. "0 0 2 60"
  width: number;
  height: number;
  color?: string;
  progress?: number;   // 0→1 draws the line
  active?: boolean;    // enables marching-ants flow animation
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FlowArrow: React.FC<FlowArrowProps> = ({
  d,
  viewBox,
  width,
  height,
  color = colors.accentBlue,
  progress = 1,
  active = false,
  strokeWidth = 2,
  style,
}) => {
  const frame = useCurrentFrame();

  // Total path length estimate — 1000 is a safe upper bound for small paths
  const totalLength = 1000;
  const drawLength = progress * totalLength;

  // marching ants offset
  const dashOffset = active ? -(frame * 3) % 24 : 0;

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      overflow="visible"
      style={{ display: "block", ...style }}
    >
      {/* Static grey base rail */}
      <path
        d={d}
        fill="none"
        stroke={colors.cardBorder}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
      />

      {/* Animated draw-in strokes */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${totalLength}`}
        strokeDashoffset={totalLength - drawLength}
        opacity={progress}
      />

      {/* Marching ants flow overlay when active */}
      {active && (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
          strokeDasharray="4 24"
          strokeDashoffset={dashOffset}
          opacity={0.8}
          filter="drop-shadow(0 0 4px currentColor)"
        />
      )}
    </svg>
  );
};
