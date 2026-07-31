import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene08Example: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 830f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 18 } });

  const oldTasks = ["create repo", "write Dockerfile", "add CI", "configure K8s", "set up dashboards", "wire logs", "wire alerts"];
  // local frames matched to whisper words: docker file/146, CI/197, Kubernetes/218, dashboard/269, logs/309, alerts/344
  const oldTaskStarts = [120, 146, 197, 218, 269, 309, 344];
  const newTasks = ["template · node.recommendations", "auto: pipeline, dashboards, catalog"];
  // local frames matched to whisper words: template/450, platform generates the boilerplate/577
  const newTaskStarts = [450, 577];

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <GridBg opacity={0.05} />
      <AbsoluteFill style={{ padding: 60 }}>
        <div style={{ opacity: titleIn, marginBottom: 12 }}>
          <Chip label="Case: new recommendation service" />
        </div>
        <KineticWords text="Same job. Two paths." size={54} />

        {/* Old path timeline */}
        <div style={{ position: "absolute", left: 60, top: 260, right: 60 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 13, color: palette.accent2, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Old world</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {oldTasks.map((t, i) => {
              const start = oldTaskStarts[i];
              const s = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 200 } });
              return (
                <React.Fragment key={i}>
                  <div style={{
                    opacity: s, transform: `translateY(${interpolate(s,[0,1],[10,0])}px)`,
                    padding: "8px 12px", borderRadius: 8,
                    border: `1.5px solid ${palette.accent2}66`, background: `${palette.accent2}12`,
                    fontFamily: fonts.mono, fontSize: 15, color: palette.accent2, fontWeight: 700,
                  }}>{t}</div>
                  {i < oldTasks.length - 1 && (
                    <span style={{ color: palette.accent2, opacity: s, fontSize: 20 }}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 13, color: palette.muted, marginTop: 12 }}>
            days of setup · duplicated per service · every time
          </div>
        </div>

        {/* New path */}
        <div style={{ position: "absolute", left: 60, top: 480, right: 60 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 13, color: palette.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Platform world</div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {newTasks.map((t, i) => {
              const start = newTaskStarts[i];
              const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 160 } });
              return (
                <React.Fragment key={i}>
                  <div style={{
                    opacity: s, transform: `scale(${interpolate(s,[0,1],[0.85,1])})`,
                    padding: "14px 20px", borderRadius: 12,
                    border: `1.5px solid ${palette.accent}`, background: `${palette.accent}16`,
                    fontFamily: fonts.mono, fontSize: 20, color: palette.accent, fontWeight: 800,
                  }}>{t}</div>
                  {i < newTasks.length - 1 && (
                    <span style={{ color: palette.accent, opacity: s, fontSize: 28, fontWeight: 700 }}>⟶</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{
            marginTop: 22, fontFamily: fonts.display, fontSize: 34, fontWeight: 700, color: palette.ink,
            opacity: interpolate(frame,[760,794],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),
          }}>
            Start from a <span style={{ color: palette.accent }}>known-good path</span> instead of inventing one.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
