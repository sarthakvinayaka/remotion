import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame } from "remotion";
import { cv } from "./theme";
import { HookScene } from "./HookScene";
import { CoreIdeaScene } from "./CoreIdeaScene";
import { WhyNotSameScene } from "./WhyNotSameScene";
import { SimplifiedScene } from "./SimplifiedScene";
import { WrapUpScene } from "./WrapUpScene";
import { GptCodeScene } from "./GptCodeScene";
import { CODE, PREVIOUS_CODE, type SegmentKey } from "./gptCodeSegments";
import { TYPING_SCHEDULES } from "./gptTypingSchedule";
import segmentsData from "../gpt-segments.json";
import type { TimedGptEvent, GptEvent, VocabEvent, CandidateEvent, DecodedEvent } from "./gptEvents";

import encodingText from "../gpt-traces/encoding.json";
import buildingModelText from "../gpt-traces/building_model.json";
import samplingText from "../gpt-traces/sampling.json";
import generatingLiveText from "../gpt-traces/generating_live.json";
import threeRunsText from "../gpt-traces/three_runs.json";
import type { TraceLine } from "../code-video/TerminalOutput";

import encodingEvents from "../gpt-events/encoding.json";
import samplingEvents from "../gpt-events/sampling.json";
import generatingLiveEvents from "../gpt-events/generating_live.json";
import threeRunsEvents from "../gpt-events/three_runs.json";

const TEXT_TRACES: Record<SegmentKey, TraceLine[]> = {
  setup_text: [],
  encoding: encodingText as TraceLine[],
  building_model: buildingModelText as TraceLine[],
  sampling: samplingText as TraceLine[],
  generating_live: generatingLiveText as TraceLine[],
  three_runs: threeRunsText as TraceLine[],
};

const TITLES: Record<SegmentKey, string> = {
  setup_text: "setting up our text",
  encoding: "encoding words into numbers",
  building_model: "building the context model",
  sampling: "picking the next token",
  generating_live: "generating live",
  three_runs: "same seed, three runs",
};

// --- encoding: vocab montage synced to the real narration -----------------
// "we take every unique word... give it a number" (global 3667) through
// "our model never actually touches the word cat" (global 4081).
const ENCODING_START = 3457;
const VOCAB_MONTAGE_START = 3667 - ENCODING_START;
const VOCAB_SETTLED_AT = 4081 - ENCODING_START;
const VOCAB: Record<string, number> = (encodingEvents as VocabEvent[]).find((e) => e.type === "vocab")!.vocab;

// --- sampling: the 70/30-style real candidates for context ("the","cat") --
const SAMPLING_START = 5365;
const SAMPLING_CANDIDATES = (samplingEvents as CandidateEvent[]).find((e) => e.type === "candidates") ?? null;
// "we grab every token id that's followed this pair" (global 5588) is where
// bars should start growing; "random dot choices with weights picks one"
// (global 5746) is the sampling moment itself, though this demo doesn't
// have a sampled_id to reveal a winner against (predict_next_id here isn't
// called with emit_candidates), so no winner reveal fires -- bars alone
// illustrate "these are the weighted options" without a callback.

// --- generating_live: 10 real generation steps, spread across the loop's
// on-screen narration window, with the terminal print landing exactly on
// "there it is, a fully generated sentence" (global 7162) --------------------
const GEN_LIVE_START = 6194;
const genLiveEventsRaw = generatingLiveEvents as GptEvent[];
const genLiveAppendOnly = genLiveEventsRaw.filter((e) => e.type === "append");
// "we take our seed words, encode them" (local 116) through "predict the
// next id and add it on" (local 441) is the loop mechanics explanation --
// the context window should be visibly growing through that window, then
// finish comfortably before "only at the very end..." (local 477), which is
// exactly when DecodeReveal takes over.
const GEN_LIVE_STEP_START = 150;
const GEN_LIVE_STEP_SPAN = 300;
const GEN_LIVE_DECODE_AT = 6671 - GEN_LIVE_START; // "only at the very end, we turn every id back into its word"
const GEN_LIVE_TERMINAL_AT = 7162 - GEN_LIVE_START; // "there it is, a fully generated sentence"

const GENERATING_LIVE_CONTEXT_EVENTS: TimedGptEvent[] = (() => {
  let stepIdx = 0;
  const stepCount = genLiveAppendOnly.length;
  return genLiveEventsRaw
    .filter((e) => e.type !== "decoded") // decode is its own component (DecodeReveal), not part of the growing timeline
    .map((event) => {
      let at: number;
      if (event.type === "generate_start") {
        at = 0;
      } else {
        const t = stepCount > 1 ? stepIdx / (stepCount - 1) : 0;
        at = Math.round(GEN_LIVE_STEP_START + t * GEN_LIVE_STEP_SPAN);
        if (event.type === "append") stepIdx += 1;
      }
      return { at, event };
    });
})();

// last candidate event in this segment, for the single ProbabilityBars
// preview -- per the confirmed answer, bars only appear at key named
// moments (this first real generation, and the three-run replay), not
// every intermediate step.
const GEN_LIVE_LAST_CANDIDATES = [...genLiveEventsRaw].reverse().find((e) => e.type === "candidates") as CandidateEvent | undefined;
const GEN_LIVE_BARS_AT = GENERATING_LIVE_CONTEXT_EVENTS.find((e) => e.event === GEN_LIVE_LAST_CANDIDATES)?.at ?? GEN_LIVE_STEP_START + GEN_LIVE_STEP_SPAN;

const GENERATING_LIVE_TERMINAL_FRAMES = [GEN_LIVE_TERMINAL_AT];
const GEN_LIVE_DECODED_EVENT = genLiveEventsRaw.find((e) => e.type === "decoded") as DecodedEvent | undefined;

// --- three_runs: the payoff -- three replays against the same start, each
// holding on its own divergence, with the critical "three different
// sentences from the exact same starting point" moment (global 7561)
// landing exactly when the divergence across all three is visible ----------
const THREE_RUNS_START = 7388;
const threeRunsEventsRaw = threeRunsEvents as GptEvent[];
const RUN_STARTS = [0, 460, 920]; // each run's own local window within the segment (890 frames total)
const RUN_STEP_SPAN = 340;

const buildRunEvents = (run: number, windowStart: number): TimedGptEvent[] => {
  const runEvents = threeRunsEventsRaw.filter((e) => "run" in e && e.run === run);
  const candidateCount = runEvents.filter((e) => e.type === "candidates").length;
  let stepIdx = 0;
  return runEvents.map((event) => {
    let at: number;
    if (event.type === "generate_start") at = windowStart;
    else {
      const t = candidateCount > 1 ? stepIdx / (candidateCount - 1) : 0;
      at = Math.round(windowStart + 20 + t * RUN_STEP_SPAN);
      if (event.type === "candidates") stepIdx += 1;
      if (event.type === "decoded") at = windowStart + RUN_STEP_SPAN + 40;
    }
    return { at, event };
  });
};

const THREE_RUNS_ALL_EVENTS: TimedGptEvent[] = [0, 1, 2].flatMap((run) => buildRunEvents(run, RUN_STARTS[run]));

const THREE_RUNS_DECODED: (DecodedEvent | undefined)[] = [0, 1, 2].map(
  (run) => threeRunsEventsRaw.find((e) => e.type === "decoded" && "run" in e && e.run === run) as DecodedEvent | undefined
);

const THREE_RUNS_TERMINAL_FRAMES = [
  0, // "Same seed, three separate runs:" header, right at segment start
  RUN_STARTS[0] + RUN_STEP_SPAN + 40, // Run 1 result
  RUN_STARTS[1] + RUN_STEP_SPAN + 40, // Run 2 result
  RUN_STARTS[2] + RUN_STEP_SPAN + 40, // Run 3 result
];

type Segment = [string, "narration" | "code", number, number];
const segments = segmentsData as Segment[];

const NARRATION_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  core_idea: CoreIdeaScene,
  why_not_same: WhyNotSameScene,
  simplified: SimplifiedScene,
  wrapup: WrapUpScene,
};

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const SubtitlesLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return <GptSubtitles globalFrame={frame} />;
};

import gptSubtitles from "../gpt-subtitles.json";
type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };
const cues = gptSubtitles as Cue[];

const findCue = (frame: number): Cue | null => {
  for (const c of cues) {
    if (frame >= c.startFrame && frame < c.endFrame) return c;
  }
  return null;
};

const GptSubtitles: React.FC<{ globalFrame: number }> = ({ globalFrame }) => {
  const cue = findCue(globalFrame);
  if (!cue) return null;
  const fadeIn = Math.min(1, Math.max(0, (globalFrame - cue.startFrame) / 4));
  const fadeOut = Math.min(1, Math.max(0, (cue.endFrame - globalFrame) / 4));
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 18,
          display: "flex",
          justifyContent: "center",
          opacity,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            textAlign: "center",
            padding: "8px 22px",
            borderRadius: 10,
            background: "rgba(11,14,20,0.65)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.4)",
            fontFamily: "SpaceGrotesk, sans-serif",
            fontSize: 26,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {cue.words.map((w, i) => {
            const active = globalFrame >= w.startFrame && globalFrame < w.endFrame + 2;
            const spoken = globalFrame >= w.endFrame;
            const color = active ? cv.terminalGreen : spoken ? cv.ink : `${cv.ink}99`;
            return (
              <span
                key={i}
                style={{
                  color,
                  display: "inline-block",
                  textShadow: active ? `0 0 16px ${cv.terminalGreen}66` : "none",
                  marginRight: 12,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GptVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: cv.bg, fontFamily: "sans-serif" }}>
      <Series>
        {segments.map(([name, type, start, end]) => {
          const duration = end - start;
          if (type === "narration") {
            const Comp = NARRATION_COMPONENTS[name];
            return (
              <Series.Sequence key={name} durationInFrames={duration}>
                <Comp />
              </Series.Sequence>
            );
          }
          const key = name as SegmentKey;
          const globalSchedule = TYPING_SCHEDULES[key];
          const localSchedule = globalSchedule?.map((a) => ({
            atFrame: a.atFrame - start,
            throughLine: a.throughLine,
          }));

          let extra: Partial<React.ComponentProps<typeof GptCodeScene>> = {};
          if (key === "encoding") {
            extra = { vocab: VOCAB, vocabMontageStartAt: VOCAB_MONTAGE_START, vocabSettledAt: VOCAB_SETTLED_AT };
          } else if (key === "sampling") {
            extra = {
              probabilityEvent: SAMPLING_CANDIDATES,
              probabilityStartAt: 5588 - SAMPLING_START,
              probabilitySampleRevealAt: 999999,
            };
          } else if (key === "generating_live") {
            extra = {
              contextEvents: GENERATING_LIVE_CONTEXT_EVENTS,
              probabilityEvent: GEN_LIVE_LAST_CANDIDATES ?? null,
              probabilityStartAt: GEN_LIVE_BARS_AT,
              probabilitySampleRevealAt: GEN_LIVE_BARS_AT + 24,
              terminalLineFrames: GENERATING_LIVE_TERMINAL_FRAMES,
              decodeEvent: GEN_LIVE_DECODED_EVENT ?? null,
              decodeStartAt: GEN_LIVE_DECODE_AT,
            };
          } else if (key === "three_runs") {
            extra = {
              contextEvents: THREE_RUNS_ALL_EVENTS,
              contextActiveRun: undefined,
              terminalLineFrames: THREE_RUNS_TERMINAL_FRAMES,
            };
          }

          return (
            <Series.Sequence key={name} durationInFrames={duration}>
              <GptCodeScene
                title={TITLES[key]}
                code={CODE[key]}
                previousCode={PREVIOUS_CODE[key]}
                trace={TEXT_TRACES[key]}
                typeStart={0}
                typeEnd={duration}
                runStart={0}
                runEnd={duration}
                schedule={localSchedule}
                {...extra}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      <SubtitlesLayer />
      <Audio src={staticFile("gpt_vo.m4a")} volume={1} />
    </AbsoluteFill>
  );
};
