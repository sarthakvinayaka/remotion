import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import type { TimedGptEvent } from "./gptEvents";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

const CONTEXT_SIZE = 2;
const SLIDE_FRAMES = 16;

type Snapshot = {
  ids: number[];
  words: string[];
  lastAppendAt: number;
};

// Replays generate_start/append/decoded events up to `frame` into the
// current token sequence -- the source of truth for both the growing
// timeline and the sliding "last 2 tokens" bracket. Only ever reads the one
// run marked `activeRun` (or events with no `run` field at all), so this
// same component can drive either the single first-generation demo or one
// specific run of the three-run replay.
const buildSnapshot = (events: TimedGptEvent[], frame: number, activeRun?: number): Snapshot => {
  let ids: number[] = [];
  let words: string[] = [];
  let lastAppendAt = -999;
  const idToWord = new Map<number, string>();

  for (const { at, event } of events) {
    if (at > frame) break;
    if ("run" in event && event.run !== undefined && event.run !== activeRun) continue;
    if (event.type === "candidates") {
      for (const c of event.candidates) idToWord.set(c.id, c.word);
    }
    if (event.type === "generate_start") {
      ids = [...event.context_ids];
      words = ids.map((id) => idToWord.get(id) ?? "?");
    } else if (event.type === "append") {
      if (event.context_ids.length > ids.length) lastAppendAt = at;
      ids = [...event.context_ids];
      words = ids.map((id) => idToWord.get(id) ?? "?");
    } else if (event.type === "decoded") {
      ids = [...event.ids];
      words = [...event.words];
    }
  }
  return { ids, words, lastAppendAt };
};

export const ContextWindow: React.FC<{
  events: TimedGptEvent[];
  activeRun?: number;
  width?: number;
}> = ({ events, activeRun, width = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = buildSnapshot(events, frame, activeRun);

  if (snap.ids.length === 0) return <div style={{ height: 90 }} />;

  const chipW = 64;
  const gap = 10;
  const isAppending = frame - snap.lastAppendAt < SLIDE_FRAMES;
  const slideT = isAppending
    ? interpolate(frame - snap.lastAppendAt, [0, SLIDE_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // Scroll so the bracket (last 2 tokens) always stays comfortably in view,
  // sliding smoothly rather than jumping when a new token pushes it along.
  const totalW = snap.ids.length * (chipW + gap);
  const idealScroll = Math.max(0, totalW - width);
  const prevIdealScroll = Math.max(0, (snap.ids.length - 1) * (chipW + gap) - width);
  const scrollX = interpolate(slideT, [0, 1], [prevIdealScroll, idealScroll]);

  const bracketStart = Math.max(0, snap.ids.length - CONTEXT_SIZE);
  const bracketX = bracketStart * (chipW + gap) - scrollX;
  const bracketW = Math.min(CONTEXT_SIZE, snap.ids.length) * chipW + (Math.min(CONTEXT_SIZE, snap.ids.length) - 1) * gap;

  return (
    <div style={{ width, position: "relative", overflow: "hidden", height: 110 }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
        context window
      </div>
      <div style={{ position: "relative", height: 64 }}>
        <div style={{ position: "absolute", left: -scrollX, top: 0, display: "flex", gap, transition: "none" }}>
          {snap.ids.map((id, i) => {
            const isNew = i === snap.ids.length - 1 && isAppending;
            const isInContext = i >= bracketStart;
            const enterIn = isNew ? ease(frame, snap.lastAppendAt, fps, 14, 220) : 1;
            const dimmed = !isInContext;
            return (
              <div
                key={i}
                style={{
                  width: chipW,
                  height: 44,
                  flexShrink: 0,
                  opacity: isNew ? enterIn : dimmed ? 0.4 : 1,
                  transform: isNew ? `translateX(${interpolate(enterIn, [0, 1], [40, 0])}px)` : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  border: `1.5px solid ${isInContext ? cv.func : cv.panelLine}`,
                  background: isInContext ? `${cv.func}14` : cv.panel,
                  borderRadius: 8,
                }}
              >
                <div style={{ fontFamily: cvFonts.mono, fontSize: 13, fontWeight: 700, color: isInContext ? cv.func : cv.muted }}>
                  {id}
                </div>
                <div style={{ fontFamily: cvFonts.mono, fontSize: 9, color: cv.muted }}>{snap.words[i]}</div>
              </div>
            );
          })}
        </div>

        {/* the bracket -- always wraps exactly the last 2 chips, sliding in
            the same motion as new tokens appending */}
        <div
          style={{
            position: "absolute",
            left: bracketX,
            top: -10,
            width: bracketW,
            height: 64,
            border: `2px solid ${cv.terminalGreen}`,
            borderRadius: 10,
            boxShadow: `0 0 14px ${cv.terminalGreen}44`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};
