import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, GridBg } from "../components/shared";

export const Scene11Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // synced to whisper words: "serious engineering orgs don't just build services" (local 0-70),
  // "they build the platform underneath them" (94-135), then outro "Thank you..." begins at 148
  const l1 = spring({ frame: frame - 1, fps, config: { damping: 20 } });
  const l2 = spring({ frame: frame - 4, fps, config: { damping: 18 } });
  const l3 = spring({ frame: frame - 94, fps, config: { damping: 14, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1000px 600px at 50% 60%, ${palette.primary}22, transparent 65%), ${palette.bg}` }}>
      <GridBg opacity={0.06} color={palette.primary} />
      <AbsoluteFill style={{ padding: 80, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ opacity: l1, transform: `translateY(${interpolate(l1,[0,1],[20,0])}px)`,
          fontFamily: fonts.mono, fontSize: 16, letterSpacing: 6, textTransform: "uppercase", color: palette.muted }}>
          The takeaway
        </div>
        <div style={{ height: 22 }} />
        <div style={{
          opacity: l2 * interpolate(frame, [70, 100], [1, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(l2,[0,1],[24,0])}px) translateY(${interpolate(frame,[70,118],[0,-14],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}px)`,
          fontFamily: fonts.display, fontSize: 48, fontWeight: 700, color: palette.ink, maxWidth: 1000, lineHeight: 1.1,
        }}>
          Serious engineering orgs don't just build services.
        </div>
        <div style={{ height: 18 }} />
        <div style={{
          opacity: l3,
          transform: `scale(${interpolate(l3,[0,1],[0.85,1])}) translateY(${Math.sin(frame * 0.05) * 3}px)`,
          fontFamily: fonts.display, fontSize: 78, fontWeight: 800, letterSpacing: -2,
          color: palette.primary,
          textShadow: `0 0 ${20 + Math.sin(frame * 0.08) * 10}px ${palette.primary}66`,
          lineHeight: 1.05,
        }}>
          Build the platform around them.
        </div>

        <div style={{
          marginTop: 60, opacity: interpolate(frame,[148,180],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),
          display: "flex", gap: 20, alignItems: "center",
        }}>
          <div style={{ width: 46, height: 3, background: palette.primary }} />
          <div style={{ fontFamily: fonts.mono, fontSize: 14, color: palette.muted, letterSpacing: 3, textTransform: "uppercase" }}>
            like · share · subscribe
          </div>
          <div style={{ width: 46, height: 3, background: palette.primary }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
