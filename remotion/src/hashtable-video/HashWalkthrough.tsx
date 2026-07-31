import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Illustrates the _hash() accumulator loop character-by-character: h = (h*31
// + ord(ch)) % 1000000007, then h % capacity at the end. Nothing here is a
// captured event from the real run -- hash_function_code's narration never
// names a concrete key, so there's no InsertEvent to visualize (unlike the
// other code scenes). This is a generic, illustrative walk driven entirely
// by the `sampleKey`/`capacity` props the assembler passes in, not anything
// hardcoded in this component, so it stays reusable for a future video with
// a different sample.
export const HashWalkthrough: React.FC<{
  sampleKey: string;
  capacity: number;
  // local frames (already offset by the assembler) for each beat
  bucketsInAt: number;
  charStepStartAt: number; // "we walk through every character..."
  multiplyAt: number; // "we multiply by 31 each time..."
  modAt: number; // "mod self.capacity"
  width?: number;
}> = ({ sampleKey, capacity, bucketsInAt, charStepStartAt, multiplyAt, modAt, width = 720 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chars = sampleKey.split("");
  // one char "consumed" every 16 frames starting at charStepStartAt, so the
  // full walk finishes comfortably before modAt regardless of key length
  const stepDur = 16;
  const activeCharIdx = Math.max(
    -1,
    Math.min(chars.length - 1, Math.floor((frame - charStepStartAt) / stepDur))
  );
  const showAccumulator = frame >= charStepStartAt;
  const showMod = frame >= modAt;

  // running accumulator value, purely illustrative (real formula, sample data)
  let running = 0;
  const runningValues: number[] = [];
  for (const ch of chars) {
    running = (running * 31 + ch.charCodeAt(0)) % 1000000007;
    runningValues.push(running);
  }
  const finalHash = running;
  const finalSlot = ((finalHash % capacity) + capacity) % capacity;

  const bucketsIn = ease(frame, bucketsInAt, fps, 14, 210);
  const modIn = ease(frame, modAt, fps, 13, 230);

  const boxW = Math.min(84, (width - (capacity - 1) * 10) / capacity);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, width }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
          walking the key
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {chars.map((ch, i) => {
            const isPast = i < activeCharIdx;
            const isActive = i === activeCharIdx;
            const charIn = ease(frame, charStepStartAt + i * stepDur, fps, 13, 240);
            return (
              <div
                key={i}
                style={{
                  opacity: showAccumulator ? Math.max(0.35, charIn) : 0.25,
                  transform: `scale(${isActive ? 1.12 : 1})`,
                  fontFamily: cvFonts.mono,
                  fontSize: 20,
                  fontWeight: 700,
                  color: isActive ? cv.keyword : isPast ? cv.string : cv.muted,
                  background: isActive ? `${cv.keyword}22` : `${cv.string}0d`,
                  border: `1.5px solid ${isActive ? cv.keyword : isPast ? `${cv.string}66` : cv.panelLine}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  boxShadow: isActive ? `0 0 14px ${cv.keyword}55` : "none",
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>

        {showAccumulator && (
          <div
            style={{
              fontFamily: cvFonts.mono,
              fontSize: 16,
              color: cv.ink,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span style={{ color: cv.muted }}>h =</span>
            <span style={{ color: cv.number, fontWeight: 700 }}>
              {activeCharIdx >= 0 ? runningValues[activeCharIdx] : 0}
            </span>
            {frame >= multiplyAt && frame < modAt && (
              <span style={{ color: cv.muted, fontSize: 13 }}>
                (h * 31 + ord(ch)) % 1000000007
              </span>
            )}
          </div>
        )}
      </div>

      {showMod && (
        <div style={{ opacity: modIn, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.ink }}>
            <span style={{ color: cv.number, fontWeight: 700 }}>{finalHash}</span>
            <span style={{ color: cv.muted }}> % {capacity} = </span>
            <span style={{ color: cv.terminalGreen, fontWeight: 700 }}>{finalSlot}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {Array.from({ length: capacity }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: boxW,
                  height: 54,
                  borderRadius: 10,
                  border: `2px solid ${i === finalSlot ? cv.terminalGreen : cv.panelLine}`,
                  background: i === finalSlot ? `${cv.terminalGreen}1a` : cv.panel,
                  boxShadow: i === finalSlot ? `0 0 16px ${cv.terminalGreen}66` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: cvFonts.mono,
                  fontSize: 12,
                  color: cv.muted,
                }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      )}

      {bucketsIn > 0 && !showAccumulator && (
        <div style={{ opacity: bucketsIn, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
            buckets: capacity {capacity}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {Array.from({ length: capacity }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: boxW,
                  height: 54,
                  borderRadius: 10,
                  border: `2px solid ${cv.panelLine}`,
                  background: cv.panel,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: cvFonts.mono,
                  fontSize: 12,
                  color: cv.muted,
                }}
              >
                {i}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted }}>
            one empty list per slot
          </div>
        </div>
      )}
    </div>
  );
};
