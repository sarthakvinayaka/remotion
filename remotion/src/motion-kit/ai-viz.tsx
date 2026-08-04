import React from "react";
import { mk, alpha, rampAt, RGB } from "./colors";
import { ease, idlePulse, ramp, seeded, smooth } from "./timing";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { DrawPath } from "./primitives";

/**
 * MOTION KIT — AI visualisation components.
 *
 * Generic enough to reuse across any AI explainer: a procedural image the
 * camera can zoom into until pixels resolve, patch grids, embedding bars,
 * attention webs, neural nets, token streams, and diffusion.
 *
 * Everything is deterministic (seeded), so it is safe under Remotion's
 * parallel frame rendering.
 */

/* ────────────────────────────────────────────────────────────────────────
   PROCEDURAL IMAGE
   ──────────────────────────────────────────────────────────────────────── */

/**
 * The "uploaded photo", defined as a pure function of normalised x/y.
 *
 * Building the image procedurally (rather than as fixed artwork) means the
 * SAME source can be sampled at any resolution — so "zoom in until you see
 * pixels" is just lowering the sample count, and the pixel grid, the patch
 * grid and the final render all agree by construction.
 *
 * Scene: a sunset over hills with a low sun and water. Chosen because it
 * pixelates legibly and reads at 64x36 as well as at 8x5.
 */
export const samplePhoto = (u: number, v: number): [number, number, number] => {
  // sky: deep indigo at top -> warm orange at horizon
  const horizon = 0.58;
  let r: number, g: number, b: number;

  if (v < horizon) {
    const t = v / horizon;
    r = 26 + t * 229;
    g = 20 + t * 130;
    b = 62 + t * 20;

    // sun disc
    const sx = 0.5;
    const sy = 0.5;
    const d = Math.sqrt((u - sx) ** 2 + ((v - sy) * 1.7) ** 2);
    if (d < 0.11) {
      const c = 1 - d / 0.11;
      r = Math.min(255, r + c * 120);
      g = Math.min(255, g + c * 150);
      b = Math.min(255, b + c * 60);
    }
  } else {
    // water: reflects the sky, banded
    const t = (v - horizon) / (1 - horizon);
    const band = Math.sin(v * 60) * 0.5 + 0.5;
    r = 180 - t * 150 + band * 18;
    g = 90 - t * 70 + band * 14;
    b = 90 - t * 30 + band * 30;
  }

  // hills silhouette
  const hill = 0.55 + Math.sin(u * 5.2) * 0.045 + Math.sin(u * 11.7) * 0.02;
  if (v > hill && v < horizon + 0.005) {
    r = 38;
    g = 24;
    b = 60;
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
};

const rgbCss = ([r, g, b]: [number, number, number]) => `rgb(${r},${g},${b})`;

/**
 * The photo, rendered as a grid of cells. Lower `cols` = more visibly
 * pixelated. `gap` separates the cells so individual pixels read as squares.
 */
export const PixelImage: React.FC<{
  cols: number;
  rows: number;
  width: number;
  height: number;
  gap?: number;
  radius?: number;
  /** 0..1 — fade each cell in from the centre outward */
  reveal?: number;
  /** show each cell's numeric value instead of its colour */
  showNumbers?: boolean;
}> = ({ cols, rows, width, height, gap = 0, radius = 0, reveal = 1, showNumbers = false }) => {
  const cw = width / cols;
  const ch = height / rows;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const u = (x + 0.5) / cols;
      const v = (y + 0.5) / rows;
      const col = samplePhoto(u, v);
      // centre-out reveal
      const dc = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2) / 0.72;
      const on = Math.max(0, Math.min(1, (reveal - dc) * 4));
      if (on <= 0) continue;
      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x * cw,
            top: y * ch,
            width: Math.max(1, cw - gap),
            height: Math.max(1, ch - gap),
            background: rgbCss(col),
            borderRadius: radius,
            opacity: on,
            display: showNumbers ? "flex" : undefined,
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.min(cw, ch) * 0.2,
            fontFamily: "monospace",
            color: "#000",
          }}
        >
          {showNumbers ? col[0] : null}
        </div>
      );
    }
  }
  return <div style={{ position: "relative", width, height, overflow: "hidden" }}>{cells}</div>;
};

/** A single pixel blown up, showing its three channel values. */
export const PixelInspector: React.FC<{
  u: number;
  v: number;
  size?: number;
  t?: number;
  fontFamily?: string;
}> = ({ u, v, size = 150, t = 1, fontFamily }) => {
  const [r, g, b] = samplePhoto(u, v);
  const rows: [string, number, string][] = [
    ["R", r, RGB.r],
    ["G", g, RGB.g],
    ["B", b, RGB.b],
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 40, opacity: t }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: `rgb(${r},${g},${b})`,
          boxShadow: `0 0 46px ${alpha(mk.white, 0.28)}, 0 14px 40px rgba(0,0,0,0.6)`,
          border: `2px solid ${alpha(mk.white, 0.3)}`,
          transform: `scale(${0.85 + t * 0.15})`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(([k, val, col], i) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily, fontSize: 34, fontWeight: 700, color: col, width: 30 }}>{k}</span>
            <div style={{ width: 230, height: 16, borderRadius: 99, background: alpha(col, 0.18) }}>
              <div
                style={{
                  width: `${(val / 255) * 100 * t}%`,
                  height: "100%",
                  borderRadius: 99,
                  background: col,
                  boxShadow: `0 0 12px ${col}`,
                }}
              />
            </div>
            <span
              style={{
                fontFamily,
                fontSize: 40,
                fontWeight: 700,
                color: mk.white,
                fontVariantNumeric: "tabular-nums",
                width: 82,
              }}
            >
              {Math.round(val * t)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   PATCHES
   ──────────────────────────────────────────────────────────────────────── */

/**
 * The image split into patches that separate and lift into depth.
 * `split` 0..1 pushes patches apart; `lift` 0..1 tilts them into 3D.
 */
export const PatchGrid: React.FC<{
  n?: number;
  width: number;
  height: number;
  split?: number;
  lift?: number;
  gridT?: number;
  /** 0..1 — patches morph toward flat colour chips (embeddings) */
  abstract?: number;
}> = ({ n = 6, width, height, split = 0, lift = 0, gridT = 0, abstract = 0 }) => {
  const frame = useCurrentFrame();
  const pw = width / n;
  const ph = height / n;
  const patches: React.ReactNode[] = [];

  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const i = y * n + x;
      const u = (x + 0.5) / n;
      const v = (y + 0.5) / n;
      const col = samplePhoto(u, v);
      // push outward from centre
      const ox = (u - 0.5) * split * width * 0.34;
      const oy = (v - 0.5) * split * height * 0.34;
      const z = lift * (30 + seeded(i) * 90);
      const bob = idlePulse(frame, 190 + seeded(i + 9) * 120, i) * 2 - 1;
      const chip = rampAt(seeded(i + 3));
      return_patch(patches, {
        key: i,
        x: x * pw + ox,
        y: y * ph + oy + bob * 3 * lift,
        w: pw - 3,
        h: ph - 3,
        colour: abstract > 0 ? chip : rgbCss(col),
        blend: abstract,
        z,
        gridT,
      });
    }
  }
  return (
    <div style={{ position: "relative", width, height, perspective: 1400 }}>{patches}</div>
  );
};

function return_patch(
  out: React.ReactNode[],
  p: {
    key: number;
    x: number;
    y: number;
    w: number;
    h: number;
    colour: string;
    blend: number;
    z: number;
    gridT: number;
  }
) {
  out.push(
    <div
      key={p.key}
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: p.w,
        height: p.h,
        background: p.colour,
        borderRadius: 4 + p.blend * 8,
        transform: `translateZ(${p.z}px)`,
        boxShadow: p.z > 2 ? `0 ${p.z * 0.3}px ${p.z * 0.7}px rgba(0,0,0,0.5)` : undefined,
        outline: p.gridT > 0 ? `${1.5 * p.gridT}px solid ${alpha(mk.cyan, 0.85 * p.gridT)}` : undefined,
        outlineOffset: -1,
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────
   EMBEDDINGS
   ──────────────────────────────────────────────────────────────────────── */

/** A patch's embedding as glowing bars of numbers, compressible into a chip. */
export const EmbeddingBars: React.FC<{
  seed?: number;
  count?: number;
  width?: number;
  height?: number;
  t?: number;
  /** 0..1 — bars collapse into a single colour chip */
  compress?: number;
  color?: string;
}> = ({ seed = 0, count = 12, width = 190, height = 130, t = 1, compress = 0, color }) => {
  const frame = useCurrentFrame();
  const bw = width / count;
  return (
    <div style={{ position: "relative", width, height, opacity: t }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = seed * 31 + i * 5;
        const base = 0.2 + seeded(s) * 0.8;
        const live = base * (0.86 + idlePulse(frame, 70 + seeded(s + 1) * 90, s) * 0.14);
        const col = color ?? rampAt(seeded(s + 2));
        const h = height * live * (1 - compress) + compress * height * 0.34;
        const x = i * bw * (1 - compress);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              bottom: 0,
              width: Math.max(2, bw - 3 + compress * 16),
              height: h,
              borderRadius: 3 + compress * 8,
              background: col,
              opacity: 0.55 + live * 0.45,
              boxShadow: `0 0 ${10 + live * 12}px ${alpha(col, 0.7)}`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   ATTENTION
   ──────────────────────────────────────────────────────────────────────── */

export type Node2D = { x: number; y: number };

/**
 * Attention web: every node connected to every other, with a subset
 * highlighted and the rest faded — exactly the "compare everything, keep what
 * matters" idea.
 *
 * `t` 0..1 draws the connections on. `focus` 0..1 fades the irrelevant ones.
 * `strong` lists index pairs that stay lit.
 */
export const AttentionWeb: React.FC<{
  nodes: Node2D[];
  t?: number;
  focus?: number;
  strong?: [number, number][];
  color?: string;
  strongColor?: string;
  flow?: number;
}> = ({ nodes, t = 1, focus = 0, strong = [], color = mk.blue, strongColor = mk.cyan, flow = -1 }) => {
  const pairs: [number, number][] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) pairs.push([i, j]);
  }
  const isStrong = (i: number, j: number) =>
    strong.some(([a, b]) => (a === i && b === j) || (a === j && b === i));

  return (
    <>
      {pairs.map(([i, j], k) => {
        const on = Math.max(0, Math.min(1, (t * pairs.length - k * 0.35) / 6));
        if (on <= 0) return null;
        const s = isStrong(i, j);
        const op = s ? 0.85 : 0.5 * (1 - focus * 0.92);
        if (op <= 0.02) return null;
        return (
          <line
            key={k}
            x1={nodes[i].x}
            y1={nodes[i].y}
            x2={nodes[j].x}
            y2={nodes[j].y}
            stroke={s ? strongColor : color}
            strokeWidth={s ? 2.4 : 1}
            opacity={op * on}
            style={s ? { filter: `drop-shadow(0 0 5px ${strongColor})` } : undefined}
          />
        );
      })}
      {/* information flowing along the strong links */}
      {flow >= 0 &&
        strong.map(([a, b], k) => {
          const p = (flow + k * 0.17) % 1;
          return (
            <circle
              key={`f${k}`}
              cx={nodes[a].x + (nodes[b].x - nodes[a].x) * p}
              cy={nodes[a].y + (nodes[b].y - nodes[a].y) * p}
              r={4.5}
              fill={strongColor}
              style={{ filter: `drop-shadow(0 0 8px ${strongColor})` }}
            />
          );
        })}
    </>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   NEURAL NETWORK
   ──────────────────────────────────────────────────────────────────────── */

/** A glowing multi-layer network with signal propagating through it. */
export const NeuralNet: React.FC<{
  layers?: number[];
  width: number;
  height: number;
  t?: number;
  /** 0..1 — a wave of activation sweeping left to right */
  signal?: number;
  color?: string;
}> = ({ layers = [5, 8, 8, 6, 3], width, height, t = 1, signal = -1, color = mk.purple }) => {
  const cols = layers.length;
  const pos = (li: number, ni: number): Node2D => ({
    x: (width / (cols + 1)) * (li + 1),
    y: (height / (layers[li] + 1)) * (ni + 1),
  });

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {/* edges */}
      {layers.slice(0, -1).map((count, li) =>
        Array.from({ length: count }).map((_, a) =>
          Array.from({ length: layers[li + 1] }).map((__, b) => {
            const p1 = pos(li, a);
            const p2 = pos(li + 1, b);
            const on = Math.max(0, Math.min(1, t * cols - li));
            if (on <= 0) return null;
            const lit =
              signal >= 0 && Math.abs(signal * (cols - 1) - li) < 0.85
                ? 1 - Math.abs(signal * (cols - 1) - li) / 0.85
                : 0;
            return (
              <line
                key={`${li}-${a}-${b}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={lit > 0 ? mk.cyan : color}
                strokeWidth={lit > 0 ? 1.6 : 0.7}
                opacity={(0.16 + lit * 0.72) * on}
              />
            );
          })
        )
      )}
      {/* nodes */}
      {layers.map((count, li) =>
        Array.from({ length: count }).map((_, ni) => {
          const p = pos(li, ni);
          const on = Math.max(0, Math.min(1, t * cols - li));
          const lit =
            signal >= 0 && Math.abs(signal * (cols - 1) - li) < 0.6
              ? 1 - Math.abs(signal * (cols - 1) - li) / 0.6
              : 0;
          return (
            <circle
              key={`n${li}-${ni}`}
              cx={p.x}
              cy={p.y}
              r={(5 + lit * 3) * on}
              fill={lit > 0 ? mk.cyan : color}
              opacity={(0.5 + lit * 0.5) * on}
              style={{ filter: `drop-shadow(0 0 ${6 + lit * 14}px ${lit > 0 ? mk.cyan : color})` }}
            />
          );
        })
      )}
    </svg>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   TOKENS
   ──────────────────────────────────────────────────────────────────────── */

/** Words appearing one at a time, as a language model generates them. */
export const TokenStream: React.FC<{
  words: string[];
  startAt: number;
  perToken?: number;
  fontFamily?: string;
  size?: number;
  color?: string;
  maxWidth?: number;
}> = ({ words, startAt, perToken = 12, fontFamily, size = 40, color = mk.ink, maxWidth = 1200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        maxWidth,
      }}
    >
      {words.map((w, i) => {
        const at = startAt + i * perToken;
        const t = ease(frame, at, fps, "ENTER");
        if (t <= 0.01) return null;
        const fresh = Math.max(0, 1 - (frame - at) / 20);
        return (
          <span
            key={i}
            style={{
              fontFamily,
              fontSize: size,
              fontWeight: 600,
              color: fresh > 0.3 ? mk.cyan : color,
              opacity: t,
              transform: `translateY(${(1 - t) * 16}px) scale(${0.9 + t * 0.1})`,
              textShadow: fresh > 0 ? `0 0 ${18 * fresh}px ${alpha(mk.cyan, 0.9)}` : "none",
              padding: "4px 12px",
              borderRadius: 8,
              background: fresh > 0.3 ? alpha(mk.cyan, 0.1) : "transparent",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
