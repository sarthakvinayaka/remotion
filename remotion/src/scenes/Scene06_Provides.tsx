import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene06Provides: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 592f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  const items = [
    ["Service templates", "one command → a fully wired repo"],
    ["Automated deployments", "prod pipeline, day 0"],
    ["Logging & monitoring", "standard dashboards attached"],
    ["Secrets management", "no plaintext, ever"],
    ["Service catalog", "who owns what, at a glance"],
    ["Self-service infra", "no more tickets"],
    ["Policy & guardrails", "safe defaults, hard limits"],
  ];
  // first 6 synced to whisper words spoken in this scene; "Policy & guardrails" has no
  // literal narration match, so it trails last rather than competing with a mismatched word
  const itemStarts = [51, 90, 131, 180, 213, 249, 290];

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <GridBg opacity={0.05} />
      <AbsoluteFill style={{ padding: 80 }}>
        <div style={{ opacity: titleIn, marginBottom: 16 }}>
          <Chip label="What the platform provides" color={palette.primary} />
        </div>
        <KineticWords text="A repeatable way to ship." size={64} />

        <div style={{ position: "absolute", left: 80, top: 300, right: 80, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {items.map(([h, s], i) => {
            const start = itemStarts[i];
            const sp = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 200 } });
            return (
              <div key={i} style={{
                opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-30,0])}px)`,
                border: `1.5px solid ${palette.line}`,
                borderLeft: `4px solid ${palette.primary}`,
                background: palette.surface, padding: "14px 18px", borderRadius: 10,
              }}>
                <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: palette.ink }}>{h}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 15, color: palette.muted, marginTop: 4 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
