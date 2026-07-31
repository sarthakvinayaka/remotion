import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (verified against whisper, local frames, 0 = "Okay so imagine"):
//   "using Notion...bad wifi" 31-151      "co-workers...another city" 156-256
//   "both...dropping offline" 283-383     "internet comes back...merge in perfectly" 390-508
//   "no popup...nothing" 517-600          "that's not luck...CRDT" 604-743
//   "10 lines of python" 754-902          "let's just build it" 908-959
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const deviceAIn = ease(frame, 31, fps, 14, 220);
  const deviceBIn = ease(frame, 156, fps, 14, 220);
  const offline = frame >= 283 && frame < 390;
  const syncing = frame >= 390 && frame < 517;
  const syncedClean = frame >= 517;

  const offlineShake = offline ? Math.sin(frame * 0.9) * 3 : 0;
  const syncPulse = interpolate(frame, [390, 430, 470, 508], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkIn = ease(frame, 517, fps, 12, 240);

  const crdtTitleIn = ease(frame, 642, fps, 14, 210);
  const crdtFull = frame >= 719;

  const codeFlashIn = ease(frame, 754, fps, 12, 220);
  const codeFlashOut = interpolate(frame, [895, 920], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const finalIn = ease(frame, 908, fps, 16, 200);

  // Typing cadence -- each device "types" a new line every ~18 frames while
  // online, so the document bars visibly grow instead of sitting static.
  const typingLines = (startFrame: number) => {
    const t = Math.max(0, frame - startFrame);
    const active = !offline;
    const count = active ? Math.min(4, Math.floor(t / 22) + 1) : Math.min(4, Math.floor(Math.min(t, 283 - startFrame) / 22) + 1);
    return count;
  };

  // Drifting background glyphs: a plane path for "on a flight" and a skyline
  // silhouette for "another city" -- ambient motion behind the cards.
  const planeX = interpolate(frame, [0, 900], [-100, 1400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Opening frames (before the chip/devices spring in) would otherwise be a
  // near-empty black screen -- give the very first instant some visible
  // life: a slow radial pulse plus a handful of drifting particles, active
  // from frame 0 rather than waiting on the first word anchor at 31.
  const openPulse = 0.5 + Math.sin(frame * 0.05) * 0.5;
  const particles = Array.from({ length: 14 }).map((_, i) => {
    const speed = 0.25 + (i % 5) * 0.07;
    const startX = (i * 137) % 1920;
    const startY = (i * 271) % 1080;
    const x = (startX + frame * speed) % 1920;
    const y = (startY + Math.sin((frame + i * 40) * 0.02) * 30 + 1080) % 1080;
    return { x, y, i };
  });

  return (
    <AbsoluteFill style={{ background: cv.bg }}>
      <GridBg opacity={0.05} color={cv.func} />

      {/* ambient particle field + soft glow, visible from frame 0 so the
          screen never reads as a static void before the devices spring in */}
      {!crdtTitleIn && (
        <>
          <AbsoluteFill
            style={{
              pointerEvents: "none",
              background: `radial-gradient(900px 500px at 50% 50%, ${cv.func}${Math.round(openPulse * 10).toString(16).padStart(2, "0")}, transparent 70%)`,
            }}
          />
          {particles.map(({ x, y, i }) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 3,
                height: 3,
                borderRadius: 999,
                background: i % 3 === 0 ? cv.string : cv.func,
                opacity: 0.25 + (Math.sin((frame + i * 30) * 0.03) + 1) * 0.15,
              }}
            />
          ))}
        </>
      )}

      {/* ambient drifting plane, low opacity, top area */}
      {!crdtTitleIn && (
        <div style={{ position: "absolute", left: planeX, top: 130, opacity: 0.18 }}>
          <PlaneIcon color={cv.func} />
        </div>
      )}

      {/* ambient skyline silhouette, bottom right */}
      {!crdtTitleIn && (
        <div style={{ position: "absolute", right: 40, bottom: 40, opacity: 0.14 }}>
          <SkylineIcon color={cv.string} />
        </div>
      )}

      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="CRDTs, explained" color={cv.func} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        {/* two devices editing the same doc */}
        {!crdtTitleIn && (
          <div style={{ display: "flex", gap: 120, alignItems: "center", transform: `translate(${offlineShake}px, 0)` }}>
            <DeviceCard
              label="YOU"
              sub="on a flight"
              opacity={deviceAIn}
              scale={interpolate(deviceAIn, [0, 1], [0.7, 1])}
              dimmed={offline}
              color={cv.func}
              lineCount={typingLines(31)}
              showCursor={!offline && deviceAIn > 0.5}
            />

            {/* connection line between devices */}
            <div style={{ position: "relative", width: 90, height: 4 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: offline ? cv.muted : cv.terminalGreen,
                  opacity: offline ? 0.3 : Math.max(deviceBIn, syncPulse),
                  borderRadius: 2,
                  boxShadow: syncing ? `0 0 16px ${cv.terminalGreen}` : "none",
                }}
              />
              {offline && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.4) * 0.12})`,
                    fontFamily: cvFonts.mono,
                    fontSize: 18,
                    color: cv.terminalRed,
                  }}
                >
                  ✕
                </div>
              )}
              {syncing && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: `${syncPulse * 100}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: cv.terminalGreen,
                      boxShadow: `0 0 12px ${cv.terminalGreen}`,
                    }}
                  />
                  {/* second token traveling the opposite direction -- edits merge both ways */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${(1 - syncPulse) * 100}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 9,
                      height: 9,
                      borderRadius: 999,
                      background: cv.string,
                      boxShadow: `0 0 10px ${cv.string}`,
                      opacity: 0.85,
                    }}
                  />
                </>
              )}
            </div>

            <DeviceCard
              label="CO-WORKER"
              sub="another city"
              opacity={deviceBIn}
              scale={interpolate(deviceBIn, [0, 1], [0.7, 1])}
              dimmed={offline}
              color={cv.string}
              lineCount={typingLines(156)}
              showCursor={!offline && deviceBIn > 0.5}
            />
          </div>
        )}

        {syncedClean && !crdtTitleIn && (
          <div
            style={{
              opacity: checkIn,
              transform: `translateY(${interpolate(checkIn, [0, 1], [12, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: cvFonts.mono,
              fontSize: 20,
              color: cv.terminalGreen,
            }}
          >
            <span style={{ fontSize: 26 }}>✓</span> merged perfectly. no popup. nothing.
          </div>
        )}

        {/* CRDT title reveal */}
        {crdtTitleIn > 0 && (
          <div
            style={{
              opacity: crdtTitleIn,
              transform: `scale(${interpolate(crdtTitleIn, [0, 1], [0.8, 1])})`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: cvFonts.display,
                fontSize: 76,
                fontWeight: 700,
                color: cv.ink,
                letterSpacing: -1,
              }}
            >
              {crdtFull ? "CRDT" : "CR"}
            </div>
            {crdtFull && (
              <div style={{ fontFamily: cvFonts.mono, fontSize: 18, color: cv.muted, marginTop: 10, letterSpacing: 2 }}>
                CONFLICT-FREE REPLICATED DATA TYPE
              </div>
            )}
          </div>
        )}

        {/* 10 lines of python code flash */}
        {codeFlashIn > 0 && (
          <div
            style={{
              opacity: Math.min(codeFlashIn, codeFlashOut === 0 ? 1 : codeFlashOut),
              transform: `translateY(${interpolate(codeFlashIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.mono,
              fontSize: 22,
              color: cv.terminalGreen,
              border: `1.5px solid ${cv.terminalGreen}55`,
              borderRadius: 12,
              padding: "12px 24px",
              background: `${cv.terminalGreen}0d`,
            }}
          >
            ~10 lines of Python
          </div>
        )}

        {finalIn > 0 && (
          <div
            style={{
              opacity: finalIn,
              transform: `translateY(${interpolate(finalIn, [0, 1], [16, 0])}px)`,
              fontFamily: cvFonts.display,
              fontSize: 34,
              fontWeight: 700,
              color: cv.ink,
            }}
          >
            Let's just build it.
          </div>
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const DeviceCard: React.FC<{
  label: string;
  sub: string;
  opacity: number;
  scale: number;
  dimmed: boolean;
  color: string;
  lineCount: number;
  showCursor: boolean;
}> = ({ label, sub, opacity, scale, dimmed, color, lineCount, showCursor }) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 12) % 2 === 0;
  const widths = ["100%", "85%", "92%", "65%"];
  return (
    <div
      style={{
        opacity: opacity * (dimmed ? 0.45 : 1),
        transform: `scale(${scale})`,
        width: 190,
        height: 140,
        borderRadius: 16,
        border: `2.5px solid ${color}`,
        background: `${color}14`,
        boxShadow: dimmed ? "none" : `0 0 22px ${color}33`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "72%", minHeight: 4 * 7 }}>
        {Array.from({ length: 4 }).map((_, i) => {
          const shown = i < lineCount;
          const isLast = i === lineCount - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, height: 5 }}>
              {shown && (
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: i === 0 ? `${color}dd` : `${color}66`,
                    width: widths[i],
                    transition: "none",
                  }}
                />
              )}
              {isLast && showCursor && blink && (
                <div style={{ width: 2, height: 9, background: color, marginLeft: 1 }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 13, fontWeight: 700, color, marginTop: 6 }}>{label}</div>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted }}>{sub}</div>
    </div>
  );
};

const PlaneIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
    <path d="M3 12l18-7-7 18-2-8-9-3z" />
  </svg>
);

const SkylineIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="160" height="90" viewBox="0 0 160 90" fill="none" stroke={color} strokeWidth={1.6}>
    <rect x="10" y="30" width="20" height="60" />
    <rect x="36" y="10" width="18" height="80" />
    <rect x="60" y="40" width="22" height="50" />
    <rect x="88" y="20" width="16" height="70" />
    <rect x="110" y="45" width="24" height="45" />
    <rect x="140" y="55" width="14" height="35" />
  </svg>
);
