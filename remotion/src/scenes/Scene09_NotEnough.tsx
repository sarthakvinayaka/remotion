import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene09NotEnough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 601f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 3, fps, config: { damping: 18 } });

  // Chart: two curves. complexity (accent2) rises exponentially, productivity (accent) plateaus.
  // Two-stage draw synced to whisper words: slow build through "complexity"(220), then a
  // sharp snap across "outspaces...productivity" (236-300) so the crossover lands on the thesis line.
  const chartW = 900, chartH = 260;
  const draw = interpolate(frame, [64, 220, 300], [0, 0.55, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const N = 60;
  const complexity: [number, number][] = [];
  const productivity: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * chartW;
    const t = i / N;
    complexity.push([x, chartH - Math.pow(t, 2.2) * chartH * 0.95]);
    productivity.push([x, chartH - (1 - Math.exp(-t * 3)) * chartH * 0.55]);
  }
  const cutoff = Math.floor(N * draw);
  const path = (pts: [number, number][], upto: number) =>
    pts.slice(0, upto + 1).map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");

  const punch = spring({ frame: frame - 440, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <GridBg opacity={0.05} />
      <AbsoluteFill style={{ padding: 60 }}>
        <div style={{ opacity: titleIn, marginBottom: 12 }}>
          <Chip label="Why microservices alone break down" color={palette.accent2} />
        </div>
        <KineticWords text="Complexity outruns productivity." size={54} maxWidth={1600} />

        <div style={{ position: "absolute", left: 130, top: 240 }}>
          <svg width={chartW} height={chartH + 40} style={{ overflow: "visible" }}>
            {/* axes */}
            <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={palette.line} strokeWidth={1.5} />
            <line x1={0} y1={0} x2={0} y2={chartH} stroke={palette.line} strokeWidth={1.5} />
            {/* gridlines */}
            {[0.25, 0.5, 0.75].map((g, i) => (
              <line key={i} x1={0} y1={chartH * (1 - g)} x2={chartW} y2={chartH * (1 - g)}
                stroke={palette.line} strokeDasharray="4 6" strokeWidth={1} />
            ))}
            {/* complexity area */}
            <path d={path(complexity, cutoff) + ` L ${complexity[cutoff]?.[0] ?? 0} ${chartH} L 0 ${chartH} Z`} fill={`${palette.accent2}22`} />
            <path d={path(complexity, cutoff)} stroke={palette.accent2} strokeWidth={3} fill="none" />
            {/* productivity */}
            <path d={path(productivity, cutoff)} stroke={palette.accent} strokeWidth={3} fill="none" strokeDasharray="8 6" />
            {/* labels */}
            <text x={chartW - 8} y={20} textAnchor="end" fill={palette.accent2}
              style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 700 }}>complexity ↑</text>
            <text x={chartW - 8} y={chartH - 20} textAnchor="end" fill={palette.accent}
              style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 700 }}>productivity →</text>
            <text x={0} y={chartH + 24} fill={palette.muted}
              style={{ fontFamily: fonts.mono, fontSize: 13 }}>1 service</text>
            <text x={chartW} y={chartH + 24} textAnchor="end" fill={palette.muted}
              style={{ fontFamily: fonts.mono, fontSize: 13 }}>N services</text>
          </svg>
        </div>

        <div style={{
          position: "absolute", left: 60, right: 60, bottom: 40,
          opacity: punch, transform: `translateY(${interpolate(punch,[0,1],[24,0])}px)`,
          fontFamily: fonts.display, fontSize: 30, color: palette.ink, fontWeight: 700, lineHeight: 1.25,
        }}>
          Build the platform early — <span style={{ color: palette.primary }}>keep microservices' benefits without drowning in overhead.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
