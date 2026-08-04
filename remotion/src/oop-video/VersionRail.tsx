import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { c, fonts, radius, VERSIONS } from "./theme";
import { ease, idlePulse } from "./motion";
import { useVideoConfig } from "remotion";

/**
 * Persistent v1..v4 rail.
 *
 * Without this, the four-version arc is rendered in exactly two places (the
 * hook and the comparison) and the ~2m50s of body between them has no
 * positional cue at all -- every segment reads as an unrelated slide.
 *
 * The rail also *pre-states* the argument: completed versions keep a coral or
 * green dot, so by the time v4 is on screen the viewer has already seen three
 * coral and one green before the comparison scene says a word about it.
 *
 * Driven off the segments file, so it survives every cut.
 */

/** Global frame where each version's block of segments begins. */
const VERSION_START = [850, 1964, 3005, 4098];
/** Rail is hidden during the hook and the wrap-up -- those scenes are the
 *  whole frame's subject and a rail would compete. */
const RAIL_IN = 850;
const RAIL_OUT = 8360;

export const VersionRail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < RAIL_IN - 30 || frame > RAIL_OUT + 20) return null;

  const appear = ease(frame, RAIL_IN - 20, fps, "SETTLE");
  const disappear = 1 - Math.max(0, Math.min(1, (frame - RAIL_OUT) / 20));
  const railOpacity = appear * disappear;

  // which version is currently active
  let active = 0;
  for (let i = 0; i < VERSION_START.length; i += 1) {
    if (frame >= VERSION_START[i]) active = i;
  }

  // the indicator slides between slots instead of cutting
  const SLOT = 62;
  const prev = Math.max(0, active - 1);
  const slide = ease(frame, VERSION_START[active], fps, "SETTLE");
  const indicatorY = interpolate(slide, [0, 1], [prev * SLOT, active * SLOT]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: railOpacity }}>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* the sliding active indicator */}
        <div
          style={{
            position: "absolute",
            left: -12,
            top: indicatorY + 8,
            width: 3,
            height: 28,
            borderRadius: 2,
            background: VERSIONS[active].modified ? c.noise : c.hit,
            boxShadow: `0 0 10px ${VERSIONS[active].modified ? c.noise : c.hit}88`,
          }}
        />

        {VERSIONS.map((v, i) => {
          const isActive = i === active;
          const isDone = i < active;
          const color = v.modified ? c.noise : c.hit;
          const pulse = idlePulse(frame, 96, i);
          return (
            <div
              key={v.n}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                opacity: isActive ? 1 : isDone ? 0.5 : 0.24,
                transform: `scale(${isActive ? 1 + pulse * 0.012 : 0.86})`,
                background: isActive ? c.bgLift : "transparent",
                border: `1.5px solid ${isActive ? `${color}77` : c.panelLine}`,
                boxShadow: isActive ? `0 8px 22px rgba(0,0,0,0.5), 0 0 ${10 + pulse * 12}px ${color}22` : "none",
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 20,
                color: isActive ? color : c.muted,
              }}
            >
              v{v.n}
              {/* completed verdict dot -- the arc, pre-stated */}
              {isDone && (
                <span
                  style={{
                    position: "absolute",
                    right: -5,
                    top: -4,
                    width: 8,
                    height: 8,
                    borderRadius: radius.pill,
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
