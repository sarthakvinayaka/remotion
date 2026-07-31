import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 691f duration (final_audio.m4a): "same wall." lands at local 336
  const s2 = spring({ frame: frame - 129, fps, config: { damping: 18 } });
  const s3 = frame > 295;
  // "Platform Engineering" card settles right as the narrator starts
  // "That's exactly where platform engineering comes in" (spans the cut into Scene02)
  const s4 = spring({ frame: frame - 619, fps, config: { damping: 20, stiffness: 220 } });

  const painWords = ["Deployment.", "Observability.", "Onboarding.", "Secrets.", "Alerts.", "CI/CD."];

  const bgShift = interpolate(frame, [0, 691], [0, -100]);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 700px at ${50 + bgShift * 0.1}% 40%, ${palette.primary}18, transparent 60%), ${palette.bg}` }}>
      <GridBg opacity={0.08} />
      <AbsoluteFill style={{ padding: 80, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: 24 }}>
          <Chip label="Ep · Microservices at scale" />
        </div>
        <KineticWords text="Microservices sound great." startFrame={4} size={96} maxWidth={1500} />
        <div style={{ height: 18 }} />
        <div style={{
          opacity: s2 * interpolate(frame, [246, 281], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(s2,[0,1],[24,0])}px)`,
          fontFamily: fonts.body, fontSize: 30, color: palette.muted, maxWidth: 1200, lineHeight: 1.3,
        }}>
          Split the app. Let teams move faster. Ship independently.
        </div>

        {s3 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {painWords.map((w, i) => {
              const start = 295 + i * 17;
              const p = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 140 } });
              // 3 cols x 2 rows within 1280 width, sit in mid area between title & bottom callout
              const col = i % 3;
              const row = Math.floor(i / 3);
              const x = 120 + col * 360 + Math.sin(i) * 14;
              const y = 470 + row * 60;
              const rot = (i % 2 === 0 ? -1 : 1) * (2 + i * 0.5);
              // fade out well before the "Platform Engineering" reveal at frame 619
              const fade = interpolate(frame, [524, 587], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const drift = Math.sin((frame - start) * 0.06 + i) * 4;
              return (
                <div key={i} style={{
                  position: "absolute", left: x, top: y,
                  fontFamily: fonts.mono, fontSize: 28, fontWeight: 700,
                  color: palette.accent2,
                  opacity: p * fade,
                  transform: `translate(${interpolate(p,[0,1],[-10,0])}px, ${interpolate(p,[0,1],[20,drift])}px) rotate(${rot}deg)`,
                  textShadow: `0 0 12px ${palette.accent2}55`,
                }}>{w}</div>
              );
            })}
          </div>
        )}

        {/* subtle strike-through slash under the pain words */}
        <div style={{
          position: "absolute", left: 80, right: 80, top: 560,
          height: 2, background: `linear-gradient(90deg, transparent, ${palette.accent2}, transparent)`,
          opacity: interpolate(frame, [482, 556, 619], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scaleX(${interpolate(frame,[461,556],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})})`,
          transformOrigin: "left",
        }} />

        <div style={{
          position: "absolute", left: 80, bottom: 70, right: 80,
          opacity: s4, transform: `translateY(${interpolate(s4,[0,1],[30,0])}px)`,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 14, color: palette.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
            The real fix →
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: 68, fontWeight: 700, color: palette.ink, letterSpacing: -1 }}>
            Platform <span style={{ color: palette.primary, textShadow: `0 0 24px ${palette.primary}66` }}>Engineering</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
