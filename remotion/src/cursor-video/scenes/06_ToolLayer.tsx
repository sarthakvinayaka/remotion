import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 06_ToolLayer  7711→8430 frames (719 local frames, 24.0s)
// Beat map (local frames):
//   frame   4 : "The AI model itself cannot change your computer..."
//   frame 225 : "the agent needs tools..."
//   frame 608 : "the model provides reasoning, the tools provide abilities..."

export const ToolLayerScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn  = smoothIn(frame, 5, 40);
  const titleOut = 1 - smoothIn(frame, 80, 25);

  // Model isolation
  const modelIn  = springIn(frame, 20, 50);
  const wallIn   = smoothIn(frame, 60, 30);

  // Tools emerge @218
  const arrowIn  = smoothIn(frame, 218, 40);
  const tools = [
    { l: "Read Files",   icon: "📖", c: colors.accentBlue   },
    { l: "Write Files",  icon: "✏️", c: colors.accentGreen  },
    { l: "Terminal",     icon: "💻", c: colors.accentOrange  },
    { l: "Search Code",  icon: "🔎", c: colors.accentPurple  },
    { l: "Git",          icon: "🌿", c: colors.accentGreen   },
    { l: "Test Runner",  icon: "🧪", c: colors.accentRed     },
  ];
  const toolIns = tools.map((_, i) => springIn(frame, 220 + i * 18, 35));

  // "reasoning + abilities" @608
  const summaryIn = springIn(frame, 608, 60);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* Title */}
      <div style={{ position: "absolute", top: 80, opacity: titleIn * titleOut, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 60, color: colors.accentOrange }}>Tool Execution Layer</div>
        <div style={{ ...type.body, fontSize: 24, color: colors.textMuted, marginTop: 12 }}>
          The model cannot change your computer directly
        </div>
      </div>

      {/* Layout */}
      {modelIn > 0.1 && (
        <div style={{ position: "absolute", display: "flex", flexDirection: "row", alignItems: "center", gap: 60, padding: "0 100px" }}>

          <ArchNode label="Isolated Model" sublabel="Reasoning only" icon="🧠" progress={modelIn} active accentColor={colors.accentPurple} width={250} />

          {wallIn > 0.01 && arrowIn < 0.5 && (
            <div style={{
              position: "relative",
              width: 6, height: 160, background: "rgba(239,68,68,0.2)",
              opacity: wallIn * (1 - arrowIn * 2),
              borderRadius: 3, boxShadow: `0 0 16px ${colors.accentRed}`,
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", left: 0, right: 0, height: 40,
                background: "linear-gradient(to bottom, transparent, rgba(239,68,68,0.8), transparent)",
                top: `${(frame * 2) % 200 - 20}px`
              }} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <FlowArrow d="M 0 1 L 80 1" viewBox="0 0 80 2" width={80} height={3} color={colors.accentOrange} progress={arrowIn} active={smoothIn(frame, 281, 20) > 0.5} />
            {frame > 392 && (
              <FlowArrow d="M 80 1 L 0 1" viewBox="0 0 80 2" width={80} height={3} color={colors.accentGreen} progress={smoothIn(frame, 392, 20)} active={smoothIn(frame, 392, 20) > 0.5} />
            )}
          </div>

          {/* Tools grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {tools.map(({ l, icon, c }, i) => {
              const ping = smoothIn(frame, 347 + i * 5, 10) * (1 - smoothIn(frame, 380 + i * 5, 20));
              return (
                <div key={l} style={{ position: "relative" }}>
                  <ArchNode label={l} icon={icon} progress={toolIns[i]} active accentColor={c} width={210} />
                  {ping > 0.01 && (
                    <div style={{
                      position: "absolute", inset: -4, borderRadius: 12,
                      border: `2px solid ${c}`, opacity: ping * 0.8,
                      transform: `scale(${1 + (1 - ping) * 0.1})`,
                      filter: "blur(4px)"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* "Reasoning + Abilities = Engineering" */}
      {summaryIn > 0.01 && (
        <div style={{
          position: "absolute", bottom: 120,
          opacity: summaryIn, display: "flex", gap: 40, alignItems: "center",
        }}>
          <div style={{ ...type.hero, fontSize: 40, color: colors.accentPurple }}>Reasoning</div>
          <div style={{ ...type.hero, fontSize: 40, color: colors.textMuted }}>+</div>
          <div style={{ ...type.hero, fontSize: 40, color: colors.accentOrange }}>Capabilities</div>
          <div style={{ ...type.hero, fontSize: 40, color: colors.textMuted }}>=</div>
          <div style={{ ...type.hero, fontSize: 40, color: colors.accentGreen }}>Engineering</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
