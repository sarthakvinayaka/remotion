import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame } from "remotion";
import { cv } from "./theme";
import { CodeVideoSubtitles } from "./CodeVideoSubtitles";
import { TwoIdeasScene, MapToInfraScene, WrapUpScene } from "./NarrationScenes";
import { HookScene } from "./HookScene";
import { CodeScene } from "./CodeScene";
import { CODE, PREVIOUS_CODE, type SegmentKey } from "./codeSegments";
import { TYPING_SCHEDULES } from "./typingSchedule";
import segmentsData from "../codevideo-segments.json";

import setupTrace from "../traces/setup_hashmap.json";
import orderTrace from "../traces/order_service.json";
import queueTrace from "../traces/queue_payment.json";
import invNotifTrace from "../traces/inventory_notification.json";
import wireTrace from "../traces/wire_and_run.json";
import failureTrace from "../traces/failure_handling.json";
import type { TraceLine } from "./TerminalOutput";

const TRACES: Record<SegmentKey, TraceLine[]> = {
  setup_hashmap: setupTrace as TraceLine[],
  order_service: orderTrace as TraceLine[],
  queue_payment: queueTrace as TraceLine[],
  inventory_notification: invNotifTrace as TraceLine[],
  wire_and_run: wireTrace as TraceLine[],
  failure_handling: failureTrace as TraceLine[],
};

const TITLES: Record<SegmentKey, string> = {
  setup_hashmap: "setup + the hashmap",
  order_service: "order service",
  queue_payment: "the queue + payment service",
  inventory_notification: "inventory + notification services",
  wire_and_run: "wire it up and run it live",
  failure_handling: "handling a failed payment",
};

type Segment = [string, "narration" | "code", number, number];
const segments = segmentsData as Segment[];

const NARRATION_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  two_ideas: TwoIdeasScene,
  map_to_infra: MapToInfraScene,
  wrap_up: WrapUpScene,
};

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const SubtitlesLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return <CodeVideoSubtitles globalFrame={frame} />;
};

export const CodeVideo: React.FC = () => {
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
          // Word-anchor schedules are stored as global frame numbers (real
          // whisper timestamps); convert to local frames since this scene
          // runs inside a Series.Sequence starting at `start`.
          const globalSchedule = TYPING_SCHEDULES[key];
          const localSchedule = globalSchedule?.map((a) => ({
            atFrame: a.atFrame - start,
            throughLine: a.throughLine,
          }));
          return (
            <Series.Sequence key={name} durationInFrames={duration}>
              <CodeScene
                title={TITLES[key]}
                code={CODE[key]}
                previousCode={PREVIOUS_CODE[key]}
                trace={trace}
                typeStart={0}
                typeEnd={duration}
                runStart={0}
                runEnd={duration}
                schedule={localSchedule}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      <SubtitlesLayer />
      <Audio src={staticFile("codevideo_vo.m4a")} volume={1} />
    </AbsoluteFill>
  );
};
