import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import {
  SplitBlocks,
  CracksSpread,
  HopefulPath,
  ServiceGrid,
  InfraDuplication,
  Overload,
  ProductForms,
} from "../components/WordlessScenes";

// Fully wordless visual storyboard, timed to the actual narration content
// (global frames 0-2655), not to individual words:
//   0-297     one clean block splits into pieces — "sound great... ship independently"
//   297-691   pieces crack/shake — "give it a few months... same wall"
//   691-1244  a hopeful path appears then fades — "the pitch is simple... but here's the catch"
//   1244-1705 grid of 10 services forms — "say you are at 10 services..."
//   1705-1980 each sprouts duplicate infra icons — "10 services and 10 copies of infra"
//   1980-2515 the whole grid shakes/overloads — "system gets more complex... plumbing"
//   2515-2655 chaos resolves into one glowing block — "the platform quietly becomes the product"
const MOOD_BG: [number, string][] = [
  [0, "#0A1420"],
  [297, "#170A22"],
  [691, "#0A2216"],
  [1244, "#0A1420"],
  [1705, "#220A0E"],
  [1980, "#220A0E"],
  [2515, "#0A2216"],
];

const bgAt = (frame: number) => {
  let color = MOOD_BG[0][1];
  for (const [f, c] of MOOD_BG) {
    if (frame >= f) color = c;
  }
  return color;
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const bg = bgAt(frame);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent 70%)",
          transform: `scale(${1 + Math.sin(frame * 0.04) * 0.05})`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Short1Vertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05080A" }}>
      <Backdrop />

      <Sequence from={0} durationInFrames={297}>
        <SplitBlocks startFrame={0} />
      </Sequence>
      <Sequence from={297} durationInFrames={394}>
        <CracksSpread startFrame={0} />
      </Sequence>
      <Sequence from={691} durationInFrames={553}>
        <HopefulPath startFrame={0} endLocal={553} />
      </Sequence>
      <Sequence from={1244} durationInFrames={461}>
        <ServiceGrid startFrame={0} />
      </Sequence>
      <Sequence from={1705} durationInFrames={275}>
        <InfraDuplication startFrame={0} />
      </Sequence>
      <Sequence from={1980} durationInFrames={535}>
        <Overload startFrame={0} />
      </Sequence>
      <Sequence from={2515} durationInFrames={140}>
        <ProductForms startFrame={0} />
      </Sequence>

      {/* SFX hits keyed to the same story beats */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={330} durationInFrames={20}>
        <Audio src={staticFile("sfx/thud.wav")} volume={0.55} />
      </Sequence>
      <Sequence from={1244} durationInFrames={12}>
        <Audio src={staticFile("sfx/click.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={1705} durationInFrames={12}>
        <Audio src={staticFile("sfx/rise.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={2515} durationInFrames={12}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.45} />
      </Sequence>

      <Audio src={staticFile("audio.m4a")} volume={1} />
    </AbsoluteFill>
  );
};
