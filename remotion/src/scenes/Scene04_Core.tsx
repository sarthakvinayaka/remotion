import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene04Core: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // rescaled for 715f duration (final_audio.m4a)
  const items = ["deploy", "observe", "secure", "debug", "recover"];
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  // "The platform quietly becomes the product, even though nobody meant..." at local 575
  const punchline = spring({ frame: frame - 575, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${palette.bgAlt}, ${palette.bg})` }}>
      <GridBg opacity={0.04} />
      <AbsoluteFill style={{ padding: 80, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: titleIn, marginBottom: 20 }}>
          <Chip label="The core problem" color={palette.accent2} />
        </div>
        <KineticWords text="Code gets smaller." size={68} color={palette.muted} maxWidth={1100} />
        <div style={{ height: 6 }} />
        <KineticWords text="Systems get more complex." startFrame={20} size={84} color={palette.ink} maxWidth={1100} />

        {/* Circling items around a center */}
        <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", width: 420, height: 420 }}>
          {/* synced to whisper timings: deploy/234, monitor/264, secure/297, debug/325, recover/353 (local frames) */}
          {items.map((it, i) => {
            const start = [234, 264, 297, 325, 353][i];
            const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 210 } });
            const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2 + frame * 0.003;
            const r = 155;
            const x = 210 + Math.cos(angle) * r - 55;
            const y = 210 + Math.sin(angle) * r - 20;
            return (
              <div key={i} style={{
                position: "absolute", left: x, top: y,
                padding: "10px 18px", borderRadius: 999,
                border: `1.5px solid ${palette.primary}`,
                background: `${palette.primary}18`,
                fontFamily: fonts.mono, color: palette.primary, fontSize: 20, fontWeight: 700,
                opacity: s,
                transform: `scale(${interpolate(s,[0,1],[0.6,1])})`,
                letterSpacing: 0.5,
              }}>{it}</div>
            );
          })}
          {/* Center label */}
          <div style={{
            position: "absolute", left: 100, top: 175,
            width: 220, height: 90, borderRadius: 14,
            background: palette.surface, border: `1.5px solid ${palette.line}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            fontFamily: fonts.display,
          }}>
            <div style={{ fontSize: 13, color: palette.muted, fontFamily: fonts.mono, letterSpacing: 2, textTransform: "uppercase" }}>every team must know</div>
            <div style={{ fontSize: 24, color: palette.ink, fontWeight: 700, marginTop: 2 }}>all of it</div>
          </div>
        </div>

        <div style={{
          position: "absolute", left: 80, bottom: 90,
          opacity: punchline, transform: `translateY(${interpolate(punchline,[0,1],[20,0])}px)`,
          fontFamily: fonts.body, fontSize: 26, color: palette.ink, maxWidth: 700,
          borderLeft: `3px solid ${palette.primary}`, paddingLeft: 18,
        }}>
          The platform becomes the product — <span style={{ color: palette.primary, fontWeight: 700 }}>even though nobody meant for it to.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
