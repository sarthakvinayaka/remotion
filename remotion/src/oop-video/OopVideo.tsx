import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
import { c, fonts, radius, space } from "./theme";
import { FilmGrain, Vignette } from "./ui";
import { sceneTransition } from "./motion";
import segmentsData from "../oop-segments.json";
import searchSubtitles from "../oop-subtitles.json";

import { HookScene } from "./HookScene";
import { TrapScene } from "./TrapScene";
import { ComparisonScene } from "./ComparisonScene";
import { OpenClosedScene } from "./OpenClosedScene";
import { CaveatScene } from "./CaveatScene";
import { WrapUpScene } from "./WrapUpScene";
import { OopCodeScene } from "./OopCodeScene";
import { DuplicatedRetry, StillAsking, UntouchedService, GrowthWarning } from "./SidePanels";
import { ServiceGraph } from "./ServiceGraph";
import { VersionRail } from "./VersionRail";
import { CODE, PREVIOUS_CODE, TITLES, type SegmentKey } from "./oopCodeSegments";
import { TYPING_SCHEDULES, TERMINAL_FRAMES } from "./oopTypingSchedule";
import type { TraceLine } from "../code-video/TerminalOutput";

import v3Trace from "../oop-traces/v3.json";
import v4Trace from "../oop-traces/v4.json";
import testTrace from "../oop-traces/test.json";

type Segment = [string, "narration" | "code", number, number];
const segments = segmentsData as Segment[];

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const NARRATION_SCENES: Record<string, React.FC> = {
  hook: HookScene,
  v2_trap: TrapScene,
  comparison: ComparisonScene,
  openclosed: OpenClosedScene,
  caveat: CaveatScene,
  wrapup: WrapUpScene,
};

/** The failure run must NOT render in success-green -- the top line is the
 *  WRONG answer. Coral for the winner, dimmed for the runner-up; inverted on
 *  the fix so the same shape reads as a correction. */
const LINE_COLORS: Partial<Record<SegmentKey, (string | null)[]>> = {
  // v4 adding Slack, and the fake-notifier test, are both WINS -> green.
  v4_slack: [c.hit, c.hit],
  v4_test: [c.hit],
};

/** Segment mood -- tints grid, glow and chip so the room changes temperature
 *  on the failure and recovers on the fix. */
/** Mood tints grid + glow + chip. v1/v2 are the problem (coral), v3/v4 the
 *  fix (green) -- the room warms as the code gets better. */
const MOOD: Partial<Record<SegmentKey, string>> = {
  v1: c.noise,
  v1_grown: c.noise,
  v2: c.noise,
  v3: c.violet,
  v3_run: c.hit,
  v4: c.hit,
  v4_slack: c.hit,
  v4_test: c.hit,
};

const TRACES: Partial<Record<SegmentKey, TraceLine[]>> = {
  v3_run: v3Trace as TraceLine[],
  v4_slack: v4Trace as TraceLine[],
  v4_test: testTrace as TraceLine[],
};

/** Side panel per code segment. Secondary to the code by design. */
const sidePanelFor = (key: SegmentKey, start: number): React.ReactNode => {
  switch (key) {
    case "v1":
      // v1 previously had NO panel -- 19s of nine lines of code beside black.
      // "the problem is what this code becomes" -- global 1055
      return <GrowthWarning startAt={Math.max(0, 1055 - start)} />;
    case "v1_grown":
      // "look at the retry loop, it's copy-pasted three times" -- global 1565
      return <DuplicatedRetry startAt={1565 - start} />;
    case "v2":
      // Opens with the segment. Previously startAt=200 left the code pane
      // squeezed to ~55% beside an empty column for the first 6.7s.
      return <StillAsking startAt={30} />;
    case "v3":
      // "That's abstraction. A promise about shape." -- global 3250
      return <ServiceGraph startAt={3250 - start} />;
    case "v3_run":
      // dispatch traces draw just before each terminal line prints
      // (TERMINAL_FRAMES.v3_run = [3700, 3740, 3780], local = -3385)
      return <ServiceGraph startAt={0} dispatchAt={[315, 355, 395]} />;
    case "v4":
      // v4 previously had NO side panel -- 24s of six lines of code beside an
      // empty column, during the segment that carries the whole point.
      // "instead of building them, the service receives them" -- global 4436
      return <ServiceGraph startAt={Math.max(0, 4300 - start)} injected />;
    case "v4_slack":
      // "I did not touch NotificationService at all" -- global 4887
      return <UntouchedService startAt={Math.max(0, 4887 - start)} />;
    default:
      return null;
  }
};

const TransitionWrap: React.FC<{
  duration: number;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}> = ({ duration, isFirst, isLast, children }) => {
  const frame = useCurrentFrame();
  const { opacity, scale } = sceneTransition(frame, duration, { isFirst, isLast });
  return <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };
const cues = searchSubtitles as Cue[];

/**
 * ANTI-FLICKER -- carried over from the price-cut video, where subtitle
 * flicker had three independent causes. All three are handled here:
 *
 *  1. OPACITY: cues are grouped into continuous RUNS that fade only at their
 *     outer edges, so back-to-back cues never dip to zero between them.
 *  2. BLANKS: gaps under GAP_BRIDGE_FRAMES are bridged, so a 0.5s pause
 *     doesn't read as a dropout.
 *  3. GEOMETRY: the box is FIXED WIDTH. A shrink-to-fit box snaps down to
 *     one short word and back as cues swap, and that resize reads as flicker
 *     even when opacity is perfectly stable. build-oop-subtitles.py also
 *     absorbs runt cues so no cue displays for under ~1s.
 *
 * And critically: NO `backdrop-filter`. It composites unreliably when
 * Remotion renders frames in parallel and dropped the caption for exactly
 * one frame, hundreds of times, in the previous video.
 */
const GAP_BRIDGE_FRAMES = 18;
const CAPTION_FADE = 5;

type Run = { startFrame: number; endFrame: number; cues: Cue[] };

const runs: Run[] = (() => {
  const out: Run[] = [];
  for (const cue of cues) {
    const last = out[out.length - 1];
    if (last && cue.startFrame - last.endFrame <= GAP_BRIDGE_FRAMES) {
      last.endFrame = cue.endFrame;
      last.cues.push(cue);
    } else {
      out.push({ startFrame: cue.startFrame, endFrame: cue.endFrame, cues: [cue] });
    }
  }
  return out;
})();

const findRun = (frame: number): Run | null => {
  for (const run of runs) {
    if (frame >= run.startFrame && frame < run.endFrame) return run;
  }
  return null;
};

const cueInRun = (run: Run, frame: number): Cue => {
  let current = run.cues[0];
  for (const cue of run.cues) {
    if (frame >= cue.startFrame) current = cue;
    else break;
  }
  return current;
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const run = findRun(frame);
  if (!run) return null;
  const cue = cueInRun(run, frame);

  const fadeIn = Math.min(1, Math.max(0, (frame - run.startFrame) / CAPTION_FADE));
  const fadeOut = Math.min(1, Math.max(0, (run.endFrame - frame) / CAPTION_FADE));
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: space.lg,
          right: space.lg,
          bottom: 34,
          display: "flex",
          justifyContent: "center",
          opacity,
        }}
      >
        <div
          style={{
            width: 1360,
            minHeight: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "10px 26px",
            borderRadius: radius.md,
            background: "rgba(11,14,20,0.82)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.4)",
            fontFamily: fonts.display,
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {cue.words.map((w, i) => {
            const glow = Math.max(
              0,
              Math.min(1, Math.min((frame - w.startFrame + 2) / 3, (w.endFrame + 3 - frame) / 3))
            );
            const spoken = frame >= w.endFrame;
            const base = spoken ? c.ink : `${c.ink}99`;
            const color = glow > 0.5 ? c.hit : base;
            return (
              <span
                key={i}
                style={{
                  color,
                  display: "inline-block",
                  textShadow: glow > 0 ? `0 0 ${16 * glow}px ${c.hit}66` : "none",
                  marginRight: 13,
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

/**
 * Whooshes at real topic changes only. Cuts inside the continuous code
 * walkthrough (build_index -> index_output -> naive -> failure) are pacing
 * beats, not chapter breaks, so they stay silent.
 */
/** Whooshes at real chapter breaks only -- cuts WITHIN one version's
 *  walkthrough are pacing beats. */
const CHAPTER_STARTS = new Set(["v1", "v2", "v3", "v4", "comparison", "caveat", "wrapup"]);
const WHOOSH_LEAD = 6;

/** Chapter accent per segment -- gives the film a deliberate colour arc
 *  (setup cool -> building amber -> failure coral -> understanding violet ->
 *  fix green -> wrapup amber) instead of 13 unrelated slides. */
const CHAPTER_ACCENT: Record<string, string> = {
  hook: c.accent,
  v1: c.noise,
  v1_grown: c.noise,
  v2: c.noise,
  v2_trap: c.noise,
  v3: c.violet,
  v3_run: c.hit,
  v4: c.hit,
  v4_slack: c.hit,
  v4_test: c.hit,
  comparison: c.accent,
  openclosed: c.hit,
  caveat: c.accent,
  wrapup: c.hit,
};

/** A single hairline that runs continuously across every cut -- the strongest
 *  "this is one film" signal available, and it costs one div. */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = segments.find(([, , s2, e]) => frame >= s2 && frame < e) ?? segments[segments.length - 1];
  const accent = CHAPTER_ACCENT[seg[0]] ?? c.accent;
  const pct = Math.min(1, frame / TOTAL_FRAMES);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: space.captionSafe - 6,
          height: 2,
          background: "rgba(255,255,255,0.055)",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            background: accent,
            boxShadow: `0 0 10px ${accent}66`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const ChapterWhooshes: React.FC = () => (
  <>
    {segments
      .filter(([name]) => CHAPTER_STARTS.has(name))
      .map(([name, , start]) => (
        <Sequence key={`whoosh-${name}`} from={Math.max(0, start - WHOOSH_LEAD)} durationInFrames={40}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.2} />
        </Sequence>
      ))}
  </>
);

export const OopVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: c.bg, fontFamily: fonts.body }}>
    <Series>
      {segments.map(([name, kind, start, end], i) => {
        const duration = end - start;
        const isFirst = i === 0;
        const isLast = i === segments.length - 1;

        if (kind === "narration") {
          const Comp = NARRATION_SCENES[name];
          return (
            <Series.Sequence key={name} durationInFrames={duration}>
              <TransitionWrap duration={duration} isFirst={isFirst} isLast={isLast}>
                <Comp />
              </TransitionWrap>
            </Series.Sequence>
          );
        }

        const key = name as SegmentKey;
        // schedules are authored in GLOBAL frames; shift to scene-local
        const localSchedule = TYPING_SCHEDULES[key]?.map((a) => ({
          atFrame: a.atFrame - start,
          throughLine: a.throughLine,
        }));
        const localTerminal = TERMINAL_FRAMES[key]?.map((f) => f - start);

        return (
          <Series.Sequence key={name} durationInFrames={duration}>
            <TransitionWrap duration={duration} isFirst={isFirst} isLast={isLast}>
              <OopCodeScene
                title={TITLES[key]}
                code={CODE[key]}
                previousCode={PREVIOUS_CODE[key]}
                schedule={localSchedule}
                duration={duration}
                trace={TRACES[key]}
                terminalFrames={localTerminal}
                side={sidePanelFor(key, start)}
                lineColors={LINE_COLORS[key]}
                mood={MOOD[key]}
              />
            </TransitionWrap>
          </Series.Sequence>
        );
      })}
    </Series>
    <VersionRail />
    <ProgressBar />
    <Vignette />
    <FilmGrain />
    <Subtitles />
    <ChapterWhooshes />
    <Audio src={staticFile("oop_vo.m4a")} volume={1} />
  </AbsoluteFill>
);
