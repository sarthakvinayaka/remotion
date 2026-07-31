import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// "Word becomes number": for each vocab entry (in order), a word chip flows
// through a small "encode" box and comes out as a number chip in a
// different color. Runs once, word by word, then the whole thing settles
// into a small persistent table -- entirely driven by the `vocab` map from
// the real captured trace, nothing hardcoded.
export const TokenEncoder: React.FC<{
  vocab: Record<string, number>;
  montageStartAt: number; // local frame the word->number montage begins
  settledAt: number; // local frame by which the montage should be fully done and settled into the table
  width?: number;
}> = ({ vocab, montageStartAt, settledAt, width = 460 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entries = Object.entries(vocab).sort((a, b) => a[1] - b[1]);
  const montageDuration = Math.max(1, settledAt - montageStartAt);
  const perWord = montageDuration / entries.length;

  const isSettled = frame >= settledAt;
  const local = frame - montageStartAt;
  const activeIdx = Math.max(0, Math.min(entries.length - 1, Math.floor(local / perWord)));

  if (frame < montageStartAt) return null;

  if (isSettled) {
    // small persistent table, most recent-looking entries first is less
    // useful than natural vocab order for quick lookup during the rest of
    // the video
    return (
      <div
        style={{
          width,
          border: `1.5px solid ${cv.panelLine}`,
          background: cv.panel,
          borderRadius: 12,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxHeight: 210,
          overflow: "hidden",
        }}
      >
        <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
          vocabulary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 14px" }}>
          {entries.map(([word, id]) => (
            <div key={word} style={{ display: "flex", justifyContent: "space-between", fontFamily: cvFonts.mono, fontSize: 12 }}>
              <span style={{ color: cv.string }}>{word}</span>
              <span style={{ color: cv.number, fontWeight: 700 }}>{id}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // active montage: one word->number flow at a time
  const [word, id] = entries[activeIdx];
  const wordLocal = local - activeIdx * perWord;
  const t = interpolate(wordLocal, [0, perWord], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wordIn = ease(frame, montageStartAt + activeIdx * perWord, fps, 12, 260);
  const numberIn = ease(frame, montageStartAt + activeIdx * perWord + perWord * 0.5, fps, 12, 260);

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
        encoding vocabulary ({activeIdx + 1}/{entries.length})
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, height: 50 }}>
        <div
          style={{
            opacity: wordIn,
            transform: `translateX(${interpolate(t, [0, 1], [0, -8])}px) scale(${interpolate(wordIn, [0, 1], [0.6, 1])})`,
            fontFamily: cvFonts.mono,
            fontSize: 15,
            fontWeight: 700,
            color: cv.string,
            background: `${cv.string}1a`,
            border: `1.5px solid ${cv.string}`,
            borderRadius: 999,
            padding: "6px 14px",
            whiteSpace: "nowrap",
          }}
        >
          {word}
        </div>
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 12,
            color: cv.muted,
            border: `1px dashed ${cv.muted}`,
            borderRadius: 8,
            padding: "6px 10px",
          }}
        >
          encode
        </div>
        <div
          style={{
            opacity: numberIn,
            transform: `scale(${interpolate(numberIn, [0, 1], [0.5, 1])})`,
            fontFamily: cvFonts.mono,
            fontSize: 15,
            fontWeight: 700,
            color: cv.keyword,
            background: `${cv.keyword}1a`,
            border: `1.5px solid ${cv.keyword}`,
            borderRadius: 999,
            padding: "6px 14px",
          }}
        >
          {id}
        </div>
      </div>
    </div>
  );
};
