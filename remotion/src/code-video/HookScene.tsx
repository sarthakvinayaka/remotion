import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";
import { IconBox, IconBell, IconLock, IconHashMap, IconQueue } from "./Icons";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// High-energy, multi-beat hook -- built for retention, not a static text
// card. Every phrase gets its own visual event: a cursor moving to a click,
// a full-screen flash + shockwave on impact, service nodes physically
// exploding outward from the click point, a synchronized "none waiting"
// pulse across all four at once, then a hard cut to the HashMap/Queue payoff.
//
// Word anchors (verified against whisper, local frames, 0 = "Ok, so think..."):
//   "just one click" 96-127        "kicks off 4 or 5" 169-199
//   "One handles order" 259-298    "...payment" 298-337
//   "...stock" 337-374             "...notification" 374-457
//   "None waiting" 448-517         "build this...python" 517-650
//   "hashmap and a queue" 650-692  "let's get into it" 722-763
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const services = [
    { label: "Order", icon: IconBox, at: 259, color: cv.func, angle: -135 },
    { label: "Payment", icon: IconLock, at: 298, color: cv.number, angle: -45 },
    { label: "Inventory", icon: IconBox, at: 337, color: cv.string, angle: 135 },
    { label: "Notification", icon: IconBell, at: 374, color: cv.keyword, angle: 45 },
  ];

  // ---- Phase 1: cursor moves toward center (0-96) ----
  const cursorMove = interpolate(frame, [0, 96], [0, 1], { extrapolateRight: "clamp" });
  const cursorX = interpolate(cursorMove, [0, 1], [-420, 0]);
  const cursorY = interpolate(cursorMove, [0, 1], [260, 0]);
  const showCursor = frame < 135;

  // ---- Phase 2: click impact flash + shockwave (96-169) ----
  const impactLocal = frame - 96;
  const flash = interpolate(frame, [96, 100, 118], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shockScale = interpolate(impactLocal, [0, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shockOpacity = interpolate(impactLocal, [0, 8, 45], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camShake =
    frame >= 96 && frame <= 118
      ? Math.sin((frame - 96) * 3.5) * interpolate(frame, [96, 118], [8, 0])
      : 0;

  // ---- Phase 3: services explode outward (169 onward) ----
  const explodeStart = 169;
  const parallelWindow = frame >= 448 && frame < 650;

  // ---- Phase 4: python/build line (517-650) ----
  const pythonIn = ease(frame, 517, fps, 15, 210);
  const pythonOut = interpolate(frame, [630, 655], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---- Phase 5: HashMap + Queue payoff slam (650-763) ----
  const payoffLocal = frame - 650;
  const payoffIn = ease(frame, 650, fps, 12, 240);
  const payoffFlash = interpolate(payoffLocal, [-2, 0, 10], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // background color wash per beat
  const bg =
    frame < 96
      ? cv.bg
      : frame < 169
        ? cv.panel
        : frame < 448
          ? "#0d1a14"
          : frame < 650
            ? "#160d1a"
            : "#0d1a17";

  return (
    <AbsoluteFill style={{ background: bg, transform: `translate(${camShake}px, ${camShake * 0.5}px)` }}>
      <GridBg opacity={0.05} color={cv.terminalGreen} />

      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="Microservices, from scratch" color={cv.terminalGreen} />
      </div>

      {/* Phase 1+2: cursor + click site, dead center */}
      {showCursor && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${cursorX}px), calc(-50% + ${cursorY}px))`,
          }}
        >
          <CursorIcon />
        </div>
      )}

      {/* click impact flash */}
      {flash > 0 && <AbsoluteFill style={{ background: cv.terminalGreen, opacity: flash, mixBlendMode: "screen" }} />}

      {/* shockwave ring at click point */}
      {shockOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 40,
            height: 40,
            borderRadius: 999,
            border: `3px solid ${cv.terminalGreen}`,
            transform: `translate(-50%, -50%) scale(${1 + shockScale * 6})`,
            opacity: shockOpacity,
          }}
        />
      )}

      {/* Phase 3: 4 services exploding outward from center, then settling into a row-ish ring */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {services.map(({ label, icon: Icon, at, color, angle }) => {
          const s = ease(frame, Math.max(explodeStart, at - 40), fps, 11, 190);
          const settleP = interpolate(frame, [at, at + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rad = (angle * Math.PI) / 180;
          const dist = interpolate(settleP, [0, 1], [40, 340]);
          const x = Math.cos(rad) * dist;
          const y = Math.sin(rad) * dist * 0.85;
          const pulse = parallelWindow ? 1 + Math.sin((frame - at) * 0.3) * 0.08 : 1;
          const labelIn = ease(frame, at, fps, 14, 220);

          return (
            <div
              key={label}
              style={{
                position: "absolute",
                opacity: s,
                transform: `translate(${x}px, ${y}px) scale(${interpolate(s, [0, 1], [0.3, 1]) * pulse})`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  border: `2px solid ${color}`,
                  background: `${color}18`,
                  boxShadow: `0 0 24px ${color}44`,
                  borderRadius: 16,
                  padding: "16px 20px",
                }}
              >
                <Icon size={32} color={color} />
                <div
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    color: cv.ink,
                    opacity: labelIn,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          );
        })}

        {/* center label: appears once services have exploded out */}
        {frame >= 420 && frame < 650 && (
          <div
            style={{
              fontFamily: cvFonts.display,
              fontSize: 40,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
              maxWidth: 500,
              opacity: ease(frame, 420, fps, 16, 200),
            }}
          >
            One click.
            <br />
            <span style={{ color: cv.terminalGreen }}>Four services.</span>
          </div>
        )}
      </AbsoluteFill>

      {/* Phase 4: python build line, full screen takeover */}
      {frame >= 505 && frame < 660 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            background: bg,
            opacity: Math.min(pythonIn, pythonOut === 0 ? 1 : pythonOut),
          }}
        >
          <div
            style={{
              fontFamily: cvFonts.mono,
              fontSize: 26,
              color: cv.terminalGreen,
              marginBottom: 14,
              transform: `translateY(${interpolate(pythonIn, [0, 1], [16, 0])}px)`,
            }}
          >
            $ python build_from_scratch.py
          </div>
          <div
            style={{
              fontFamily: cvFonts.display,
              fontSize: 56,
              fontWeight: 700,
              color: cv.ink,
              transform: `translateY(${interpolate(pythonIn, [0, 1], [16, 0])}px)`,
            }}
          >
            Built from scratch, in Python.
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 5: HashMap + Queue payoff */}
      {frame >= 645 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {payoffFlash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: payoffFlash }} />}
          <div style={{ display: "flex", gap: 70, opacity: payoffIn, transform: `scale(${interpolate(payoffIn, [0, 1], [0.6, 1])})` }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <IconHashMap size={72} color={cv.func} />
              <div style={{ fontFamily: cvFonts.mono, fontSize: 22, fontWeight: 700, color: cv.func }}>HashMap</div>
            </div>
            <div
              style={{
                fontFamily: cvFonts.display,
                fontSize: 40,
                color: cv.muted,
                alignSelf: "center",
              }}
            >
              +
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <IconQueue size={72} color={cv.string} />
              <div style={{ fontFamily: cvFonts.mono, fontSize: 22, fontWeight: 700, color: cv.string }}>Queue</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 34,
              fontFamily: cvFonts.display,
              fontSize: 30,
              color: cv.ink,
              opacity: ease(frame, 700, fps, 16, 200),
            }}
          >
            That's it. Let's get into it.
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const CursorIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill={cv.ink} stroke={cv.bg} strokeWidth={1}>
    <path d="M4 2l14 6-5.5 2.2L14 16z" />
  </svg>
);
