import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { s3, s3Fonts } from "./theme";
import marks from "../short3-marks.json";

// Scene 5 payoff: the merged teal card expands into a paved-road icon (a
// horizontal bar with small service blocks docked on top, sliding in with
// stagger), plus stacked "PLATFORM" / "ENGINEERING" kinetic text.
export const RoadPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // frame is already local to this <Sequence from={marks.paved_road_start}>
  const local = frame;

  const roadIn = spring({ frame: local, fps, config: { damping: 16, stiffness: 170 } });
  const roadWidth = interpolate(roadIn, [0, 1], [80, 640]);

  const dockedCount = 4;

  const platformLocal = frame - (marks.platform_start - marks.paved_road_start);
  const engineeringLocal = frame - (marks.platform_start - marks.paved_road_start + 12);
  const platformS = spring({ frame: platformLocal, fps, config: { damping: 15, stiffness: 210 } });
  const engineeringS = spring({ frame: engineeringLocal, fps, config: { damping: 15, stiffness: 210 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 700, height: 300 }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 160,
            transform: `translate(-50%, -50%)`,
            width: roadWidth,
            height: 26,
            borderRadius: 13,
            background: s3.signal,
            boxShadow: `0 0 40px ${s3.signal}88`,
          }}
        />
        {Array.from({ length: dockedCount }).map((_, i) => {
          const t = spring({ frame: local - 10 - i * 6, fps, config: { damping: 14, stiffness: 240 } });
          const cx = -240 + i * 160;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `calc(50% + ${cx}px)`,
                top: 160 - 46,
                width: 64,
                height: 64,
                transform: `translate(-50%, -50%) translateY(${interpolate(t, [0, 1], [30, 0])}px) scale(${t})`,
                opacity: t,
                borderRadius: 12,
                background: s3.ink,
                border: `3px solid ${s3.signal}`,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: "58%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: s3Fonts.display,
            fontSize: 96,
            color: s3.paper,
            textTransform: "uppercase",
            opacity: platformS,
            transform: `translateY(${interpolate(platformS, [0, 1], [40, 0])}px)`,
          }}
        >
          Platform
        </div>
        <div
          style={{
            fontFamily: s3Fonts.display,
            fontSize: 96,
            color: s3.signal,
            textTransform: "uppercase",
            opacity: engineeringS,
            transform: `translateY(${interpolate(engineeringS, [0, 1], [40, 0])}px)`,
            textShadow: `0 0 50px ${s3.signal}77`,
          }}
        >
          Engineering
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 6 end card
export const EndCard: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;

  const fadeIn = spring({ frame: local, fps, config: { damping: 18, stiffness: 160 } });
  const loopT = (local % 45) / 45;

  return (
    <AbsoluteFill style={{ backgroundColor: s3.ink, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: fadeIn }}>
        <div
          style={{
            fontFamily: s3Fonts.display,
            fontSize: 64,
            color: s3.signal,
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          Platform
          <br />
          Engineering
        </div>
        <div
          style={{
            width: 220,
            height: 4,
            background: s3.dim,
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${loopT * 100}%`,
              background: s3.signal,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: s3Fonts.mono,
            fontSize: 22,
            color: s3.dim,
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          full breakdown ↓ full video on the channel
        </div>
        {/* minimal subscribe icon: a bell outline */}
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={s3.paper} strokeWidth={1.6}>
          <path d="M12 2a2 2 0 00-2 2v.3A7 7 0 005 11v4l-2 3h18l-2-3v-4a7 7 0 00-5-6.7V4a2 2 0 00-2-2zM9 20a3 3 0 006 0" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
