import { spring, interpolate, type SpringConfig } from "remotion";

/**
 * ONE shared set of easings for the whole video. Scenes must never define
 * their own inline spring configs -- if you find yourself writing
 * `config: { damping: ... }` in a scene, add a named easing here instead.
 *
 *   ENTER  - something arrives on screen. Crisp, slight overshoot.
 *   SETTLE - something re-positions or changes value. No overshoot.
 *   SLOW   - large hero moves and reveals that should feel deliberate.
 */
export const EASE: Record<"ENTER" | "SETTLE" | "SLOW", Partial<SpringConfig>> = {
  ENTER: { damping: 14, stiffness: 220 },
  SETTLE: { damping: 20, stiffness: 170 },
  SLOW: { damping: 26, stiffness: 90 },
};

/** Spring driver: returns 0..1 for an animation beginning at `from`. */
export const ease = (
  frame: number,
  from: number,
  fps: number,
  kind: keyof typeof EASE = "ENTER"
) => spring({ frame: frame - from, fps, config: EASE[kind] });

/** Linear 0..1 ramp -- for continuous motion where a spring would settle. */
export const ramp = (frame: number, from: number, len: number) =>
  interpolate(frame, [from, from + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Deterministic 0..1 breathing wave for idle life on the ACTIVE focal
 * element. Remotion renders frames independently, so this is a pure
 * function of frame -- never Math.random().
 *
 * Use it to keep the thing the narration is currently about subtly alive
 * (glow, float, scale) during long holds. Never to add unrelated motion.
 */
export const idlePulse = (frame: number, period = 90, seed = 0) => {
  const phase = (frame / period + seed * 0.37) * Math.PI * 2;
  return (Math.sin(phase) + 1) / 2;
};

/** Deterministic pseudo-random 0..1 from an integer seed. */
export const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Duration-preserving scene wrapper. Each scene fades/scales in and out
 * WITHIN its own unchanged duration -- no TransitionSeries, which would
 * overlap sequences and shrink the timeline, desyncing every frame anchor
 * against the fixed audio track.
 *
 * Interior cuts hold an opacity floor so the boundary frame is never empty
 * (a hard 0 on both sides renders a black flash). Only the video's true
 * first and last edges fade fully from/to black.
 */
export const TRANSITION_FRAMES = 12;
export const OPACITY_FLOOR = 0.2;

/**
 * Scenes reveal their own content with entrance springs starting around
 * local frame 0-6. That entrance multiplies with the wrapper's fade-in, so
 * the first frame of a scene renders at (floor x ~0) -- effectively black,
 * which reads as a flash at every cut.
 *
 * SCENE_LEAD_IN is how many frames of "hold" a scene's intro animation
 * should start BEFORE local 0 conceptually; scenes pass `-SCENE_LEAD_IN`
 * as their intro start so content is already visible on the boundary
 * frame and only the wrapper's opacity floor does the blending.
 */
export const SCENE_LEAD_IN = 10;

export const sceneTransition = (
  frame: number,
  duration: number,
  { isFirst = false, isLast = false }: { isFirst?: boolean; isLast?: boolean } = {}
) => {
  const t = TRANSITION_FRAMES;
  const inFloor = isFirst ? 0 : OPACITY_FLOOR;
  const outFloor = isLast ? 0 : OPACITY_FLOOR;

  const fadeIn = interpolate(frame, [0, t], [inFloor, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [duration - t, duration], [1, outFloor], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const scaleIn = interpolate(frame, [0, t], [0.985, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleOut = interpolate(frame, [duration - t, duration], [1, 0.995], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return { opacity, scale: Math.min(scaleIn, scaleOut) };
};
