import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene03Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const services = ["user", "payment", "order", "notif", "search", "auth", "media", "billing", "email", "analytics"];
  // trimmed to fit 720p — the enumeration still reads visually
  const infra = ["CI/CD", "Docker", "K8s", "Logs", "Metrics", "Alerts"];

  // 0-120: title
  // 120-540: 10 services fly in grid
  // 540-1100: infra items duplicate under each service, stack of copies
  // 1100-1500: reveal "10 services + 10 copies of the same infra"

  // rescaled for 696f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  // "So you're not really building..." reveal onset at local 461
  const finalIn = spring({ frame: frame - 461, fps, config: { damping: 20 } });
  // dim the grid when the final overlay lands so the callout sits cleanly on top
  const gridDim = interpolate(frame, [453, 488], [1, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <GridBg opacity={0.05} color={palette.accent2} />
      <AbsoluteFill style={{ padding: 60 }}>
        <div style={{ opacity: titleIn }}>
          <Chip label="Now scale it up" color={palette.accent2} />
        </div>
        <div style={{ marginTop: 10 }}>
          <KineticWords text="10 services. 10 copies of everything." size={44} />
        </div>

        {/* Service grid: 5 cols x 2 rows, sized to fit 720p */}
        <div style={{
          position: "absolute", left: 60, top: 210, right: 60, bottom: 40,
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "1fr 1fr",
          gap: 12, opacity: gridDim,
        }}>
          {/* first 5 synced to whisper words: users/72, payments/83, orders/105, notifications/123, search/171; remaining 5 trail evenly before "every single team" (179) */}
          {services.map((name, i) => {
            const start = [72, 83, 105, 123, 171, 178, 185, 192, 199, 206][i];
            const s = spring({ frame: frame - start, fps, config: { damping: 15, stiffness: 190 } });
            return (
              <div key={i} style={{
                opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
                border: `1.5px solid ${palette.primary}66`,
                background: `linear-gradient(180deg, ${palette.primary}10, ${palette.bg})`,
                borderRadius: 10, padding: "8px 10px",
                display: "flex", flexDirection: "column", gap: 3,
                overflow: "hidden", minHeight: 0,
              }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: palette.muted, letterSpacing: 1 }}>svc/{String(i + 1).padStart(2, "0")}</div>
                <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 700, color: palette.ink, lineHeight: 1 }}>{name}</div>
                <div style={{ height: 1, background: palette.line, margin: "3px 0" }} />
                {/* synced to whisper words: CICD/249, Docker/263, Kubernetes(K8s)/284, logging/329, metrics/342, alerts/369; small per-card stagger keeps the grid feel */}
                {infra.map((it, j) => {
                  const wordFrame = [249, 263, 284, 329, 342, 369][j];
                  const t = wordFrame + i * 2;
                  const sj = spring({ frame: frame - t, fps, config: { damping: 18 } });
                  return (
                    <div key={j} style={{
                      opacity: sj,
                      transform: `translateX(${interpolate(sj,[0,1],[-8,0])}px)`,
                      fontFamily: fonts.mono, fontSize: 10,
                      color: palette.accent2,
                      display: "flex", justifyContent: "space-between",
                      lineHeight: 1.35,
                    }}>
                      <span>· {it}</span>
                      <span style={{ opacity: 0.5 }}>×</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Overlay: math reveal */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(finalIn, [0, 1], [0.85, 1])})`,
          opacity: finalIn,
          background: palette.bg, border: `2px solid ${palette.primary}`,
          padding: "22px 40px", borderRadius: 16,
          boxShadow: `0 30px 80px ${palette.primary}33`,
          fontFamily: fonts.display, textAlign: "center",
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.muted, letterSpacing: 3, textTransform: "uppercase" }}>You're not building</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: palette.ink, marginTop: 6 }}>
            10 services.
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: palette.primary }}>
            10 services × 10 copies of infra.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
