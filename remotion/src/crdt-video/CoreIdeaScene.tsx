import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg, KineticWords } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "So CRDT stands for"):
//   "CRDT stands for conflict-free replicated data type" 0-108
//   "update on multiple machines at the same time" 251-342
//   "no coordinator...no locking...nobody waiting" 547-711
//   "simplest CRDT...just a counter" 714-842
//   "likes on a post or view count spread across servers" 849-964
export const CoreIdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const showAcronym = frame >= 0 && frame < 340;
  const showMachines = frame >= 251 && frame < 547;
  const showNoCoord = frame >= 547 && frame < 714;
  const showCounter = frame >= 714;

  const acronymIn = ease(frame, 20, fps, 15, 210);
  const machinesIn = ease(frame, 260, fps, 14, 200);
  const noCoordIn = ease(frame, 560, fps, 14, 200);
  const counterIn = ease(frame, 714, fps, 14, 210);
  const serversIn = ease(frame, 849, fps, 14, 210);

  // Faint animated node-mesh behind the acronym reveal -- previews the
  // "distributed machines" idea visually before it's introduced in words,
  // instead of leaving the vast top/bottom canvas empty behind bare text.
  const meshNodes = [
    { x: 260, y: 160 }, { x: 1660, y: 190 }, { x: 180, y: 860 },
    { x: 1740, y: 840 }, { x: 960, y: 130 }, { x: 960, y: 930 },
  ];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.func} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="The core idea" color={cv.func} />
      </div>

      {showAcronym && (
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {meshNodes.map((n, i) =>
            meshNodes.slice(i + 1).map((m, j) => (
              <line
                key={`${i}-${j}`}
                x1={n.x}
                y1={n.y}
                x2={m.x}
                y2={m.y}
                stroke={cv.func}
                strokeWidth={1}
                strokeDasharray="3 7"
                opacity={0.08}
              />
            ))
          )}
          {meshNodes.map((n, i) => {
            const pulse = 0.3 + (Math.sin((frame + i * 22) * 0.05) + 1) * 0.2;
            return (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={4}
                fill={cv.func}
                opacity={pulse * acronymIn}
                style={{ filter: `drop-shadow(0 0 6px ${cv.func})` }}
              />
            );
          })}
        </svg>
      )}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, padding: 80 }}>
        {showAcronym && (
          <div style={{ opacity: acronymIn, transform: `translateY(${interpolate(acronymIn, [0, 1], [16, 0])}px)`, textAlign: "center" }}>
            <div style={{ fontFamily: cvFonts.display, fontSize: 64, fontWeight: 700, color: cv.ink }}>
              <span style={{ color: cv.func }}>C</span>onflict-free{" "}
              <span style={{ color: cv.func }}>R</span>eplicated{" "}
              <span style={{ color: cv.func }}>D</span>ata{" "}
              <span style={{ color: cv.func }}>T</span>ype
            </div>
          </div>
        )}

        {showMachines && (
          <div style={{ position: "relative" }}>
            {/* dashed network lines connecting all three, showing they're peers not isolated */}
            <svg
              width="290"
              height="76"
              style={{ position: "absolute", left: -15, top: 0, overflow: "visible", zIndex: 0 }}
            >
              <line x1={50} y1={38} x2={145} y2={38} stroke={cv.muted} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.4} />
              <line x1={145} y1={38} x2={240} y2={38} stroke={cv.muted} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.4} />
            </svg>
            <div style={{ opacity: machinesIn, display: "flex", gap: 30, alignItems: "center", position: "relative", zIndex: 1 }}>
              {["M1", "M2", "M3"].map((m, i) => {
                const s = ease(frame, 260 + i * 12, fps, 12, 220);
                // independent, staggered "actively updating" pulse per machine
                const pulsePhase = (frame + i * 14) * 0.15;
                const pulse = 1 + Math.sin(pulsePhase) * 0.05;
                const glow = 0.2 + (Math.sin(pulsePhase) + 1) * 0.15;
                return (
                  <div
                    key={m}
                    style={{
                      opacity: s,
                      transform: `translateY(${interpolate(s, [0, 1], [14, 0])}px) scale(${pulse})`,
                      width: 100,
                      height: 76,
                      borderRadius: 12,
                      border: `2px solid ${cv.func}`,
                      background: `${cv.func}14`,
                      boxShadow: `0 0 ${18 * glow}px ${cv.func}55`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      fontFamily: cvFonts.mono,
                      fontWeight: 700,
                      color: cv.func,
                    }}
                  >
                    {m}
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: cv.terminalGreen,
                        opacity: 0.5 + (Math.sin(pulsePhase) + 1) * 0.25,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {showMachines && (
          <div style={{ opacity: machinesIn, fontFamily: cvFonts.mono, fontSize: 18, color: cv.muted }}>
            updating independently &mdash; at the same time
          </div>
        )}

        {showNoCoord && (
          <div style={{ opacity: noCoordIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <KineticWords text="No coordinator. No locking." size={52} color={cv.ink} family={cvFonts.display} perWord={3} />
            <div style={{ fontFamily: cvFonts.mono, fontSize: 20, color: cv.terminalGreen }}>nobody waiting on anybody.</div>
          </div>
        )}

        {showCounter && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div
              style={{
                opacity: counterIn,
                transform: `scale(${interpolate(counterIn, [0, 1], [0.8, 1])})`,
                fontFamily: cvFonts.display,
                fontSize: 56,
                fontWeight: 700,
                color: cv.ink,
                textAlign: "center",
              }}
            >
              The simplest CRDT: <span style={{ color: cv.string }}>a counter.</span>
            </div>
            {frame >= 849 && (
              <div
                style={{
                  opacity: serversIn,
                  transform: `translateY(${interpolate(serversIn, [0, 1], [14, 0])}px)`,
                  display: "flex",
                  gap: 22,
                  alignItems: "center",
                }}
              >
                {["Server A", "Server B", "Server C"].map((s, i) => {
                  // each server's like count ticks up on its own independent
                  // cadence, live -- reinforcing "spread across a bunch of
                  // servers, each doing its own thing".
                  const base = [128, 94, 61][i];
                  const tickEvery = [17, 23, 13][i];
                  const ticks = Math.floor(Math.max(0, frame - 849 - i * 8) / tickEvery);
                  const value = base + ticks;
                  const justTicked = frame >= 849 && (frame - 849 - i * 8) % tickEvery < 3;
                  return (
                    <div
                      key={s}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        border: `2px solid ${cv.string}`,
                        background: `${cv.string}14`,
                        borderRadius: 14,
                        padding: "14px 20px",
                        boxShadow: justTicked ? `0 0 20px ${cv.string}55` : "none",
                      }}
                    >
                      <div style={{ fontFamily: cvFonts.mono, fontSize: 13, fontWeight: 700, color: cv.string }}>{s}</div>
                      <div
                        style={{
                          fontFamily: cvFonts.mono,
                          fontSize: 28,
                          fontWeight: 700,
                          color: justTicked ? cv.terminalGreen : cv.ink,
                        }}
                      >
                        {value}
                      </div>
                      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted }}>likes</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
