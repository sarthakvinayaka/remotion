import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, Body, GridBg, Hero, Scene } from "./ui";

/**
 * Word anchors (local frames == global, this scene starts at 0):
 *    0  "So last week OpenAI dropped the price of one of its AI models by 80%"
 *  139  "Same model, same day, suddenly costs a fifth of what it did"
 *  256  "And that model had only been out for three weeks"
 *  344  "companies don't usually cut prices three weeks after launch"
 *  492  "But the way they pulled it off is the interesting bit"
 *  593  "They had their smartest AI go and fix the machinery that runs their other AI"
 *  727  "Let's talk about it"
 */

const PRICE_FLIP_AT = 64; // "...by 80%"
const FIFTH_AT = 139; // "same day, suddenly costs a fifth"
const WEEKS_AT = 256; // "only been out for three weeks"
const AI_FIXES_AT = 593; // "smartest AI ... fix the machinery"

/** Counts $1.00 -> $0.20 on the spoken "80%". */
const PriceTag: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const flip = ease(frame, PRICE_FLIP_AT, fps, "SLOW");
  const value = interpolate(flip, [0, 1], [1.0, 0.2]);
  const pulse = idlePulse(frame, 100, 1);
  const settled = flip > 0.98;
  const color = flip > 0.5 ? c.cheap : c.accent;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: space.xl,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "34px 64px",
          borderRadius: radius.lg,
          background: c.bgLift,
          border: `2px solid ${color}66`,
          boxShadow: `0 18px 60px rgba(0,0,0,0.55), 0 0 ${34 + (settled ? pulse * 26 : 0)}px ${color}33`,
        }}
      >
        <div style={{ ...type.meta, color: c.muted, marginBottom: space.xs }}>PER 1M TOKENS IN</div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 132,
            fontWeight: 700,
            letterSpacing: -3,
            color,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          ${value.toFixed(2)}
        </div>
      </div>

      {/* the 80% badge lands with the flip */}
      <div
        style={{
          opacity: flip,
          transform: `scale(${interpolate(flip, [0, 1], [0.7, 1])})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space.xs,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 104,
            fontWeight: 700,
            color: c.cheap,
            letterSpacing: -2,
            lineHeight: 1,
            textShadow: `0 0 40px ${c.cheap}55`,
          }}
        >
          −80%
        </div>
        <div style={{ ...type.meta, color: c.muted }}>OVERNIGHT</div>
      </div>
    </div>
  );
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = ease(frame + SCENE_LEAD_IN, 6, fps, "ENTER");
  const tagIn = ease(frame, 40, fps, "ENTER");
  const fifthIn = ease(frame, FIFTH_AT, fps, "SETTLE");
  const weeksIn = ease(frame, WEEKS_AT, fps, "SETTLE");
  const twistIn = ease(frame, AI_FIXES_AT, fps, "SLOW");

  // after the twist line lands, the price tag recedes and the "AI fixed its
  // own machinery" statement becomes the focal element
  const twistTakeover = ramp(frame, AI_FIXES_AT, 26);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.045} color={c.cool} />
      <AmbientGlow color={twistTakeover > 0.5 ? c.violet : c.accent} />

      <Scene chip="OpenAI · price cut" chipColor={c.accent}>
        {/* The price block and the twist line are mutually exclusive -- they
            are NOT crossfaded, because both are large centred text and any
            overlap renders one on top of the other. The price block is
            unmounted once the twist has taken over. */}
        <div
          style={{
            display: twistTakeover > 0.5 ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: space.lg,
          }}
        >
          <Hero
            style={{
              opacity: titleIn * (1 - twistTakeover * 2),
              transform: `translateY(${interpolate(titleIn, [0, 1], [18, 0])}px)`,
            }}
          >
            They cut the price by <span style={{ color: c.cheap }}>80%</span>
          </Hero>

          <div
            style={{
              opacity: tagIn * (1 - twistTakeover * 2),
              transform: `scale(${interpolate(tagIn, [0, 1], [0.9, 1])})`,
            }}
          >
            <PriceTag frame={frame} fps={fps} />
          </div>

          {/* "a fifth of what it did" / "only three weeks old" facts */}
          <div style={{ display: "flex", gap: space.md, opacity: 1 - twistTakeover }}>
            {[
              { at: fifthIn, label: "a fifth of yesterday's price", color: c.cheap },
              { at: weeksIn, label: "three weeks after launch", color: c.expensive },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  opacity: f.at,
                  transform: `translateY(${interpolate(f.at, [0, 1], [14, 0])}px)`,
                  padding: "12px 22px",
                  borderRadius: radius.pill,
                  border: `1px solid ${f.color}44`,
                  background: `${f.color}10`,
                  color: f.color,
                  fontFamily: fonts.body,
                  fontSize: 26,
                  fontWeight: 600,
                }}
              >
                {f.label}
              </div>
            ))}
          </div>

        </div>

        {/* the actual hook: an AI rewrote the machinery. Sibling of the price
            block above, and only mounted once that block is gone. */}
        {twistTakeover > 0.5 && (
          <div
            style={{
              opacity: twistIn,
              transform: `translateY(${interpolate(twistIn, [0, 1], [26, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: space.md,
            }}
          >
            <Hero>
              Their smartest AI went and fixed the
              <br />
              <span style={{ color: c.violet }}>machinery</span> running their other AI
            </Hero>
            <Body style={{ opacity: ease(frame, AI_FIXES_AT + 60, fps, "SETTLE") }}>
              Let's talk about it.
            </Body>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
