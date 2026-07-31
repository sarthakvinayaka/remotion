import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { cv, cvFonts } from "./theme";
import { CodeTypewriter } from "./CodeTypewriter";
import { TerminalOutput, type TraceLine } from "./TerminalOutput";
import { GridBg } from "../components/shared";
import type { Anchor } from "./typingSchedule";

// 60/40 split: the whole function is visible immediately on the left with
// the active line highlighted in sync with narration; the real captured
// terminal output runs live in the right-hand panel the whole time, so
// running + explaining happens in the same shot instead of separate beats.
// Available height for the code block: compositionHeight - (44 top/bottom
// padding * 2 for outer frame) - title row (~13px text + 10px margin) -
// panel's own 28*2 padding. Font size is derived from that so every line of
// the segment's code fits without ever needing to scroll, per line, at
// lineHeight 1.5. Uses the composition's actual height (not a literal 1080)
// so this scales correctly at any render resolution.
const fitFontSize = (lineCount: number, compositionHeight: number) => {
  const codeBlockHeight = compositionHeight - 44 * 2 - 33 - 28 * 2;
  const raw = codeBlockHeight / (lineCount * 1.5);
  const scale = compositionHeight / 1080;
  return Math.max(11 * scale, Math.min(20 * scale, raw));
};

export const CodeScene: React.FC<{
  title: string;
  code: string;
  previousCode?: string;
  trace: TraceLine[];
  typeStart: number;
  typeEnd: number;
  runStart: number;
  runEnd: number;
  schedule?: Anchor[];
}> = ({ title, code, previousCode, trace, typeStart, typeEnd, runStart, runEnd, schedule }) => {
  const lineCount = code.split("\n").length;
  const { height } = useVideoConfig();
  const codeFontSize = fitFontSize(lineCount, height);
  return (
  <AbsoluteFill style={{ background: cv.bg }}>
    <GridBg opacity={0.04} color={cv.ink} />
    <AbsoluteFill style={{ padding: 44, display: "flex", flexDirection: "row", gap: 32 }}>
      <div style={{ flex: 6, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 13,
            color: cv.muted,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            flex: 1,
            background: cv.panel,
            border: `1.5px solid ${cv.panelLine}`,
            borderRadius: 16,
            padding: 28,
            overflow: "hidden",
          }}
        >
          <CodeTypewriter code={code} previousCode={previousCode} startFrame={typeStart} endFrame={typeEnd} schedule={schedule} fontSize={codeFontSize} />
        </div>
      </div>

      <div style={{ flex: 4, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 13,
            color: cv.muted,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          terminal
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {trace.length > 0 ? (
            <TerminalOutput trace={trace} startFrame={runStart} endFrame={runEnd} fontSize={15} maxLines={16} />
          ) : (
            <div
              style={{
                fontFamily: cvFonts.mono,
                fontSize: 15,
                color: cv.muted,
                border: `1px solid ${cv.panelLine}`,
                borderRadius: 10,
                padding: 16,
                background: "#000000",
              }}
            >
              $ &nbsp;
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
  );
};
