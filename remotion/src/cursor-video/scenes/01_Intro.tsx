import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn, fadeOut } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 01_Intro  0→3336 frames (111.2s)
// Beat map from Whisper medium.en word timestamps:
//   frame   0 : "5 years ago..."
//   frame 191 : "Someone who could read..."
//   frame 537 : "add google authentication..."
//   frame 617 : "And an AI agent..."
//   frame 870 : "interesting question is not..."
//   frame 992 : "what architecture allows..."
//   frame 1147: "cursor is not just..."
//   frame 1346: "code intelligence system..."
//   frame 1800: "simplest possible design..."
//   frame 2207: "software engineering is different..."

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title card
  const titleIn  = smoothIn(frame, 5, 40);
  const titleOut = fadeOut(frame, 170, 25);
  const titleOp  = titleIn * titleOut;

  // "Someone who could read 1000 lines of code..."
  const oldWayIn  = springIn(frame, 191, 40);
  const oldWayOut = fadeOut(frame, 510, 30);
  const oldWayOp  = oldWayIn * oldWayOut;
  const item1 = smoothIn(frame, 220, 25);
  const item2 = smoothIn(frame, 260, 25);
  const item3 = smoothIn(frame, 300, 25);
  const item4 = smoothIn(frame, 340, 25);

  // "add google authentication..." — cursor chat typing
  const cursorIn  = springIn(frame, 530, 45);
  const cursorOut = fadeOut(frame, 780, 30);
  const cursorOp  = cursorIn * cursorOut;
  const typedLen  = Math.max(0, Math.min(44, (frame - 537) * 0.7));
  const fullPrompt = "Add Google authentication to my application.";
  const typedText  = fullPrompt.slice(0, Math.floor(typedLen));
  const showBlink  = frame % 28 < 14 && cursorOp > 0.1;

  // "the interesting question is NOT..."
  const questionIn  = springIn(frame, 870, 50);
  const questionOut = fadeOut(frame, 960, 25);
  const questionOp  = questionIn * questionOut;

  // "what architecture allows..."
  const archIn  = springIn(frame, 992, 55);
  const archOut = fadeOut(frame, 1110, 30);
  const archOp  = archIn * archOut;

  // "cursor is not just a chatbot... behind that simple interface..."
  const systemsIn  = springIn(frame, 1147, 55);
  const systemsOut = fadeOut(frame, 1760, 30);
  const systemsOp  = systemsIn * systemsOut;
  const s1 = springIn(frame, 1250, 30);
  const s2 = springIn(frame, 1310, 30);
  const s3 = springIn(frame, 1370, 30);
  const s4 = springIn(frame, 1430, 30);
  const s5 = springIn(frame, 1490, 30);
  const s6 = springIn(frame, 1550, 30);

  // "simplest possible design..."
  const pipeIn  = springIn(frame, 1800, 60);
  const pipeOut = fadeOut(frame, 3300, 30);
  const pipeOp  = pipeIn * pipeOut;
  const dev2In  = springIn(frame, 1830, 40);
  const a1In    = smoothIn(frame, 1880, 30);
  const llmIn   = springIn(frame, 1920, 40);
  const a2In    = smoothIn(frame, 1970, 30);
  const codeIn  = springIn(frame, 2010, 40);

  // "software engineering is different..."
  const failIn = springIn(frame, 2207, 50);

  // Audio cues after "Generated Code"
  const ex1In = springIn(frame, 2058, 40); // "small questions"
  const ex2In = springIn(frame, 2117, 40); // "python script"
  const ex3In = springIn(frame, 2183, 40); // "simple component"

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* 1. Title card */}
      <div style={{ position: "absolute", opacity: titleOp, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 88, color: colors.textMain, lineHeight: 1 }}>
          5 Years Ago
        </div>
        <div style={{ ...type.body, fontSize: 32, color: colors.textMuted, marginTop: 20 }}>
          Building software required an engineer.
        </div>
      </div>

      {/* 2. "Someone who could..." with background floating code */}
      {oldWayOp > 0.01 && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: oldWayOp * 0.1, pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            top: -((frame * 2) % 400),
            left: 100,
            ...type.mono, fontSize: 18, color: colors.accentBlue,
            whiteSpace: "pre",
            filter: "blur(2px)"
          }}>
            {`function initializeSystem() {
  const kernel = new Kernel();
  kernel.loadModules();
  return kernel;
}
export class Node {
  constructor(id: string) {
    this.id = id;
    this.edges = new Set();
  }
}
async function executeTask(task) {
  const result = await run(task);
  return result;
}
`.repeat(10)}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", opacity: oldWayOp, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24, padding: "0 200px" }}>
        <div style={{ ...type.hero, fontSize: 52, color: colors.textMain }}>Someone who could:</div>
        {[
          { t: "Read 1000 lines of code",         p: item1 },
          { t: "Understand the architecture",      p: item2 },
          { t: "Find the right files",              p: item3 },
          { t: "Run tests and fix errors",          p: item4 },
        ].map(({ t, p }) => (
          <div key={t} style={{
            opacity: p, transform: `translateX(${(1 - p) * -30}px)`,
            ...type.body, fontSize: 36, color: colors.textMuted,
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <span style={{ color: colors.accentBlue }}>→</span> {t}
          </div>
        ))}
      </div>

      {/* 3. Cursor chat typing with Glassmorphism */}
      <div style={{ position: "absolute", opacity: cursorOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ ...type.hero, fontSize: 48, color: colors.textMain, textAlign: "center" }}>
          But today, a developer can simply type:
        </div>
        <div style={{
          width: 760,
          background: "linear-gradient(135deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))",
          backdropFilter: "blur(12px)",
          border: `1.5px solid rgba(59,130,246,0.3)`,
          borderRadius: 24, padding: "28px 36px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.accentBlue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 0 12px rgba(59,130,246,0.5)" }}>✨</div>
            <div style={{ ...type.body, color: colors.textMain, fontSize: 14, fontWeight: 500 }}>Cursor Chat</div>
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)",
            border: `1px solid rgba(255,255,255,0.05)`,
            borderRadius: 16, padding: "20px 24px",
            ...type.mono, fontSize: 24, color: colors.textMain,
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.4)",
            minHeight: 74,
            display: "flex", alignItems: "center"
          }}>
            <div style={{ width: "100%" }}>
              {typedText}
              <span style={{ color: colors.accentBlue, textShadow: "0 0 8px rgba(59,130,246,0.8)", opacity: showBlink ? 1 : 0 }}>▋</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. "The interesting question is NOT..." */}
      <div style={{ position: "absolute", opacity: questionOp, textAlign: "center", maxWidth: 900 }}>
        <div style={{ ...type.hero, fontSize: 56, color: colors.textMuted }}>The interesting question is not</div>
        <div style={{ ...type.hero, fontSize: 72, color: colors.textMain, marginTop: 12, textDecoration: "line-through", textDecorationColor: colors.accentRed }}>
          What can Cursor do?
        </div>
      </div>

      {/* 5. "What architecture allows..." */}
      <div style={{ position: "absolute", opacity: archOp, textAlign: "center", maxWidth: 1100, padding: "0 80px" }}>
        <div style={{ ...type.hero, fontSize: 72, color: colors.textMain }}>
          What <span style={{ color: colors.accentBlue }}>architecture</span> allows an AI to behave like a <span style={{ color: colors.accentGreen }}>software engineer?</span>
        </div>
      </div>

      {/* 6. "Behind that simple interface... a collection of systems" */}
      <div style={{ position: "absolute", opacity: systemsOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ ...type.hero, fontSize: 44, color: colors.textMain, marginBottom: 16 }}>Behind that simple interface:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { t: "Code Intelligence System", icon: "🧠", p: s1, c: colors.accentBlue },
            { t: "Context Engine",           icon: "⚙️", p: s2, c: colors.accentGreen },
            { t: "AI Agent",                 icon: "🤖", p: s3, c: colors.accentPurple },
            { t: "Tool Execution Layer",     icon: "🛠️", p: s4, c: colors.accentOrange },
            { t: "Model Orchestration",      icon: "🚦", p: s5, c: colors.accentBlue },
            { t: "Code Modification Pipeline", icon: "🔄", p: s6, c: colors.accentGreen },
          ].map(({ t, icon, p, c }) => (
            <ArchNode key={t} label={t} icon={icon} progress={p} active accentColor={c} width={400} />
          ))}
        </div>
      </div>

      {/* 7. "Simplest possible design" naive LLM pipeline */}
      <div style={{ position: "absolute", opacity: pipeOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ ...type.body, fontSize: 28, color: colors.textMuted, marginBottom: 48, opacity: smoothIn(frame, 1810, 30) }}>
          The simplest possible design:
        </div>
        <ArchNode label="Developer" icon="👩‍💻" progress={dev2In} active />
        <FlowArrow d="M 1 0 L 1 50" viewBox="0 0 2 50" width={3} height={50} color={colors.accentBlue} progress={a1In} active={llmIn > 0.5} />
        <ArchNode label="LLM (e.g. GPT-4)" icon="🧠" progress={llmIn} active />
        <FlowArrow d="M 1 0 L 1 50" viewBox="0 0 2 50" width={3} height={50} color={colors.accentBlue} progress={a2In} active={codeIn > 0.5} />
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <ArchNode label="Generated Code" icon="📄" progress={codeIn} active />
          
          {/* Example 1: Small Question */}
          {ex1In > 0.01 && (
            <div style={{
              position: "absolute", right: "120%", top: -20 + Math.sin(frame * 0.05) * 5,
              opacity: ex1In * (1 - failIn), transform: `scale(${0.9 + ex1In * 0.1})`,
              background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)",
              border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 12, padding: "12px 16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 8, zIndex: 10
            }}>
              <span style={{ fontSize: 16 }}>❓</span>
              <span style={{ ...type.mono, fontSize: 14, color: colors.textMuted }}>// how to center a div?</span>
            </div>
          )}

          {/* Example 2: Python Script */}
          {ex2In > 0.01 && (
            <div style={{
              position: "absolute", left: "120%", top: 10 + Math.sin(frame * 0.06) * 5,
              opacity: ex2In * (1 - failIn), transform: `scale(${0.9 + ex2In * 0.1})`,
              background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)",
              border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 12, padding: "12px 16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)", whiteSpace: "nowrap", zIndex: 10
            }}>
              <div style={{ ...type.body, fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>script.py</div>
              <div style={{ ...type.mono, fontSize: 14, color: colors.accentGreen }}>def main():</div>
              <div style={{ ...type.mono, fontSize: 14, color: colors.textMuted, paddingLeft: 16 }}>print("hello")</div>
            </div>
          )}

          {/* Example 3: Simple Component */}
          {ex3In > 0.01 && (
            <div style={{
              position: "absolute", right: "110%", top: 50 + Math.sin(frame * 0.04) * 5,
              opacity: ex3In * (1 - failIn), transform: `scale(${0.9 + ex3In * 0.1})`,
              background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)",
              border: `1px solid rgba(139,92,246,0.3)`, borderRadius: 12, padding: "12px 16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)", whiteSpace: "nowrap", zIndex: 10
            }}>
              <span style={{ ...type.mono, fontSize: 14, color: colors.accentPurple }}>{`<Button variant="primary" />`}</span>
            </div>
          )}
        </div>

        {failIn > 0.01 && (
          <div style={{
            marginTop: 48, opacity: failIn,
            background: "rgba(239,68,68,0.1)", border: `1.5px solid ${colors.accentRed}`,
            borderRadius: 14, padding: "20px 40px",
            ...type.body, fontSize: 22, color: colors.accentRed, maxWidth: 560, textAlign: "center",
          }}>
            ⚠️ A real app has thousands of interconnected files. A lone model cannot understand them.
          </div>
        )}
      </div>

    </AbsoluteFill>
  );
};
