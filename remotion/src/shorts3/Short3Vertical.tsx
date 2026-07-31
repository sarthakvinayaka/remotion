import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { s3 } from "./theme";
import { CardField } from "./CardField";
import { KineticWord } from "./KineticWord";
import { RoadPayoff, EndCard } from "./PayoffScenes";
import marks from "../short3-marks.json";

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  // subtle push-in zoom during the overload window (scene 3)
  const zoom =
    frame >= marks.every_team_start && frame <= marks.hard_end
      ? interpolate(frame, [marks.every_team_start, marks.hard_end], [1, 1.06], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : frame > marks.hard_end
        ? 1.06
        : 1;

  const redPulse =
    frame >= marks.every_team_start && frame <= marks.hard_end
      ? interpolate(frame, [marks.every_team_start, marks.hard_end], [0, 0.35], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) *
        (0.7 + Math.sin(frame * 0.5) * 0.3)
      : 0;

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${s3.bgTop}, ${s3.bgBottom})` }} />
      <AbsoluteFill
        style={{
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {redPulse > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(closest-side, ${s3.alarm}, transparent 70%)`,
            opacity: redPulse,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const Short3Vertical: React.FC = () => {
  const endCardStart = marks.engineering_end + 15;

  return (
    <AbsoluteFill style={{ backgroundColor: s3.ink, fontFamily: "sans-serif" }}>
      <Backdrop />

      {/* Scenes 1-4: shared card field (renders itself null once merged) */}
      <CardField />

      {/* Scene 4 hero text: ONE PATH */}
      <KineticWord
        text="One Path"
        color={s3.signal}
        enterFrame={marks.paved_road_start - 4}
        holdFrames={40}
        rotateSettle
        size={110}
      />

      {/* Scene 5: road + Platform Engineering */}
      <Sequence from={marks.paved_road_start} durationInFrames={endCardStart - marks.paved_road_start}>
        <RoadPayoff />
      </Sequence>

      {/* Scene 6: end card */}
      <Sequence from={endCardStart} durationInFrames={marks.total_frames + 45 - endCardStart}>
        <EndCard startFrame={0} />
      </Sequence>

      <Audio src={staticFile("short3_vo.m4a")} volume={1} />
    </AbsoluteFill>
  );
};
