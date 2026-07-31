import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cv, cvFonts } from "./theme";
import { CodeTypewriter } from "../code-video/CodeTypewriter";
import { TerminalOutput, type TraceLine } from "../code-video/TerminalOutput";
import { GridBg } from "../components/shared";
import type { Anchor } from "./hashTableTypingSchedule";
import { HashComputer } from "./HashComputer";
import { HashBucketGrid } from "./HashBucketGrid";
import { LoadFactorMeter } from "./LoadFactorMeter";
import type { TimedHashEvent, InsertEvent } from "./hashEvents";

// Left 50% code, right 50% stacked: HashComputer (top, only during an
// insert's key->number->bucket flow), HashBucketGrid (middle, always
// visible), LoadFactorMeter (thin bar right under the grid), TerminalOutput
// (bottom, real printed output) -- per the requested layout.
// Font-fit is computed from the composition's own height (not a literal
// 1080) so this scales correctly at any render resolution (e.g. 2560x1440).
const fitFontSize = (lineCount: number, compositionHeight: number) => {
  const codeBlockHeight = compositionHeight - 44 * 2 - 33 - 28 * 2;
  const raw = codeBlockHeight / (lineCount * 1.5);
  const scale = compositionHeight / 1080;
  return Math.max(11 * scale, Math.min(20 * scale, raw));
};

export const HashTableCodeScene: React.FC<{
  title: string;
  code: string;
  previousCode?: string;
  trace: TraceLine[];
  typeStart: number;
  typeEnd: number;
  runStart: number;
  runEnd: number;
  schedule?: Anchor[];
  hashEvents?: TimedHashEvent[];
  computerEvents?: { event: InsertEvent; startFrame: number; bucketTargetX: number }[];
  terminalLineFrames?: number[];
  // For code scenes whose narration never names a concrete key (pure
  // mechanics explanation) there's no real InsertEvent/ResizeEvent to
  // replay, so `hashEvents` is left undefined and this renders instead --
  // an illustrative, data-driven-by-props visual (HashWalkthrough /
  // InsertFlow / ResizeMechanics) filling the same right-column space so
  // the panel is never just empty.
  explainerVisual?: React.ReactNode;
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
  hashEvents,
  computerEvents,
  terminalLineFrames,
  explainerVisual,
}) => {
  const lineCount = code.split("\n").length;
  const { height } = useVideoConfig();
  const codeFontSize = fitFontSize(lineCount, height);
  const frame = useCurrentFrame();

  // When two inserts' HashComputer flows land close enough together that
  // the earlier one hasn't finished (~46-frame animation) before the next
  // starts, rendering both at once collides them into the same top-right
  // slot (two "hash function" boxes and key/number chips fused together,
  // illegible). Only the most recently-started flow that's still within its
  // own window renders -- the newer insert always wins, which matches how
  // the eye already reads "the latest thing happening" as primary.
  const activeComputerEvent = computerEvents
    ?.filter((c) => frame >= c.startFrame && frame - c.startFrame <= 46)
    .sort((a, b) => b.startFrame - a.startFrame)[0];

  return (
    <AbsoluteFill style={{ background: cv.bg }}>
      <GridBg opacity={0.04} color={cv.ink} />
      <AbsoluteFill style={{ padding: 44, display: "flex", flexDirection: "row", gap: 32 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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
            <CodeTypewriter
              code={code}
              previousCode={previousCode}
              startFrame={typeStart}
              endFrame={typeEnd}
              schedule={schedule}
              fontSize={codeFontSize}
            />
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, gap: 16 }}>
          {/* HashComputer: only rendered content during an active insert's
              key->number->bucket flow; otherwise collapses to a fixed-height
              placeholder so the grid below doesn't jump position. */}
          <div style={{ flexShrink: 0, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {activeComputerEvent && (
              <HashComputer
                event={activeComputerEvent.event}
                startFrame={activeComputerEvent.startFrame}
                bucketTargetX={activeComputerEvent.bucketTargetX}
                width={720}
              />
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
            {hashEvents && <HashBucketGrid events={hashEvents} width={720} />}
            {hashEvents && <LoadFactorMeter events={hashEvents} width={720} />}
            {!hashEvents && explainerVisual}
          </div>

          <div style={{ flexShrink: 0, height: 200, display: "flex", flexDirection: "column" }}>
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
                  maxLines={6}
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
