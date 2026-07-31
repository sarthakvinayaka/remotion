import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { palette } from "./theme";
import { Subtitles } from "./components/Subtitles";
import { Scene01Hook } from "./scenes/Scene01_Hook";
import { Scene02Promise } from "./scenes/Scene02_Promise";
import { Scene03Pain } from "./scenes/Scene03_Pain";
import { Scene04Core } from "./scenes/Scene04_Core";
import { Scene05PlatformIntro } from "./scenes/Scene05_PlatformIntro";
import { Scene06Provides } from "./scenes/Scene06_Provides";
import { Scene07DX } from "./scenes/Scene07_DX";
import { Scene08Example } from "./scenes/Scene08_Example";
import { Scene09NotEnough } from "./scenes/Scene09_NotEnough";
import { Scene10Recap } from "./scenes/Scene10_Recap";
import { Scene11Final } from "./scenes/Scene11_Final";

// Scene durations are audio-driven: derived from whisper.cpp word-level
// timestamps on final_audio.m4a (see scripts/transcribe.mjs) so every scene
// boundary lands on the matching narration beat.
export const SCENE_DURATIONS = [691, 553, 696, 715, 679, 592, 535, 830, 601, 768, 354];
export const TOTAL_FRAMES = SCENE_DURATIONS.reduce((a, b) => a + b, 0);

const SCENES = [
  Scene01Hook, Scene02Promise, Scene03Pain, Scene04Core,
  Scene05PlatformIntro, Scene06Provides, Scene07DX, Scene08Example,
  Scene09NotEnough, Scene10Recap, Scene11Final,
];

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.5) % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.05 }}>
      <div style={{
        position: "absolute", inset: -20,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
        transform: `translate(${shift}px, ${-shift}px)`,
      }} />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{
    pointerEvents: "none",
    background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
  }} />
);

// Quick punch of light at every scene cut so hard cuts read as intentional
// beats instead of jarring jumps — doesn't touch any scene's own duration.
const CutFlashes: React.FC = () => {
  const frame = useCurrentFrame();
  const cutFrames: number[] = [];
  let cursor = 0;
  for (let i = 0; i < SCENE_DURATIONS.length; i++) {
    cursor += SCENE_DURATIONS[i];
    if (i < SCENE_DURATIONS.length - 1) cutFrames.push(cursor);
  }
  let opacity = 0;
  for (const cut of cutFrames) {
    const local = frame - cut;
    if (local >= -3 && local <= 5) {
      const o = interpolate(local, [-3, 0, 5], [0, 0.22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (o > opacity) opacity = o;
    }
  }
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: palette.ink, opacity }} />
  );
};

const TimedSfx: React.FC = () => {
  const sounds = ["whoosh", "rise", "thud", "whoosh", "rise", "pop", "whoosh", "click", "thud", "rise", "whoosh"];
  let cursor = 0;
  const nodes: React.ReactNode[] = [];
  // per-scene click tick offsets, retimed to the actual enumerated words now driving
  // each scene's list animations (see Scene03/Scene06/Scene07 retiming)
  const tickOffsets: Record<number, number[]> = {
    2: [249, 263, 284, 329, 342, 369], // CICD, Docker, Kubernetes, logging, metrics, alerts (Scene03)
    5: [51, 90, 131, 180, 213, 249], // Scene06 provides cards
    6: [142, 168, 203, 247], // Scene07 old-world steps
  };
  for (let i = 0; i < SCENE_DURATIONS.length; i++) {
    const dur = SCENE_DURATIONS[i];
    nodes.push(
      <Sequence key={`s-${i}`} from={cursor} durationInFrames={Math.min(60, dur)}>
        <Audio src={staticFile(`sfx/${sounds[i]}.wav`)} volume={0.55} />
      </Sequence>
    );
    // mid-scene ticks keyed to the same words the scene's own list items pop on
    const ticks = tickOffsets[i];
    if (ticks) {
      for (const t of ticks) {
        if (t < dur - 10) {
          nodes.push(
            <Sequence key={`t-${i}-${t}`} from={cursor + t} durationInFrames={8}>
              <Audio src={staticFile(`sfx/click.wav`)} volume={0.3} />
            </Sequence>
          );
        }
      }
    }
    // punctuation pop: on Scene03 (index 2) land it on the "10 services x 10 copies" reveal
    // onset ("So you're not really building..." local 461) instead of a generic
    // end-of-scene offset, since that reveal now settles well before the scene ends.
    const popOffset = i === 2 ? 461 : dur - 40;
    if (dur > 50 && popOffset < dur) {
      nodes.push(
        <Sequence key={`p-${i}`} from={cursor + popOffset} durationInFrames={10}>
          <Audio src={staticFile(`sfx/pop.wav`)} volume={0.25} />
        </Sequence>
      );
    }
    cursor += dur;
  }
  return <>{nodes}</>;
};

// Word-locked emphasis hits: land squarely on the narration's strongest beats
// rather than on generic scene-relative offsets.
const WordAccents: React.FC = () => (
  <>
    {/* "...most companies hit the same wall." (Scene01, global/local 336) */}
    <Sequence from={336} durationInFrames={12}>
      <Audio src={staticFile("sfx/thud.wav")} volume={0.5} />
    </Sequence>
    {/* "...complexity outspaces the productivity fast." — chart crossover (global 5536) */}
    <Sequence from={5536} durationInFrames={12}>
      <Audio src={staticFile("sfx/rise.wav")} volume={0.55} />
    </Sequence>
  </>
);

const SubtitlesLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return <Subtitles globalFrame={frame} />;
};

const FullTimeline: React.FC = () => (
  <>
    <Series>
      {SCENES.map((S, i) => (
        <Series.Sequence key={i} durationInFrames={SCENE_DURATIONS[i]}>
          <S />
        </Series.Sequence>
      ))}
    </Series>
    <Grain />
    <Vignette />
    <CutFlashes />
    <TimedSfx />
    <WordAccents />
    <SubtitlesLayer />
    <Audio src={staticFile("audio.m4a")} volume={1} />
  </>
);

export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: palette.bg, fontFamily: "sans-serif" }}>
    <FullTimeline />
  </AbsoluteFill>
);

// Renders the full timeline starting from startFrame — used for vertical shorts.
// Reuses every scene, all SFX, subtitles and the audio-driven retiming as-is: the
// whole timeline is mounted at a negative offset so playback appears to "seek"
// straight to startFrame. The composition's own durationInFrames (set in Root.tsx)
// controls where the clip ends.
export const ShortClip: React.FC<{ startFrame: number }> = ({ startFrame }) => (
  <AbsoluteFill style={{ backgroundColor: palette.bg, fontFamily: "sans-serif" }}>
    <Sequence from={-startFrame} durationInFrames={TOTAL_FRAMES}>
      <FullTimeline />
    </Sequence>
  </AbsoluteFill>
);
