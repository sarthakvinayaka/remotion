import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { cv, cvFonts } from "./theme";
import { tokenizeLine } from "./pythonHighlight";
import type { Anchor } from "./typingSchedule";

// Shows the whole function at once, statically -- nothing ever scrolls or
// moves. Only the active-line highlight advances as narration reaches it.
// `fontSize` is expected to already be sized (by the caller, from line
// count) so every line fits in the container without needing to scroll.
export const CodeTypewriter: React.FC<{
  code: string;
  previousCode?: string;
  startFrame: number;
  endFrame: number;
  schedule?: Anchor[];
  fontSize?: number;
}> = ({ code, previousCode, startFrame, endFrame, schedule, fontSize = 18 }) => {
  const frame = useCurrentFrame();
  const lines = code.split("\n");
  const prevLines = previousCode ? previousCode.split("\n") : [];

  const changedFrom = prevLines.length
    ? lines.findIndex((l, i) => l !== prevLines[i])
    : 0;
  const firstTypedLine = changedFrom === -1 ? lines.length : changedFrom;

  let activeLineIndex: number;
  if (schedule && schedule.length > 0) {
    if (frame <= schedule[0].atFrame) {
      activeLineIndex = firstTypedLine;
    } else if (frame >= schedule[schedule.length - 1].atFrame) {
      activeLineIndex = schedule[schedule.length - 1].throughLine;
    } else {
      let seg = 0;
      for (let i = 0; i < schedule.length - 1; i++) {
        if (frame >= schedule[i].atFrame && frame <= schedule[i + 1].atFrame) {
          seg = i;
          break;
        }
      }
      // Cut directly to each anchor's target line -- never walk through the
      // lines in between, even when the next anchor is above the current one
      // (a "recap" jump backward). The highlight should jump like a cursor,
      // not scrub through every line number on the way.
      const a = schedule[seg];
      activeLineIndex = a.throughLine;
    }
  } else {
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const typedRange = lines.length - firstTypedLine;
    activeLineIndex = firstTypedLine + Math.floor(progress * typedRange);
  }
  activeLineIndex = Math.max(0, Math.min(lines.length - 1, activeLineIndex));

  const rendered = lines.map((line, i) => {
    const isActive = i === activeLineIndex;
    return (
      <div
        key={i}
        style={{
          background: isActive ? `${cv.terminalGreen}1a` : "transparent",
          borderLeft: `3px solid ${isActive ? cv.terminalGreen : "transparent"}`,
          paddingLeft: 10,
          marginLeft: -13,
        }}
      >
        {tokenizeLine(line).map((t, ti) => (
          <span key={ti} style={{ color: t.color }}>
            {t.text}
          </span>
        ))}
        {line === "" ? " " : null}
      </div>
    );
  });

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      <div
        style={{
          fontFamily: cvFonts.mono,
          fontSize,
          lineHeight: 1.5,
          whiteSpace: "pre",
        }}
      >
        {rendered}
      </div>
    </div>
  );
};
