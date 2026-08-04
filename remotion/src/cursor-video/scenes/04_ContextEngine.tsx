import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 04_ContextEngine  5527→6778 frames (1251 local frames, 41.7s)
// Beat map (local frames):
//   frame   0 : "now the system understand the repository..."
//   frame 115 : "What information should the AI actually see..."
//   frame 508 : "job of the context engine..."
//   frame 677 : "context engine combines..."
//   frame 1185: "hardest problems in AI engineering..."

export const ContextEngineScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn = smoothIn(frame, 5, 40);
  const titleOut = 1 - smoothIn(frame, 95, 30);

  // "What information should the AI actually see..." @114
  const overloadIn = springIn(frame, 114, 50);
  const overloadOut = 1 - smoothIn(frame, 230, 20);

  const inputs = [
    { l: "Current File",          icon: "📄", c: colors.accentBlue   },
    { l: "Open Tabs",             icon: "📑", c: colors.accentGreen  },
    { l: "Repository Search",     icon: "🔎", c: colors.accentPurple },
    { l: "Code Relationships",    icon: "🕸️", c: colors.accentOrange },
    { l: "Previous Conversation", icon: "💬", c: colors.accentBlue   },
    { l: "Error Messages",        icon: "⚠️", c: colors.accentRed    },
  ];
  const inputIns = inputs.map((_, i) => springIn(frame, 250 + i * 25, 35));

  // Context Engine node @460
  const engineIn = springIn(frame, 460, 60);

  // Token gauge @616
  const gaugeIn = smoothIn(frame, 616, 60);
  const gaugeW  = interpolate(gaugeIn, [0, 1], [0, 75], { extrapolateRight: "clamp" });

  const arrow1In   = smoothIn(frame, 680, 40);
  const relevantIn = springIn(frame, 720, 50);
  const arrow2In   = smoothIn(frame, 780, 40);
  const llmIn      = springIn(frame, 820, 50);

  // "hardest problems in AI engineering" @1163
  const quoteIn = springIn(frame, 1163, 70);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* Title */}
      <div style={{ position: "absolute", top: 90, opacity: titleIn * titleOut, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 60, color: colors.accentGreen }}>The Context Engine</div>
        <div style={{ ...type.body, fontSize: 24, color: colors.textMuted, marginTop: 12 }}>
          Deciding what information the AI actually needs
        </div>
      </div>

      {/* Missing Visual: What information should AI see? */}
      {overloadIn > 0.01 && overloadOut > 0.01 && (
        <div style={{
          position: "absolute", opacity: overloadIn * overloadOut, transform: `scale(${0.9 + overloadIn * 0.1})`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24, zIndex: 10
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              fontSize: 100, textShadow: `0 0 40px ${colors.accentPurple}`,
              transform: `translateY(${Math.sin(frame * 0.1) * -10}px)`
            }}>
              🧠
            </div>
            <div style={{
              position: "absolute", top: -40, right: -40, fontSize: 60,
              opacity: 0.5 + Math.sin(frame * 0.2) * 0.5,
              transform: `rotate(15deg) scale(${1 + Math.sin(frame * 0.1) * 0.1})`,
              textShadow: `0 0 20px ${colors.accentOrange}`
            }}>
              ❓
            </div>
          </div>
          <div style={{ ...type.hero, fontSize: 36, color: colors.textMain }}>What does the AI actually see?</div>
        </div>
      )}

      {/* Three-column layout */}
      {engineIn > 0.1 && (
        <div style={{ position: "absolute", display: "flex", flexDirection: "row", alignItems: "center", gap: 60, padding: "0 80px" }}>

          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...type.body, fontSize: 17, color: colors.textMuted, marginBottom: 4 }}>All Available Information</div>
            {inputs.map(({ l, icon, c }, i) => (
              <ArchNode key={l} label={l} icon={icon} progress={inputIns[i]} accentColor={c} width={250} />
            ))}
          </div>

          {/* Funnel Arrows */}
          <div style={{ position: "relative", width: 70, height: 400 }}>
            {engineIn > 0.01 && (
              <svg width="70" height="400" viewBox="0 0 70 400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                {inputs.map((_, i) => {
                  const startY = 40 + i * 54;
                  const endY = 200;
                  const progress = smoothIn(frame, 506 + i * 10, 40);
                  const active = engineIn > 0.5;
                  const dashOffset = active ? -(frame * 4) % 24 : 0;
                  const path = `M 0 ${startY} C 35 ${startY}, 35 ${endY}, 70 ${endY}`;
                  return (
                    <g key={i}>
                      <path d={path} fill="none" stroke={colors.cardBorder} strokeWidth={1.5} opacity={0.3} />
                      <path d={path} fill="none" stroke={colors.accentGreen} strokeWidth={2}
                        strokeDasharray="1000" strokeDashoffset={1000 - progress * 1000}
                        opacity={progress}
                      />
                      {active && (
                        <path d={path} fill="none" stroke={colors.accentGreen} strokeWidth={3}
                          strokeDasharray="4 24" strokeDashoffset={dashOffset}
                          opacity={0.8} filter="drop-shadow(0 0 4px currentColor)"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Engine */}
          <ArchNode label="Context Engine" sublabel="Relevance scoring + ranking" icon="⚙️" progress={engineIn} active accentColor={colors.accentGreen} width={300}>
            {gaugeIn > 0.01 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ ...type.mono, fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Token budget</div>
                <div style={{ height: 10, borderRadius: 5, background: colors.cardBorder, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${gaugeW}%`, background: `linear-gradient(90deg, ${colors.accentGreen}, ${colors.accentBlue})`, borderRadius: 5 }} />
                </div>
                <div style={{ ...type.mono, fontSize: 11, color: colors.accentGreen, marginTop: 4 }}>Optimal signal, no noise</div>
              </div>
            )}
          </ArchNode>

          <FlowArrow d="M 0 1 L 60 1" viewBox="0 0 60 2" width={60} height={3} color={colors.accentGreen} progress={arrow1In} active={relevantIn > 0.5} />

          <ArchNode label="Relevant Context" sublabel="Curated payload" icon="🎯" progress={relevantIn} active accentColor={colors.accentGreen} width={240} />

          <FlowArrow d="M 0 1 L 60 1" viewBox="0 0 60 2" width={60} height={3} color={colors.accentPurple} progress={arrow2In} active={llmIn > 0.5} />

          <ArchNode label="LLM" sublabel="Claude / GPT / Gemini" icon="🧠" progress={llmIn} active accentColor={colors.accentPurple} width={210} />
        </div>
      )}

      {/* "hardest problems in AI engineering" */}
      {quoteIn > 0.01 && (
        <div style={{ position: "absolute", bottom: 110, opacity: quoteIn, textAlign: "center", maxWidth: 900 }}>
          <div style={{ ...type.hero, fontSize: 38, color: colors.textMain }}>
            This balance is one of the{" "}
            <span style={{ color: colors.accentOrange }}>hardest problems</span> in AI engineering.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
