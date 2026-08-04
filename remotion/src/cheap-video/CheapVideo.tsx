import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
import { c, fonts, radius, space } from "./theme";
import { sceneTransition } from "./motion";
import segmentsData from "../cheap-segments.json";
import cheapSubtitles from "../cheap-subtitles.json";

import { HookScene } from "./HookScene";
import { ThreeModelsScene } from "./ThreeModelsScene";
import { PricingScene } from "./PricingScene";
import { KernelRewriteScene } from "./KernelRewriteScene";
import { VerifierScene } from "./VerifierScene";
import { SpeculativeScene } from "./SpeculativeScene";
import { BothTogetherScene } from "./BothTogetherScene";
import { WhyNowScene } from "./WhyNowScene";
import { CompetitionScene } from "./CompetitionScene";
import { TakeawaysScene } from "./TakeawaysScene";
import { LoopScene } from "./LoopScene";
import { WrapUpScene } from "./WrapUpScene";

type Segment = [string, "narration", number, number];
const segments = segmentsData as Segment[];

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const SCENES: Record<string, React.FC> = {
  hook: HookScene,
  three_models: ThreeModelsScene,
  pricing: PricingScene,
  kernel_rewrite: KernelRewriteScene,
  verifier: VerifierScene,
  speculative: SpeculativeScene,
  both_together: BothTogetherScene,
  why_now: WhyNowScene,
  competition: CompetitionScene,
  takeaways: TakeawaysScene,
  loop: LoopScene,
  wrapup: WrapUpScene,
};

/**
 * Duration-preserving transition wrapper. The scene fades and settles
 * WITHIN its own unchanged duration -- we never overlap sequences, because
 * that would shrink the timeline and desync every anchor against the fixed
 * audio track. Interior cuts hold an opacity floor so no boundary frame
 * renders empty.
 */
const TransitionWrap: React.FC<{
  duration: number;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}> = ({ duration, isFirst, isLast, children }) => {
  const frame = useCurrentFrame();
  const { opacity, scale } = sceneTransition(frame, duration, { isFirst, isLast });
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>{children}</AbsoluteFill>
  );
};

type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };
const cues = cheapSubtitles as Cue[];

/**
 * ANTI-FLICKER. Subtitle flicker had THREE independent causes; all three had
 * to go, and fixing only the first two still left a visible strobe.
 *
 *  1. OPACITY. Every cue faded in and out individually, so the box dropped
 *     below 55% opacity on 980 frames (10.5% of the video) and hit a hard 0
 *     at each of the 96 touching boundaries. Fixed by grouping cues into
 *     continuous RUNS (below) that fade only at their true outer edges.
 *
 *  2. BLANKS. 37 cues sat 1-6 frames apart, and one 17-frame gap read as a
 *     mid-sentence blackout. Fixed by bridging gaps under GAP_BRIDGE_FRAMES.
 *
 *  3. GEOMETRY -- the one that was still visible after 1 and 2. Whisper split
 *     sentence tails into runt cues ("weeks" for 4 frames, "all" for 7). The
 *     shrink-to-fit box snapped from full width down to one short word and
 *     back inside 0.13s. Opacity was rock steady the whole time; the RESIZE
 *     was the flicker. Fixed at both layers: build-cheap-subtitles.py absorbs
 *     sub-MIN_CUE_FRAMES cues into the sentence they belong to, and the box
 *     below is fixed-width so cue length can never move it again.
 */
// ~0.6s. Chosen against the actual gap distribution: the largest gaps are
// 37, 17, 13, 11, 10... A threshold of 18 bridges the 17-frame gap at frame
// 3403 (which read as a mid-sentence blackout) while leaving the 37-frame
// gap at 5848 unbridged, because that one is a real breath in the narration.
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

/** Within a run, the cue to display: the active one, else the most recent. */
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

  // fade only at the RUN's edges, never at interior cue boundaries
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
        {/* FIXED-WIDTH BOX. A shrink-to-fit box snaps from full width down to
            one short word and back as cues swap, and that resize reads as a
            flicker even when opacity is perfectly stable. Holding the width
            constant means only the text inside ever changes. */}
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
            // NO backdropFilter. `backdrop-filter: blur()` composites
            // unreliably when Remotion renders frames in parallel: it
            // intermittently fails on individual frames, so the caption plate
            // vanished for exactly one frame, 325 times across the video.
            // Stills always looked correct (single-frame render), which is
            // why this only showed up when measuring the encoded output.
            // A slightly more opaque flat fill gives the same separation
            // from the background with none of the flicker.
            background: "rgba(11,14,20,0.82)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.4)",
            fontFamily: fonts.display,
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {cue.words.map((w, i) => {
            // Highlight ramps in/out over a few frames instead of snapping on
            // a boolean -- a hard toggle on a 1-frame word reads as a twitch.
            const glow = Math.max(
              0,
              Math.min(
                1,
                Math.min((frame - w.startFrame + 2) / 3, (w.endFrame + 3 - frame) / 3)
              )
            );
            const spoken = frame >= w.endFrame;
            const base = spoken ? c.ink : `${c.ink}99`;
            const color = glow > 0.5 ? c.cheap : base;
            return (
              <span
                key={i}
                style={{
                  color,
                  display: "inline-block",
                  textShadow: glow > 0 ? `0 0 ${16 * glow}px ${c.cheap}66` : "none",
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
 * Whooshes mark real TOPIC changes only, not every cut. Scenes that continue
 * one continuous thought (pricing follows three_models; verifier follows the
 * kernel rewrite; competition follows why_now) are pacing beats and get no
 * sound -- whooshing all of them reads as an action trailer.
 *
 * Derived from the segments file rather than hardcoded frame numbers, so it
 * stays correct if a boundary ever moves.
 */
const CHAPTER_STARTS = new Set([
  "kernel_rewrite", // the how -- new topic after the pricing setup
  "speculative", // second fix
  "why_now", // the editorial turn
  "takeaways", // closing section
  "wrapup",
]);

const WHOOSH_LEAD = 6; // start the swell just before the cut so it lands under it

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

export const CheapVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: c.bg, fontFamily: fonts.body }}>
    <Series>
      {segments.map(([name, , start, end], i) => {
        const duration = end - start;
        const Comp = SCENES[name];
        return (
          <Series.Sequence key={name} durationInFrames={duration}>
            <TransitionWrap duration={duration} isFirst={i === 0} isLast={i === segments.length - 1}>
              <Comp />
            </TransitionWrap>
          </Series.Sequence>
        );
      })}
    </Series>
    <Subtitles />
    <ChapterWhooshes />
    <Audio src={staticFile("cheap_vo.m4a")} volume={1} />
  </AbsoluteFill>
);
