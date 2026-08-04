import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame } from "remotion";
import { mk, alpha, sceneTransition } from "../motion-kit";
import segmentsData from "../imggpt-segments.json";
import subtitlesData from "../imggpt-subtitles.json";
import { fonts, radius, space } from "./theme";

import { HookScene, NeverSeesScene, JourneyScene, PixelsScene, NumbersScene } from "./ScenesOpening";
import {
  PatchesScene,
  EmbeddingsScene,
  TogetherScene,
  AttentionScene,
  RelationshipsScene,
} from "./ScenesMiddle";
import {
  LanguageScene,
  TokensScene,
  StaticScene,
  DenoiseScene,
  SculptScene,
  RecapScene,
  ReflectScene,
  CtaScene,
} from "./ScenesClosing";

type Segment = [string, "narration", number, number];
const segments = segmentsData as Segment[];

export const TOTAL_FRAMES = segments[segments.length - 1][3];

const SCENES: Record<string, React.FC> = {
  hook: HookScene,
  never_sees: NeverSeesScene,
  journey: JourneyScene,
  pixels: PixelsScene,
  numbers: NumbersScene,
  patches: PatchesScene,
  embeddings: EmbeddingsScene,
  together: TogetherScene,
  attention: AttentionScene,
  relationships: RelationshipsScene,
  language: LanguageScene,
  tokens: TokensScene,
  static: StaticScene,
  denoise: DenoiseScene,
  sculpt: SculptScene,
  recap: RecapScene,
  reflect: ReflectScene,
  cta: CtaScene,
};

/** Chapter accent, so the progress hairline carries a deliberate colour arc. */
const CHAPTER_ACCENT: Record<string, string> = {
  hook: mk.blue,
  never_sees: mk.purple,
  journey: mk.cyan,
  pixels: mk.blue,
  numbers: mk.purple,
  patches: mk.cyan,
  embeddings: mk.purple,
  together: mk.blue,
  attention: mk.cyan,
  relationships: mk.purple,
  language: mk.purple,
  tokens: mk.blue,
  static: mk.hot,
  denoise: mk.cyan,
  sculpt: mk.cyan,
  recap: mk.blue,
  reflect: mk.cyan,
  cta: mk.purple,
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

/* ────────────────────────────────────────────────────────────────────────
   SUBTITLES
   ──────────────────────────────────────────────────────────────────────── */

type Word = { text: string; startFrame: number; endFrame: number };
type Cue = { text: string; startFrame: number; endFrame: number; words: Word[] };
const cues = subtitlesData as Cue[];

/**
 * ANTI-FLICKER. Subtitle flicker has three independent causes and all three
 * are handled here:
 *
 *  1. OPACITY — cues are grouped into continuous RUNS that fade only at their
 *     outer edges, so back-to-back cues never dip to zero between them.
 *  2. BLANKS — gaps under GAP_BRIDGE_FRAMES are bridged, so a short pause
 *     doesn't read as a dropout.
 *  3. GEOMETRY — the box is FIXED WIDTH. A shrink-to-fit box snaps down to
 *     one short word and back as cues swap, and that resize reads as flicker
 *     even when opacity is perfectly stable.
 *
 * And critically: NO `backdrop-filter`. It composites unreliably when
 * Remotion renders frames in parallel and dropped the caption for exactly one
 * frame, hundreds of times, in a sibling video.
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
            background: alpha(mk.bg, 0.84),
            boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
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
            const base = spoken ? mk.ink : alpha(mk.ink, 0.6);
            return (
              <span
                key={i}
                style={{
                  color: glow > 0.5 ? mk.cyan : base,
                  display: "inline-block",
                  textShadow: glow > 0 ? `0 0 ${16 * glow}px ${alpha(mk.cyan, 0.75)}` : "none",
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

/** A single hairline running continuously across every cut — one-film signal. */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const seg =
    segments.find(([, , s, e]) => frame >= s && frame < e) ?? segments[segments.length - 1];
  const accent = CHAPTER_ACCENT[seg[0]] ?? mk.blue;
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
          background: alpha(mk.white, 0.055),
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            background: accent,
            boxShadow: `0 0 10px ${alpha(accent, 0.5)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ImgGptVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: mk.bg, fontFamily: fonts.body }}>
    <Series>
      {segments.map(([name, , start, end], i) => {
        const duration = end - start;
        const Comp = SCENES[name];
        return (
          <Series.Sequence key={name} durationInFrames={duration}>
            <TransitionWrap
              duration={duration}
              isFirst={i === 0}
              isLast={i === segments.length - 1}
            >
              <Comp />
            </TransitionWrap>
          </Series.Sequence>
        );
      })}
    </Series>
    <ProgressBar />
    <Subtitles />
    <Audio src={staticFile("imggpt_vo.m4a")} volume={1} />
  </AbsoluteFill>
);
