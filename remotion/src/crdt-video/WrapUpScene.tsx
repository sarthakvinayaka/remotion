import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { GridBg } from "../components/shared";
import { NodeCounterBoard, type BoardEvent, type NodeId } from "./NodeCounterBoard";

const RECAP_NODES: NodeId[] = ["A", "B", "C"];
// A compact, looping fast-forward replay of the whole story in one board:
// A and B increment independently, then merge both ways, then C joins in --
// a visual "everything you just learned, at a glance" capstone.
const RECAP_EVENTS: BoardEvent[] = [
  { type: "increment", at: 40, node: "A" },
  { type: "increment", at: 60, node: "B" },
  { type: "increment", at: 80, node: "C" },
  { type: "merge", at: 160, from: "A", into: "B" },
  { type: "merge", at: 200, from: "B", into: "C" },
  { type: "merge", at: 240, from: "C", into: "A" },
];

// Word anchors (local frames, 0 = "So that's a fully working CRDT counter"):
//   recap line 0-384   "full code in description" 466-525
//   "PN-Counter next? let me know" 527-699   "see you in the next one" 704-750
export const WrapUpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 10, fps, config: { damping: 18 } });
  const l2 = spring({ frame: frame - 466, fps, config: { damping: 16, stiffness: 150 } });
  const l3 = spring({ frame: frame - 527, fps, config: { damping: 15, stiffness: 200 } });
  const stepsIn = spring({ frame: frame - 140, fps, config: { damping: 15, stiffness: 200 } });

  const steps = [
    { label: "each node tracks its own slot", color: cv.func },
    { label: "increment only touches your own slot", color: cv.string },
    { label: "merge takes the max per slot", color: cv.keyword },
    { label: "total = sum of everything", color: cv.terminalGreen },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1000px 600px at 50% 45%, ${cv.func}18, transparent 65%), ${cv.bg}`,
      }}
    >
      <GridBg opacity={0.05} color={cv.func} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 80, gap: 30 }}>
        <div
          style={{
            opacity: l1,
            transform: `translateY(${interpolate(l1, [0, 1], [20, 0])}px)`,
            fontFamily: cvFonts.display,
            fontSize: 44,
            fontWeight: 700,
            color: cv.ink,
            maxWidth: 1000,
            lineHeight: 1.2,
          }}
        >
          A fully working CRDT counter.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((s, i) => {
              const stepS = spring({ frame: frame - (140 + i * 22), fps, config: { damping: 16, stiffness: 200 } });
              return (
                <div
                  key={s.label}
                  style={{
                    opacity: stepS,
                    transform: `translateX(${interpolate(stepS, [0, 1], [-14, 0])}px)`,
                    fontFamily: cvFonts.mono,
                    fontSize: 20,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
                  {s.label}
                </div>
              );
            })}
          </div>

          {frame >= 230 && (
            <div
              style={{
                opacity: spring({ frame: frame - 230, fps, config: { damping: 16, stiffness: 200 } }),
              }}
            >
              <NodeCounterBoard nodes={RECAP_NODES} events={RECAP_EVENTS} scale={0.5} showTotals={false} />
            </div>
          )}
        </div>

        {frame >= 466 && (
          <div
            style={{
              opacity: l2,
              transform: `scale(${interpolate(l2, [0, 1], [0.9, 1])})`,
              fontFamily: cvFonts.mono,
              fontSize: 18,
              color: cv.muted,
              marginTop: 10,
            }}
          >
            Full code down in the description.
          </div>
        )}

        {frame >= 527 && (
          <div
            style={{
              opacity: l3,
              transform: `translateY(${interpolate(l3, [0, 1], [16, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: cvFonts.display,
                fontSize: 26,
                fontWeight: 700,
                color: cv.ink,
              }}
            >
              Want the <span style={{ color: cv.keyword }}>PN-Counter</span> version next?
            </div>
            <div style={{ fontFamily: cvFonts.mono, fontSize: 16, color: cv.terminalGreen }}>
              let me know in the comments &mdash; see you in the next one.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
