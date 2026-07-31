import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import type { TimedHashEvent } from "./hashEvents";

const THRESHOLD = 0.7;

// Green -> yellow -> red as the fill approaches the 70% threshold. Interpolates
// through three color stops rather than a flat two-stop gradient so the last
// stretch before the line reads as genuinely alarming, not just "slightly
// more yellow."
const fillColor = (ratio: number): string => {
  const t = Math.min(1, ratio / THRESHOLD);
  if (t < 0.6) {
    // green -> yellow across the first 60% of the way to threshold
    const localT = t / 0.6;
    return mix(cv.terminalGreen, cv.number, localT);
  }
  // yellow -> red across the final stretch approaching threshold
  const localT = (t - 0.6) / 0.4;
  return mix(cv.number, cv.terminalRed, localT);
};

const mix = (a: string, b: string, t: number): string => {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

export const LoadFactorMeter: React.FC<{
  events: TimedHashEvent[];
  width?: number;
}> = ({ events, width = 640 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Replay every event up to now to get the current size/capacity, exactly
  // like NodeCounterBoard replays increment/merge events in the CRDT video.
  let size = 0;
  let capacity = 8;
  let lastResizeAt = -999;
  const seen = new Set<string>();
  for (const { at, event } of events) {
    if (at > frame) break;
    if (event.type === "insert") {
      capacity = event.capacity;
      const key = `${event.key}`;
      if (!seen.has(key)) {
        seen.add(key);
        size += 1;
      }
    } else {
      capacity = event.new_capacity;
      lastResizeAt = at;
      // a resize re-inserts every existing key at the new capacity; those
      // insert events follow immediately after in the same list and will
      // re-populate `seen`/`size` naturally as they're replayed above.
      seen.clear();
      size = 0;
    }
  }

  const ratio = size / capacity;

  // Right after a resize, ease the bar visually relaxing down to the new
  // (lower) ratio instead of snapping, so the "meter caused this, and now
  // it's relaxed" causality reads clearly.
  const relaxT = spring({ frame: frame - lastResizeAt, fps, config: { damping: 20, stiffness: 90 } });
  const displayRatio = lastResizeAt > -999 && frame - lastResizeAt < 45 ? interpolate(relaxT, [0, 1], [THRESHOLD + 0.02, ratio]) : ratio;

  const fillPct = Math.min(1, displayRatio) * 100;
  const color = fillColor(displayRatio);
  const barH = 18;

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
          load factor
        </span>
        <span style={{ fontFamily: cvFonts.mono, fontSize: 14, color: cv.ink }}>
          {size} / {capacity} = <span style={{ color, fontWeight: 700 }}>{displayRatio.toFixed(2)}</span>
        </span>
      </div>
      <div style={{ position: "relative", width: "100%", height: barH, background: cv.panel, borderRadius: barH / 2, border: `1px solid ${cv.panelLine}`, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${fillPct}%`,
            background: color,
            boxShadow: `0 0 12px ${color}88`,
            borderRadius: barH / 2,
          }}
        />
        {/* 70% threshold marker */}
        <div
          style={{
            position: "absolute",
            left: `${THRESHOLD * 100}%`,
            top: -3,
            bottom: -3,
            width: 2,
            background: cv.ink,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
};
