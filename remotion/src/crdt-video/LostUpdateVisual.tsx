import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// The "why a plain shared counter breaks" walkthrough, entirely local-frame
// driven so it can be dropped into any scene at any point: two plain number
// boxes (not GCounters) both start at 5, both increment independently, sync
// to the same wrong "6", and a red "should be 7" flag appears -- visualizing
// the lost-update bug the rest of the video fixes.
export const LostUpdateVisual: React.FC<{
  incrementAt: number;
  syncAt: number;
  revealBugAt: number;
}> = ({ incrementAt, syncAt, revealBugAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const aBumped = frame >= incrementAt;
  const bBumped = frame >= incrementAt;
  const aVal = aBumped ? 6 : 5;
  const bVal = bBumped ? 6 : 5;

  const bumpPulseA = ease(frame, incrementAt, fps, 10, 260);
  const bumpPulseB = ease(frame, incrementAt + 6, fps, 10, 260);

  const synced = frame >= syncAt;
  const syncFlow = interpolate(frame, [syncAt, syncAt + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bugIn = ease(frame, revealBugAt, fps, 14, 220);

  const boxColor = synced ? cv.terminalRed : cv.func;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={{ display: "flex", gap: 90, alignItems: "center" }}>
        <CounterBox label="SERVER A" value={aVal} color={cv.func} pulse={bumpPulseA} bumped={aBumped} />
        <div style={{ position: "relative", width: 80, height: 40 }}>
          {synced && (
            <svg width="80" height="40" style={{ overflow: "visible" }}>
              <line
                x1={0}
                y1={20}
                x2={80}
                y2={20}
                stroke={cv.muted}
                strokeWidth={2}
                strokeDasharray="5 5"
                opacity={0.6}
              />
              <circle
                cx={interpolate(syncFlow, [0, 1], [0, 80])}
                cy={20}
                r={7}
                fill={cv.terminalRed}
                opacity={interpolate(syncFlow, [0, 0.1, 0.9, 1], [0, 1, 1, 0])}
              />
            </svg>
          )}
        </div>
        <CounterBox label="SERVER B" value={bVal} color={cv.string} pulse={bumpPulseB} bumped={bBumped} />
      </div>

      {synced && (
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 20,
            color: cv.ink,
            opacity: interpolate(frame, [syncAt, syncAt + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          both synced to
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: cv.terminalRed,
              border: `2px solid ${cv.terminalRed}`,
              borderRadius: 10,
              padding: "4px 16px",
            }}
          >
            6
          </span>
        </div>
      )}

      {frame >= revealBugAt && (
        <div
          style={{
            opacity: bugIn,
            transform: `translateY(${interpolate(bugIn, [0, 1], [14, 0])}px) scale(${interpolate(bugIn, [0, 1], [0.85, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: `${cv.terminalRed}18`,
            border: `2px solid ${cv.terminalRed}`,
            borderRadius: 14,
            padding: "14px 26px",
          }}
        >
          <span style={{ fontFamily: cvFonts.mono, fontSize: 20, color: cv.ink }}>should be</span>
          <span style={{ fontFamily: cvFonts.mono, fontSize: 30, fontWeight: 700, color: cv.terminalGreen }}>7</span>
          <span style={{ fontFamily: cvFonts.mono, fontSize: 16, color: cv.muted }}>&mdash; one increment lost</span>
        </div>
      )}
    </div>
  );
};

const CounterBox: React.FC<{ label: string; value: number; color: string; pulse: number; bumped: boolean }> = ({
  label,
  value,
  color,
  pulse,
  bumped,
}) => {
  const scale = bumped ? interpolate(pulse, [0, 1], [1, 1]) * (1 + Math.max(0, 1 - pulse) * 0.15) : 1;
  return (
    <div
      style={{
        width: 168,
        borderRadius: 18,
        border: `2.5px solid ${color}`,
        background: `${color}14`,
        boxShadow: `0 0 20px ${color}33`,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ fontFamily: cvFonts.mono, fontSize: 14, fontWeight: 700, color, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 46, fontWeight: 700, color: cv.ink }}>{value}</div>
    </div>
  );
};
