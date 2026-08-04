import { spring, interpolate, type SpringConfig } from "remotion";

/**
 * MOTION KIT — timing primitives.
 *
 * ONE shared easing set for every video. If a scene needs a curve that isn't
 * here, add a named entry rather than writing an inline spring config.
 */
export const EASE: Record<"ENTER" | "SETTLE" | "SLOW" | "SNAP", Partial<SpringConfig>> = {
  ENTER: { damping: 14, stiffness: 220 },
  SETTLE: { damping: 20, stiffness: 170 },
  SLOW: { damping: 26, stiffness: 90 },
  /** for stamps/impacts — noticeable overshoot */
  SNAP: { damping: 11, stiffness: 260 },
};

export const ease = (
  frame: number,
  from: number,
  fps: number,
  kind: keyof typeof EASE = "ENTER"
) => spring({ frame: frame - from, fps, config: EASE[kind] });

/** Linear 0..1 ramp, clamped. For continuous motion a spring would settle out of. */
export const ramp = (frame: number, from: number, len: number) =>
  interpolate(frame, [from, from + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Smoothstep 0..1 — softer than `ramp`, no spring overshoot. */
export const smooth = (frame: number, from: number, len: number) => {
  const t = ramp(frame, from, len);
  return t * t * (3 - 2 * t);
};

/**
 * Deterministic pseudo-random in 0..1.
 *
 * Remotion renders frames INDEPENDENTLY and in PARALLEL. Math.random() at
 * render time produces a different value per frame and per worker, which
 * reads as full-screen noise. Every "random" value in this kit routes here.
 */
export const seeded = (n: number): number => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Deterministic 0..1 breathing wave — idle life on a focal element. */
export const idlePulse = (frame: number, period = 90, seed = 0) => {
  const phase = (frame / period + seed * 0.37) * Math.PI * 2;
  return (Math.sin(phase) + 1) / 2;
};

/** Deterministic signed drift in -1..1, for float/parallax. */
export const drift = (frame: number, period = 200, seed = 0) =>
  idlePulse(frame, period, seed) * 2 - 1;

/**
 * Duration-preserving scene transition.
 *
 * Never use TransitionSeries on a video hand-synced to fixed audio — it
 * overlaps sequences, shrinks the timeline, and desyncs every frame anchor.
 * This fades and settles WITHIN a scene's own unchanged duration.
 *
 * Interior cuts hold an opacity floor so a boundary frame is never empty
 * (a hard 0 on both sides renders black and flashes).
 */
export const TRANSITION_FRAMES = 12;
export const OPACITY_FLOOR = 0.2;

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

  // directional push-through: outgoing settles back, incoming comes forward
  const scaleIn = interpolate(frame, [0, t], [1.015, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleOut = interpolate(frame, [duration - t, duration], [1, 0.985], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return { opacity: Math.min(fadeIn, fadeOut), scale: Math.min(scaleIn, scaleOut) };
};

/**
 * Scenes reveal content with entrance springs starting near local frame 0.
 * That entrance multiplies with the wrapper's fade-in, so the first frame of
 * a scene renders at (floor x ~0) -- effectively black, a flash at every cut.
 * Scenes offset their intro by this so content is already up on the boundary.
 */
export const SCENE_LEAD_IN = 10;
