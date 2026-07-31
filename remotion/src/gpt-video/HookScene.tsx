import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "Ok so a lot of people..."):
//   "diagrams, arrows, boxes labeled attention" 155-231
//   "but most of them don't let you build something and watch it run" 247-369
//   "walk through the core idea... generate text one word at a time" 437-577
//   "build a small working version, live, in about 20 lines of python" 586-707
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = ease(frame, 25, fps, 14, 220);
  const showDiagram = frame >= 155 && frame < 373;
  const diagramIn = ease(frame, 155, fps, 13, 220);
  const crossOut = ease(frame, 247, fps, 12, 230);

  const showChat = frame >= 373;
  // chat words appear one at a time, slowed down, per the script's own
  // visual note -- a small typed sentence building up word by word
  const chatSentence = "the model predicts one word at a time";
  const chatWords = chatSentence.split(" ");
  const wordRevealStart = 460;
  const perWord = 16;

  const linesIn = ease(frame, 586, fps, 13, 220);

  return (
    <AbsoluteFill style={{ background: cv.bg }}>
      <GridBg opacity={0.05} color={cv.keyword} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Tiny GPT, from scratch" color={cv.keyword} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        {frame < 155 && (
          <div
            style={{
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 56,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Everyone explains ChatGPT with <span style={{ color: cv.func }}>diagrams</span>.
          </div>
        )}

        {showDiagram && (
          <div style={{ opacity: diagramIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 16, position: "relative" }}>
              {["Diagram", "Arrows", '"Attention"'].map((label, i) => (
                <div
                  key={label}
                  style={{
                    border: `1.5px solid ${cv.panelLine}`,
                    background: cv.panel,
                    borderRadius: 10,
                    padding: "14px 18px",
                    fontFamily: cvFonts.mono,
                    fontSize: 15,
                    color: cv.muted,
                    opacity: 1 - crossOut * 0.3,
                  }}
                >
                  {label}
                </div>
              ))}
              <div
                style={{
                  position: "absolute",
                  inset: "-6px -10px",
                  border: `2px solid ${cv.terminalRed}`,
                  borderRadius: 14,
                  opacity: crossOut,
                  transform: `scale(${interpolate(crossOut, [0, 1], [0.9, 1])})`,
                }}
              />
            </div>
            {crossOut > 0.3 && (
              <div
                style={{
                  opacity: crossOut,
                  fontFamily: cvFonts.display,
                  fontSize: 30,
                  fontWeight: 700,
                  color: cv.ink,
                  textAlign: "center",
                  maxWidth: 700,
                }}
              >
                None of them let you actually <span style={{ color: cv.terminalGreen }}>build one</span> and watch it run.
              </div>
            )}
          </div>
        )}

        {showChat && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
            <div
              style={{
                border: `1.5px solid ${cv.panelLine}`,
                background: cv.panel,
                borderRadius: 16,
                padding: "24px 30px",
                minWidth: 620,
                minHeight: 60,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
              }}
            >
              {chatWords.map((w, i) => {
                const wIn = ease(frame, wordRevealStart + i * perWord, fps, 13, 230);
                return (
                  <span
                    key={i}
                    style={{
                      opacity: wIn,
                      transform: `translateY(${interpolate(wIn, [0, 1], [10, 0])}px)`,
                      fontFamily: cvFonts.mono,
                      fontSize: 24,
                      color: cv.ink,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>

            {linesIn > 0 && (
              <div
                style={{
                  opacity: linesIn,
                  fontFamily: cvFonts.mono,
                  fontSize: 18,
                  color: cv.terminalGreen,
                  textAlign: "center",
                }}
              >
                ~20 lines of Python. Live.
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
