import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";

// Declarative event log driving the whole board -- each scene passes a list
// of "things that happen" (increment on a node, or a merge between two
// nodes) with a local frame each fires at. The board derives every node's
// live per-slot counts at the current frame by replaying events <= now, so
// there's one source of truth instead of separately-animated numbers that
// could drift out of sync with each other.
export type NodeId = "A" | "B" | "C";
export type BoardEvent =
  | { type: "increment"; at: number; node: NodeId }
  | { type: "merge"; at: number; from: NodeId; into: NodeId };

const NODE_COLOR: Record<NodeId, string> = {
  A: cv.func,
  B: cv.string,
  C: cv.keyword,
};

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

const emptyCounts = (nodes: NodeId[]): Record<NodeId, Record<NodeId, number>> => {
  const base: Record<NodeId, number> = {} as any;
  for (const n of nodes) base[n] = 0;
  const out: Record<NodeId, Record<NodeId, number>> = {} as any;
  for (const n of nodes) out[n] = { ...base };
  return out;
};

export const NodeCounterBoard: React.FC<{
  nodes: NodeId[];
  events: BoardEvent[];
  showTotals?: boolean;
  scale?: number;
}> = ({ nodes, events, showTotals = true, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Replay every event whose time has come to get each node's current slots.
  const counts = emptyCounts(nodes);
  for (const e of events) {
    if (e.at > frame) continue;
    if (e.type === "increment") {
      counts[e.node][e.node] += 1;
    } else {
      for (const n of nodes) {
        counts[e.into][n] = Math.max(counts[e.into][n], counts[e.from][n]);
      }
    }
  }

  // Most recent event still animating (pulse / flow), so we know which node
  // to highlight and, for merges, where the flow line should be drawn.
  const activeEvent = [...events].reverse().find((e) => frame - e.at >= 0 && frame - e.at < 40);

  const boxW = 168 * scale;
  const gap = 46 * scale;
  const totalW = nodes.length * boxW + (nodes.length - 1) * gap;

  const nodeX: Record<string, number> = {};
  nodes.forEach((n, i) => {
    nodeX[n] = i * (boxW + gap) + boxW / 2;
  });

  return (
    <div style={{ position: "relative", width: totalW, height: 320 * scale }}>
      {/* merge flow line + traveling token */}
      {activeEvent && activeEvent.type === "merge" && (
        <MergeFlow
          fromX={nodeX[activeEvent.from]}
          toX={nodeX[activeEvent.into]}
          localFrame={frame - activeEvent.at}
          fps={fps}
          color={NODE_COLOR[activeEvent.from]}
          y={boxW / 2}
        />
      )}

      <div style={{ display: "flex", gap, position: "relative" }}>
        {nodes.map((n) => {
          const pulse =
            activeEvent &&
            ((activeEvent.type === "increment" && activeEvent.node === n) ||
              (activeEvent.type === "merge" && activeEvent.into === n))
              ? ease(frame, activeEvent.at, fps, 10, 260)
              : 1;
          const pulseScale = activeEvent
            ? interpolate(frame - activeEvent.at, [0, 8, 40], [1, 1.08, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;
          const isPulsing =
            activeEvent &&
            ((activeEvent.type === "increment" && activeEvent.node === n) ||
              (activeEvent.type === "merge" && activeEvent.into === n));
          const color = NODE_COLOR[n];
          const total = nodes.reduce((a, k) => a + counts[n][k], 0);

          return (
            <div
              key={n}
              style={{
                width: boxW,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12 * scale,
              }}
            >
              <div
                style={{
                  width: boxW,
                  borderRadius: 18 * scale,
                  border: `2.5px solid ${color}`,
                  background: `${color}14`,
                  boxShadow: isPulsing ? `0 0 32px ${color}77` : `0 0 18px ${color}22`,
                  padding: `${16 * scale}px ${14 * scale}px`,
                  transform: `scale(${pulseScale})`,
                }}
              >
                <div
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 15 * scale,
                    fontWeight: 700,
                    color,
                    textAlign: "center",
                    letterSpacing: 1,
                    marginBottom: 10 * scale,
                  }}
                >
                  NODE {n}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 * scale }}>
                  {nodes.map((slot) => {
                    const justChanged =
                      isPulsing && activeEvent!.type === "increment"
                        ? slot === n
                        : isPulsing && activeEvent!.type === "merge"
                          ? slot === activeEvent!.from
                          : false;
                    return (
                      <div
                        key={slot}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontFamily: cvFonts.mono,
                          fontSize: 15 * scale,
                          padding: `${3 * scale}px ${6 * scale}px`,
                          borderRadius: 6 * scale,
                          background: justChanged ? `${color}33` : "transparent",
                        }}
                      >
                        <span style={{ color: cv.muted }}>{slot}:</span>
                        <span
                          style={{
                            color: justChanged ? color : cv.ink,
                            fontWeight: justChanged ? 700 : 400,
                          }}
                        >
                          {counts[n][slot]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {showTotals && (
                <div
                  style={{
                    fontFamily: cvFonts.mono,
                    fontSize: 14 * scale,
                    color: cv.muted,
                  }}
                >
                  total = <span style={{ color, fontWeight: 700 }}>{total}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MergeFlow: React.FC<{
  fromX: number;
  toX: number;
  localFrame: number;
  fps: number;
  color: string;
  y: number;
}> = ({ fromX, toX, localFrame, fps, color, y }) => {
  const t = interpolate(localFrame, [0, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(localFrame, [0, 4, 22, 30], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(t, [0, 1], [fromX, toX]);
  const s = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 200 } });

  return (
    <svg
      width="100%"
      height={y + 40}
      style={{ position: "absolute", top: -50, left: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <line
        x1={fromX}
        y1={0}
        x2={toX}
        y2={0}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 6"
        opacity={opacity * 0.5}
      />
      <circle cx={x} cy={0} r={9 * s} fill={color} opacity={opacity} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
    </svg>
  );
};
