import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene10Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 768f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 18 } });

  const rows: [string, string][] = [
    ["Split the application", "Make the pieces manageable"],
    ["Team independence", "Team consistency"],
    ["Architecture scale", "Organizational scale"],
  ];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${palette.bg}, ${palette.bgAlt})` }}>
      <GridBg opacity={0.05} />
      <AbsoluteFill style={{ padding: 80 }}>
        <div style={{ opacity: titleIn, marginBottom: 16 }}>
          <Chip label="Recap · two sides of the same story" />
        </div>
        <KineticWords text="Microservices vs. Platform Engineering." size={48} />

        <div style={{ position: "absolute", left: 80, right: 80, top: 300, bottom: 80,
          display: "flex", flexDirection: "column", gap: 22, justifyContent: "center" }}>
          {/* synced to whisper words: row0 "split your app...manageable" 0-178, row1 "team independence...consistency" 215-348, row2 "scale architecture...organization" 370-485 */}
          {rows.map(([a, b], i) => {
            const start = [40, 215, 370][i];
            const s = spring({ frame: frame - start, fps, config: { damping: 20 } });
            return (
              <div key={i} style={{
                opacity: s, transform: `translateY(${interpolate(s,[0,1],[24,0])}px)`,
                display: "grid", gridTemplateColumns: "1fr 60px 1fr", alignItems: "center", gap: 20,
              }}>
                <div style={{
                  fontFamily: fonts.display, fontSize: 34, fontWeight: 700, color: palette.ink,
                  padding: "18px 22px", border: `1.5px solid ${palette.line}`, borderRadius: 14,
                  borderLeft: `4px solid ${palette.accent2}`, background: palette.surface,
                }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.accent2, letterSpacing: 2, textTransform: "uppercase" }}>Microservices</div>
                  {a}
                </div>
                <div style={{ textAlign: "center", color: palette.muted, fontFamily: fonts.mono, fontSize: 24 }}>↔</div>
                <div style={{
                  fontFamily: fonts.display, fontSize: 34, fontWeight: 700, color: palette.ink,
                  padding: "18px 22px", border: `1.5px solid ${palette.line}`, borderRadius: 14,
                  borderLeft: `4px solid ${palette.accent}`, background: palette.surface,
                }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.accent, letterSpacing: 2, textTransform: "uppercase" }}>Platform</div>
                  {b}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
