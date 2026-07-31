import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "one more piece and it matters just as much"):
//   "every bucket eventually turns into a long list" 91-258
//   "back to scanning through a list one by one" 322-408
//   "load factor, size divided by capacity" 494-712
//   "crosses a threshold, doubles its capacity" 718-992
export const ResizeExplainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const growIn = ease(frame, 91, fps, 14, 210);
  const defeatIn = ease(frame, 322, fps, 14, 210);
  const loadFactorIn = ease(frame, 494, fps, 13, 220);
  const doubleIn = ease(frame, 718, fps, 14, 210);

  const bucketLen = Math.min(6, 1 + Math.floor(interpolate(frame, [91, 260], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const ratio = interpolate(frame, [494, 700], [0.2, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.number} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Why capacity has to grow" color={cv.number} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
        {frame < 494 && (
          <div style={{ opacity: growIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted }}>bucket [2]</div>
            <div
              style={{
                border: `2px solid ${cv.number}`,
                background: `${cv.number}14`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minWidth: 160,
              }}
            >
              {Array.from({ length: bucketLen }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: cv.number,
                    background: `${cv.number}22`,
                    border: `1px solid ${cv.number}66`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    opacity: ease(frame, 91 + i * 30, fps, 13, 230),
                  }}
                >
                  key_{i}
                </div>
              ))}
            </div>

            {defeatIn > 0 && (
              <div
                style={{
                  opacity: defeatIn,
                  fontFamily: cvFonts.display,
                  fontSize: 34,
                  fontWeight: 700,
                  color: cv.ink,
                  textAlign: "center",
                  maxWidth: 700,
                }}
              >
                That defeats the <span style={{ color: cv.terminalRed }}>whole point</span> of a hash table.
              </div>
            )}
          </div>
        )}

        {frame >= 494 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            {loadFactorIn > 0 && (
              <div style={{ opacity: loadFactorIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{ fontFamily: cvFonts.mono, fontSize: 18, color: cv.ink }}>
                  load factor = <span style={{ color: cv.number, fontWeight: 700 }}>size</span> / <span style={{ color: cv.func, fontWeight: 700 }}>capacity</span>
                </div>
                <div style={{ width: 420, height: 20, background: cv.panel, border: `1px solid ${cv.panelLine}`, borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${ratio * 100}%`,
                      background: ratio > 0.7 ? cv.terminalRed : ratio > 0.5 ? cv.number : cv.terminalGreen,
                    }}
                  />
                  <div style={{ position: "absolute", left: "70%", top: -3, bottom: -3, width: 2, background: cv.ink, opacity: 0.6 }} />
                </div>
              </div>
            )}

            {doubleIn > 0 && (
              <div style={{ opacity: doubleIn, display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ width: 34, height: 42, border: `1.5px solid ${cv.panelLine}`, borderRadius: 7, background: cv.panel }} />
                  ))}
                </div>
                <div style={{ fontFamily: cvFonts.mono, fontSize: 24, color: cv.terminalGreen }}>&rarr;</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 34,
                        height: 42,
                        border: `1.5px solid ${i >= 4 ? cv.terminalGreen : cv.panelLine}`,
                        borderRadius: 7,
                        background: i >= 4 ? `${cv.terminalGreen}1a` : cv.panel,
                        opacity: i >= 4 ? ease(frame, 718 + (i - 4) * 6, fps, 13, 230) : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
