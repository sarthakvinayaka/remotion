import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { InfraCard } from "./InfraCard";
import { s3 } from "./theme";
import marks from "../short3-marks.json";

// Canvas center for a 1080x1920 vertical composition.
const CX = 540;
const CY = 860;

const TAGS = ["CI/CD", "DOCKERFILES", "KUBERNETES", "LOGGING", "SECRETS"];
// which of the 10 cards gets which tag (5 tags across the first 5 cards)
const TAG_CARD_INDEX = [0, 1, 2, 3, 4];
const TAG_FRAMES = [marks.cicd, marks.dockerfiles, marks.kubernetes, marks.logging, marks.secrets];

const N = 10;

// Fan-out grid target positions (loose grid, not a perfect matrix — reads as
// organic scatter rather than a spreadsheet).
const GRID_POS = Array.from({ length: N }).map((_, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const jitterX = (i % 2 === 0 ? 1 : -1) * 10;
  const jitterY = (i * 7) % 15;
  return {
    x: CX + (col - 1) * 260 + jitterX,
    y: CY - 340 + row * 240 + jitterY,
    rot: (i % 2 === 0 ? -1 : 1) * (3 + (i % 3) * 2),
  };
});

const ease = (frame: number, from: number, fps: number, damping = 15, stiffness = 190) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

export const CardField: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Scene 1: single card scales in, then fans out into the grid ----
  const singleCardIn = ease(frame, 0, fps, 14, 220);
  const fanOut = interpolate(frame, [20, marks.setup_end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Scene 3: overload jitter + red glow build ----
  const inOverloadWindow = frame >= marks.every_team_start && frame <= marks.hard_end;
  const jitterAmp = inOverloadWindow ? interpolate(frame, [marks.every_team_start, marks.hard_end], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const jx = Math.sin(frame * 3.1) * jitterAmp;
  const jy = Math.cos(frame * 2.7) * jitterAmp;
  const redGlow = interpolate(frame, [marks.every_team_start, marks.hard_end], [0, 55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Scene 4: convergence into one teal card at center ----
  const converge = interpolate(frame, [marks.fix_start, marks.paved_road_start], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const convergeSpring = ease(frame, marks.fix_start, fps, 12, 170);
  const impactFlash = interpolate(frame, [marks.paved_road_start - 4, marks.paved_road_start, marks.paved_road_start + 8], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const afterTurn = frame >= marks.paved_road_start;

  if (afterTurn) {
    // Cards have fully merged — CardField renders nothing after this point,
    // Scene 5/6 own the visuals (the merged card becomes the road icon there).
    return null;
  }

  return (
    <>
      {Array.from({ length: N }).map((_, i) => {
        const grid = GRID_POS[i];

        // position: center (scene1 start) -> grid (fanned out) -> back to center (converge)
        const gx = interpolate(fanOut, [0, 1], [CX, grid.x]);
        const gy = interpolate(fanOut, [0, 1], [CY, grid.y]);
        const x = interpolate(converge, [0, 1], [gx, CX]) + jx;
        const y = interpolate(converge, [0, 1], [gy, CY]) + jy;
        const rot = interpolate(converge, [0, 1], [grid.rot, 0]);

        // scale: pop in (scene1), settle at 1, shrink slightly as they merge
        const baseScale = frame < 20 ? singleCardIn : 1;
        const mergeScale = interpolate(convergeSpring, [0, 1], [1, 0.4]);
        const scale = interpolate(converge, [0, 1], [baseScale, mergeScale]);

        const outlineColor = converge > 0.5 ? s3.signal : s3.alarm;
        const cardOpacity = converge > 0.85 ? interpolate(converge, [0.85, 1], [1, 0]) : 1;

        const tagIdx = i < TAG_CARD_INDEX.length ? i : -1;
        const hasTag = tagIdx !== -1 && frame >= TAG_FRAMES[tagIdx] && frame < marks.every_team_start;
        const isCurrentTag =
          hasTag && tagIdx === TAG_FRAMES.filter((f) => frame >= f).length - 1;

        return (
          <InfraCard
            key={i}
            x={x}
            y={y}
            scale={scale}
            rotate={rot}
            outline={outlineColor}
            opacity={cardOpacity}
            glow={redGlow}
            tag={hasTag ? TAGS[tagIdx] : null}
            tagBright={isCurrentTag}
          />
        );
      })}
      {impactFlash > 0 && (
        <div
          style={{
            position: "absolute",
            left: CX - 200,
            top: CY - 200,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: s3.signal,
            opacity: impactFlash * 0.5,
            filter: "blur(30px)",
            transform: "translate(0,0)",
          }}
        />
      )}
    </>
  );
};
