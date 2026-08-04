import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, CHANNELS, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp } from "./motion";
import { SideTitle } from "./OopCodeScene";
import { surface } from "./ui";

/**
 * The retry loop, copy-pasted three times. This is the v1 growth beat: the
 * duplication IS the problem, so the panel shows three identical blocks and
 * marks them as one bug in three places.
 */
export const DuplicatedRetry: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;
  const verdict = ease(frame, startAt + 150, fps, "SLOW");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: panelIn }}>
      <SideTitle color={c.noise}>the same retry loop, 3×</SideTitle>
      {CHANNELS.map((ch, i) => {
        const inn = ease(frame, startAt + i * 26, fps, "ENTER");
        const pulse = idlePulse(frame, 86, i);
        return (
          <div
            key={ch}
            style={{
              opacity: inn,
              transform: `translateY(${interpolate(inn, [0, 1], [14, 0])}px)`,
              padding: space.sm,
              borderRadius: radius.md,
              ...surface(c.noise, true),
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 26px rgba(0,0,0,0.5), 0 0 ${8 + pulse * 12}px ${c.noise}22`,
            }}
          >
            <div style={{ ...type.meta, color: c.noise, marginBottom: 4 }}>{ch} BRANCH</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 18, color: c.inkDim, lineHeight: 1.45 }}>
              for attempt in range(3):
              <br />
              &nbsp;&nbsp;try: … except: continue
            </div>
          </div>
        );
      })}
      {verdict > 0.02 && (
        <div
          style={{
            opacity: verdict,
            ...type.body,
            fontSize: 24,
            color: c.ink,
            textAlign: "center",
            marginTop: space.xs,
          }}
        >
          one bug → <span style={{ color: c.noise }}>three places to fix</span>
        </div>
      )}
    </div>
  );
};

/**
 * "If your code still asks what type is this, you haven't finished the job."
 * The v2 trap: classes exist, but the if/else survived.
 */
export const StillAsking: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;
  const pulse = idlePulse(frame, 84, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.md, opacity: panelIn }}>
      <SideTitle color={c.noise}>the mess moved, it didn't leave</SideTitle>
      <div
        style={{
          padding: space.md,
          borderRadius: radius.lg,
          ...surface(c.noise, true),
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 34px rgba(0,0,0,0.55), 0 0 ${12 + pulse * 16}px ${c.noise}26`,
          fontFamily: fonts.mono,
          fontSize: 21,
          color: c.inkDim,
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: c.noise }}>if kind == "email":</div>
        <div style={{ color: c.noise }}>elif kind == "sms":</div>
        <div style={{ color: c.noise }}>elif kind == "push":</div>
      </div>
      <div style={{ ...type.body, fontSize: 25, color: c.ink, textAlign: "center" }}>
        still asking <span style={{ color: c.noise }}>"what type is this?"</span>
      </div>
    </div>
  );
};

/**
 * The abstraction promise: a base class guarantees shape, each notifier keeps
 * it its own way. This is the v3 "it clicks" beat.
 */
export const PromiseShape: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.sm, opacity: panelIn }}>
      <SideTitle color={c.violet}>one promise, three keepers</SideTitle>

      {/* the base class */}
      <div
        style={{
          width: "100%",
          padding: space.sm,
          borderRadius: radius.md,
          ...surface(c.violet, true),
          textAlign: "center",
        }}
      >
        <div style={{ ...type.meta, color: c.violet }}>NOTIFIER (ABC)</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 20, color: c.ink, marginTop: 2 }}>
          send(to, message)
        </div>
      </div>

      <div style={{ ...type.sub, fontSize: 26, color: c.muted, lineHeight: 1 }}>▼</div>

      {/* the three implementations */}
      <div style={{ display: "flex", gap: space.xs, width: "100%" }}>
        {CHANNELS.map((ch, i) => {
          const inn = ease(frame, startAt + 30 + i * 16, fps, "ENTER");
          const pulse = idlePulse(frame, 80, i);
          return (
            <div
              key={ch}
              style={{
                flex: 1,
                opacity: inn,
                transform: `translateY(${interpolate(inn, [0, 1], [12, 0])}px)`,
                padding: "12px 6px",
                borderRadius: radius.md,
                ...surface(c.hit, true),
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 22px rgba(0,0,0,0.45), 0 0 ${8 + pulse * 10}px ${c.hit}22`,
                textAlign: "center",
                fontFamily: fonts.mono,
                fontSize: 19,
                color: c.hit,
                fontWeight: 700,
              }}
            >
              {ch}
            </div>
          );
        })}
      </div>

      <div style={{ ...type.body, fontSize: 23, color: c.inkDim, textAlign: "center" }}>
        the service just knows it <span style={{ color: c.hit }}>has send()</span>
      </div>
    </div>
  );
};

/**
 * "I did not touch NotificationService at all. Not one line."
 * Green = added new code, coral = modified existing code.
 */
export const UntouchedService: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;
  const stamp = ease(frame, startAt + 50, fps, "ENTER");
  const pulse = idlePulse(frame, 88, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.md, opacity: panelIn }}>
      <SideTitle color={c.hit}>what changed?</SideTitle>

      <div
        style={{
          padding: space.md,
          borderRadius: radius.lg,
          ...surface(c.hit, true),
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 34px rgba(0,0,0,0.5), 0 0 ${12 + pulse * 16}px ${c.hit}26`,
          textAlign: "center",
        }}
      >
        <div style={{ ...type.meta, color: c.hit }}>ADDED</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 24, color: c.ink, marginTop: 4 }}>SlackNotifier</div>
      </div>

      {stamp > 0.02 && (
        <div
          style={{
            opacity: stamp,
            transform: `scale(${interpolate(stamp, [0, 1], [1.12, 1])}) rotate(-1.4deg)`,
            padding: space.md,
            borderRadius: radius.lg,
            border: `2px solid ${c.hit}`,
            background: `${c.hit}12`,
            textAlign: "center",
          }}
        >
          <div style={{ ...type.meta, color: c.muted }}>NOTIFICATIONSERVICE</div>
          <div style={{ ...type.sub, fontSize: 40, color: c.hit, marginTop: 2 }}>UNTOUCHED</div>
        </div>
      )}
    </div>
  );
};

/**
 * v1's panel. The narration is "this is fine -- the problem is what this code
 * BECOMES", so the panel previews the growth: each feature that gets bolted on
 * later, arriving as the reasons stack up.
 */
export const GrowthWarning: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;

  const ADDITIONS = [
    { label: "email validation", at: 0 },
    { label: "160-char SMS limit", at: 34 },
    { label: "retry on failure", at: 68 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: panelIn }}>
      <SideTitle color={c.accent}>then features get added</SideTitle>
      {ADDITIONS.map((a, i) => {
        const inn = ease(frame, startAt + a.at, fps, "ENTER");
        const pulse = idlePulse(frame, 92, i);
        return (
          <div
            key={a.label}
            style={{
              opacity: inn,
              transform: `translateX(${interpolate(inn, [0, 1], [18, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: space.sm,
              padding: "14px 18px",
              borderRadius: radius.md,
              ...surface(c.accent, true),
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 26px rgba(0,0,0,0.5), 0 0 ${8 + pulse * 10}px ${c.accent}1A`,
              fontFamily: fonts.mono,
              fontSize: 21,
              color: c.ink,
            }}
          >
            <span style={{ color: c.accent, fontWeight: 700 }}>+</span>
            {a.label}
          </div>
        );
      })}
      <div style={{ ...type.body, fontSize: 24, color: c.inkDim, textAlign: "center", marginTop: space.xs }}>
        9 lines → <span style={{ color: c.noise }}>34 lines</span>
      </div>
    </div>
  );
};

