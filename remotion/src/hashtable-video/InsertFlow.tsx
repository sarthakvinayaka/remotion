import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// insert_code's narration walks through insert()'s control flow in the
// abstract (no concrete key/value named), so there's no InsertEvent to
// visualize -- instead this renders the method's own logic as a small
// flowchart, highlighting each step exactly when that step is spoken about.
// All timing comes from the real word-anchor frames the assembler passes in.
export const InsertFlow: React.FC<{
  hashAt: number; // "we hash the key to get our index"
  grabAt: number; // "then we grab that bucket"
  scanAt: number; // "we loop through whatever's already in that bucket"
  matchAt: number; // "if it does, we just update it in place"
  appendAt: number; // "otherwise we append this new key value pair"
  width?: number;
}> = ({ hashAt, grabAt, scanAt, matchAt, appendAt, width = 720 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { at: hashAt, label: "hash(key)", sub: "compute the index", color: cv.func },
    { at: grabAt, label: "buckets[index]", sub: "grab that bucket's list", color: cv.keyword },
    { at: scanAt, label: "scan the bucket", sub: "look for an existing match", color: cv.number },
  ];

  const branchIn = ease(frame, matchAt, fps, 14, 210);
  const appendIn = ease(frame, appendAt, fps, 14, 210);

  // which step is "current" -- the highlighted node -- based on the latest
  // anchor whose frame has passed
  const anchors = [hashAt, grabAt, scanAt, matchAt, appendAt];
  let activeIdx = -1;
  anchors.forEach((a, i) => {
    if (frame >= a) activeIdx = i;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
        insert(key, value)
      </div>

      {steps.map((s, i) => {
        const stepIn = ease(frame, s.at, fps, 14, 220);
        const isActive = activeIdx === i;
        if (stepIn <= 0) return <div key={s.label} style={{ height: 0 }} />;
        return (
          <div
            key={s.label}
            style={{
              opacity: stepIn,
              transform: `translateX(${interpolate(stepIn, [0, 1], [-16, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              border: `1.5px solid ${isActive ? s.color : `${s.color}55`}`,
              background: isActive ? `${s.color}1a` : `${s.color}0a`,
              borderRadius: 10,
              padding: "10px 16px",
              boxShadow: isActive ? `0 0 16px ${s.color}55` : "none",
            }}
          >
            <div style={{ fontFamily: cvFonts.mono, fontSize: 16, fontWeight: 700, color: s.color }}>{s.label}</div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted }}>{s.sub}</div>
          </div>
        );
      })}

      {branchIn > 0 && (
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          <div
            style={{
              opacity: branchIn,
              transform: `scale(${interpolate(branchIn, [0, 1], [0.85, 1])})`,
              flex: 1,
              border: `1.5px solid ${activeIdx === 3 && frame < appendAt ? cv.terminalGreen : `${cv.terminalGreen}55`}`,
              background: `${cv.terminalGreen}0d`,
              borderRadius: 10,
              padding: "12px 14px",
              boxShadow: activeIdx === 3 && frame < appendAt ? `0 0 16px ${cv.terminalGreen}55` : "none",
            }}
          >
            <div style={{ fontFamily: cvFonts.mono, fontSize: 13, fontWeight: 700, color: cv.terminalGreen }}>key exists</div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 12, color: cv.muted, marginTop: 4 }}>update value in place</div>
          </div>

          <div
            style={{
              opacity: appendIn,
              transform: `scale(${interpolate(appendIn, [0, 1], [0.85, 1])})`,
              flex: 1,
              border: `1.5px solid ${activeIdx === 4 ? cv.terminalRed : `${cv.terminalRed}55`}`,
              background: `${cv.terminalRed}0d`,
              borderRadius: 10,
              padding: "12px 14px",
              boxShadow: activeIdx === 4 ? `0 0 16px ${cv.terminalRed}55` : "none",
            }}
          >
            <div style={{ fontFamily: cvFonts.mono, fontSize: 13, fontWeight: 700, color: cv.terminalRed }}>new key</div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 12, color: cv.muted, marginTop: 4 }}>
              append (key, value) &middot; size += 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
