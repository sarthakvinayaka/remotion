import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "Ok so think about python dict"):
//   "apple[...] = 5, just works" 203-270    "not magic" 481-497
//   "hash table underneath" 523-548        "build one from scratch" 580-624
//   "no dict, no shortcuts" 644-703
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dictIn = ease(frame, 44, fps, 14, 220);
  const lineIn = ease(frame, 203, fps, 13, 230);
  const zoomStart = 460;
  const zoomT = interpolate(frame, [zoomStart, zoomStart + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showGrid = frame >= zoomStart;
  const titleIn = ease(frame, 523, fps, 14, 210);
  const scratchIn = ease(frame, 580, fps, 14, 210);
  const noShortcutsIn = ease(frame, 644, fps, 14, 210);

  return (
    <AbsoluteFill style={{ background: cv.bg }}>
      <GridBg opacity={0.05} color={cv.func} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Hash tables, from scratch" color={cv.func} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        {!showGrid && (
          <div
            style={{
              opacity: dictIn,
              transform: `scale(${interpolate(zoomT, [0, 1], [1, 3.2])}) translateY(${interpolate(dictIn, [0, 1], [14, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: cvFonts.mono,
                fontSize: 30,
                color: cv.ink,
                background: cv.panel,
                border: `1.5px solid ${cv.panelLine}`,
                borderRadius: 14,
                padding: "20px 30px",
              }}
            >
              <span style={{ color: cv.string }}>my_dict</span>
              <span style={{ color: cv.muted }}>[</span>
              <span style={{ color: cv.keyword }}>"apple"</span>
              <span style={{ color: cv.muted }}>] = </span>
              <span style={{ color: cv.number }}>5</span>
              {lineIn > 0 && (
                <span
                  style={{
                    marginLeft: 14,
                    color: cv.terminalGreen,
                    opacity: lineIn,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          </div>
        )}

        {showGrid && (
          <div style={{ opacity: interpolate(zoomT, [0, 0.3], [0, 1]), display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 60,
                    height: 70,
                    border: `2px solid ${i === 2 ? cv.func : cv.panelLine}`,
                    background: i === 2 ? `${cv.func}1a` : cv.panel,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: cvFonts.mono,
                    fontSize: 13,
                    color: cv.muted,
                  }}
                >
                  {i}
                </div>
              ))}
            </div>

            {titleIn > 0 && (
              <div
                style={{
                  opacity: titleIn,
                  transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
                  fontFamily: cvFonts.display,
                  fontSize: 54,
                  fontWeight: 700,
                  color: cv.ink,
                  textAlign: "center",
                }}
              >
                It's a <span style={{ color: cv.func }}>hash table</span> underneath.
              </div>
            )}

            {scratchIn > 0 && frame < 644 && (
              <div
                style={{
                  opacity: scratchIn,
                  fontFamily: cvFonts.mono,
                  fontSize: 22,
                  color: cv.terminalGreen,
                }}
              >
                Let's build one from scratch.
              </div>
            )}

            {noShortcutsIn > 0 && (
              <div
                style={{
                  opacity: noShortcutsIn,
                  transform: `translateY(${interpolate(noShortcutsIn, [0, 1], [12, 0])}px)`,
                  display: "flex",
                  gap: 14,
                }}
              >
                {["no dict", "no shortcuts"].map((t) => (
                  <div
                    key={t}
                    style={{
                      fontFamily: cvFonts.mono,
                      fontSize: 16,
                      color: cv.terminalRed,
                      border: `1.5px solid ${cv.terminalRed}66`,
                      borderRadius: 999,
                      padding: "6px 16px",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
