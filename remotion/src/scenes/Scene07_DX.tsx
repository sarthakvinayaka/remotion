import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene07DX: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 535f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 3, fps, config: { damping: 18 } });

  const oldSteps = ["pick a stack", "write dockerfile", "wire CI/CD", "k8s manifests", "dashboards", "alerts", "secrets", "ownership"];
  // first 4 synced to whisper words spoken in this scene: stack/142, config/168, observability/203, security/247; remaining 4 trail evenly before the cut
  const oldStepStarts = [142, 168, 203, 247, 263, 276, 289, 302];
  const newSteps = ["fill 3 fields", "hit create", "ship."];

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <GridBg opacity={0.05} />
      <AbsoluteFill style={{ padding: 60 }}>
        <div style={{ opacity: titleIn, marginBottom: 12 }}>
          <Chip label="Developer experience" color={palette.violet} />
        </div>
        <KineticWords text="Before vs. after a platform." size={52} />

        {/* Split panels */}
        <div style={{ position: "absolute", left: 60, top: 260, width: 540, bottom: 80,
          border: `1.5px solid ${palette.accent2}55`, borderRadius: 18, padding: 24,
          background: `${palette.accent2}08`,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 13, color: palette.accent2, letterSpacing: 3, textTransform: "uppercase" }}>Without platform</div>
          <div style={{ fontFamily: fonts.display, fontSize: 34, fontWeight: 700, color: palette.ink, marginTop: 6 }}>Every new service is a mini project.</div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {oldSteps.map((s, i) => {
              const t = oldStepStarts[i];
              const sp = spring({ frame: frame - t, fps, config: { damping: 16, stiffness: 200 } });
              return (
                <div key={i} style={{
                  opacity: sp,
                  transform: `translateX(${interpolate(sp,[0,1],[-20,0])}px)`,
                  fontFamily: fonts.mono, fontSize: 18, color: palette.ink,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ color: palette.accent2 }}>▢</span> {s}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "absolute", right: 60, top: 260, width: 540, bottom: 80,
          border: `1.5px solid ${palette.accent}55`, borderRadius: 18, padding: 24,
          background: `${palette.accent}08`,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 13, color: palette.accent, letterSpacing: 3, textTransform: "uppercase" }}>With platform</div>
          <div style={{ fontFamily: fonts.display, fontSize: 34, fontWeight: 700, color: palette.ink, marginTop: 6 }}>Start from a known-good path.</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {newSteps.map((s, i) => {
              const t = 136 + i * 31;
              const sp = spring({ frame: frame - t, fps, config: { damping: 12, stiffness: 160 } });
              return (
                <div key={i} style={{
                  opacity: sp,
                  transform: `translateY(${interpolate(sp,[0,1],[20,0])}px) scale(${interpolate(sp,[0,1],[0.9,1])})`,
                  fontFamily: fonts.display, fontSize: 30, fontWeight: 800, color: palette.accent,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{
                    display: "inline-flex", width: 28, height: 28, borderRadius: 7,
                    background: palette.accent, color: palette.bg, alignItems: "center", justifyContent: "center",
                    fontFamily: fonts.mono, fontSize: 16, fontWeight: 800,
                  }}>{i + 1}</span>
                  {s}
                </div>
              );
            })}
            {/* mock terminal */}
            <div style={{
              marginTop: 12,
              background: palette.bg, border: `1px solid ${palette.line}`, borderRadius: 10,
              padding: "10px 14px", fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 1.55, color: palette.muted,
              opacity: interpolate(frame, [467, 495], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div style={{ color: palette.accent }}>$ platform new service</div>
              <div>? runtime · <span style={{ color: palette.ink }}>node</span></div>
              <div>? name · <span style={{ color: palette.ink }}>recommendations</span></div>
              <div>? owner · <span style={{ color: palette.ink }}>@growth-team</span></div>
              <div style={{ color: palette.primary }}>✓ created · pipeline · dashboards · catalog</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
