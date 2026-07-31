import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { CodeTypewriter } from "../code-video/CodeTypewriter";
import { TerminalOutput, type TraceLine } from "../code-video/TerminalOutput";
import { GridBg } from "../components/shared";
import type { Anchor } from "./crdtTypingSchedule";
import { NodeCounterBoard, type BoardEvent, type NodeId } from "./NodeCounterBoard";

// Same 60/40 static-code + live-terminal layout as the microservices video,
// but the right panel can also host the NodeCounterBoard so the abstract
// "increment" / "merge" calls being typed are mirrored by a live, moving
// visualization of what they actually do to each node's state -- not just a
// wall of text and print statements.
// Font-fit is computed from the composition's own height (not a literal
// 1080) so this scales correctly at any render resolution.
const fitFontSize = (lineCount: number, compositionHeight: number) => {
  const codeBlockHeight = compositionHeight - 44 * 2 - 33 - 28 * 2;
  const raw = codeBlockHeight / (lineCount * 1.5);
  const scale = compositionHeight / 1080;
  return Math.max(11 * scale, Math.min(20 * scale, raw));
};

// Mirrors CodeTypewriter's own active-line derivation exactly (same jump
// behaviour, same clamping) so the annotation strip below always names the
// line that is actually highlighted right now -- one source of truth for
// "what line is active", just read twice.
const deriveActiveLine = (frame: number, lineCount: number, schedule?: Anchor[]): number => {
  if (!schedule || schedule.length === 0) return 0;
  if (frame <= schedule[0].atFrame) return Math.max(0, Math.min(lineCount - 1, schedule[0].throughLine));
  if (frame >= schedule[schedule.length - 1].atFrame) {
    return Math.max(0, Math.min(lineCount - 1, schedule[schedule.length - 1].throughLine));
  }
  let seg = 0;
  for (let i = 0; i < schedule.length - 1; i++) {
    if (frame >= schedule[i].atFrame && frame <= schedule[i + 1].atFrame) {
      seg = i;
      break;
    }
  }
  return Math.max(0, Math.min(lineCount - 1, schedule[seg].throughLine));
};

export const CrdtCodeScene: React.FC<{
  title: string;
  code: string;
  previousCode?: string;
  trace: TraceLine[];
  typeStart: number;
  typeEnd: number;
  runStart: number;
  runEnd: number;
  schedule?: Anchor[];
  boardNodes?: NodeId[];
  boardEvents?: BoardEvent[];
  terminalLineFrames?: number[];
  lineCaptions?: Record<number, string>;
}> = ({
  title,
  code,
  previousCode,
  trace,
  typeStart,
  typeEnd,
  runStart,
  runEnd,
  schedule,
  boardNodes,
  boardEvents,
  terminalLineFrames,
  lineCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const lineCount = code.split("\n").length;
  const codeFontSize = fitFontSize(lineCount, height);
  const hasBoard = !!boardNodes && !!boardEvents;

  const activeLine = deriveActiveLine(frame, lineCount, schedule);
  const caption = lineCaptions?.[activeLine];
  // Re-trigger a small enter animation each time the caption text changes by
  // keying off the active-line anchor frame closest to now.
  const captionAnchorFrame = (() => {
    if (!schedule) return 0;
    const passed = schedule.filter((a) => a.atFrame <= frame);
    return passed.length ? passed[passed.length - 1].atFrame : schedule[0].atFrame;
  })();
  const captionIn = spring({ frame: frame - captionAnchorFrame, fps, config: { damping: 16, stiffness: 200 } });

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
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <CodeTypewriter
                code={code}
                previousCode={previousCode}
                startFrame={typeStart}
                endFrame={typeEnd}
                schedule={schedule}
                fontSize={codeFontSize}
              />
            </div>

            {/* fills what would otherwise be dead space below the code --
                a short, word-synced explanation of the currently active
                line, so the panel never sits static and empty. */}
            {caption && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: 6,
                }}
              >
                <div
                  key={caption}
                  style={{
                    opacity: captionIn,
                    transform: `translateY(${interpolate(captionIn, [0, 1], [10, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderTop: `1px solid ${cv.panelLine}`,
                    paddingTop: 20,
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: cv.terminalGreen,
                      boxShadow: `0 0 10px ${cv.terminalGreen}`,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: cvFonts.mono,
                      fontSize: 17,
                      color: cv.ink,
                      lineHeight: 1.5,
                    }}
                  >
                    {caption}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 4, display: "flex", flexDirection: "column", minWidth: 0, gap: 20 }}>
          {hasBoard && (
            <div style={{ flex: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
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
                live state
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <NodeCounterBoard nodes={boardNodes!} events={boardEvents!} scale={0.62} />
              </div>
            </div>
          )}

          <div style={{ flex: hasBoard ? 2 : 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
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
                <TerminalOutput
                  trace={trace}
                  startFrame={runStart}
                  endFrame={runEnd}
                  fontSize={13}
                  maxLines={8}
                  lineFrames={terminalLineFrames}
                />
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
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
