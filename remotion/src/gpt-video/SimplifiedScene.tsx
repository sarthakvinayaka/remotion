import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "One more thing before we wrap up"):
//   "the encoding step we built is real" 60-376
//   "what's still simplified is the context and the model itself" 382-492
//   "we looked at the last 2 tokens, real models look at whole conversation" 495-756
//   "our model is just counting, real models replace with neural network" 765-1009
//   "the shape of the pipeline... that part's actually accurate" 1014-1372
export const SimplifiedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const realIn = ease(frame, 60, fps, 14, 220);
  const showSimplified = frame >= 382 && frame < 1014;
  const simplifiedIn = ease(frame, 382, fps, 13, 220);
  const contextRowIn = ease(frame, 495, fps, 13, 220);
  const modelRowIn = ease(frame, 765, fps, 13, 220);
  const pipelineIn = ease(frame, 1014, fps, 14, 210);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.string} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="What's real, what's simplified" color={cv.string} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, padding: 80 }}>
        {frame < 382 && (
          <div
            style={{
              opacity: realIn,
              transform: `translateY(${interpolate(realIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 40,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 850,
            }}
          >
            The encoding step is <span style={{ color: cv.terminalGreen }}>real</span>. Word to number, decode back &mdash; that's actually how it works.
          </div>
        )}

        {showSimplified && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                opacity: simplifiedIn,
                fontFamily: cvFonts.display,
                fontSize: 32,
                fontWeight: 700,
                color: cv.ink,
                textAlign: "center",
              }}
            >
              What's still <span style={{ color: cv.number }}>simplified</span>:
            </div>

            {frame >= 495 && (
              <div
                style={{
                  opacity: contextRowIn,
                  transform: `translateX(${interpolate(contextRowIn, [0, 1], [-14, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  border: `1.5px solid ${cv.panelLine}`,
                  background: cv.panel,
                  borderRadius: 12,
                  padding: "14px 22px",
                  width: 700,
                }}
              >
                <span style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.func, fontWeight: 700 }}>last 2 tokens</span>
                <span style={{ color: cv.muted, fontFamily: cvFonts.mono }}>&rarr;</span>
                <span style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.terminalGreen }}>real models: whole conversation, via attention</span>
              </div>
            )}

            {frame >= 765 && (
              <div
                style={{
                  opacity: modelRowIn,
                  transform: `translateX(${interpolate(modelRowIn, [0, 1], [-14, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  border: `1.5px solid ${cv.panelLine}`,
                  background: cv.panel,
                  borderRadius: 12,
                  padding: "14px 22px",
                  width: 700,
                }}
              >
                <span style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.func, fontWeight: 700 }}>just counting</span>
                <span style={{ color: cv.muted, fontFamily: cvFonts.mono }}>&rarr;</span>
                <span style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.terminalGreen }}>real models: neural network, billions of params</span>
              </div>
            )}
          </div>
        )}

        {frame >= 1014 && (
          <div
            style={{
              opacity: pipelineIn,
              transform: `scale(${interpolate(pipelineIn, [0, 1], [0.9, 1])})`,
              fontFamily: cvFonts.mono,
              fontSize: 20,
              color: cv.terminalGreen,
              textAlign: "center",
              maxWidth: 800,
              letterSpacing: 0.5,
            }}
          >
            encode &rarr; predict from context &rarr; sample &rarr; decode &rarr; feed back in &rarr; repeat
            <div style={{ fontFamily: cvFonts.display, fontSize: 18, color: cv.muted, marginTop: 14 }}>
              That shape is real. Just running at a much smaller scale here.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
