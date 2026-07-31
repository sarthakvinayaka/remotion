import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame } from "remotion";
import { cv } from "./theme";
import { HookScene } from "./HookScene";
import { CoreIdeaScene } from "./CoreIdeaScene";
import { WhyBreaksScene } from "./WhyBreaksScene";
import { WhereUsedScene } from "./WhereUsedScene";
import { WrapUpScene } from "./WrapUpScene";
import { CrdtCodeScene } from "./CrdtCodeScene";
import { CrdtSubtitles } from "./CrdtSubtitles";
import { CODE, PREVIOUS_CODE, LINE_CAPTIONS, type SegmentKey } from "./crdtCodeSegments";
import { TYPING_SCHEDULES } from "./crdtTypingSchedule";
import segmentsData from "../crdt-segments.json";
import type { BoardEvent, NodeId } from "./NodeCounterBoard";

import gcounterTrace from "../crdt-traces/gcounter_class.json";
import mergeTrace from "../crdt-traces/merge_method.json";
import runLiveTrace from "../crdt-traces/run_it_live.json";
import type { TraceLine } from "../code-video/TerminalOutput";

const NODES: NodeId[] = ["A", "B", "C"];

// gcounter_code / merge_code segments show the class definitions only -- no
// run happens yet in the script, so no terminal trace or live board for
// those (matches the narration, which is purely explaining the code, not
// executing it). run_live is where everything actually executes.
const TRACES: Record<SegmentKey, TraceLine[]> = {
  gcounter_code: [],
  merge_code: [],
  run_live: runLiveTrace as TraceLine[],
};

const TITLES: Record<SegmentKey, string> = {
  gcounter_code: "the GCounter class",
  merge_code: "merging two counters",
  run_live: "run it live",
};

// Board events for the run_live segment, matching TYPING_SCHEDULES anchors
// exactly (local frames, computed below once `start` is known) so the live
// counter board updates in the same instant the corresponding code line and
// print statement do.
const RUN_LIVE_BOARD_EVENTS: BoardEvent[] = [
  { type: "increment", at: 5180 - 5147, node: "A" }, // A.increment() x1
  { type: "increment", at: 5201 - 5147, node: "A" }, // A.increment() x2 ("twice")
  { type: "increment", at: 5266 - 5147, node: "B" }, // B.increment()
  { type: "merge", at: 5495 - 5147, from: "A", into: "B" }, // B merges A's counts
  { type: "merge", at: 5654 - 5147, from: "B", into: "A" }, // A merges B's counts
];

// Each captured print() line's exact local frame, matched to the real word
// where the narrator actually says that result out loud -- not spread evenly
// across the segment. Order matches src/crdt-traces/run_it_live.json.
const RUN_LIVE_TERMINAL_FRAMES: number[] = [
  5258 - 5147, // "...totally on its own." -> print("A's view:"...)
  5339 - 5147, // "...totally separately." -> print("B's view:"...)
  5495 - 5147, // "Look at it, B's total jumps to 3" -> print("B after merging A's counts:"...)
  5765 - 5147, // "And yep, A also lands on 3" -> print("A after merging B's counts:"...)
];

// gcounter_code: while explaining "if node A increments twice, its own slot
// just goes to 2" (3550), show it happening live on a mini board instead of
// leaving the right panel empty during the explanation.
const GCOUNTER_BOARD_EVENTS: BoardEvent[] = [
  { type: "increment", at: 3550 - 3084, node: "A" },
  { type: "increment", at: 3595 - 3084, node: "A" }, // "...twice"
];

// merge_code: while explaining "if I already know A did three increments,
// and you tell me A did three too, that's the same info, not six" (4150),
// demonstrate the actual idempotent-merge behavior live: A increments to 3,
// merges into B, then merges into B again -- B's count stays 3, never 6.
const MERGE_BOARD_EVENTS: BoardEvent[] = [
  { type: "increment", at: 4150 - 3815, node: "A" },
  { type: "increment", at: 4157 - 3815, node: "A" },
  { type: "increment", at: 4164 - 3815, node: "A" },
  { type: "merge", at: 4438 - 3815, from: "A", into: "B" }, // "taking the max protects us"
  { type: "merge", at: 4975 - 3815, from: "A", into: "B" }, // merge again -- stays at 3, not 6
];

const BOARD_EVENTS_BY_KEY: Partial<Record<SegmentKey, BoardEvent[]>> = {
  gcounter_code: GCOUNTER_BOARD_EVENTS,
  merge_code: MERGE_BOARD_EVENTS,
  run_live: RUN_LIVE_BOARD_EVENTS,
};

type Segment = [string, "narration" | "code", number, number];
const segments = segmentsData as Segment[];

const NARRATION_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  core_idea: CoreIdeaScene,
  why_breaks: WhyBreaksScene,
  where_used: WhereUsedScene,
  wrapup: WrapUpScene,
};

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const SubtitlesLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return <CrdtSubtitles globalFrame={frame} />;
};

export const CrdtVideo: React.FC = () => {
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
          const trace = TRACES[key];
          const globalSchedule = TYPING_SCHEDULES[key];
          const localSchedule = globalSchedule?.map((a) => ({
            atFrame: a.atFrame - start,
            throughLine: a.throughLine,
          }));
          const boardEvents = BOARD_EVENTS_BY_KEY[key];
          const terminalLineFrames = key === "run_live" ? RUN_LIVE_TERMINAL_FRAMES : undefined;
          return (
            <Series.Sequence key={name} durationInFrames={duration}>
              <CrdtCodeScene
                title={TITLES[key]}
                code={CODE[key]}
                previousCode={PREVIOUS_CODE[key]}
                trace={trace}
                typeStart={0}
                typeEnd={duration}
                runStart={0}
                runEnd={duration}
                schedule={localSchedule}
                boardNodes={boardEvents ? NODES : undefined}
                boardEvents={boardEvents}
                terminalLineFrames={terminalLineFrames}
                lineCaptions={LINE_CAPTIONS[key]}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      <SubtitlesLayer />
      <Audio src={staticFile("crdt_vo.m4a")} volume={1} />
    </AbsoluteFill>
  );
};
