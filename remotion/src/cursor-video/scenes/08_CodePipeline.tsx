import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 08_CodePipeline  9157→9647 frames (490 local frames, 16.3s)
// Beat map (local frames):
//   frame  23 : "only half the challenge..."
//   frame 271 : "create a patch, show exactly what changed..."
//   frame 427 : "software change needs trust..."

export const CodePipelineScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn  = smoothIn(frame, 5, 35);
  const titleOut = 1 - smoothIn(frame, 60, 25);

  // Pipeline stages
  const aiOutIn   = springIn(frame, 30, 45);
  const a1In      = smoothIn(frame, 80, 35);
  const diffIn    = springIn(frame, 115, 45);

  // "create a patch" @259
  const a2In      = smoothIn(frame, 259, 35);
  const previewIn = springIn(frame, 275, 45);

  // "show exactly what changed" @304
  const a3In      = smoothIn(frame, 304, 35);
  const approveIn = springIn(frame, 320, 45);

  // "then applies it" @343 (button press at 343, arrow and apply right after)
  const a4In      = smoothIn(frame, 345, 35);
  const applyIn   = springIn(frame, 360, 40);

  // "software change needs trust" @375
  const trustIn   = smoothIn(frame, 375, 60);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* Title */}
      <div style={{ position: "absolute", top: 80, opacity: titleIn * titleOut, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 60, color: colors.accentGreen }}>Code Change Pipeline</div>
        <div style={{ ...type.body, fontSize: 24, color: colors.textMuted, marginTop: 12 }}>
          Coding is only half the challenge — applying changes safely is the other half
        </div>
      </div>

      {aiOutIn > 0.1 && (
        <div style={{ position: "absolute", display: "flex", flexDirection: "row", alignItems: "center", gap: 0, padding: "0 60px" }}>

          <ArchNode label="AI Output" sublabel="Raw model response" icon="🤖" progress={aiOutIn} accentColor={colors.textMuted} width={200} />

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentBlue} progress={a1In} active={diffIn > 0.5} />

          <ArchNode label="Diff Generator" sublabel="Git-style patches" icon="🔄" progress={diffIn} active accentColor={colors.accentBlue} width={240}>
            {diffIn > 0.6 && (
              <div style={{ marginTop: 8, ...type.mono, fontSize: 12, textAlign: "left", borderRadius: 4, overflow: "hidden", border: `1px solid ${colors.cardBorder}` }}>
                {[
                  { t: "  function auth() {",      c: colors.textMuted, bg: "transparent" },
                  { t: "- // TODO: implement",    c: "#f87171", bg: "rgba(239,68,68,0.15)" },
                  { t: "+ return GoogleAuth();",   c: "#34d399", bg: "rgba(16,185,129,0.15)" },
                  { t: "  }",                       c: colors.textMuted, bg: "transparent" },
                ].map(({ t, c, bg }, i) => (
                  <div key={i} style={{ color: c, opacity: smoothIn(frame, 140 + i * 8, 20), padding: "4px 8px", background: bg, borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.02)` : "none", whiteSpace: "pre" }}>{t}</div>
                ))}
              </div>
            )}
          </ArchNode>

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentBlue} progress={a2In} active={previewIn > 0.5} />

          <ArchNode label="Change Preview" sublabel="Developer reviews diff" icon="👀" progress={previewIn} active accentColor={colors.accentPurple} width={210} />

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentGreen} progress={a3In} active={approveIn > 0.5} />

          <ArchNode label="Developer Approval" sublabel="Human in the loop" icon="✅" progress={approveIn} active accentColor={colors.accentGreen} width={240}>
            {approveIn > 0.7 && (() => {
              // Press button at frame 343 just before "Applied to Repo" arrow starts at 345
              const buttonPress = smoothIn(frame, 343, 5) * (1 - smoothIn(frame, 348, 5));
              return (
                <div style={{
                  marginTop: 10, background: colors.accentBlue, color: "#fff",
                  padding: "8px 20px", borderRadius: 8, ...type.body, fontSize: 15, fontWeight: 500,
                  opacity: smoothIn(frame, 335, 20), textAlign: "center",
                  transform: `scale(${1 - buttonPress * 0.08})`,
                  boxShadow: buttonPress > 0.1 ? "0 0 0 rgba(59,130,246,0)" : "0 4px 12px rgba(59,130,246,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>Apply Changes</div>
              );
            })()}
          </ArchNode>

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentGreen} progress={a4In} active={applyIn > 0.5} />

          <ArchNode label="Applied to Repo" sublabel="Files updated safely" icon="📂" progress={applyIn} active accentColor={colors.accentGreen} width={200} />
        </div>
      )}

      {/* "software change needs trust" */}
      {trustIn > 0.01 && (
        <div style={{ position: "absolute", bottom: 110, opacity: trustIn, textAlign: "center", maxWidth: 700 }}>
          <div style={{ ...type.hero, fontSize: 36, color: colors.textMain }}>
            Software change needs <span style={{ color: colors.accentGreen }}>trust.</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
