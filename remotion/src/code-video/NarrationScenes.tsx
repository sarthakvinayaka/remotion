import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { KineticWords, Chip, GridBg } from "../components/shared";
import { HashMapVisual, QueueVisual } from "./ConceptVisuals";
import { IconHashMap, IconQueue, IconLock, IconContainer, IconCloud } from "./Icons";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

const Backdrop: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent = cv.ink }) => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
    <GridBg opacity={0.05} color={accent} />
    <AbsoluteFill style={{ padding: 80, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {children}
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  </AbsoluteFill>
);

// ---- Two ideas (local frames, 0 = "So there's basically two ideas") ----
// "first one hashmap" 104-137, "10 orders or 10 million" 443-483,
// "second one queue" 553-606, "nobody sitting around waiting" 947-1009.
export const TwoIdeasScene: React.FC = () => {
  const frame = useCurrentFrame();

  const showHashmap = frame >= 104;
  const showQueue = frame >= 553;

  return (
    <Backdrop accent={cv.func}>
      <Chip label="Two ideas doing all the work" color={cv.func} />
      <div style={{ height: 20 }} />
      <KineticWords text="A HashMap. A Queue. That's it." size={68} color={cv.ink} family={cvFonts.display} />
      <div style={{ height: 40 }} />
      <div style={{ display: "flex", gap: 60, justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, minHeight: 260 }}>
          {showHashmap && <HashMapVisual startFrame={104} accent={cv.func} />}
          <div style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.muted, textAlign: "center", maxWidth: 320 }}>
            10 orders or 10 million &mdash; same speed.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, minHeight: 260 }}>
          {showQueue && <QueueVisual startFrame={553} accent={cv.string} />}
          <div style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.muted, textAlign: "center", maxWidth: 320 }}>
            Drop it, move on. Nobody's waiting around.
          </div>
        </div>
      </div>
    </Backdrop>
  );
};

// ---- Map to infra: dict -> Redis, queue -> Kafka, thread -> container/cloud, lock -> distributed lock ----
export const MapToInfraScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows: [string, string, React.FC<{ size?: number; color: string }>, React.FC<{ size?: number; color: string }>][] = [
    ["dict", "Redis / a database row", IconHashMap, IconCloud],
    ["queue.Queue()", "Kafka / RabbitMQ", IconQueue, IconCloud],
    ["threading.Thread", "a container in the cloud", IconContainer, IconCloud],
    ["store_lock", "a distributed lock", IconLock, IconCloud],
  ];

  return (
    <Backdrop accent={cv.keyword}>
      <Chip label="Map it to real infrastructure" color={cv.keyword} />
      <div style={{ height: 20 }} />
      <KineticWords text="Same shape. Bigger tools." size={68} color={cv.ink} family={cvFonts.display} />
      <div style={{ height: 30 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map(([a, b, FromIcon, ToIcon], i) => {
          const start = 30 + i * 26;
          const s = ease(frame, start, fps, 16, 200);
          const morph = ease(frame, start + 14, fps, 14, 180);
          return (
            <div
              key={a}
              style={{
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-24, 0])}px)`,
                display: "grid",
                gridTemplateColumns: "44px 1fr 40px 44px 1fr",
                alignItems: "center",
                gap: 14,
                border: `1px solid ${cv.panelLine}`,
                borderRadius: 12,
                background: cv.panel,
                padding: "12px 20px",
              }}
            >
              <div style={{ opacity: interpolate(morph, [0, 1], [1, 0.25]) }}>
                <FromIcon size={26} color={cv.builtin} />
              </div>
              <div style={{ fontFamily: cvFonts.mono, fontSize: 18, color: cv.builtin, fontWeight: 700 }}>{a}</div>
              <div style={{ textAlign: "center", color: cv.muted, fontFamily: cvFonts.mono }}>&rarr;</div>
              <div
                style={{
                  opacity: morph,
                  transform: `scale(${interpolate(morph, [0, 1], [0.6, 1])})`,
                }}
              >
                <ToIcon size={26} color={cv.terminalGreen} />
              </div>
              <div style={{ fontFamily: cvFonts.display, fontSize: 20, color: cv.ink }}>{b}</div>
            </div>
          );
        })}
      </div>
    </Backdrop>
  );
};

export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 20, fps, config: { damping: 18 } });
  const l2 = spring({ frame: frame - 220, fps, config: { damping: 16, stiffness: 150 } });
  const iconsIn = spring({ frame: frame - 280, fps, config: { damping: 15, stiffness: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1000px 600px at 50% 55%, ${cv.terminalGreen}18, transparent 65%), ${cv.bg}`,
      }}
    >
      <GridBg opacity={0.05} color={cv.terminalGreen} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 80 }}>
        <div
          style={{
            opacity: l1,
            transform: `translateY(${interpolate(l1, [0, 1], [20, 0])}px)`,
            fontFamily: cvFonts.display,
            fontSize: 46,
            fontWeight: 700,
            color: cv.ink,
            maxWidth: 1100,
            lineHeight: 1.2,
          }}
        >
          A full microservices system in ~70 lines of Python.
        </div>
        <div style={{ height: 30 }} />
        <div
          style={{
            opacity: l2,
            transform: `scale(${interpolate(l2, [0, 1], [0.9, 1])})`,
            fontFamily: cvFonts.mono,
            fontSize: 22,
            color: cv.terminalGreen,
            letterSpacing: 1,
          }}
        >
          HashMap for state. Queue for decoupling.
        </div>
        <div style={{ height: 40 }} />
        <div
          style={{
            display: "flex",
            gap: 26,
            opacity: iconsIn,
            transform: `translateY(${interpolate(iconsIn, [0, 1], [16, 0])}px)`,
          }}
        >
          <IconHashMap size={40} color={cv.func} />
          <IconQueue size={40} color={cv.string} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
