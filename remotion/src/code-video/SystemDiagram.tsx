import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts, serviceColor } from "./theme";
import type { TraceLine } from "./TerminalOutput";
import { parseTrace, deriveStages, computeEntityStates } from "./traceParser";

// Full-bleed visualization of what the code is conceptually doing: a row of
// big stage cards (one per distinct service seen in the trace) with tokens
// flowing left-to-right between them, and a HashMap readout underneath
// showing the current status of each entity. Driven entirely by the generic
// parsed trace -- nothing here names "order", "payment", etc. directly.
export const SystemDiagram: React.FC<{
  trace: TraceLine[];
  startFrame: number;
  endFrame: number;
  title?: string;
}> = ({ trace, startFrame, endFrame, title = "what's actually happening" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const events = React.useMemo(() => parseTrace(trace), [trace]);
  const stages = React.useMemo(() => deriveStages(events), [events]);

  if (events.length === 0 || stages.length === 0) return null;

  const localFrame = frame - startFrame;
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const upToOrder = progress * events[events.length - 1].order;
  const visibleEvents = events.filter((e) => e.order <= upToOrder);
  const entities = computeEntityStates(events, stages, upToOrder);

  const frameForOrder = (order: number) =>
    interpolate(order, [0, events[events.length - 1].order], [startFrame, endFrame], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const stageW = 210;
  const stageH = 110;
  const stageGap = 70;
  const stagesTotalW = stages.length * stageW + (stages.length - 1) * stageGap;

  const titleIn = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ background: cv.bg, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 50,
          fontFamily: cvFonts.mono,
          fontSize: 16,
          color: cv.muted,
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: titleIn,
        }}
      >
        {title}
      </div>

      {/* Stage flow */}
      <div style={{ position: "relative", width: stagesTotalW, height: stageH + 40 }}>
        <div style={{ display: "flex", gap: stageGap, alignItems: "center" }}>
          {stages.map((stage, i) => (
            <div key={stage} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: stageW,
                  height: stageH,
                  borderRadius: 18,
                  border: `2px solid ${serviceColor(stage)}`,
                  background: `${serviceColor(stage)}14`,
                  boxShadow: `0 0 30px ${serviceColor(stage)}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 22,
                    fontWeight: 700,
                    color: serviceColor(stage),
                    lineHeight: 1.25,
                  }}
                >
                  {stage}
                </span>
              </div>
              {i < stages.length - 1 && (
                <svg width={stageGap} height={24} style={{ overflow: "visible" }}>
                  <line x1={0} y1={12} x2={stageGap - 8} y2={12} stroke={cv.panelLine} strokeWidth={2} />
                  <polygon
                    points={`${stageGap - 8},6 ${stageGap},12 ${stageGap - 8},18`}
                    fill={cv.panelLine}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Animated tokens moving between stages */}
        {entities.map((e) => {
          const lastEvt = [...visibleEvents].reverse().find((ev) => ev.entityId === e.id);
          if (!lastEvt || e.atStage < 0) return null;
          const prevStage = Math.max(0, e.atStage - 1);
          const moveStartFrame = frameForOrder(lastEvt.order) - 16;
          const moveEnd = frameForOrder(lastEvt.order);
          const t = interpolate(frame, [moveStartFrame, moveEnd], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const s = spring({ frame: frame - moveStartFrame, fps, config: { damping: 14, stiffness: 170 } });
          const xFrom = prevStage * (stageW + stageGap) + stageW / 2;
          const xTo = e.atStage * (stageW + stageGap) + stageW / 2;
          const x = interpolate(t, [0, 1], [xFrom, xTo]);
          const color = serviceColor(stages[e.atStage]);
          return (
            <div
              key={`${e.id}-token`}
              style={{
                position: "absolute",
                left: x,
                top: -26,
                transform: `translateX(-50%) scale(${s})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                opacity: s,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: color,
                  boxShadow: `0 0 14px ${color}`,
                }}
              />
              <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted }}>{e.id}</div>
            </div>
          );
        })}
      </div>

      {/* HashMap readout */}
      <div
        style={{
          marginTop: 70,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: stagesTotalW + 200,
        }}
      >
        {entities.slice(-4).map((e) => {
          const firstEvt = events.find((ev) => ev.entityId === e.id);
          const enterFrame = firstEvt ? frameForOrder(firstEvt.order) : startFrame;
          const s = spring({ frame: frame - enterFrame, fps, config: { damping: 16, stiffness: 200 } });
          return (
            <div
              key={e.id}
              style={{
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: cvFonts.mono,
                fontSize: 17,
                background: cv.panel,
                border: `1.5px solid ${cv.panelLine}`,
                borderRadius: 10,
                padding: "10px 16px",
              }}
            >
              <span style={{ color: cv.ink }}>{e.id}</span>
              <StatusPill status={e.status} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const STATUS_COLOR: Record<string, string> = {
  CREATED: cv.muted,
  PAID: cv.number,
  INVENTORY_RESERVED: cv.string,
  COMPLETED: cv.terminalGreen,
  FAILED: cv.terminalRed,
};

const StatusPill: React.FC<{ status: string | null }> = ({ status }) => {
  if (!status) return null;
  const color = STATUS_COLOR[status] ?? cv.muted;
  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        color,
        border: `1px solid ${color}66`,
        borderRadius: 999,
        padding: "3px 10px",
        letterSpacing: 0.5,
      }}
    >
      {status}
    </span>
  );
};
