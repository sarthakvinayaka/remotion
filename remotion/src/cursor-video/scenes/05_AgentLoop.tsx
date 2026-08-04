import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 05_AgentLoop  6778→7711 frames (933 local frames, 31.1s)
// Beat map (local frames):
//   frame  10 : "reach the core of the system, the agent..."
//   frame 460 : "create a plan..."
//   frame 799 : "called the agent loop, think, act, observe..."
//   frame ~820: "think, act, observe, repeat..."

export const AgentLoopScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn  = smoothIn(frame, 5, 40);
  const titleOut = 1 - smoothIn(frame, 100, 30);

  // Goal + planner appear at the start
  const goalIn    = springIn(frame, 30, 50);
  const a0In      = smoothIn(frame, 80, 35);
  const plannerIn = springIn(frame, 110, 50);

  // "create a plan" @460 — planner details expand
  const planDetailsIn = smoothIn(frame, 460, 60);

  // "called the agent loop" @782 — loop appears
  const loopIn    = springIn(frame, 782, 50);
  const thinkIn   = springIn(frame, 852, 40);
  const aT2AIn    = smoothIn(frame, 862, 20);
  const actIn     = springIn(frame, 871, 40);
  const aA2OIn    = smoothIn(frame, 878, 20);
  const observeIn = springIn(frame, 885, 40);
  
  // "repeat" @924
  const cycleIn   = smoothIn(frame, 924, 40);

  const aResultIn = smoothIn(frame, 940, 35);
  const resultIn  = springIn(frame, 950, 50);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>

      {/* Title */}
      <div style={{ position: "absolute", top: 80, opacity: titleIn * titleOut, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 60, color: colors.accentGreen }}>The Agent Orchestrator</div>
        <div style={{ ...type.body, fontSize: 24, color: colors.textMuted, marginTop: 12 }}>
          Unlike a chatbot, an AI engineer must plan
        </div>
      </div>

      {/* Vertical spine */}
      {goalIn > 0.1 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

          <ArchNode label="User Goal" icon="🎯" progress={goalIn} active accentColor={colors.accentBlue} />

          <FlowArrow d="M 1 0 L 1 40" viewBox="0 0 2 40" width={3} height={40} color={colors.accentBlue} progress={a0In} active={plannerIn > 0.5} />

          <ArchNode label="Planner" sublabel={planDetailsIn > 0.3 ? "Create plan → modify files → run tests → fix problems" : "Breaks goal into steps"} icon="🧠" progress={plannerIn} active accentColor={colors.accentPurple} width={planDetailsIn > 0.3 ? 500 : 240} />

          <FlowArrow d="M 1 0 L 1 36" viewBox="0 0 2 36" width={3} height={36} color={colors.accentPurple} progress={loopIn} active={thinkIn > 0.5} />

          {/* Agent Loop */}
          {loopIn > 0.1 && (
            <div style={{ position: "relative", width: 440, height: 320, marginTop: 20 }}>
              {/* Circular flow paths */}
              {thinkIn > 0.1 && (
                <svg width="440" height="320" viewBox="0 0 440 320" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                  <path d="M 220 50 Q 380 50, 380 220" fill="none" stroke={colors.accentOrange} strokeWidth={2.5} strokeDasharray="1000" strokeDashoffset={1000 - aT2AIn * 1000} opacity={aT2AIn} />
                  <path d="M 380 220 Q 220 340, 60 220" fill="none" stroke={colors.accentGreen} strokeWidth={2.5} strokeDasharray="1000" strokeDashoffset={1000 - aA2OIn * 1000} opacity={aA2OIn} />
                  <path d="M 60 220 Q 60 50, 220 50" fill="none" stroke={colors.accentPurple} strokeWidth={2.5} strokeDasharray="1000" strokeDashoffset={1000 - cycleIn * 1000} opacity={cycleIn} />
                  
                  {/* Glowing particles when looping */}
                  {cycleIn > 0.8 && (
                    <>
                      <path d="M 220 50 Q 380 50, 380 220" fill="none" stroke={colors.accentOrange} strokeWidth={4} strokeDasharray="4 24" strokeDashoffset={-(frame * 4) % 24} opacity={0.6} filter="drop-shadow(0 0 4px currentColor)" />
                      <path d="M 380 220 Q 220 340, 60 220" fill="none" stroke={colors.accentGreen} strokeWidth={4} strokeDasharray="4 24" strokeDashoffset={-(frame * 4) % 24} opacity={0.6} filter="drop-shadow(0 0 4px currentColor)" />
                      <path d="M 60 220 Q 60 50, 220 50" fill="none" stroke={colors.accentPurple} strokeWidth={4} strokeDasharray="4 24" strokeDashoffset={-(frame * 4) % 24} opacity={0.6} filter="drop-shadow(0 0 4px currentColor)" />
                    </>
                  )}
                </svg>
              )}

              {/* Nodes */}
              <div style={{ position: "absolute", left: "50%", top: -30, transform: `translate(-50%, 0) scale(${1 + Math.sin(frame * 0.1) * 0.05 * cycleIn})` }}>
                <ArchNode label="Think" icon="🤔" sublabel="Reason" progress={thinkIn} active={cycleIn > 0.1} accentColor={colors.accentPurple} width={180} />
              </div>
              <div style={{ position: "absolute", right: -30, bottom: 30, transform: `scale(${1 + Math.sin(frame * 0.1 + 2) * 0.05 * cycleIn})` }}>
                <ArchNode label="Act" icon="⚡" sublabel="Invoke tool" progress={actIn} active={cycleIn > 0.1} accentColor={colors.accentOrange} width={180} />
              </div>
              <div style={{ position: "absolute", left: -30, bottom: 30, transform: `scale(${1 + Math.sin(frame * 0.1 + 4) * 0.05 * cycleIn})` }}>
                <ArchNode label="Observe" icon="👁️" sublabel="Read output" progress={observeIn} active={cycleIn > 0.1} accentColor={colors.accentGreen} width={180} />
              </div>
            </div>
          )}

          <FlowArrow d="M 1 0 L 1 36" viewBox="0 0 2 36" width={3} height={36} color={colors.accentGreen} progress={aResultIn} active={resultIn > 0.5} style={{ marginTop: 40 }} />
          <ArchNode label="Final Result" icon="✅" sublabel="Task complete" progress={resultIn} active accentColor={colors.accentGreen} />
        </div>
      )}
    </AbsoluteFill>
  );
};
