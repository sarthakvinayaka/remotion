import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { mk, alpha, rampAt } from "./colors";
import { drift, ease, idlePulse, ramp, seeded, smooth } from "./timing";

/* ────────────────────────────────────────────────────────────────────────
   CAMERA
   ──────────────────────────────────────────────────────────────────────── */

export type CameraMove = {
  /** local frame the move starts */
  at: number;
  /** how long the move takes */
  len: number;
  /** target scale (1 = neutral) */
  scale?: number;
  /** target offset in px at 1920x1080 */
  x?: number;
  y?: number;
};

/**
 * A camera rig. Wrap scene content and give it moves; it interpolates
 * between them so the frame is never locked off.
 *
 * A slow continuous push is applied on top of any explicit moves — 2-3% over
 * a scene is invisible frame-to-frame and unmistakable in motion. It is the
 * cheapest thing that makes static graphics read as photographed.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  moves?: CameraMove[];
  /** continuous push over the scene's whole duration */
  push?: number;
  duration?: number;
  origin?: string;
}> = ({ children, moves = [], push = 0.022, duration = 300, origin = "50% 50%" }) => {
  const frame = useCurrentFrame();

  let scale = 1 + smooth(frame, 0, duration) * push;
  let x = 0;
  let y = 0;

  for (const m of moves) {
    const t = smooth(frame, m.at, m.len);
    if (t <= 0) continue;
    if (m.scale !== undefined) scale *= 1 + (m.scale - 1) * t;
    if (m.x !== undefined) x += m.x * t;
    if (m.y !== undefined) y += m.y * t;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Parallax layer — moves a fraction of the camera, for depth. */
export const Parallax: React.FC<{
  children: React.ReactNode;
  depth?: number;
  period?: number;
  seed?: number;
}> = ({ children, depth = 1, period = 260, seed = 0 }) => {
  const frame = useCurrentFrame();
  const dx = drift(frame, period, seed) * 14 * depth;
  const dy = drift(frame, period * 1.31, seed + 3) * 9 * depth;
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>{children}</AbsoluteFill>;
};

/* ────────────────────────────────────────────────────────────────────────
   SURFACES
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Glass surface — WITHOUT `backdrop-filter`.
 *
 * `backdrop-filter: blur()` is the normal way to do this and it is NOT SAFE
 * here: Remotion renders frames in parallel and the filter does not resolve
 * identically each time, so the element intermittently vanishes for exactly
 * one frame. Measured in a sibling video as hundreds of single-frame
 * dropouts that were invisible in stills and obvious on playback.
 *
 * This fakes the look with layered gradients + rim light, which composites
 * deterministically.
 */
export const glass = (tint: string = mk.blue, strength = 1) => ({
  background: [
    `linear-gradient(180deg, ${alpha(mk.white, 0.06 * strength)} 0%, ${alpha(mk.white, 0)} 46%)`,
    `radial-gradient(120% 80% at 50% -10%, ${alpha(tint, 0.1 * strength)} 0%, transparent 62%)`,
    alpha(mk.panel, 0.82),
  ].join(", "),
  border: `1px solid ${alpha(mk.white, 0.09)}`,
  boxShadow: [
    `inset 0 1px 0 ${alpha(mk.white, 0.1)}`,
    `inset 0 -1px 0 ${alpha("#000000", 0.5)}`,
    `0 18px 48px ${alpha("#000000", 0.55)}`,
    `0 2px 6px ${alpha("#000000", 0.4)}`,
    `0 0 34px ${alpha(tint, 0.13 * strength)}`,
  ].join(", "),
});

export const GlassPanel: React.FC<{
  children?: React.ReactNode;
  tint?: string;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ children, tint = mk.blue, radius = 22, style }) => (
  <div style={{ ...glass(tint), borderRadius: radius, ...style }}>{children}</div>
);

/** Soft animated glow blob. Deterministic. */
export const Glow: React.FC<{
  color?: string;
  size?: number;
  x?: string;
  y?: string;
  seed?: number;
  intensity?: number;
}> = ({ color = mk.blue, size = 70, x = "50%", y = "45%", seed = 0, intensity = 0.3 }) => {
  const frame = useCurrentFrame();
  const p = idlePulse(frame, 260, seed);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse ${size}% ${size * 0.8}% at ${x} ${y}, ${alpha(
          color,
          intensity * (0.8 + p * 0.4)
        )} 0%, transparent 65%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

/** Corner falloff so the frame reads photographed rather than rendered. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(130% 105% at 50% 45%, transparent 36%, ${alpha(
        "#000000",
        strength
      )} 100%)`,
    }}
  />
);

/** Slow drifting grid — ambient structure, never a substitute for real motion. */
export const GridBg: React.FC<{ opacity?: number; color?: string; speed?: number; cell?: number }> = ({
  opacity = 0.05,
  color = mk.blue,
  speed = 0.25,
  cell = 64,
}) => {
  const frame = useCurrentFrame();
  const shift = (frame * speed) % cell;
  return (
    <div
      style={{
        position: "absolute",
        inset: -90,
        backgroundImage: `linear-gradient(${alpha(color, 0.53)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
          color,
          0.53
        )} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`,
        transform: `translate(${-shift}px, ${-shift}px)`,
        opacity,
      }}
    />
  );
};

/* ────────────────────────────────────────────────────────────────────────
   PARTICLES
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Deterministic floating particle field. Every position derives from
 * `seeded(i)`, so the field is identical on every render worker.
 */
export const Particles: React.FC<{
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  opacity?: number;
  seedBase?: number;
}> = ({ count = 40, color, speed = 1, size = 3, opacity = 0.5, seedBase = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = seedBase + i * 7;
        const bx = seeded(s) * 100;
        const by = seeded(s + 1) * 100;
        const per = 240 + seeded(s + 2) * 320;
        const dx = drift(frame, per, s) * 3.2 * speed;
        const dy = drift(frame, per * 1.27, s + 5) * 2.4 * speed;
        const tw = 0.35 + idlePulse(frame, 90 + seeded(s + 3) * 120, s) * 0.65;
        const r = size * (0.5 + seeded(s + 4));
        const col = color ?? rampAt(seeded(s + 6));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${bx}%`,
              top: `${by}%`,
              width: r,
              height: r,
              borderRadius: 999,
              background: col,
              opacity: opacity * tw,
              transform: `translate(${dx}px, ${dy}px)`,
              boxShadow: `0 0 ${r * 3}px ${alpha(col, 0.6)}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Particle burst — for transitions and "dissolve" moments.
 * `t` 0..1 drives the burst outward from the centre.
 */
export const ParticleBurst: React.FC<{
  t: number;
  count?: number;
  color?: string;
  spread?: number;
  seedBase?: number;
}> = ({ t, count = 60, color, spread = 620, seedBase = 100 }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = seedBase + i * 11;
        const ang = seeded(s) * Math.PI * 2;
        const dist = (0.35 + seeded(s + 1) * 0.65) * spread * t;
        const r = 2 + seeded(s + 2) * 4;
        const col = color ?? rampAt(seeded(s + 3));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: r,
              height: r,
              borderRadius: 999,
              background: col,
              opacity: (1 - t) * 0.9,
              transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px)`,
              boxShadow: `0 0 ${r * 4}px ${col}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   SVG DRAWING
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Line that draws itself on. `t` 0..1. Uses dashoffset, which is
 * deterministic and parallel-render safe.
 */
export const DrawPath: React.FC<{
  d: string;
  t: number;
  color?: string;
  width?: number;
  length?: number;
  glow?: boolean;
  dash?: string;
  cap?: "butt" | "round";
}> = ({ d, t, color = mk.cyan, width = 2.5, length = 1400, glow = true, dash, cap = "round" }) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap={cap}
    strokeDasharray={dash ?? length}
    strokeDashoffset={dash ? undefined : length * (1 - Math.max(0, Math.min(1, t)))}
    opacity={t <= 0 ? 0 : 1}
    style={glow ? { filter: `drop-shadow(0 0 6px ${alpha(color, 0.7)})` } : undefined}
  />
);

/** Arrow head marker set — drop once per SVG. */
export const ArrowDefs: React.FC<{ id?: string; color?: string }> = ({
  id = "mkArrow",
  color = mk.cyan,
}) => (
  <defs>
    <marker id={id} markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={color} />
    </marker>
  </defs>
);

/** A dot travelling along a straight segment — information flowing. */
export const FlowDot: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  t: number;
  color?: string;
  r?: number;
}> = ({ x1, y1, x2, y2, t, color = mk.cyan, r = 5 }) => {
  if (t <= 0 || t > 1) return null;
  return (
    <circle
      cx={x1 + (x2 - x1) * t}
      cy={y1 + (y2 - y1) * t}
      r={r}
      fill={color}
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    />
  );
};

/* ────────────────────────────────────────────────────────────────────────
   NOISE  (the diffusion scene depends on this)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Deterministic static field — WITHOUT `feTurbulence`.
 *
 * An SVG turbulence filter is the obvious way to make TV static and it is NOT
 * SAFE: the filter is not resolved identically across parallel-rendered
 * frames, so the whole field re-randomises every frame. Measured in a sibling
 * video as a 4-unit mean-luminance swing alternating every single frame —
 * a full-screen strobe that stills cannot reveal.
 *
 * This draws real cells from `seeded()`. `t` 0..1 fades the noise out, so the
 * same component drives an entire diffusion sequence.
 */
export const NoiseField: React.FC<{
  cols?: number;
  rows?: number;
  /** 1 = full static, 0 = gone */
  amount?: number;
  /** advance the pattern deterministically (frame/6 gives a lively shimmer) */
  step?: number;
  colorize?: boolean;
  radius?: number;
}> = ({ cols = 64, rows = 36, amount = 1, step = 0, colorize = false, radius = 0 }) => {
  if (amount <= 0) return null;
  const cells: React.ReactNode[] = [];
  const gen = Math.floor(step);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const s = (y * cols + x) * 3 + gen * 977;
      const v = seeded(s);
      const col = colorize ? rampAt(seeded(s + 1)) : `rgb(${v * 255 | 0}, ${v * 255 | 0}, ${v * 255 | 0})`;
      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: `${(x / cols) * 100}%`,
            top: `${(y / rows) * 100}%`,
            width: `${100 / cols}%`,
            height: `${100 / rows}%`,
            background: col,
            opacity: amount * (0.35 + v * 0.65),
            borderRadius: radius,
          }}
        />
      );
    }
  }
  return <AbsoluteFill style={{ overflow: "hidden" }}>{cells}</AbsoluteFill>;
};

/* ────────────────────────────────────────────────────────────────────────
   TYPOGRAPHY
   ──────────────────────────────────────────────────────────────────────── */

/** One-word title card. The brief caps on-screen text at ~4 words. */
export const BigWord: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  t?: number;
  fontFamily?: string;
}> = ({ children, color = mk.white, size = 128, t = 1, fontFamily }) => (
  <div
    style={{
      fontFamily,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: -2,
      color,
      opacity: t,
      transform: `translateY(${(1 - t) * 18}px) scale(${0.96 + t * 0.04})`,
      textShadow: `0 0 60px ${alpha(color, 0.35)}, 0 8px 30px ${alpha("#000000", 0.7)}`,
      textAlign: "center",
      lineHeight: 1.02,
    }}
  >
    {children}
  </div>
);

/** Word-by-word reveal for short phrases. */
export const KineticWords: React.FC<{
  text: string;
  startFrame?: number;
  perWord?: number;
  size?: number;
  color?: string;
  fontFamily?: string;
}> = ({ text, startFrame = 0, perWord = 5, size = 54, color = mk.ink, fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: size * 0.28, justifyContent: "center" }}>
      {text.split(" ").map((w, i) => {
        const t = ease(frame, startFrame + i * perWord, fps, "ENTER");
        return (
          <span
            key={i}
            style={{
              fontFamily,
              fontSize: size,
              fontWeight: 700,
              color,
              opacity: t,
              display: "inline-block",
              transform: `translateY(${(1 - t) * 20}px)`,
              filter: `blur(${(1 - t) * 6}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
