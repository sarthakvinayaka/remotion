import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene02Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // rescaled for 553f duration (final_audio.m4a)
  const monoIn = spring({ frame: frame - 37, fps, config: { damping: 18 } });
  const shatter = interpolate(frame, [126, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bullets = ["Smaller ownership", "Cleaner boundaries", "Faster releases"];
  // "Microservices only solve..." caveat spans local 401-553 (runs to scene end)
  const caveatIn = spring({ frame: frame - 401, fps, config: { damping: 20 } });

  const services = new Array(6).fill(0).map((_, i) => ({ i }));

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <GridBg opacity={0.05} />
      <AbsoluteFill style={{ padding: 80 }}>
        <div style={{ marginBottom: 20 }}>
          <Chip label="The promise" color={palette.accent} />
        </div>
        <KineticWords text="Monolith → Microservices." size={68} />

        {/* Monolith */}
        <div style={{
          position: "absolute", left: 120, top: 260,
          width: 300, height: 300,
          border: `2px solid ${palette.primary}`,
          background: `${palette.primary}10`,
          borderRadius: 18,
          opacity: monoIn * interpolate(shatter, [0, 0.4], [1, 0], { extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(monoIn, [0, 1], [0.8, 1])}) rotate(${shatter * -8}deg)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: fonts.mono, fontSize: 26, color: palette.primary, fontWeight: 700, letterSpacing: 1,
        }}>MONOLITH</div>

        {/* Shattered services */}
        {services.map(({ i }) => {
          const targetX = 620 + (i % 3) * 200;
          const targetY = 260 + Math.floor(i / 3) * 170;
          const p = interpolate(shatter, [0.2 + i * 0.05, 0.8 + i * 0.03], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const startX = 260, startY = 400;
          const x = interpolate(p, [0, 1], [startX, targetX]);
          const y = interpolate(p, [0, 1], [startY, targetY]);
          const names = ["user", "payment", "order", "notif", "search", "auth"];
          return (
            <div key={i} style={{
              position: "absolute", left: x, top: y,
              width: 160, height: 140,
              borderRadius: 14,
              border: `1.5px solid ${palette.accent}`,
              background: `${palette.accent}12`,
              opacity: p,
              transform: `rotate(${(i - 2) * 4 * (1 - p)}deg)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column",
              fontFamily: fonts.mono, color: palette.accent,
            }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>service.</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{names[i]}</div>
            </div>
          );
        })}

        {/* Bullets */}
        <div style={{ position: "absolute", left: 120, bottom: 200, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* synced to whisper word timings: "smaller services"/126, "cleaner ownership"/161, "faster releases"/191 (local frames) */}
          {bullets.map((b, i) => {
            const start = [126, 161, 191][i];
            const s = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 200 } });
            const fade = interpolate(frame, [401, 430], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                fontFamily: fonts.display, fontSize: 40, fontWeight: 600, color: palette.ink,
                opacity: s * fade, transform: `translateX(${interpolate(s,[0,1],[-30,0])}px)`,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ color: palette.accent, fontFamily: fonts.mono, fontSize: 22 }}>0{i + 1}</span>
                {b}
              </div>
            );
          })}
        </div>

        {/* Caveat */}
        <div style={{
          position: "absolute", left: 120, right: 120, bottom: 70,
          opacity: caveatIn,
          transform: `translateY(${interpolate(caveatIn, [0, 1], [20, 0])}px)`,
          fontFamily: fonts.body, fontSize: 26, color: palette.muted, lineHeight: 1.35,
          borderLeft: `3px solid ${palette.accent2}`, paddingLeft: 18,
        }}>
          But microservices only solve the <span style={{ color: palette.accent2, fontWeight: 700 }}>code organization</span> problem.
          <br />They don't solve the <span style={{ color: palette.accent2, fontWeight: 700 }}>operational</span> one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
