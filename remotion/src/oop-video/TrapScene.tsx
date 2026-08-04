import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 2374. Local = global - 2374.
 *    0 (2374) "But look at the bottom of the service class"
 *   57 (2431) "the if-else chain is still there"
 *  116 (2490) "we moved the mess, we didn't remove it"
 *  183 (2557) "This is the trap I want to point out"
 *  249 (2623) "because a lot of code looks like this in production"
 *  352 (2726) "Using classes doesn't automatically mean you're doing OOP well"
 *  448 (2822) "If your code still asks what type is this"
 *  513 (2887) "before deciding what to do, you haven't finished the job"
 *
 * The script's note: DON'T SKIP THIS BEAT. "You used classes but you're still
 * checking types" is the most useful thing in the video.
 */

const CHAIN_AT = 57;
const MOVED_AT = 116;
const TRAP_AT = 183;
const NOT_OOP_AT = 352;
const STILL_ASKS_AT = 448;

export const TrapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const movedIn = ease(frame, MOVED_AT, fps, "SETTLE");
  const notOopIn = ease(frame, NOT_OOP_AT, fps, "SETTLE");
  const asksIn = ease(frame, STILL_ASKS_AT, fps, "SLOW");
  const chainIn = ramp(frame, CHAIN_AT, 24);
  const pulse = idlePulse(frame, 88, 1);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.noise} />
      <AmbientGlow color={c.noise} seed={3} />

      <Scene chip="the trap" chipColor={c.noise}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            We moved the mess — we didn't <span style={{ color: c.noise }}>remove</span> it
          </Sub>

          {/* the if/else that survived the refactor */}
          <div
            style={{
              opacity: chainIn,
              transform: `scale(${interpolate(chainIn, [0, 1], [0.94, 1])})`,
              padding: space.lg,
              borderRadius: radius.lg,
              ...surface(c.noise, true),
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 44px rgba(0,0,0,0.55), 0 0 ${16 + pulse * 20}px ${c.noise}26`,
              fontFamily: fonts.mono,
              fontSize: 34,
              lineHeight: 1.55,
              color: c.noise,
            }}
          >
            <div>if kind == "email": …</div>
            <div>elif kind == "sms": …</div>
            <div>elif kind == "push": …</div>
          </div>

          {notOopIn > 0.02 && (
            <div
              style={{
                opacity: notOopIn * (asksIn > 0.5 ? 0.45 : 1),
                ...type.body,
                fontSize: 30,
                color: c.inkDim,
                textAlign: "center",
              }}
            >
              Using classes doesn't automatically mean you're doing OOP well.
            </div>
          )}

          {asksIn > 0.02 && (
            <div
              style={{
                opacity: asksIn,
                transform: `translateY(${interpolate(asksIn, [0, 1], [18, 0])}px)`,
                ...type.sub,
                fontSize: 46,
                color: c.ink,
                textAlign: "center",
                maxWidth: 1400,
              }}
            >
              Still asking <span style={{ color: c.noise }}>"what type is this?"</span>
              <br />
              You haven't finished the job.
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
