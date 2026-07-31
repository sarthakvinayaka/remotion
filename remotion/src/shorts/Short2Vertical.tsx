import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { RecapMorph, ZoomRevealRoad, FoundationMerge } from "../components/WordlessScenes";

// Fully wordless visual storyboard for the recap+payoff short
// (local frames 0-903, global 5892-6795):
//   0-485    tangle morphs into a road, then into an orderly tower — the recap's
//            parallel lines ("split into pieces... team independence... scale
//            your architecture" vs "manageable... consistency... organization")
//   485-745  zoom out revealing the road extends much further than expected —
//            "operational service area grows faster than you expect"
//   745-903  blocks settle onto one glowing foundation — the closing payoff line
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const bg = frame < 485 ? "#0A2216" : frame < 745 ? "#170A22" : "#0A2216";
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

export const Short2Vertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05080A" }}>
      <Backdrop />

      <Sequence from={0} durationInFrames={485}>
        <RecapMorph startFrame={0} />
      </Sequence>
      <Sequence from={485} durationInFrames={260}>
        <ZoomRevealRoad startFrame={0} />
      </Sequence>
      <Sequence from={745} durationInFrames={158}>
        <FoundationMerge startFrame={0} />
      </Sequence>

      <Sequence from={0} durationInFrames={24}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.55} />
      </Sequence>
      <Sequence from={745} durationInFrames={16}>
        <Audio src={staticFile("sfx/rise.wav")} volume={0.55} />
      </Sequence>
      <Sequence from={868} durationInFrames={16}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.45} />
      </Sequence>

      {/* seek the shared audio track to global frame 5892 (this short's start) */}
      <Sequence from={-5892} durationInFrames={5892 + 903}>
        <Audio src={staticFile("audio.m4a")} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
