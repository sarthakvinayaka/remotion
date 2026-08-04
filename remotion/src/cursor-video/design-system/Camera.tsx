import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export interface CameraMove {
  atFrame: number;
  duration: number;
  x?: number;
  y?: number;
  scale?: number;
  easing?: (t: number) => number;
}

export const Camera: React.FC<{
  moves: CameraMove[];
  children: React.ReactNode;
}> = ({ moves, children }) => {
  const frame = useCurrentFrame();

  let currentX = 0;
  let currentY = 0;
  let currentScale = 1;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const prevMove = i > 0 ? moves[i - 1] : { x: 0, y: 0, scale: 1 };
    
    const startX = prevMove.x ?? 0;
    const startY = prevMove.y ?? 0;
    const startScale = prevMove.scale ?? 1;
    
    const endX = move.x ?? startX;
    const endY = move.y ?? startY;
    const endScale = move.scale ?? startScale;

    const progress = interpolate(
      frame,
      [move.atFrame, move.atFrame + move.duration],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const easedProgress = move.easing ? move.easing(progress) : Easing.inOut(Easing.cubic)(progress);

    if (frame >= move.atFrame) {
      currentX = interpolate(easedProgress, [0, 1], [startX, endX]);
      currentY = interpolate(easedProgress, [0, 1], [startY, endY]);
      currentScale = interpolate(easedProgress, [0, 1], [startScale, endScale]);
    }
  }

  return (
    <div style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      transformOrigin: "center center",
      transform: `scale(${currentScale}) translate(${-currentX}px, ${-currentY}px)`,
      willChange: "transform"
    }}>
      {children}
    </div>
  );
};
