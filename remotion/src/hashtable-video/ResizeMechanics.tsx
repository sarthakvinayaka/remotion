import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// resize_code walks through _resize()'s mechanics in the abstract (no
// concrete key/capacity named -- that's saved for resize_demo_code right
// after), so there's no InsertEvent/ResizeEvent to replay here. Instead this
// renders the method's own steps -- double capacity, clear buckets,
// re-insert every key -- timed to the real word anchors the assembler
// passes in, plus the auto-trigger check at the end of insert().
export const ResizeMechanics: React.FC<{
  doubleAt: number; // "we double the capacity, clear the buckets"
  reinsertAt: number; // "and re-insert every key we had before"
  capacityChangedAt: number; // "that's because the capacity changed"
  reshuffledAt: number; // "everything gets reshuffled into its new correct slot"
  checkAt: number; // "this one check at the end of insert"
  autoAt: number; // "now it grows itself automatically"
  width?: number;
}> = ({ doubleAt, reinsertAt, capacityChangedAt, reshuffledAt, checkAt, autoAt, width = 720 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const oldCap = 4;
  const newCap = 8;

  const doubleIn = ease(frame, doubleAt, fps, 14, 210);
  const showReinsert = frame >= reinsertAt;
  const showReshuffle = frame >= reshuffledAt;
  const checkIn = ease(frame, checkAt, fps, 13, 230);
  const autoIn = ease(frame, autoAt, fps, 14, 220);

  const oldBoxW = Math.min(70, (width / 2 - 40 - (oldCap - 1) * 8) / oldCap);
  const newBoxW = Math.min(56, (width / 2 - 40 - (newCap - 1) * 6) / newCap);

  // reshuffle stagger: each old-bucket key "flies" to a new slot in turn
  const reshuffleProgress = interpolate(frame, [reshuffledAt, reshuffledAt + 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
        _resize()
      </div>

      <div style={{ opacity: doubleIn, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted }}>capacity {oldCap}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: oldCap }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: oldBoxW,
                  height: 40,
                  border: `1.5px solid ${cv.panelLine}`,
                  borderRadius: 7,
                  background: cv.panel,
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ fontFamily: cvFonts.mono, fontSize: 22, color: cv.number }}>&times;2</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.number, fontWeight: 700 }}>capacity {newCap}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: newCap }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: newBoxW,
                  height: 40,
                  border: `1.5px solid ${cv.number}`,
                  borderRadius: 7,
                  background: `${cv.number}14`,
                  opacity: ease(frame, doubleAt + 6 + i * 3, fps, 13, 230),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {showReinsert && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: cvFonts.mono, fontSize: 14, color: cv.ink }}>
            for each old bucket &rarr; <span style={{ color: cv.keyword }}>self.insert(key, value)</span>
          </div>
          {frame >= capacityChangedAt && (
            <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted }}>
              same key, capacity {oldCap}&rarr;{newCap}: <span style={{ color: cv.terminalRed }}>different index now</span>
            </div>
          )}
        </div>
      )}

      {showReshuffle && (
        <div style={{ position: "relative", height: 60 }}>
          {Array.from({ length: 3 }).map((_, i) => {
            const t = Math.min(1, Math.max(0, reshuffleProgress * 3 - i));
            const fromX = 40 + i * 60;
            const toX = 220 + i * 90;
            const x = interpolate(t, [0, 1], [fromX, toX]);
            const y = -Math.sin(Math.min(1, t) * Math.PI) * 30;
            const opacity = interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0.85]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: 20 + y,
                  transform: "translate(-50%, -50%)",
                  opacity,
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: cv.func,
                  boxShadow: `0 0 8px ${cv.func}88`,
                }}
              />
            );
          })}
          <div style={{ position: "absolute", bottom: 0, left: 0, fontFamily: cvFonts.mono, fontSize: 12, color: cv.muted }}>
            every key reshuffled into its new correct slot
          </div>
        </div>
      )}

      {checkIn > 0 && (
        <div
          style={{
            opacity: checkIn,
            fontFamily: cvFonts.mono,
            fontSize: 14,
            color: cv.ink,
            border: `1.5px solid ${cv.terminalGreen}66`,
            background: `${cv.terminalGreen}0d`,
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          if size / capacity &gt; <span style={{ color: cv.number, fontWeight: 700 }}>0.7</span>:
        </div>
      )}

      {autoIn > 0 && (
        <div
          style={{
            opacity: autoIn,
            transform: `translateY(${interpolate(autoIn, [0, 1], [10, 0])}px)`,
            fontFamily: cvFonts.mono,
            fontSize: 15,
            fontWeight: 700,
            color: cv.terminalGreen,
          }}
        >
          self._resize() &mdash; grows itself, automatically
        </div>
      )}
    </div>
  );
};
