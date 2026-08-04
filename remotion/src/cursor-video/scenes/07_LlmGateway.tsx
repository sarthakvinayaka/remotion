import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 07_LlmGateway  8430→9157 frames (727 local frames, 24.2s)
// Beat map (local frames):
//   frame   6 : "the final piece is the model layer..."
//   frame  89 : "cannot permanently depend on one model..."
//   frame 349 : "model extraction layer..."

export const LlmGatewayScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn  = smoothIn(frame, 5, 40);
  const titleOut = 1 - smoothIn(frame, 75, 25);

  const agentIn    = springIn(frame, 20, 50);

  // "cannot permanently depend" @89 — show problem
  const problemIn  = smoothIn(frame, 89, 50);
  const problemOut = 1 - smoothIn(frame, 358, 20);

  // "Claude", "GPT", "Gemini" @212, 276, 284
  const models = [
    { l: "Claude 3.5",    c: "#D97757" },
    { l: "GPT-4o",        c: "#10A37F" },
    { l: "Gemini Pro",    c: "#4285F4" },
    { l: "Deepseek",      c: colors.textMuted },
  ];
  const modelIns = [
    springIn(frame, 212, 40),
    springIn(frame, 276, 40),
    springIn(frame, 284, 40),
    springIn(frame, 320, 40), // Deepseek inferred
  ];

  // "model extraction layer" @358
  const gatewayIn  = springIn(frame, 358, 55);
  const a0In       = smoothIn(frame, 360, 35);

  // "routing, cost, latency" @429, 449, 487
  const metricsIn  = smoothIn(frame, 429, 20);
  const m1 = smoothIn(frame, 429, 20); // routing
  const m2 = smoothIn(frame, 449, 20); // cost
  const m3 = smoothIn(frame, 487, 20); // latency
  const m4 = smoothIn(frame, 508, 20); // model selection

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* Title */}
      <div style={{ position: "absolute", top: 80, opacity: titleIn * titleOut, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 60, color: colors.accentPurple }}>LLM Gateway</div>
        <div style={{ ...type.body, fontSize: 24, color: colors.textMuted, marginTop: 12 }}>
          Abstracting model providers, managing routing & cost
        </div>
      </div>

      {agentIn > 0.1 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

          <ArchNode label="Agent Orchestrator" icon="🤖" sublabel="Makes API calls" progress={agentIn} active accentColor={colors.textMuted} />

          <FlowArrow d="M 1 0 L 1 40" viewBox="0 0 2 40" width={3} height={40} color={colors.accentBlue} progress={a0In} active={gatewayIn > 0.5} />

          <ArchNode label="LLM Gateway" sublabel="Routing · Latency · Cost · Reliability" icon="🚦" progress={gatewayIn} active accentColor={colors.accentBlue} width={340}>
            {metricsIn > 0.01 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  {["Routing", "Latency", "Cost", "Fallback", "Caching"].map((m, i) => {
                    const metricsArr = [m1, m2, m3, m3, m4];
                    return (
                    <div key={m} style={{
                      opacity: metricsArr[i],
                      background: "rgba(59,130,246,0.12)", border: `1px solid rgba(59,130,246,0.3)`,
                      borderRadius: 6, padding: "5px 12px", ...type.mono, fontSize: 12, color: colors.accentBlue,
                    }}>{m}</div>
                  )})}
                </div>
                {/* Mini Sparkline Chart */}
                <svg width="200" height="40" style={{ marginTop: 12 }}>
                  <path d="M 0 30 L 20 25 L 40 35 L 60 15 L 80 20 L 100 5 L 120 10 L 140 2 L 160 15 L 180 8 L 200 25" fill="none" stroke={colors.accentBlue} strokeWidth={2} opacity={0.3 * m2} strokeLinejoin="round" />
                  <path d="M 0 30 L 20 25 L 40 35 L 60 15 L 80 20 L 100 5 L 120 10 L 140 2 L 160 15 L 180 8 L 200 25" fill="none" stroke={colors.accentGreen} strokeWidth={2.5} strokeLinejoin="round"
                    strokeDasharray="300" strokeDashoffset={300 - ((frame * 2) % 300)} filter="drop-shadow(0 0 4px currentColor)" opacity={m2}
                  />
                </svg>
              </div>
            )}
          </ArchNode>

          {/* Fan-out to models */}
          {modelIns[0] > 0.01 && (
            <div style={{ position: "relative", marginTop: 0 }}>
              <svg width={680} height={70} viewBox="0 0 680 70" style={{ overflow: "visible" }}>
                {[80, 260, 420, 600].map((x, i) => {
                  const isActive = i === 0; // Route to Claude
                  return (
                    <g key={i}>
                      <path d={`M 340 0 C 340 42, ${x} 30, ${x} 70`}
                        fill="none" stroke={models[i].c} strokeWidth={isActive ? 3 : 2}
                        strokeDasharray="1000" strokeDashoffset={1000 - modelIns[i] * 1000}
                        strokeLinecap="round" opacity={isActive ? 0.8 : 0.3}
                      />
                      {isActive && modelIns[i] > 0.8 && (
                        <path d={`M 340 0 C 340 42, ${x} 30, ${x} 70`}
                          fill="none" stroke={models[i].c} strokeWidth={4}
                          strokeDasharray="4 24" strokeDashoffset={-(frame * 5) % 24}
                          strokeLinecap="round" opacity={0.8} filter="drop-shadow(0 0 4px currentColor)"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
              <div style={{ display: "flex", flexDirection: "row", gap: 18 }}>
                {models.map(({ l, c }, i) => (
                  <ArchNode key={l} label={l} progress={modelIns[i]} active={i === 0} accentColor={c} width={152} style={{ opacity: i === 0 ? 1 : 0.6 }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Problem: cannot depend on one model */}
      {problemIn > 0.01 && gatewayIn < 0.3 && (
        <div style={{
          position: "absolute", bottom: 130, opacity: problemIn * (1 - gatewayIn * 3),
          background: "rgba(245,158,11,0.1)", border: `1.5px solid ${colors.accentOrange}`,
          borderRadius: 14, padding: "18px 36px",
          ...type.body, fontSize: 22, color: colors.accentOrange, textAlign: "center",
        }}>
          ⚠️ An AI company cannot permanently depend on one model. Today: Claude. Tomorrow: GPT or Gemini.
        </div>
      )}
    </AbsoluteFill>
  );
};
