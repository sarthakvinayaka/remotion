import React from "react";
import { colors, type } from "./Theme";
import { interpolate, Easing } from "remotion";

interface ArchNodeProps {
  label: string;
  sublabel?: string;
  icon?: string;
  progress?: number;    // 0 to 1 for entrance animation
  active?: boolean;
  accentColor?: string;
  width?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ArchNode: React.FC<ArchNodeProps> = ({
  label,
  sublabel,
  icon,
  progress = 1,
  active = false,
  accentColor = colors.accentBlue,
  width = 220,
  style,
  children,
}) => {
  // Entrance animation: pop in from below
  const nodeScale = interpolate(progress, [0, 1], [0.85, 1], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const nodeOpacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const nodeY = interpolate(progress, [0, 1], [20, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width,
        opacity: nodeOpacity,
        transform: `scale(${nodeScale}) translateY(${nodeY}px)`,
        background: active
          ? `linear-gradient(135deg, ${colors.cardBg}, ${accentColor}18)`
          : colors.cardBg,
        border: `1.5px solid ${active ? accentColor : colors.cardBorder}`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxShadow: active
          ? `0 0 0 1px ${accentColor}30, 0 12px 40px rgba(0,0,0,0.6), 0 0 30px ${accentColor}20`
          : "0 4px 20px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {icon && (
        <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>
      )}
      <div
        style={{
          ...type.body,
          color: active ? colors.textMain : colors.textMuted,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            ...type.mono,
            color: accentColor,
            fontSize: 11,
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          {sublabel}
        </div>
      )}
      {children && (
        <div style={{ width: "100%", marginTop: 4 }}>{children}</div>
      )}
    </div>
  );
};
