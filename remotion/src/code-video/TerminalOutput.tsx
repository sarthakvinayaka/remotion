import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts, serviceColor } from "./theme";

export type TraceLine = { line: string; order: number; service: string | null };

// Reveals real captured stdout lines progressively across [startFrame,
// endFrame), proportional to each line's position in the execution trace
// (order), not wall-clock -- so pacing always matches the segment's actual
// on-screen time regardless of how long the code itself took to run.
//
// When `lineFrames` is provided (one local frame per trace line, in trace
// order), each line appears at its own explicit frame instead of being
// evenly spread across the window -- use this whenever specific print
// statements are called out by name in the narration, so the terminal
// reveals in lockstep with what's actually being said, not a linear guess.
export const TerminalOutput: React.FC<{
  trace: TraceLine[];
  startFrame: number;
  endFrame: number;
  fontSize?: number;
  maxLines?: number;
  lineFrames?: number[];
}> = ({ trace, startFrame, endFrame, fontSize = 16, maxLines = 10, lineFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (trace.length === 0) return null;

  const frameForIdx = (globalIdx: number) =>
    lineFrames
      ? (lineFrames[globalIdx] ?? endFrame)
      : interpolate(globalIdx, [0, trace.length], [startFrame, endFrame], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const visibleCount = lineFrames
    ? lineFrames.filter((f) => f <= frame).length
    : Math.max(
        0,
        Math.ceil(
          interpolate(frame, [startFrame, endFrame], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * trace.length
        )
      );
  const visible = trace.slice(0, visibleCount).slice(-maxLines);

  // Pull focus to the panel the instant a new line lands: a brief border/glow
  // pulse keyed to the most recent visible line's arrival frame.
  const lastArrival = visibleCount > 0 ? frameForIdx(visibleCount - 1) : -999;
  const panelPulse = interpolate(frame, [lastArrival, lastArrival + 6, lastArrival + 26], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: cvFonts.mono,
        fontSize,
        lineHeight: 1.6,
        background: "#000000",
        borderRadius: 10,
        border: `1.5px solid ${panelPulse > 0 ? cv.terminalGreen : cv.panelLine}`,
        boxShadow: panelPulse > 0 ? `0 0 ${28 * panelPulse}px ${cv.terminalGreen}55` : "none",
        padding: "14px 16px",
        overflow: "hidden",
        minHeight: fontSize * 1.6 * maxLines + 28,
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <Dot color="#FF5F56" />
        <Dot color="#FFBD2E" />
        <Dot color="#27C93F" />
      </div>
      {visible.map((t, i) => {
        const globalIdx = visibleCount - visible.length + i;
        const isNewest = globalIdx === visibleCount - 1;
        const lineFrame = frameForIdx(globalIdx);
        const s = spring({ frame: frame - lineFrame, fps, config: { damping: 16, stiffness: 220 } });
        const flash = isNewest
          ? interpolate(frame, [lineFrame, lineFrame + 5, lineFrame + 22], [0, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;
        const color = t.line.includes("FAILED")
          ? cv.terminalRed
          : t.service
            ? serviceColor(t.service)
            : cv.terminalGreen;
        return (
          <div
            key={t.order}
            style={{
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [8, 0])}px) scale(${1 + flash * 0.03})`,
              color,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: flash > 0 ? `${cv.terminalGreen}${Math.round(flash * 26).toString(16).padStart(2, "0")}` : "transparent",
              borderRadius: 4,
            }}
          >
            {t.line}
          </div>
        );
      })}
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 11, height: 11, borderRadius: 999, background: color }} />
);
