import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { GridBg } from "../components/shared";

// Word anchors (local frames, 0 = "so that's what's inside every dict we've used"):
//   recap line 0-353   "full code in description" 448-500
//   "open addressing next? let me know" 509-703   "see you in the next one" 727-771
export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 10, fps, config: { damping: 18 } });
  const l2 = spring({ frame: frame - 448, fps, config: { damping: 16, stiffness: 150 } });
  const l3 = spring({ frame: frame - 509, fps, config: { damping: 15, stiffness: 200 } });

  const steps = [
    { label: "a hash function turns key into slot number", color: cv.func },
    { label: "buckets hold a list to handle collisions", color: cv.terminalRed },
    { label: "resize keeps things fast as it grows", color: cv.number },
  ];

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1000px 600px at 50% 45%, ${cv.func}18, transparent 65%), ${cv.bg}` }}>
      <GridBg opacity={0.05} color={cv.func} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 80, gap: 30 }}>
        <div
          style={{
            opacity: l1,
            transform: `translateY(${interpolate(l1, [0, 1], [20, 0])}px)`,
            fontFamily: cvFonts.display,
            fontSize: 44,
            fontWeight: 700,
            color: cv.ink,
            maxWidth: 1000,
            lineHeight: 1.2,
          }}
        >
          That's what's inside every dict you've used.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s, i) => {
            const stepS = spring({ frame: frame - (140 + i * 22), fps, config: { damping: 16, stiffness: 200 } });
            return (
              <div
                key={s.label}
                style={{
                  opacity: stepS,
                  transform: `translateX(${interpolate(stepS, [0, 1], [-14, 0])}px)`,
                  fontFamily: cvFonts.mono,
                  fontSize: 20,
                  color: s.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
                {s.label}
              </div>
            );
          })}
        </div>

        {frame >= 448 && (
          <div
            style={{
              opacity: l2,
              transform: `scale(${interpolate(l2, [0, 1], [0.9, 1])})`,
              fontFamily: cvFonts.mono,
              fontSize: 18,
              color: cv.muted,
              marginTop: 10,
            }}
          >
            Maybe 40 lines total. Full code down in the description.
          </div>
        )}

        {frame >= 509 && (
          <div
            style={{
              opacity: l3,
              transform: `translateY(${interpolate(l3, [0, 1], [16, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: cvFonts.display, fontSize: 26, fontWeight: 700, color: cv.ink }}>
              Want the next one on <span style={{ color: cv.keyword }}>open addressing</span>?
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
