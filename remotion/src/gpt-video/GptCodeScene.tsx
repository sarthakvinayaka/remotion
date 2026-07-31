import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cv, cvFonts } from "./theme";
import { CodeTypewriter } from "../code-video/CodeTypewriter";
import { TerminalOutput, type TraceLine } from "../code-video/TerminalOutput";
import { GridBg } from "../components/shared";
import type { Anchor } from "./gptTypingSchedule";
import { TokenEncoder } from "./TokenEncoder";
import { ContextWindow } from "./ContextWindow";
import { ProbabilityBars } from "./ProbabilityBars";
import { DecodeReveal } from "./DecodeReveal";
import { PipelineMap } from "./PipelineMap";
import type { TimedGptEvent, CandidateEvent, DecodedEvent } from "./gptEvents";

// Left 45% code, right 55% stacked: TokenEncoder (small, top corner,
// persistent once settled), ContextWindow (center, main focus),
// ProbabilityBars (beside the context window during prediction moments),
// DecodeReveal (takes over during the final decode), TerminalOutput
// (bottom strip, real output) -- per the requested layout.
const fitFontSize = (lineCount: number, compositionHeight: number) => {
  const codeBlockHeight = compositionHeight - 44 * 2 - 33 - 28 * 2;
  const raw = codeBlockHeight / (lineCount * 1.5);
  const scale = compositionHeight / 1080;
  return Math.max(11 * scale, Math.min(20 * scale, raw));
};

export const GptCodeScene: React.FC<{
  title: string;
  code: string;
  previousCode?: string;
  trace: TraceLine[];
  typeStart: number;
  typeEnd: number;
  runStart: number;
  runEnd: number;
  schedule?: Anchor[];
  terminalLineFrames?: number[];
  vocab?: Record<string, number>;
  vocabMontageStartAt?: number;
  vocabSettledAt?: number;
  contextEvents?: TimedGptEvent[];
  contextActiveRun?: number;
  probabilityEvent?: CandidateEvent | null;
  probabilityStartAt?: number;
  probabilitySampleRevealAt?: number;
  decodeEvent?: DecodedEvent | null;
  decodeStartAt?: number;
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
  terminalLineFrames,
  vocab,
  vocabMontageStartAt,
  vocabSettledAt,
  contextEvents,
  contextActiveRun,
  probabilityEvent,
  probabilityStartAt,
  probabilitySampleRevealAt,
  decodeEvent,
  decodeStartAt,
}) => {
  const frame = useCurrentFrame();
  const lineCount = code.split("\n").length;
  const { height } = useVideoConfig();
  const codeFontSize = fitFontSize(lineCount, height);

  // DecodeReveal intentionally returns nothing until its word-locked start.
  // Do not reserve the entire right panel before that point: the live context
  // window and probability chart are the visual explanation leading into it.
  const showDecode = Boolean(decodeEvent && decodeStartAt !== undefined && frame >= decodeStartAt);

  // Three runs are replayed in consecutive windows. ContextWindow renders one
  // run at a time, so select the active replay rather than passing undefined
  // (which filters out all run-tagged trace events).
  const effectiveContextRun = title.includes("three runs")
    ? Math.min(2, Math.max(0, Math.floor(frame / 460)))
    : contextActiveRun;
  // Check the more specific context-model label before the generic "text"
  // match ("context" itself contains that substring).
  const activePipelineStage = title.includes("context model") ? "model"
    : title.includes("encoding") ? "encode"
      : title.includes("picking") ? "sample"
        : title.includes("text") ? "text" : "generate";

  return (
    <AbsoluteFill style={{ background: cv.bg }}>
      <GridBg opacity={0.04} color={cv.ink} />
      {/* Reserve the lower safe area for captions: source/terminal content
          should never compete with the narration transcript. */}
      <AbsoluteFill style={{ padding: "44px 44px 140px", display: "flex", flexDirection: "row", gap: 32 }}>
        <div style={{ flex: 45, display: "flex", flexDirection: "column", minWidth: 0 }}>
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

        <div style={{ flex: 55, display: "flex", flexDirection: "column", minWidth: 0, gap: 16 }}>
          {vocab && vocabMontageStartAt !== undefined && vocabSettledAt !== undefined && (
            <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
              <TokenEncoder vocab={vocab} montageStartAt={vocabMontageStartAt} settledAt={vocabSettledAt} width={300} />
            </div>
          )}

          {showDecode ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <DecodeReveal decodedEvent={decodeEvent!} startAt={decodeStartAt!} width={720} />
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
              {!showDecode && <PipelineMap active={activePipelineStage} />}
              {contextEvents && (
                <ContextWindow events={contextEvents} activeRun={effectiveContextRun} width={720} />
              )}
              {probabilityEvent !== undefined && probabilityStartAt !== undefined && (
                <ProbabilityBars
                  candidateEvent={probabilityEvent}
                  startAt={probabilityStartAt}
                  sampleRevealAt={probabilitySampleRevealAt}
                  width={500}
                />
              )}
            </div>
          )}

          <div style={{ flexShrink: 0, height: 170, display: "flex", flexDirection: "column" }}>
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
                  maxLines={5}
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
