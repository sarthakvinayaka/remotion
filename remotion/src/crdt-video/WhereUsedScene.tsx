import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "This exact pattern"):
//   "Notion and Linear" 107-214       "Yjs or Automerge" 330-444
//   "Riak and Redis...view/like counts" 448-682
//   "Google Docs does NOT use CRDTs...Operational Transformation" 687-1069 (caveat, red-tinted)
//   "plain G-Counter can only go up, never down" 1081-1226   "PN-Counter" 1370-1638
export const WhereUsedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = ease(frame, 0, fps, 15, 210);
  const showLogos = frame >= 90 && frame < 687;
  const showCaveat = frame >= 687 && frame < 1081;
  const showLimitation = frame >= 1081;

  const logos = [
    { name: "Notion / Linear", detail: "collaborative docs & issues", at: 107, color: cv.func },
    { name: "Yjs / Automerge", detail: "CRDT libraries under the hood", at: 330, color: cv.string },
    { name: "Riak / Redis", detail: "distributed view & like counts", at: 448, color: cv.keyword },
  ];

  const caveatIn = ease(frame, 687, fps, 14, 210);
  const limitIn = ease(frame, 1081, fps, 14, 210);
  const pnIn = ease(frame, 1370, fps, 14, 220);

  // Ambient world-map style dots drifting slowly behind the whole scene --
  // reinforces "distributed / global" without competing with foreground
  // text, and gives the large empty top/bottom margins some quiet motion.
  const worldDots = Array.from({ length: 22 }).map((_, i) => {
    const bx = (i * 173 + 40) % 1920;
    const by = 140 + ((i * 97) % 800);
    const drift = Math.sin((frame + i * 33) * 0.015) * 10;
    return { x: bx, y: by + drift, i };
  });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.func} />

      {worldDots.map(({ x, y, i }) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 2,
            height: 2,
            borderRadius: 999,
            background: cv.muted,
            opacity: 0.18 + (Math.sin((frame + i * 25) * 0.04) + 1) * 0.08,
          }}
        />
      ))}

      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Where this actually gets used" color={cv.func} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34, padding: 80 }}>
        {frame < 90 && (
          <div
            style={{
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 42,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 850,
            }}
          >
            This exact pattern powers offline-first apps.
          </div>
        )}

        {showLogos && (
          <div style={{ display: "flex", gap: 26 }}>
            {logos.map(({ name, detail, at, color }, idx) => {
              const s = ease(frame, at, fps, 14, 210);
              const pulsePhase = (frame + idx * 20) * 0.12;
              const livePulse = 0.4 + (Math.sin(pulsePhase) + 1) * 0.3;
              return (
                <div
                  key={name}
                  style={{
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
                    border: `2px solid ${color}`,
                    background: `${color}14`,
                    borderRadius: 14,
                    padding: "18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    width: 240,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: cv.terminalGreen,
                        opacity: livePulse,
                        boxShadow: `0 0 ${8 * livePulse}px ${cv.terminalGreen}`,
                      }}
                    />
                    <div style={{ fontFamily: cvFonts.mono, fontSize: 18, fontWeight: 700, color }}>{name}</div>
                  </div>
                  <div style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted }}>{detail}</div>
                </div>
              );
            })}
          </div>
        )}

        {showCaveat && (
          <div
            style={{
              opacity: caveatIn,
              transform: `translateY(${interpolate(caveatIn, [0, 1], [16, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              border: `2px solid ${cv.terminalRed}`,
              background: `${cv.terminalRed}14`,
              borderRadius: 16,
              padding: "22px 34px",
              maxWidth: 700,
            }}
          >
            <div style={{ fontFamily: cvFonts.mono, fontSize: 15, fontWeight: 700, color: cv.terminalRed, letterSpacing: 1 }}>
              QUICK HONEST NOTE
            </div>
            <div style={{ fontFamily: cvFonts.display, fontSize: 28, fontWeight: 700, color: cv.ink, textAlign: "center" }}>
              Google Docs does <span style={{ color: cv.terminalRed }}>NOT</span> use CRDTs.
            </div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 16, color: cv.muted, textAlign: "center" }}>
              It uses Operational Transformation &mdash; an older, different technique.
            </div>
          </div>
        )}

        {showLimitation && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div
              style={{
                opacity: limitIn,
                transform: `translateY(${interpolate(limitIn, [0, 1], [16, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 26,
              }}
            >
              <div style={{ fontFamily: cvFonts.mono, fontSize: 20, color: cv.ink }}>A plain G-Counter:</div>
              <MiniLimitationDemo frame={frame} startFrame={1081} />
            </div>

            {frame >= 1370 && (
              <div
                style={{
                  opacity: pnIn,
                  transform: `scale(${interpolate(pnIn, [0, 1], [0.85, 1])})`,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontFamily: cvFonts.mono,
                  fontSize: 20,
                  color: cv.ink,
                }}
              >
                <span
                  style={{
                    border: `2px solid ${cv.keyword}`,
                    borderRadius: 10,
                    padding: "8px 16px",
                    color: cv.keyword,
                    fontWeight: 700,
                  }}
                >
                  PN-Counter
                </span>
                <span>= two G-Counters (+ and −), subtracted at the end</span>
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Small animated proof rather than static "UP / never DOWN" text: the
// counter successfully ticks up, then a down-attempt gets visibly blocked
// (red flash + shake) -- showing the limitation instead of just stating it.
const MiniLimitationDemo: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const local = frame - startFrame;
  const upAt = 20;
  const downAttemptAt = 70;
  const value = local >= upAt ? 4 : 3;
  const blocked = local >= downAttemptAt && local < downAttemptAt + 40;
  const shake = blocked ? Math.sin(local * 2) * 3 : 0;
  const flash = blocked ? Math.max(0, 1 - (local - downAttemptAt) / 20) : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        transform: `translateX(${shake}px)`,
      }}
    >
      <div
        style={{
          fontFamily: cvFonts.mono,
          fontSize: 34,
          fontWeight: 700,
          color: cv.ink,
          border: `2px solid ${blocked ? cv.terminalRed : cv.terminalGreen}`,
          background: blocked ? `${cv.terminalRed}${Math.round(flash * 30).toString(16).padStart(2, "0")}` : `${cv.terminalGreen}14`,
          borderRadius: 12,
          padding: "8px 22px",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 16,
            fontWeight: 700,
            color: cv.terminalGreen,
            opacity: local >= 5 && local < upAt + 30 ? 1 : local >= upAt ? 0.5 : 0,
          }}
        >
          increment() ✓
        </div>
        <div
          style={{
            fontFamily: cvFonts.mono,
            fontSize: 16,
            fontWeight: 700,
            color: cv.terminalRed,
            opacity: blocked ? 1 : 0,
          }}
        >
          decrement() ✕ blocked
        </div>
      </div>
    </div>
  );
};
