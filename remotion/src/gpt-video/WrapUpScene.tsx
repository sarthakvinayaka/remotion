import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { GridBg } from "../components/shared";

// Word anchors (local frames, 0 = "So that's basically the core pipeline"):
//   recap line 0-177   "encode, predict, sample, decode, feed back, repeat" 182-474
//   "full course in the description" 478-534   "next one: tokenizers or attention?" 537-744
export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 10, fps, config: { damping: 18 } });
  const l2 = spring({ frame: frame - 182, fps, config: { damping: 16, stiffness: 150 } });
  const l3 = spring({ frame: frame - 478, fps, config: { damping: 16, stiffness: 150 } });
  const l4 = spring({ frame: frame - 537, fps, config: { damping: 15, stiffness: 200 } });

  const steps = ["encode", "predict from context", "sample", "decode", "feed back in", "repeat"];

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1000px 600px at 50% 45%, ${cv.keyword}18, transparent 65%), ${cv.bg}` }}>
      <GridBg opacity={0.05} color={cv.keyword} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 80, gap: 30 }}>
        <div
          style={{
            opacity: l1,
            transform: `translateY(${interpolate(l1, [0, 1], [20, 0])}px)`,
            fontFamily: cvFonts.display,
            fontSize: 42,
            fontWeight: 700,
            color: cv.ink,
            maxWidth: 1000,
            lineHeight: 1.2,
          }}
        >
          That's the core pipeline behind every word ChatGPT, Claude, or any language model generates.
        </div>

        {frame >= 182 && (
          <div style={{ opacity: l2, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
            {steps.map((s, i) => {
              const stepS = spring({ frame: frame - (182 + i * 14), fps, config: { damping: 16, stiffness: 200 } });
              return (
                <React.Fragment key={s}>
                  <div
                    style={{
                      opacity: stepS,
                      transform: `scale(${interpolate(stepS, [0, 1], [0.8, 1])})`,
                      fontFamily: cvFonts.mono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: cv.keyword,
                      border: `1.5px solid ${cv.keyword}`,
                      background: `${cv.keyword}14`,
                      borderRadius: 999,
                      padding: "8px 16px",
                    }}
                  >
                    {s}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ alignSelf: "center", color: cv.muted, fontFamily: cvFonts.mono }}>&rarr;</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {frame >= 478 && (
          <div
            style={{
              opacity: l3,
              transform: `scale(${interpolate(l3, [0, 1], [0.9, 1])})`,
              fontFamily: cvFonts.mono,
              fontSize: 18,
              color: cv.muted,
              marginTop: 10,
            }}
          >
            Full code down in the description.
          </div>
        )}

        {frame >= 537 && (
          <div
            style={{
              opacity: l4,
              transform: `translateY(${interpolate(l4, [0, 1], [16, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: cvFonts.display, fontSize: 24, fontWeight: 700, color: cv.ink }}>
              Next: real <span style={{ color: cv.keyword }}>tokenizers</span>, or how <span style={{ color: cv.func }}>attention</span> works?
            </div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 16, color: cv.terminalGreen }}>
              let me know in the comments &mdash; see you in the next one.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
