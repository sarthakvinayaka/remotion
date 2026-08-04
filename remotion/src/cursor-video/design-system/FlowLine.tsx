import React from "react";
import { colors } from "./Theme";
import { useCurrentFrame } from "remotion";

export const FlowLine: React.FC<{
  pathD: string;
  active?: boolean;
  progress?: number; // 0 to 1 for drawing the line itself
  color?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({ pathD, active = false, progress = 1, color = colors.accentBlue, width = 200, height = 200, style }) => {
  const frame = useCurrentFrame();
  
  // Clean, dashed animation for active state (like marching ants)
  const dashOffset = active ? -(frame * 4) : 0;
  
  return (
    <div style={{ position: "absolute", width, height, ...style }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} overflow="visible">
        {/* Base line (drawn in based on progress) */}
        <path
          d={pathD}
          fill="none"
          stroke={colors.cardBorder}
          strokeWidth="2"
          strokeDasharray="1000"
          strokeDashoffset={1000 - (progress * 1000)}
        />
        
        {/* Active flowing dashed line */}
        {active && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeDashoffset={dashOffset}
            opacity={progress}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
