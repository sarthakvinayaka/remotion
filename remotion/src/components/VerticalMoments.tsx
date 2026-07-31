import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts } from "../theme";

// Full-bleed vertical "hit" moments — replace plain kinetic words for a few
// beats where a visual metaphor lands harder than text alone.

export const TenServicesGrid: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const names = ["user", "pay", "order", "notif", "search", "auth", "media", "bill", "email", "stat"];
  const fadeOut = interpolate(local, [150, 165], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          gap: 14,
          width: 620,
          height: 900,
        }}
      >
        {names.map((n, i) => {
          const s = spring({ frame: local - i * 6, fps, config: { damping: 14, stiffness: 220 } });
          return (
            <div
              key={i}
              style={{
                opacity: s,
                transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
                border: "2px solid #33D6FF",
                borderRadius: 14,
                background: "linear-gradient(160deg, rgba(51,214,255,0.16), rgba(51,214,255,0.03))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.mono,
                fontSize: 30,
                fontWeight: 700,
                color: "#F5F1E8",
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TenXInfra: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const s = spring({ frame: local, fps, config: { damping: 12, stiffness: 220 } });
  const shake = local < 20 ? Math.sin(local * 3) * (20 - local) * 0.3 : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translateX(${shake}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: s, textAlign: "center" }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 260,
            color: "#FF3B5C",
            letterSpacing: -8,
            textShadow: "0 0 90px rgba(255,59,92,0.7)",
            lineHeight: 1,
          }}
        >
          ×10
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: fonts.mono,
            fontSize: 34,
            fontWeight: 700,
            color: "#F5F1E8",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          copies of infra
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const VerbStack: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const verbs = ["deploy", "monitor", "secure", "debug", "recover"];
  // roughly matches the word cadence in this range (~18f apart)
  const starts = [0, 18, 31, 44, 58];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
        {verbs.map((v, i) => {
          const s = spring({ frame: local - starts[i], fps, config: { damping: 14, stiffness: 240 } });
          const isLast = i === verbs.length - 1;
          return (
            <div
              key={i}
              style={{
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <span style={{ fontFamily: fonts.mono, fontSize: 30, color: "#FF3B5C", fontWeight: 700 }}>
                0{i + 1}
              </span>
              <span
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: 74,
                  color: isLast ? "#FF3B5C" : "#F5F1E8",
                  letterSpacing: -1.5,
                }}
              >
                {v}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
