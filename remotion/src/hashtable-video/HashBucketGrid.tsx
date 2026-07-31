import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import type { TimedHashEvent } from "./hashEvents";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

type Entry = { key: string; value: string };

// A pill mid-flight during a resize reshuffle: which bucket it came from,
// which bucket it's going to, and the frame the flight started.
type FlightPill = { key: string; fromIndex: number; toIndex: number; startAt: number };

type Snapshot = {
  capacity: number;
  buckets: Entry[][];
  lastEventAt: number;
  lastEventType: "insert" | "resize" | null;
  lastInsertKey: string | null;
  lastInsertWasCollision: boolean;
  resizeAt: number | null;
  resizeOldCapacity: number | null;
  flightPills: FlightPill[]; // reshuffling entries, keyed by insert order during the active resize
};

const RESHUFFLE_STAGGER = 5; // frames between each re-inserted pill starting its flight
const RESHUFFLE_FLIGHT_FRAMES = 26;

const buildSnapshot = (events: TimedHashEvent[], frame: number): Snapshot => {
  let capacity = (events.find((e) => e.event.type === "insert")?.event as any)?.capacity ?? 8;
  let buckets: Entry[][] = Array.from({ length: capacity }, () => []);

  let lastEventAt = -999;
  let lastEventType: Snapshot["lastEventType"] = null;
  let lastInsertKey: string | null = null;
  let lastInsertWasCollision = false;
  let resizeAt: number | null = null;
  let resizeOldCapacity: number | null = null;
  let preResizeBuckets: Entry[][] = [];
  const flightPills: FlightPill[] = [];
  let reshuffleIdx = 0;

  for (const { at, event } of events) {
    if (at > frame) break;
    if (event.type === "insert") {
      if (event.capacity !== buckets.length) {
        buckets = Array.from({ length: event.capacity }, () => []);
      }
      capacity = event.capacity;

      const isReshuffleInsert = resizeAt !== null && at > resizeAt && at <= resizeAt + 40;
      if (isReshuffleInsert) {
        const fromIndex = preResizeBuckets.findIndex((b) => b.some((e) => e.key === event.key));
        const startAt = resizeAt! + 14 + reshuffleIdx * RESHUFFLE_STAGGER;
        flightPills.push({ key: event.key, fromIndex: fromIndex >= 0 ? fromIndex : event.bucket_index, toIndex: event.bucket_index, startAt });
        reshuffleIdx += 1;
        // land the pill in its bucket once its flight would have finished
        if (frame >= startAt + RESHUFFLE_FLIGHT_FRAMES) {
          buckets[event.bucket_index].push({ key: event.key, value: event.key.toUpperCase() });
        }
      } else {
        const bucket = buckets[event.bucket_index];
        const existingIdx = bucket.findIndex((e) => e.key === event.key);
        if (existingIdx >= 0) bucket[existingIdx] = { key: event.key, value: event.key.toUpperCase() };
        else bucket.push({ key: event.key, value: event.key.toUpperCase() });
      }

      lastEventAt = at;
      lastEventType = "insert";
      lastInsertKey = event.key;
      lastInsertWasCollision = event.is_collision;
    } else {
      preResizeBuckets = buckets.map((b) => [...b]);
      resizeOldCapacity = event.old_capacity;
      capacity = event.new_capacity;
      buckets = Array.from({ length: event.new_capacity }, () => []);
      lastEventAt = at;
      lastEventType = "resize";
      resizeAt = at;
      reshuffleIdx = 0;
    }
  }

  // only keep flight pills that haven't landed yet (still animating)
  const activeFlights = flightPills.filter((p) => frame < p.startAt + RESHUFFLE_FLIGHT_FRAMES);

  return {
    capacity,
    buckets,
    lastEventAt,
    lastEventType,
    lastInsertKey,
    lastInsertWasCollision,
    resizeAt,
    resizeOldCapacity,
    flightPills: activeFlights,
  };
};

export const HashBucketGrid: React.FC<{
  events: TimedHashEvent[];
  width?: number;
}> = ({ events, width = 640 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = buildSnapshot(events, frame);

  const isResizing = snap.resizeAt !== null && frame - snap.resizeAt < 55;
  const resizeLocal = snap.resizeAt !== null ? frame - snap.resizeAt : 999;

  // pre-resize shake cue: a brief jolt right as the resize event fires
  const shakeX = isResizing && resizeLocal >= 0 && resizeLocal < 10 ? Math.sin(resizeLocal * 3) * (10 - resizeLocal) * 0.6 : 0;

  const displayCapacity = isResizing
    ? Math.round(
        interpolate(resizeLocal, [0, 20], [snap.resizeOldCapacity ?? snap.capacity, snap.capacity], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      )
    : snap.capacity;

  const boxCount = Math.max(snap.capacity, displayCapacity);
  const boxW = Math.min(84, (width - (boxCount - 1) * 10) / boxCount);
  const gap = 10;
  const boxH = 130;

  const isCollisionMoment = snap.lastEventType === "insert" && snap.lastInsertWasCollision && frame - snap.lastEventAt < 45;
  const collisionLocal = frame - snap.lastEventAt;
  const shockOpacity = isCollisionMoment
    ? interpolate(collisionLocal, [0, 8, 30], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const shockScale = isCollisionMoment
    ? interpolate(collisionLocal, [0, 30], [0.6, 1.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const centerXOf = (index: number) => index * (boxW + gap) + boxW / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, transform: `translateX(${shakeX}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: cvFonts.mono, fontSize: 13, color: cv.muted, letterSpacing: 1, textTransform: "uppercase" }}>
          buckets
        </span>
        <span style={{ fontFamily: cvFonts.mono, fontSize: 15, color: cv.ink, fontWeight: 700 }}>
          capacity {displayCapacity}
        </span>
      </div>

      <div style={{ position: "relative", display: "flex", gap }}>
        {Array.from({ length: boxCount }).map((_, i) => {
          const bucket = snap.buckets[i] ?? [];
          const isNewBox = i >= (snap.resizeOldCapacity ?? boxCount);
          const boxIn = isNewBox ? ease(frame, (snap.resizeAt ?? 0) + 4 + i * 1.2, fps, 14, 210) : 1;
          const isCollided = isCollisionMoment && bucket.length > 1 && bucket.some((e) => e.key === snap.lastInsertKey);
          // a bucket that just received a reshuffled pill briefly gets a
          // "comfortable" neutral-tint pulse instead of the crowded amber
          // it may have shown pre-resize
          const justResolved = snap.resizeAt !== null && frame - snap.resizeAt < 55 && bucket.length <= 1;

          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: boxW,
                opacity: boxIn,
                transform: `scale(${interpolate(boxIn, [0, 1], [0.7, 1])})`,
              }}
            >
              {isCollided && shockOpacity > 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: 14,
                    border: `2px solid ${cv.terminalRed}`,
                    transform: `scale(${shockScale})`,
                    opacity: shockOpacity,
                    pointerEvents: "none",
                  }}
                />
              )}
              <div
                style={{
                  minHeight: boxH,
                  border: `2px solid ${isCollided ? cv.terminalRed : justResolved ? cv.terminalGreen : cv.panelLine}`,
                  background: isCollided ? `${cv.terminalRed}14` : justResolved ? `${cv.terminalGreen}0d` : cv.panel,
                  borderRadius: 12,
                  padding: "8px 6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: isCollided ? `0 0 20px ${cv.terminalRed}55` : "none",
                  transition: "none",
                }}
              >
                <div style={{ textAlign: "center", fontFamily: cvFonts.mono, fontSize: 12, color: cv.muted, marginBottom: 2 }}>
                  {i}
                </div>
                {bucket.map((entry, ei) => {
                  const isThisEntryNew =
                    snap.lastEventType === "insert" && snap.lastInsertKey === entry.key && frame - snap.lastEventAt < 20;
                  const dropIn = isThisEntryNew ? ease(frame, snap.lastEventAt, fps, 11, 260) : 1;
                  const crowded = bucket.length > 1;
                  const pillColor = crowded ? cv.number : cv.func;
                  // shrink the font for longer keys instead of truncating with
                  // an ellipsis -- every key should stay fully legible, per
                  // the "both fully visible, not overlapping/hidden" spec.
                  const pillFontSize = entry.key.length <= 6 ? 12.5 : entry.key.length <= 9 ? 10.5 : 9;
                  return (
                    <div
                      key={entry.key}
                      style={{
                        opacity: dropIn,
                        transform: `translateY(${interpolate(dropIn, [0, 1], [-14, 0])}px) scale(${interpolate(dropIn, [0, 1], [0.7, 1])})`,
                        fontFamily: cvFonts.mono,
                        fontSize: pillFontSize,
                        fontWeight: 700,
                        color: pillColor,
                        background: `${pillColor}1a`,
                        border: `1px solid ${pillColor}66`,
                        borderRadius: 7,
                        padding: "3px 4px",
                        textAlign: "center",
                        marginBottom: ei < bucket.length - 1 ? 3 : 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {entry.key}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* in-flight reshuffle pills: traced along a curved path from their
            old bucket's screen position to their new one, on top of the
            static grid, so re-shuffling reads as real motion, not a swap. */}
        {snap.flightPills.map((p) => {
          const local = frame - p.startAt;
          const t = interpolate(local, [0, RESHUFFLE_FLIGHT_FRAMES], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fromX = centerXOf(p.fromIndex);
          const toX = centerXOf(p.toIndex);
          const x = interpolate(t, [0, 1], [fromX, toX]);
          // curved arc: rise up and over rather than a flat straight line
          const arcHeight = 46;
          const y = -Math.sin(t * Math.PI) * arcHeight;
          const settle = ease(frame, p.startAt + RESHUFFLE_FLIGHT_FRAMES - 6, fps, 12, 240);
          const opacity = interpolate(local, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div
              key={p.key}
              style={{
                position: "absolute",
                left: x,
                top: boxH / 2 + y,
                transform: `translate(-50%, -50%) scale(${1 + (1 - settle) * 0.15})`,
                opacity,
                fontFamily: cvFonts.mono,
                fontSize: 12.5,
                fontWeight: 700,
                color: cv.func,
                background: `${cv.func}22`,
                border: `1px solid ${cv.func}88`,
                borderRadius: 7,
                padding: "3px 8px",
                boxShadow: `0 0 10px ${cv.func}55`,
                whiteSpace: "nowrap",
                zIndex: 5,
              }}
            >
              {p.key}
            </div>
          );
        })}
      </div>
    </div>
  );
};
