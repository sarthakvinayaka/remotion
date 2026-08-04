import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 09_FinalArch  9647→11266 frames (1619 local frames, 54.0s)
// Beat map (local frames):
//   frame  12 : "put everything together, this is the architecture..."
//   frame 161 : "the important lesson is..."
//   frame 343 : "the winning system will combine..."

const layers = [
  { l: "Developer",              sub: "",                                       icon: "👩‍💻", color: colors.textMuted,     w: 200, delay: 30 },
  { l: "Cursor IDE",             sub: "Client layer",                           icon: "⚡",  color: colors.accentBlue,    w: 280, delay: 80 },
  { l: "AI Engineering Platform", sub: "Retrieval · Planning · Tools · Memory",  icon: "🏗️",  color: colors.accentPurple,  w: 680, delay: 150, dashed: true },
  { l: "LLM Gateway",            sub: "Routing · Reliability",                  icon: "🚦",  color: colors.accentBlue,    w: 380, delay: 250 },
  { l: "AI Models",              sub: "Claude · GPT-4o · Gemini",               icon: "🧠",  color: colors.accentPurple,  w: 380, delay: 320 },
  { l: "Code Modifications",     sub: "Safe diffs applied to your repo",        icon: "✅",  color: colors.accentGreen,   w: 440, delay: 390 },
];

export const FinalArchScene: React.FC = () => {
  const frame = useCurrentFrame();

  const layerIns = layers.map(({ delay }) => springIn(frame, delay, 55));
  const arrowIns = layers.map(({ delay }) => smoothIn(frame, delay + 50, 35));

  // "the important lesson is" @161
  const lessonIn  = springIn(frame, 161, 70);

  // "the winning system will combine" @343
  const winningIn = springIn(frame, 343, 80);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* Left: Stacked architecture diagram */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-55%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {layers.map(({ l, sub, icon, color, w, dashed }, i) => (
            <React.Fragment key={l}>
              <ArchNode
                label={l}
                sublabel={sub || undefined}
                icon={icon}
                progress={layerIns[i]}
                active
                accentColor={color}
                width={w}
                style={dashed ? { borderStyle: "dashed", background: "rgba(139,92,246,0.06)" } : undefined}
              />
              {i < layers.length - 1 && (
                <FlowArrow d="M 1 0 L 1 32" viewBox="0 0 2 32" width={3} height={32} color={color} progress={arrowIns[i]} active={layerIns[i + 1] > 0.5} />
              )}
            </React.Fragment>
          ))}
          {/* Scanning Laser */}
          {layerIns[layers.length - 1] > 0.9 && (
            <div style={{
              position: "absolute",
              left: -40, right: -40, height: 2,
              background: colors.accentBlue,
              boxShadow: `0 0 16px ${colors.accentBlue}`,
              top: `${50 + Math.sin(frame * 0.03) * 50}%`,
              opacity: 0.6,
              zIndex: 10,
              pointerEvents: "none"
            }} />
          )}
          {/* Winning System Combine Glow */}
          {winningIn > 0.01 && (
            <div style={{
              position: "absolute",
              inset: -60,
              border: `2px solid ${colors.accentPurple}`,
              borderRadius: 24,
              opacity: winningIn * 0.4 * (0.8 + Math.sin(frame * 0.1) * 0.2),
              boxShadow: `inset 0 0 40px ${colors.accentPurple}40, 0 0 40px ${colors.accentPurple}40`,
              zIndex: 0,
              pointerEvents: "none"
            }} />
          )}
        </div>
      </div>

      {/* Right: Insight callout */}
      <div style={{
        position: "absolute",
        right: 120,
        top: "50%",
        transform: "translateY(-50%)",
        maxWidth: 520,
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}>
        {lessonIn > 0.01 && (
          <div style={{ opacity: lessonIn, ...type.hero, fontSize: 44, color: colors.textMain }}>
            The model is only <span style={{ color: colors.accentPurple }}>one piece</span> of the system.
          </div>
        )}
        {winningIn > 0.01 && (
          <div style={{ opacity: winningIn, ...type.body, fontSize: 24, color: colors.textMuted }}>
            The winning systems will combine{" "}
            <span style={{ color: colors.accentBlue }}>models, retrieval, planning, tools, and memory</span> — not just a chatbot connected to an interface.
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
