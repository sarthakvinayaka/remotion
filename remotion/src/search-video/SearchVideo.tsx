import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
import { c, fonts, radius, space } from "./theme";
import { FilmGrain, Vignette } from "./ui";
import { sceneTransition } from "./motion";
import segmentsData from "../search-segments.json";
import searchSubtitles from "../search-subtitles.json";

import { HookScene } from "./HookScene";
import { CoreIdeaScene } from "./CoreIdeaScene";
import { WhyRareScene } from "./WhyRareScene";
import { TfIdfScene } from "./TfIdfScene";
import { RealEnginesScene } from "./RealEnginesScene";
import { WrapUpScene } from "./WrapUpScene";
import { SearchCodeScene } from "./SearchCodeScene";
import { DocList, IndexBuilding, FailureMath, IdfCompare } from "./SidePanels";
import { CODE, PREVIOUS_CODE, TITLES, type SegmentKey } from "./searchCodeSegments";
import { TYPING_SCHEDULES, TERMINAL_FRAMES } from "./searchTypingSchedule";
import type { TraceLine } from "../code-video/TerminalOutput";

import indexOutputTrace from "../search-traces/index_output.json";
import failureTrace from "../search-traces/failure.json";
import fixOutputTrace from "../search-traces/fix_output.json";

type Segment = [string, "narration" | "code", number, number];
const segments = segmentsData as Segment[];

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const NARRATION_SCENES: Record<string, React.FC> = {
  hook: HookScene,
  core_idea: CoreIdeaScene,
  why_rare: WhyRareScene,
  tfidf_explain: TfIdfScene,
  real_engines: RealEnginesScene,
  wrapup: WrapUpScene,
};

/** The failure run must NOT render in success-green -- the top line is the
 *  WRONG answer. Coral for the winner, dimmed for the runner-up; inverted on
 *  the fix so the same shape reads as a correction. */
const LINE_COLORS: Partial<Record<SegmentKey, (string | null)[]>> = {
  failure: [c.noise, c.inkDim],
  fix_output: [c.hit, c.inkDim],
};

/** Segment mood -- tints grid, glow and chip so the room changes temperature
 *  on the failure and recovers on the fix. */
const MOOD: Partial<Record<SegmentKey, string>> = {
  failure: c.noise,
  fix_output: c.hit,
};

const TRACES: Partial<Record<SegmentKey, TraceLine[]>> = {
  index_output: indexOutputTrace as TraceLine[],
  failure: failureTrace as TraceLine[],
  fix_output: fixOutputTrace as TraceLine[],
};

/** Side panel per code segment. Secondary to the code by design. */
const sidePanelFor = (key: SegmentKey, start: number): React.ReactNode => {
  switch (key) {
    case "setup_docs":
      return <DocList startAt={40} />;
    case "build_index":
      // Rows begin right as the segment opens ("This is the whole index") and
      // land through the loop explanation. Starting at 2653 left the panel
      // empty for the first ~2.4s of the segment.
      return <IndexBuilding startAt={8} perRow={26} />;
    case "index_output":
      return <IndexBuilding startAt={0} perRow={10} />;
    case "naive":
      return <DocList startAt={10} highlightWord="the" highlightColor={c.noise} />;
    case "failure":
      // "Document one contains the word 'the' four times" is global 4676
      return <FailureMath startAt={4676 - start} />;
    case "fix_code":
      // idf bars grow as "inverse document frequency" is explained (global 7159)
      return <IdfCompare startAt={7159 - start} />;
    case "fix_output":
      return <IdfCompare startAt={0} />;
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
 *     even when opacity is perfectly stable. build-search-subtitles.py also
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
const CHAPTER_STARTS = new Set(["core_idea", "setup_docs", "why_rare", "real_engines", "wrapup"]);
const WHOOSH_LEAD = 6;

/** Chapter accent per segment -- gives the film a deliberate colour arc
 *  (setup cool -> building amber -> failure coral -> understanding violet ->
 *  fix green -> wrapup amber) instead of 13 unrelated slides. */
const CHAPTER_ACCENT: Record<string, string> = {
  hook: c.cool,
  core_idea: c.cool,
  setup_docs: c.accent,
  build_index: c.accent,
  index_output: c.accent,
  naive: c.accent,
  failure: c.noise,
  why_rare: c.violet,
  tfidf_explain: c.violet,
  fix_code: c.hit,
  fix_output: c.hit,
  real_engines: c.cool,
  wrapup: c.accent,
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

export const SearchVideo: React.FC = () => (
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
              <SearchCodeScene
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
    <ProgressBar />
    <Vignette />
    <FilmGrain />
    <Subtitles />
    <ChapterWhooshes />
    <Audio src={staticFile("search_vo.m4a")} volume={1} />
  </AbsoluteFill>
);
