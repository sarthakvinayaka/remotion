import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "so this is called autoregressive generation"):
//   "each new word depends on the word before it" 120-200
//   "at each step, looks at what's been generated, figures out what's next" 300-487
//   "picks one, adds it to the sequence, repeats" 491-780
//   "real models work on numbers, not words" 786-897
export const CoreIdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = ease(frame, 5, fps, 14, 220);
  const showLoop = frame >= 300 && frame < 786;
  const showNumbers = frame >= 786;

  // small demo sequence building up one word at a time, illustrating
  // "picks one, adds it to the sequence, does the same thing again"
  const demoWords = ["the", "cat", "sat", "on"];
  const wordAt = [300, 491, 612, 708];

  const numbersIn = ease(frame, 786, fps, 13, 220);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.keyword} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Autoregressive generation" color={cv.keyword} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34, padding: 80 }}>
        {frame < 300 && (
          <div
            style={{
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 46,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 850,
            }}
          >
            Each new word depends on the <span style={{ color: cv.keyword }}>words before it</span>.
          </div>
        )}

        {showLoop && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {demoWords.map((w, i) => {
                const wIn = ease(frame, wordAt[i], fps, 13, 230);
                const isNewest = frame - wordAt[i] < 20;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: wIn,
                      transform: `translateY(${interpolate(wIn, [0, 1], [14, 0])}px) scale(${isNewest ? interpolate(wIn, [0, 1], [0.7, 1]) : 1})`,
                      border: `1.5px solid ${cv.func}`,
                      background: `${cv.func}14`,
                      borderRadius: 999,
                      padding: "8px 18px",
                      fontFamily: cvFonts.mono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: cv.func,
                    }}
                  >
                    {w}
                  </div>
                );
              })}
              <div
                style={{
                  opacity: ease(frame, 730, fps, 13, 230),
                  border: `1.5px dashed ${cv.muted}`,
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontFamily: cvFonts.mono,
                  fontSize: 18,
                  color: cv.muted,
                }}
              >
                ?
              </div>
            </div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 18, color: cv.muted }}>
              look at what's generated &rarr; predict what's next &rarr; repeat
            </div>
          </div>
        )}

        {showNumbers && (
          <div style={{ opacity: numbersIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div
              style={{
                fontFamily: cvFonts.display,
                fontSize: 40,
                fontWeight: 700,
                color: cv.ink,
                textAlign: "center",
                maxWidth: 800,
              }}
            >
              Real models work on <span style={{ color: cv.number }}>numbers</span>, not words.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {["the", "cat", "sat", "on"].map((w, i) => (
                <React.Fragment key={i}>
                  <div style={{ fontFamily: cvFonts.mono, fontSize: 16, color: cv.string }}>{w}</div>
                  <div style={{ color: cv.muted }}>&darr;</div>
                  <div style={{ fontFamily: cvFonts.mono, fontSize: 16, fontWeight: 700, color: cv.number }}>{[14, 3, 12, 9][i]}</div>
                  {i < 3 && <div style={{ width: 10 }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
