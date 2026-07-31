import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

// Fully wordless, icon/shape-only animated scenes. Every beat is told through
// motion and abstract iconography, never text — the narration carries the
// meaning, the visuals illustrate it.

const ease = (f: number, fps: number, from: number, damping = 16, stiffness = 200) =>
  spring({ frame: f - from, fps, config: { damping, stiffness } });

// ---- Reusable icon glyphs (flat, minimal, legible as small shapes) ----
const IconDocker: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M22 9.5h-2.4V7.2h-2.3v2.3H15V7.2h-2.3v2.3h-2.4V7.2H8v2.3H5.7v2.3H3.4c-.2 1.6.1 3.2 1 4.6 1.3 2 3.6 3.1 6.4 3.1 5.6 0 9.7-2.6 11.6-7.3.9 0 1.9-.3 2.5-.9l-.2-1.5-1.2.5c-.4-.4-.9-.6-1.5-.8z" />
  </svg>
);
const IconK8s: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.4 1.1.9 2.5 2.6.4 1.6 2.1-.9 2.5 1.4 2.3-1.6 2.1-.3 2.6-2.5.9-1.6 2.1H9.4l-1.6-2.1-2.5-.9-.3-2.6-1.6-2.1 1.4-2.3-.9-2.5 1.6-2.1 2.6-.4.9-2.5z" />
  </svg>
);
const IconLock: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6 10V7a6 6 0 1112 0v3h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h8V7a4 4 0 00-8 0z" />
  </svg>
);
const IconBell: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2a2 2 0 00-2 2v.3A7 7 0 005 11v4l-2 3h18l-2-3v-4a7 7 0 00-5-6.7V4a2 2 0 00-2-2zM9 20a3 3 0 006 0z" />
  </svg>
);
const IconGear: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19.4 13a7.6 7.6 0 000-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1L15 3h-4l-.3 2.5a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 000 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 001.7 1L11 21h4l.3-2.5a7.6 7.6 0 001.7-1l2.4 1 2-3.4zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" />
  </svg>
);
const ICONS = [IconDocker, IconK8s, IconLock, IconBell, IconGear];

// ---- Scene 1: one clean block splits into several smaller blocks ----
export const SplitBlocks: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const split = interpolate(local, [30, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wholeOpacity = interpolate(split, [0, 0.35], [1, 0], { extrapolateRight: "clamp" });
  const n = 5;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: 40,
          background: "linear-gradient(160deg, #33D6FF, #1a7ea8)",
          opacity: wholeOpacity,
          transform: `scale(${interpolate(wholeOpacity, [0, 1], [0.6, 1])})`,
        }}
      />
      {Array.from({ length: n }).map((_, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const dist = interpolate(split, [0, 1], [0, 260]);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const s = ease(local, fps, 20 + i * 6);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 22,
              background: "linear-gradient(160deg, #33D6FF, #1a7ea8)",
              boxShadow: "0 10px 40px rgba(51,214,255,0.35)",
              opacity: s,
              transform: `translate(${x}px, ${y}px) scale(${interpolate(s, [0, 1], [0.5, 1])}) rotate(${(i - 2) * 4}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---- Scene 2: the blocks crack / wobble — the "wall" hitting ----
export const CracksSpread: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const n = 5;
  const shake = Math.sin(local * 1.3) * Math.min(local / 10, 6);
  const redness = interpolate(local, [0, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: n }).map((_, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 260 + shake * (i % 2 === 0 ? 1 : -1);
        const y = Math.sin(angle) * 260;
        const s = ease(local, fps, i * 4);
        const blockColor = redness > 0.5 ? "#FF3B5C" : "#33D6FF";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 22,
              background: `linear-gradient(160deg, ${blockColor}, #7a1a2c)`,
              opacity: s,
              transform: `translate(${x}px, ${y}px) rotate(${(i - 2) * 4 + shake}deg)`,
              boxShadow: `0 10px 40px rgba(255,59,92,${redness * 0.5})`,
            }}
          />
        );
      })}
      {/* jagged crack lines radiating from center */}
      <svg width="640" height="640" style={{ position: "absolute", opacity: redness * 0.8 }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const x2 = 320 + Math.cos(a) * 220;
          const y2 = 320 + Math.sin(a) * 220;
          return <line key={i} x1={320} y1={320} x2={x2} y2={y2} stroke="#FF3B5C" strokeWidth={3} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---- Scene 3: a hopeful path/road appears briefly then fades (the "pitch") ----
export const HopefulPath: React.FC<{ startFrame: number; endLocal: number }> = ({ startFrame, endLocal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const draw = interpolate(local, [0, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fade = interpolate(local, [endLocal - 40, endLocal], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade }}>
      <svg width="800" height="300" viewBox="0 0 800 300">
        <path
          d="M 20 250 Q 400 20 780 250"
          fill="none"
          stroke="#4DD4B0"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset={900 - draw * 900}
        />
      </svg>
    </AbsoluteFill>
  );
};

// ---- Scene 4: the 10-services grid forms ----
export const ServiceGrid: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: 16, width: 560, height: 880 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const s = ease(local, fps, i * 8, 15, 210);
          return (
            <div
              key={i}
              style={{
                borderRadius: 18,
                background: "linear-gradient(160deg, #33D6FF33, #33D6FF0a)",
                border: "3px solid #33D6FF",
                opacity: s,
                transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- Scene 5: each service sprouts a duplicate stack of infra icons underneath ----
export const InfraDuplication: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: 16, width: 560, height: 880 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              borderRadius: 18,
              background: "linear-gradient(160deg, #FF3B5C22, #FF3B5C08)",
              border: "3px solid #FF3B5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
              padding: 8,
            }}
          >
            {ICONS.map((Icon, j) => {
              const t = i * 6 + j * 5;
              const s = ease(local, fps, t, 12, 240);
              return (
                <div key={j} style={{ opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.3, 1])})` }}>
                  <Icon size={22} color="#FF3B5C" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---- Scene 6: overload — grid shakes, icons spill, pressure building ----
export const Overload: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const shake = Math.min(local / 6, 10);
  const sx = Math.sin(local * 2.1) * shake;
  const sy = Math.cos(local * 1.7) * shake;
  const flashes = [10, 24, 38, 52, 66, 80, 94];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: 16, width: 560, height: 880 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: 18,
              background: "linear-gradient(160deg, #FF3B5C55, #FF3B5C1a)",
              border: "3px solid #FF3B5C",
            }}
          />
        ))}
      </div>
      {flashes.map((t, i) => {
        const on = local >= t && local < t + 6;
        return on ? (
          <AbsoluteFill key={i} style={{ background: "#FF3B5C", opacity: 0.15, mixBlendMode: "screen" }} />
        ) : null;
      })}
    </AbsoluteFill>
  );
};

// ---- Scene 7: chaos resolves into one solid glowing "product" block ----
export const ProductForms: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const s = ease(local, fps, 0, 16, 160);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 360,
          height: 360,
          borderRadius: 56,
          background: "linear-gradient(160deg, #FF3B5C, #7a1a2c)",
          boxShadow: `0 0 ${80 + Math.sin(local * 0.08) * 20}px rgba(255,59,92,0.6)`,
          opacity: s,
          transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---- Short 2 scenes: recap (tangle <-> road morph), zoom-out, merge into foundation ----
export const RecapMorph: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const phase = interpolate(local, [0, 200, 260, 460], [0, 1, 1, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // phase 0-1: tangle -> road; phase 1-2: road -> orderly tower (architecture -> org)
  const n = 6;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: n }).map((_, i) => {
        const tangleAngle = i * 1.3 + Math.sin(i) * 2;
        const tangleR = 180 + (i % 3) * 40;
        const tx = Math.cos(tangleAngle) * tangleR;
        const ty = Math.sin(tangleAngle) * tangleR;
        const roadX = -250 + i * 100;
        const roadY = 0;
        const towerX = 0;
        const towerY = 260 - i * 60;

        const p1 = interpolate(phase, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const p2 = interpolate(phase, [1, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x1 = interpolate(p1, [0, 1], [tx, roadX]);
        const y1 = interpolate(p1, [0, 1], [ty, roadY]);
        const x = interpolate(p2, [0, 1], [x1, towerX]);
        const y = interpolate(p2, [0, 1], [y1, towerY]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 86,
              height: 86,
              borderRadius: 16,
              background: "linear-gradient(160deg, #2CFFA0, #0e7a4e)",
              boxShadow: "0 8px 30px rgba(44,255,160,0.35)",
              transform: `translate(${x}px, ${y}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const ZoomRevealRoad: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const zoom = interpolate(local, [0, 260], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ transform: `scale(${zoom})` }}>
        <svg width="1000" height="1000" viewBox="0 0 1000 1000">
          <path d="M500 1000 L500 100" stroke="#C86BFF" strokeWidth="26" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={i}
              d={`M500 ${900 - i * 150} L${500 + (i % 2 === 0 ? 260 : -260)} ${820 - i * 150}`}
              stroke="#C86BFF"
              strokeWidth="14"
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const FoundationMerge: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const riseUp = ease(local, fps, 0, 16, 150);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => {
            const s = ease(local, fps, i * 6, 14, 220);
            return (
              <div
                key={i}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 14,
                  background: "linear-gradient(160deg, #33D6FF, #1a7ea8)",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            marginTop: 14,
            width: 340,
            height: 90,
            borderRadius: 20,
            background: "linear-gradient(160deg, #2CFFA0, #0e7a4e)",
            boxShadow: `0 0 ${60 + Math.sin(local * 0.1) * 15}px rgba(44,255,160,0.55)`,
            opacity: riseUp,
            transform: `scale(${interpolate(riseUp, [0, 1], [0.7, 1])})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
