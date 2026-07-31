import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import type { InsertEvent } from "./hashEvents";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// The full "key becomes a number becomes a slot" sequence for a single
// insert: a key chip flies through a "hash function" box, a number chip
// comes out the other side, then that number chip flies down to land on
// its matching bucket index. Runs entirely off `startFrame` (when this
// specific insert's flow should begin) and the real InsertEvent -- nothing
// about the key or hash value is hardcoded.
export const HashComputer: React.FC<{
  event: InsertEvent | null;
  startFrame: number;
  bucketTargetX: number; // screen x (relative to this component's own left edge) of the destination bucket, for the final drop
  width?: number;
}> = ({ event, startFrame, bucketTargetX, width = 640 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!event) return <div style={{ height: 90 }} />;

  const local = frame - startFrame;
  if (local < 0 || local > 46) return <div style={{ height: 90 }} />;

  // Phase timing across ~1.2s (36 frames @ 30fps):
  //   0-10: key chip appears + starts flowing toward the hash box
  //   8-18: key chip travels through the hash box
  //   16-24: number chip appears on the far side
  //   22-40: number chip flies down toward the bucket
  const keyIn = ease(frame, startFrame, fps, 14, 240);
  const travelT = interpolate(local, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numberIn = ease(frame, startFrame + 16, fps, 13, 230);
  const dropT = interpolate(local, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dropEase = ease(frame, startFrame + 22, fps, 15, 200);

  const laneY = 30;
  const boxCenterX = width / 2;
  const boxHalfWidth = 78; // the "hash function" dashed box spans boxCenterX +/- 78
  // The key chip's rest position is anchored so its *right edge* -- not its
  // center -- clears the box's left edge with margin, regardless of key
  // length. A long key like "elderberry" is much wider than "a", and
  // anchoring by center alone let long keys visibly overlap the "hash
  // function" label text instead of appearing to be consumed by it. The
  // chip is also fully faded out (see opacity below) before this rest
  // position is even reached, as a second layer of protection.
  const estChipHalfWidth = 14 + event.key.length * 4.6; // ~padding + mono glyph width at fontSize 14
  const keyChipRestX = boxCenterX - boxHalfWidth - 18 - estChipHalfWidth;
  const keyChipX = interpolate(travelT, [0, 1], [40, keyChipRestX]);
  const numberChipStartX = boxCenterX + 70;

  const numberX = interpolate(dropT, [0, 1], [numberChipStartX, bucketTargetX]);
  const numberY = interpolate(dropEase, [0, 1], [laneY, 80]);
  const numberOpacityOnDrop = interpolate(dropT, [0, 0.05], [1, 1]);

  return (
    <div style={{ position: "relative", width, height: 90 }}>
      <div
        style={{
          position: "absolute",
          left: boxCenterX - 78,
          top: laneY - 22,
          width: 156,
          height: 44,
          border: `1.5px dashed ${cv.muted}`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: cvFonts.mono,
          fontSize: 12,
          color: cv.muted,
          letterSpacing: 0.5,
        }}
      >
        hash function
      </div>

      {/* key chip, flowing left -> through the box */}
      {local < 22 && (
        <div
          style={{
            position: "absolute",
            left: keyChipX,
            top: laneY,
            transform: `translate(-50%, -50%) scale(${interpolate(keyIn, [0, 1], [0.6, 1])})`,
            opacity: keyIn * interpolate(local, [16, 22], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            fontFamily: cvFonts.mono,
            fontSize: 14,
            fontWeight: 700,
            color: cv.string,
            background: `${cv.string}1f`,
            border: `1.5px solid ${cv.string}`,
            borderRadius: 999,
            padding: "5px 14px",
            whiteSpace: "nowrap",
          }}
        >
          {event.key}
        </div>
      )}

      {/* number chip, appears after the box, then drops down to the bucket */}
      {local >= 14 && (
        <div
          style={{
            position: "absolute",
            left: local < 22 ? numberChipStartX : numberX,
            top: local < 22 ? laneY : numberY,
            transform: `translate(-50%, -50%) scale(${interpolate(numberIn, [0, 1], [0.5, 1])})`,
            opacity: numberIn * numberOpacityOnDrop,
            fontFamily: cvFonts.mono,
            fontSize: 15,
            fontWeight: 700,
            color: cv.keyword,
            background: `${cv.keyword}1f`,
            border: `1.5px solid ${cv.keyword}`,
            borderRadius: 999,
            padding: "5px 12px",
            boxShadow: local >= 30 ? `0 0 12px ${cv.keyword}66` : "none",
            whiteSpace: "nowrap",
          }}
        >
          {event.bucket_index}
        </div>
      )}

      {/* connecting arrow from box to number, only while chip sits at the box exit */}
      {local >= 14 && local < 22 && (
        <svg width={width} height={90} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <line
            x1={boxCenterX + 78}
            y1={laneY}
            x2={numberChipStartX - 24}
            y2={laneY}
            stroke={cv.keyword}
            strokeWidth={2}
            opacity={0.6}
          />
        </svg>
      )}
    </div>
  );
};
