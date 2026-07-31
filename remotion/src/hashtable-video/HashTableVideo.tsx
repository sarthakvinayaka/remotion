import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame } from "remotion";
import { cv } from "./theme";
import { HookScene } from "./HookScene";
import { CoreIdeaScene } from "./CoreIdeaScene";
import { CollisionExplainScene } from "./CollisionExplainScene";
import { ResizeExplainScene } from "./ResizeExplainScene";
import { WrapUpScene } from "./WrapUpScene";
import { HashTableCodeScene } from "./HashTableCodeScene";
import { HashWalkthrough } from "./HashWalkthrough";
import { InsertFlow } from "./InsertFlow";
import { ResizeMechanics } from "./ResizeMechanics";
import { CODE, PREVIOUS_CODE, type SegmentKey } from "./hashTableCodeSegments";
import { TYPING_SCHEDULES } from "./hashTableTypingSchedule";
import segmentsData from "../hashtable-segments.json";
import type { TimedHashEvent, InsertEvent } from "./hashEvents";

import getCollisionText from "../hashtable-traces/get_and_collision.json";
import resizeDemoText from "../hashtable-traces/resize_demo.json";
import type { TraceLine } from "../code-video/TerminalOutput";

import getCollisionEvents from "../hashtable-events/get_and_collision.json";
import resizeDemoEvents from "../hashtable-events/resize_demo.json";

// hash_function_code's narration never names "apple"/"banana" or their hash
// values (it's explaining the _hash mechanics in the abstract) -- so unlike
// the other code scenes, there is no spoken moment for that demo's terminal
// output to sync against. Showing it anyway reads as "out of sync" even
// though it's technically real output, so this segment (and resize_code,
// which is also pure explanation with no live run) show no terminal at all,
// matching the CRDT video's convention for explanation-only code scenes.
const TEXT_TRACES: Record<SegmentKey, TraceLine[]> = {
  hash_function_code: [],
  insert_code: [],
  get_and_collision_code: getCollisionText as TraceLine[],
  resize_code: [],
  resize_demo_code: resizeDemoText as TraceLine[],
};

const TITLES: Record<SegmentKey, string> = {
  hash_function_code: "the hash function",
  insert_code: "inserting a value",
  get_and_collision_code: "a real collision",
  resize_code: "resizing the table",
  resize_demo_code: "watching it resize live",
};

// hash_function_code, insert_code, and resize_code all explain mechanics in
// the abstract -- no concrete key/capacity is ever named in their narration
// (confirmed against src/hashtable-captions.json), so there's no real
// InsertEvent/ResizeEvent to replay in their right-hand column. Rather than
// leaving that half of the screen empty for ~30-45s each, they get a small
// illustrative, props-driven visual synced to the same real word-anchor
// frames already used for the code highlight schedule (TYPING_SCHEDULES).
const HASH_FUNCTION_START = 1691;
const INSERT_START = 3012;
const RESIZE_CODE_START = 6862;

const EXPLAINER_VISUALS: Partial<Record<SegmentKey, React.ReactNode>> = {
  hash_function_code: (
    <HashWalkthrough
      sampleKey="key"
      capacity={8}
      bucketsInAt={1736 - HASH_FUNCTION_START} // "buckets... one slot for every possible index"
      charStepStartAt={2096 - HASH_FUNCTION_START} // "we walk through every character in a key"
      multiplyAt={2231 - HASH_FUNCTION_START} // "we multiply by 31 each time"
      modAt={2566 - HASH_FUNCTION_START} // "mod self.capacity"
    />
  ),
  insert_code: (
    <InsertFlow
      hashAt={3044 - INSERT_START} // "we hash the key to get our index"
      grabAt={3114 - INSERT_START} // "then we grab that bucket"
      scanAt={3222 - INSERT_START} // "we loop through whatever's already in that bucket"
      matchAt={3380 - INSERT_START} // "if it does, we just update it in place"
      appendAt={3525 - INSERT_START} // "otherwise we append this new key value pair"
    />
  ),
  resize_code: (
    <ResizeMechanics
      doubleAt={6862 - RESIZE_CODE_START} // "we double the capacity, clear the buckets"
      reinsertAt={6937 - RESIZE_CODE_START} // "and re-insert every key we had before"
      capacityChangedAt={7149 - RESIZE_CODE_START} // "that's because the capacity changed"
      reshuffledAt={7402 - RESIZE_CODE_START} // "everything gets reshuffled into its new correct slot"
      checkAt={7516 - RESIZE_CODE_START} // "this one check at the end of insert"
      autoAt={7594 - RESIZE_CODE_START} // "now it grows itself automatically"
    />
  ),
};

// Each code segment's insert events, converted to timed events matched
// against the real narration frames those specific keys/results are spoken
// about (looked up in src/hashtable-captions.json), not evenly spaced.
// get_and_collision_code: "apple and elderberry" (global frame 5218/5236),
// collision reveal at "both hash to index 2" (5294).
const GET_COLLISION_START = 4946;
const GET_COLLISION_HASH_EVENTS: TimedHashEvent[] = (getCollisionEvents as InsertEvent[]).map((event, i) => ({
  at: (i === 0 ? 5218 : 5236) - GET_COLLISION_START,
  event,
}));

// resize_demo_code: "a", "b", "c" named at 7733/8020/8108, then the resize
// itself fires right as "once we insert c, size hits 3" (8123) is spoken,
// and the reshuffled re-inserts follow immediately after.
const RESIZE_DEMO_START = 7718;
const RESIZE_DEMO_HASH_EVENTS: TimedHashEvent[] = (() => {
  const events = resizeDemoEvents as (InsertEvent | { type: "resize"; old_capacity: number; new_capacity: number; order: number })[];
  const timed: TimedHashEvent[] = [];
  const preResizeFrames = [7733, 8020, 8108]; // a, b, c
  let preIdx = 0;
  let postResizeFrame = 8280; // "automatically, right in the middle of that insert call"
  for (const event of events) {
    if (event.type === "insert" && event.capacity === 4) {
      timed.push({ at: preResizeFrames[preIdx] - RESIZE_DEMO_START, event: event as InsertEvent });
      preIdx += 1;
    } else if (event.type === "resize") {
      timed.push({ at: 8123 - RESIZE_DEMO_START, event });
    } else {
      // reshuffled re-inserts at the new capacity, staggered right after
      // the resize fires
      timed.push({ at: postResizeFrame - RESIZE_DEMO_START, event: event as InsertEvent });
      postResizeFrame += 2;
    }
  }
  return timed;
})();

const HASH_EVENTS_BY_KEY: Partial<Record<SegmentKey, TimedHashEvent[]>> = {
  get_and_collision_code: GET_COLLISION_HASH_EVENTS,
  resize_demo_code: RESIZE_DEMO_HASH_EVENTS,
};

// HashComputer flows: one per named insert, starting a little before its
// hash-events counterpart so the key->number->bucket animation finishes
// right as the number lands on the grid.
const BUCKET_TARGET_X = (index: number, capacity: number) => {
  const boxW = Math.min(84, (720 - (capacity - 1) * 10) / capacity);
  return index * (boxW + 10) + boxW / 2;
};

const GET_COLLISION_COMPUTER_EVENTS = (getCollisionEvents as InsertEvent[]).map((event, i) => ({
  event,
  startFrame: (i === 0 ? 5218 : 5236) - GET_COLLISION_START - 20,
  bucketTargetX: BUCKET_TARGET_X(event.bucket_index, event.capacity),
}));

const RESIZE_DEMO_COMPUTER_EVENTS = [7733, 8020, 8108].map((atFrame, i) => {
  const event = (resizeDemoEvents as InsertEvent[])[i];
  return {
    event,
    // clamp to 0: the first key ("a") is named only 15 frames into this
    // scene, too soon for the full ~20-frame lead-in the flow wants -- start
    // it at the scene's own frame 0 rather than a negative startFrame that
    // would silently truncate the animation's opening frames.
    startFrame: Math.max(0, atFrame - RESIZE_DEMO_START - 20),
    bucketTargetX: BUCKET_TARGET_X(event.bucket_index, event.capacity),
  };
});

const COMPUTER_EVENTS_BY_KEY: Partial<Record<SegmentKey, { event: InsertEvent; startFrame: number; bucketTargetX: number }[]>> = {
  get_and_collision_code: GET_COLLISION_COMPUTER_EVENTS,
  resize_demo_code: RESIZE_DEMO_COMPUTER_EVENTS,
};

// Terminal lines matched to the exact frame their result is spoken about.
const GET_COLLISION_TERMINAL_FRAMES = [
  5218 - GET_COLLISION_START, // "hash('apple') = 2" -- right as "apple" is named
  5294 - GET_COLLISION_START, // "hash('elderberry') = 2" -- "both hash to index 2"
  5372 - GET_COLLISION_START, // "[2]: [...]" -- "that's the real collision happening"
  5442 - GET_COLLISION_START, // "get('elderberry') = ELDERBERRY" -- "and get still works"
];

const RESIZE_DEMO_TERMINAL_FRAMES = [
  7797 - RESIZE_DEMO_START, // "after 'a': size=1, capacity=4"
  8058 - RESIZE_DEMO_START, // "after 'b': size=2, capacity=4"
  8280 - RESIZE_DEMO_START, // "after 'c': size=3, capacity=8" -- resize already happened
];

const TERMINAL_FRAMES_BY_KEY: Partial<Record<SegmentKey, number[]>> = {
  get_and_collision_code: GET_COLLISION_TERMINAL_FRAMES,
  resize_demo_code: RESIZE_DEMO_TERMINAL_FRAMES,
};

type Segment = [string, "narration" | "code", number, number];
const segments = segmentsData as Segment[];

const NARRATION_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  core_idea: CoreIdeaScene,
  collision_explain: CollisionExplainScene,
  resize_explain: ResizeExplainScene,
  wrapup: WrapUpScene,
};

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const SubtitlesLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return <HashTableSubtitles globalFrame={frame} />;
};

import hashtableSubtitles from "../hashtable-subtitles.json";
type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };
const cues = hashtableSubtitles as Cue[];

const findCue = (frame: number): Cue | null => {
  for (const c of cues) {
    if (frame >= c.startFrame && frame < c.endFrame) return c;
  }
  return null;
};

const HashTableSubtitles: React.FC<{ globalFrame: number }> = ({ globalFrame }) => {
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

export const HashTableVideo: React.FC = () => {
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
          return (
            <Series.Sequence key={name} durationInFrames={duration}>
              <HashTableCodeScene
                title={TITLES[key]}
                code={CODE[key]}
                previousCode={PREVIOUS_CODE[key]}
                trace={TEXT_TRACES[key]}
                typeStart={0}
                typeEnd={duration}
                runStart={0}
                runEnd={duration}
                schedule={localSchedule}
                hashEvents={HASH_EVENTS_BY_KEY[key]}
                computerEvents={COMPUTER_EVENTS_BY_KEY[key]}
                terminalLineFrames={TERMINAL_FRAMES_BY_KEY[key]}
                explainerVisual={EXPLAINER_VISUALS[key]}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      <SubtitlesLayer />
      <Audio src={staticFile("hashtable_vo.m4a")} volume={1} />
    </AbsoluteFill>
  );
};
