import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts } from "../theme";

export type Beat = { text: string; startFrame: number; endFrame: number };

// A vertical-native, full-bleed, high-contrast palette distinct from the main
// video's amber/teal editorial look — punchier, closer to a short-form "hook"
// aesthetic: hot magenta/cyan on near-black, no boxed chrome, no blur bars.
const MOOD = {
  calm: { a: "#0A1420", b: "#0E2233", glow: "#33D6FF" },
  build: { a: "#170A22", b: "#2A0E33", glow: "#C86BFF" },
  pain: { a: "#220A0E", b: "#330E14", glow: "#FF3B5C" },
  fix: { a: "#0A2216", b: "#0E331F", glow: "#2CFFA0" },
};

type MoodKey = keyof typeof MOOD;

// Fixed layout of nodes across the vertical canvas (percent coords), each with
// a phase offset so the whole graph feels alive without any two nodes moving
// in lockstep. Lines connect nearby nodes to read as a "distributed system."
const NODES = [
  { x: 14, y: 8, r: 5, ph: 0.3 },
  { x: 82, y: 6, r: 4, ph: 1.1 },
  { x: 46, y: 12, r: 6, ph: 2.0 },
  { x: 8, y: 22, r: 4, ph: 0.7 },
  { x: 90, y: 20, r: 5, ph: 1.6 },
  { x: 30, y: 26, r: 3, ph: 2.6 },
  { x: 68, y: 24, r: 4, ph: 0.2 },
  { x: 12, y: 74, r: 4, ph: 1.4 },
  { x: 86, y: 76, r: 5, ph: 0.5 },
  { x: 50, y: 80, r: 6, ph: 2.2 },
  { x: 24, y: 88, r: 4, ph: 1.9 },
  { x: 74, y: 90, r: 3, ph: 0.9 },
  { x: 92, y: 86, r: 4, ph: 2.4 },
  { x: 6, y: 92, r: 5, ph: 0.1 },
];
const EDGES: [number, number][] = [
  [0, 2], [2, 4], [0, 3], [1, 4], [2, 6], [3, 5], [5, 6], [1, 2],
  [7, 9], [9, 8], [7, 10], [8, 12], [9, 11], [10, 13], [11, 12],
];

const NodeGraph: React.FC<{ frame: number; glow: string }> = ({ frame, glow }) => {
  const t = frame / 30;
  const pos = (n: (typeof NODES)[number]) => ({
    x: n.x + Math.sin(t * 0.5 + n.ph * 4) * 1.6,
    y: n.y + Math.cos(t * 0.4 + n.ph * 3) * 1.6,
  });
  const positions = NODES.map(pos);
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={positions[a].x}
          y1={positions[a].y}
          x2={positions[b].x}
          y2={positions[b].y}
          stroke={glow}
          strokeWidth={0.15}
          opacity={0.5}
        />
      ))}
      {NODES.map((n, i) => {
        const p = positions[i];
        const pulse = 1 + Math.sin(t * 1.3 + n.ph * 6) * 0.35;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={(n.r / 22) * pulse}
            fill={glow}
            opacity={0.85}
            style={{ filter: `drop-shadow(0 0 3px ${glow})` }}
          />
        );
      })}
    </svg>
  );
};

const Backdrop: React.FC<{ mood: MoodKey; frame: number }> = ({ mood, frame }) => {
  const m = MOOD[mood];
  const pulse = 1 + Math.sin(frame * 0.05) * 0.06;
  // two slow-drifting glow blobs for a living, "more visual" background
  const bx1 = 30 + Math.sin(frame * 0.014) * 22;
  const by1 = 28 + Math.cos(frame * 0.011) * 16;
  const bx2 = 70 + Math.cos(frame * 0.017) * 18;
  const by2 = 74 + Math.sin(frame * 0.013) * 14;

  return (
    <AbsoluteFill style={{ background: m.a }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(closest-side, ${m.glow}3a, transparent 70%)`,
          left: `${bx1}%`,
          top: `${by1}%`,
          width: "140%",
          height: "70%",
          transform: `translate(-50%,-50%) scale(${pulse})`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(closest-side, ${m.b}, transparent 72%)`,
          left: `${bx2}%`,
          top: `${by2}%`,
          width: "130%",
          height: "60%",
          transform: `translate(-50%,-50%) scale(${2 - pulse})`,
          mixBlendMode: "screen",
        }}
      />
      <NodeGraph frame={frame} glow={m.glow} />

      {/* fine grain texture, static (no seams) */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,0.68) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BigWord: React.FC<{ beat: Beat; frame: number; fps: number; accent: string }> = ({ beat, frame, fps, accent }) => {
  const local = frame - beat.startFrame;
  const dur = beat.endFrame - beat.startFrame;
  const s = spring({ frame: local, fps, config: { damping: 13, stiffness: 260 } });
  const exitStart = Math.max(dur - 4, 2);
  const exit = interpolate(local, [exitStart, dur + 3], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(s, [0, 1], [0.82, 1]);
  const words = beat.text.split(" ");
  const big = words.length <= 2;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 64px",
        opacity: Math.min(s, exit),
        transform: `scale(${scale * (0.985 + exit * 0.015)})`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: big ? 22 : 16,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: big ? 168 : 118,
          lineHeight: 1.04,
          letterSpacing: -3,
          textAlign: "center",
          color: "#F5F1E8",
          textShadow: `0 0 70px ${accent}55`,
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ color: i === words.length - 1 ? accent : "#F5F1E8" }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

export const VerticalKinetic: React.FC<{
  beats: Beat[];
  moodAt: (frame: number) => MoodKey;
  accentAt: (frame: number) => string;
}> = ({ beats, moodAt, accentAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = beats.filter((b) => frame >= b.startFrame - 2 && frame <= b.endFrame + 3);
  const mood = moodAt(frame);
  const accent = accentAt(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05080A" }}>
      <Backdrop mood={mood} frame={frame} />
      {active.map((b, i) => (
        <BigWord key={`${b.startFrame}-${i}`} beat={b} frame={frame} fps={fps} accent={accent} />
      ))}
    </AbsoluteFill>
  );
};
