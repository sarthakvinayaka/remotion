import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "...idea behind a hash table"):
//   "instead of storing in a list and scanning through it" 54-156
//   "you use a function that turns your key into a number" 169-258
//   "that number tells you exactly which slot to check" 267-334
//   "no scanning, no searching, straight to the slot" 353-458
//   "key goes in, number comes out" 726-798
export const CoreIdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const showScan = frame >= 54 && frame < 353;
  const showDirect = frame >= 353;
  const scanIn = ease(frame, 54, fps, 14, 210);
  const funcIn = ease(frame, 169, fps, 13, 220);
  const slotArrowIn = ease(frame, 267, fps, 14, 210);
  const directIn = ease(frame, 353, fps, 15, 200);
  const keyNumIn = ease(frame, 726, fps, 14, 220);

  // scanning list items light up one at a time while "scanning through it"
  // is spoken, visualizing the O(n) approach being explained away
  const scanIdx = Math.floor(interpolate(frame, [116, 350], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.func} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="The core idea" color={cv.func} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36, padding: 80 }}>
        {showScan && (
          <div style={{ opacity: scanIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 18, color: cv.muted }}>a plain list &mdash; scanning one by one</div>
            <div style={{ display: "flex", gap: 8 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 8,
                    border: `2px solid ${i === scanIdx ? cv.terminalRed : cv.panelLine}`,
                    background: i === scanIdx ? `${cv.terminalRed}22` : cv.panel,
                    boxShadow: i === scanIdx ? `0 0 14px ${cv.terminalRed}66` : "none",
                  }}
                />
              ))}
            </div>

            {funcIn > 0 && (
              <div
                style={{
                  opacity: funcIn,
                  transform: `translateY(${interpolate(funcIn, [0, 1], [14, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 16,
                    fontWeight: 700,
                    color: cv.string,
                    background: `${cv.string}1a`,
                    border: `1.5px solid ${cv.string}`,
                    borderRadius: 999,
                    padding: "8px 18px",
                  }}
                >
                  key
                </div>
                <div style={{ color: cv.muted, fontFamily: cvFonts.mono }}>&rarr;</div>
                <div
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 14,
                    color: cv.muted,
                    border: `1.5px dashed ${cv.muted}`,
                    borderRadius: 10,
                    padding: "8px 16px",
                  }}
                >
                  hash function
                </div>
                <div style={{ color: cv.muted, fontFamily: cvFonts.mono }}>&rarr;</div>
                <div
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 16,
                    fontWeight: 700,
                    color: cv.keyword,
                    background: `${cv.keyword}1a`,
                    border: `1.5px solid ${cv.keyword}`,
                    borderRadius: 999,
                    padding: "8px 18px",
                  }}
                >
                  number
                </div>
              </div>
            )}

            {slotArrowIn > 0 && (
              <div
                style={{
                  opacity: slotArrowIn,
                  fontFamily: cvFonts.mono,
                  fontSize: 18,
                  color: cv.ink,
                }}
              >
                that number = exactly which slot to check
              </div>
            )}
          </div>
        )}

        {showDirect && (
          <div style={{ opacity: directIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div
              style={{
                fontFamily: cvFonts.display,
                fontSize: 48,
                fontWeight: 700,
                color: cv.ink,
                textAlign: "center",
              }}
            >
              No scanning. <span style={{ color: cv.terminalGreen }}>Straight to the slot.</span>
            </div>

            <div style={{ position: "relative", display: "flex", gap: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 54,
                    height: 62,
                    borderRadius: 10,
                    border: `2px solid ${i === 4 ? cv.terminalGreen : cv.panelLine}`,
                    background: i === 4 ? `${cv.terminalGreen}1a` : cv.panel,
                    boxShadow: i === 4 ? `0 0 18px ${cv.terminalGreen}66` : "none",
                  }}
                />
              ))}
              {directIn > 0 && (
                <svg width="100%" height="60" style={{ position: "absolute", top: -60, left: 0, overflow: "visible" }}>
                  <line
                    x1={54 * 8 + 10 * 7 - 27}
                    y1={50}
                    x2={4 * (54 + 10) + 27}
                    y2={10}
                    stroke={cv.terminalGreen}
                    strokeWidth={2}
                    strokeDasharray="4 5"
                    opacity={0.7}
                  />
                </svg>
              )}
            </div>

            {keyNumIn > 0 && (
              <div
                style={{
                  opacity: keyNumIn,
                  fontFamily: cvFonts.mono,
                  fontSize: 20,
                  color: cv.muted,
                }}
              >
                key goes in <span style={{ color: cv.terminalGreen }}>&rarr;</span> number comes out
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
