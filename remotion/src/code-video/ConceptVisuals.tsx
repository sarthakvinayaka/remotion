import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { IconHashMap, IconQueue } from "./Icons";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Big animated HashMap visual: an icon slams in, then key/value rows fill in
// one at a time -- reads as "this is a living data structure", not a label.
// `burstStart` (local frame) drives a rapid-fire lookup flicker across the
// rows, timed to "10 orders or 10 million" -- makes O(1) *feel* instant.
export const HashMapVisual: React.FC<{ startFrame: number; accent?: string; burstStart?: number }> = ({
  startFrame,
  accent = cv.func,
  burstStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const iconIn = ease(local, 0, fps, 13, 220);
  const rows = ["a1b2c3d4", "9f8e7d6c", "5c4b3a29"];

  const burstLocal = burstStart !== undefined ? local - burstStart : -1;
  const inBurst = burstLocal >= 0 && burstLocal < 70;
  const burstRow = inBurst ? Math.floor(burstLocal / 6) % rows.length : -1;
  const burstPulse = ease(frame, (burstStart ?? 0) + startFrame, fps, 10, 260);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div
        style={{
          opacity: iconIn,
          transform: `scale(${interpolate(iconIn, [0, 1], [0.5, 1]) * (inBurst ? 1 + Math.sin(burstLocal * 1.4) * 0.05 : 1)}) rotate(${interpolate(iconIn, [0, 1], [-8, 0])}deg)`,
        }}
      >
        <IconHashMap size={64} color={accent} />
      </div>
      <div
        style={{
          border: `1.5px solid ${accent}55`,
          background: `${accent}0d`,
          borderRadius: 14,
          padding: 16,
          minWidth: 260,
          boxShadow: inBurst ? `0 0 ${20 + Math.sin(burstLocal) * 10}px ${accent}55` : "none",
        }}
      >
        {rows.map((r, i) => {
          const s = ease(local, 30 + i * 14, fps, 14, 220);
          const hit = i === burstRow;
          return (
            <div
              key={r}
              style={{
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-14, 0])}px) scale(${hit ? 1.04 : 1})`,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: cvFonts.mono,
                fontSize: 16,
                color: cv.ink,
                padding: "5px 0",
                borderBottom: i < rows.length - 1 ? `1px solid ${cv.panelLine}` : "none",
                background: hit ? `${accent}22` : "transparent",
                borderRadius: hit ? 6 : 0,
              }}
            >
              <span style={{ color: accent }}>{r}</span>
              <span style={{ color: hit ? accent : cv.muted, fontWeight: hit ? 700 : 400 }}>O(1)</span>
            </div>
          );
        })}
      </div>
      {inBurst && (
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 14,
            color: accent,
            fontWeight: 700,
            opacity: burstPulse,
            letterSpacing: 0.5,
          }}
        >
          10... 1,000... 10,000,000 lookups &mdash; same speed
        </div>
      )}
    </div>
  );
};

// Big animated Queue visual: FIFO boxes with a token continuously flowing
// through, left to right, looping.
export const QueueVisual: React.FC<{ startFrame: number; accent?: string }> = ({ startFrame, accent = cv.string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const iconIn = ease(local, 0, fps, 13, 220);
  const n = 4;
  const boxW = 56;
  const gap = 10;
  const totalW = n * boxW + (n - 1) * gap;

  const loopLocal = Math.max(0, local - 30);
  const period = 90;
  const p = ((loopLocal % period) + period) % period / period;
  const tokenX = interpolate(p, [0, 1], [-boxW, totalW]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div
        style={{
          opacity: iconIn,
          transform: `scale(${interpolate(iconIn, [0, 1], [0.5, 1])}) rotate(${interpolate(iconIn, [0, 1], [8, 0])}deg)`,
        }}
      >
        <IconQueue size={64} color={accent} />
      </div>
      <div style={{ position: "relative", width: totalW, height: boxW }}>
        <div style={{ display: "flex", gap }}>
          {Array.from({ length: n }).map((_, i) => {
            const s = ease(local, 30 + i * 10, fps, 14, 220);
            return (
              <div
                key={i}
                style={{
                  opacity: s,
                  width: boxW,
                  height: boxW,
                  borderRadius: 10,
                  border: `1.5px solid ${accent}66`,
                  background: `${accent}0d`,
                }}
              />
            );
          })}
        </div>
        {local > 30 && (
          <div
            style={{
              position: "absolute",
              top: boxW / 2 - 8,
              left: tokenX,
              width: 16,
              height: 16,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />
        )}
      </div>
    </div>
  );
};

// Click ripple: a small dot with expanding rings, for "just one click"
export const ClickRipple: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0 || local > 50) return null;
  const p = interpolate(local, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const fade = interpolate(local, [0, 10, 40], [0, 1, 0]);

  return (
    <div style={{ position: "relative", width: 10, height: 10 }}>
      {[0, 1, 2].map((i) => {
        const ringP = Math.max(0, p - i * 0.18);
        const scale = interpolate(ringP, [0, 1], [0.3, 3.2]);
        const opacity = interpolate(ringP, [0, 1], [0.7, 0]) * fade;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `2px solid ${cv.terminalGreen}`,
              transform: `scale(${scale})`,
              opacity,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", inset: 2, borderRadius: 999, background: cv.terminalGreen }} />
    </div>
  );
};
