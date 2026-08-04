import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 02_IdeClient  3336→4350 frames (1014 local frames, 33.8s)
// Beat map (local frames from Whisper):
//   frame   0 : "the first layer is the application..."
//   frame 270 : "showing AI responses..."
//   frame ~450: "which file is open..."
//   frame 825 : "IDE is not just a chat window..."

export const IdeClientScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn = smoothIn(frame, 5, 45);

  // IDE node
  const editorIn = springIn(frame, 30, 50);
  
  // Developer action pulses
  const devActionIn = springIn(frame, 120, 60);
  const devActionOut = 1 - smoothIn(frame, 260, 20);

  // Responsibilities (synced to audio)
  const r1 = smoothIn(frame, 284, 25);
  const r2 = smoothIn(frame, 313, 25);
  const r3 = smoothIn(frame, 358, 25);
  const r4 = smoothIn(frame, 402, 25);

  // "context" @ local 550
  const contextTitleIn = springIn(frame, 550, 40);
  const c1 = springIn(frame, 596, 35);
  const c2 = springIn(frame, 633, 35);
  const c3 = springIn(frame, 680, 35);
  const c4 = springIn(frame, 714, 35);

  // Arrow IDE → AI Engine
  const arrowIn = smoothIn(frame, 800, 50);
  const aiIn    = springIn(frame, 873, 50); // "AI engine"

  // "IDE is not just a chat window..." @ local 910
  const quoteIn = springIn(frame, 910, 70);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {devActionIn > 0.01 && devActionOut > 0.01 && (
        <div style={{ position: "absolute", left: 100, top: "45%", opacity: devActionIn * devActionOut, transform: `scale(${devActionIn})` }}>
          <ArchNode label="Developer Actions" icon="⌨️" progress={devActionIn} active accentColor={colors.accentOrange} width={200} />
          <FlowArrow d="M 200 25 L 300 25" viewBox="0 0 300 50" width={300} height={50} color={colors.accentOrange} progress={devActionIn} active style={{ position: "absolute", left: 0, top: 0, zIndex: -1 }} />
        </div>
      )}

      <div style={{
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 80,
        padding: "0 120px",
      }}>
        {/* IDE Node */}
        <ArchNode label="Cursor IDE Client" sublabel="The Application Layer" icon="⚡" progress={editorIn} active accentColor={colors.accentBlue} width={300}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {[
              { t: "Chat Interface",    p: r1 },
              { t: "Inline Suggestions", p: r2 },
              { t: "Diff Viewer",        p: r3 },
              { t: "Conversation State", p: r4 },
            ].map(({ t, p }) => (
              <div key={t} style={{
                opacity: p, transform: `translateX(${(1 - p) * -12}px)`,
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 7, padding: "7px 14px",
                ...type.mono, fontSize: 13, color: colors.textMuted,
              }}>✓ {t}</div>
            ))}
          </div>
        </ArchNode>

        {/* Arrow to Context */}
        {contextTitleIn > 0.01 && (
          <FlowArrow d="M 0 1 L 60 1" viewBox="0 0 60 2" width={60} height={3} color={colors.accentBlue} progress={contextTitleIn} active={c1 > 0.5} />
        )}

        {/* Context column */}
        {contextTitleIn > 0.1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ ...type.body, fontSize: 18, color: colors.accentBlue, opacity: contextTitleIn, marginBottom: 4 }}>
              Context Captured
            </div>
            {[
              { l: "Active File",          icon: "📄", c: colors.accentBlue,   p: c1 },
              { l: "Cursor Position",       icon: "📍", c: colors.accentGreen,  p: c2 },
              { l: "Error Diagnostics",     icon: "⚠️", c: colors.accentOrange, p: c3 },
              { l: "Recent Edits",          icon: "✏️", c: colors.accentPurple, p: c4 },
            ].map(({ l, icon, c, p }) => (
              <ArchNode key={l} label={l} icon={icon} progress={p} active accentColor={c} width={260} />
            ))}
          </div>
        )}

        {/* Arrow to AI Engine */}
        {arrowIn > 0.01 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <FlowArrow d="M 0 1 L 70 1" viewBox="0 0 70 2" width={70} height={3} color={colors.accentPurple} progress={arrowIn} active={aiIn > 0.5} />
            <ArchNode label="AI Engine" sublabel="Receives context" icon="🧠" progress={aiIn} active accentColor={colors.accentPurple} width={260} />
          </div>
        )}
      </div>

      {/* "IDE is not just a chat window..." */}
      {quoteIn > 0.01 && (
        <div style={{
          position: "absolute", bottom: 120,
          textAlign: "center", opacity: quoteIn, maxWidth: 900,
        }}>
          <div style={{ ...type.hero, fontSize: 38, color: colors.textMain }}>
            The IDE is not just a chat window.
            <br />
            It is the AI's <span style={{ color: colors.accentBlue }}>connection to your development environment.</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
