import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, seeded, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, Body, GridBg, Hero, Scene, Sub } from "./ui";

/**
 * Segment 0-851. Local anchors == global here.
 *    0  "You type something into Google and get results back in about half a second"
 *   99  "out of billions of pages"
 *  188  "Now here's the thing that should feel strange about that"
 *  266  "There is no way it read billions of pages after you hit enter"
 *  379  "It couldn't. Not in half a second."
 *  443  "So it must have done most of the work before you ever searched"
 *  524  "Today we're going to build a tiny search engine that works the same way"
 *  662  "It's about 30 lines of Python and we'll watch it get an answer wrong first"
 */

const BILLIONS_AT = 99;
const STRANGE_AT = 188;
const NO_WAY_AT = 266;
const BEFORE_AT = 443;
const BUILD_AT = 524;
const LINES_AT = 662;

const PAGE_COUNT = 60;

/** The search bar + instant results. */
const SearchBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const barIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const typed = Math.min(1, Math.max(0, (frame - 12) / 34));
  const q = "how do search engines work";
  const shown = q.slice(0, Math.round(q.length * typed));
  const caret = idlePulse(frame, 26, 0) > 0.5;
  const resultsIn = ease(frame, 56, fps, "SETTLE");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: barIn }}>
      <div
        style={{
          width: 1080,
          padding: "22px 32px",
          borderRadius: radius.pill,
          background: c.bgLift,
          border: `2px solid ${c.cool}55`,
          boxShadow: `0 14px 50px rgba(0,0,0,0.5), 0 0 ${24 + idlePulse(frame, 100, 1) * 20}px ${c.cool}22`,
          display: "flex",
          alignItems: "center",
          gap: space.md,
        }}
      >
        <span style={{ fontSize: 30, color: c.muted }}>⌕</span>
        <span style={{ fontFamily: fonts.mono, fontSize: 30, color: c.ink }}>
          {shown}
          {typed < 1 && caret ? <span style={{ color: c.cool }}>|</span> : null}
        </span>
      </div>

      {/* results snap in, then the timing badge */}
      <div style={{ opacity: resultsIn, display: "flex", flexDirection: "column", gap: space.xs, width: 1080 }}>
        {[0, 1, 2].map((i) => {
          const rIn = ease(frame, 56 + i * 5, fps, "SETTLE");
          return (
            <div
              key={i}
              style={{
                opacity: rIn,
                height: 16,
                width: `${88 - i * 11}%`,
                borderRadius: radius.sm,
                background: `${c.cool}${i === 0 ? "44" : "22"}`,
              }}
            />
          );
        })}
        <div style={{ ...type.meta, color: c.hit, marginTop: space.xs }}>
          ≈ 0.5 SECONDS · BILLIONS OF PAGES
        </div>
      </div>
    </div>
  );
};

/** A wall of pages that could not possibly be read in half a second. */
const PageWall: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const appear = ramp(frame, BILLIONS_AT, 40);
  const strike = ramp(frame, NO_WAY_AT, 30);
  return (
    <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 10, width: 1500, justifyContent: "center" }}>
      {Array.from({ length: PAGE_COUNT }).map((_, i) => {
        const t = Math.max(0, Math.min(1, appear * PAGE_COUNT - i));
        const drift = idlePulse(frame, 150, i) * 2 - 1;
        return (
          <div
            key={i}
            style={{
              width: 74,
              height: 96,
              borderRadius: 4,
              background: c.panel,
              border: `1px solid ${strike > 0.5 ? `${c.noise}55` : c.panelLineBright}`,
              opacity: t * (strike > 0.5 ? 0.4 : 1),
              transform: `translateY(${(1 - t) * 14 + drift * 1.5}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              padding: 6,
            }}
          >
            {[0, 1, 2].map((l) => (
              <div
                key={l}
                style={{
                  height: 3,
                  width: `${70 + seeded(i * 3 + l) * 28}%`,
                  background: c.panelLineBright,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        );
      })}
      {strike > 0.1 && (
        <div
          style={{
            position: "absolute",
            inset: "-8px -14px",
            border: `2.5px solid ${c.noise}`,
            borderRadius: radius.lg,
            opacity: strike,
            transform: `scale(${interpolate(strike, [0, 1], [0.94, 1])})`,
            boxShadow: `0 0 34px ${c.noise}33`,
          }}
        />
      )}
    </div>
  );
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const strangeIn = ease(frame, STRANGE_AT, fps, "SETTLE");
  const noWayIn = ease(frame, NO_WAY_AT, fps, "SETTLE");
  const beforeIn = ease(frame, BEFORE_AT, fps, "SLOW");
  const buildIn = ease(frame, BUILD_AT, fps, "SLOW");
  const linesIn = ease(frame, LINES_AT, fps, "SETTLE");

  const toWall = ramp(frame, BILLIONS_AT - 10, 20);
  const toPayoff = ramp(frame, BUILD_AT, 24);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.cool} />
      <AmbientGlow color={toPayoff > 0.5 ? c.hit : c.cool} />

      <Scene chip="search, from scratch" chipColor={c.accent}>
        {toPayoff < 0.5 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: space.lg,
              opacity: 1 - toPayoff * 2,
            }}
          >
            {toWall < 0.5 ? (
              <SearchBar frame={frame} fps={fps} />
            ) : (
              <>
                <Sub style={{ opacity: strangeIn || 1 }}>
                  {noWayIn > 0.4 ? (
                    <>
                      It never <span style={{ color: c.noise }}>read</span> those pages
                    </>
                  ) : (
                    <>Billions of pages. Half a second.</>
                  )}
                </Sub>
                <PageWall frame={frame} fps={fps} />
                {beforeIn > 0.02 && (
                  <div
                    style={{
                      opacity: beforeIn,
                      transform: `translateY(${interpolate(beforeIn, [0, 1], [16, 0])}px)`,
                      ...type.body,
                      fontSize: 34,
                      color: c.ink,
                      textAlign: "center",
                    }}
                  >
                    It did the work <span style={{ color: c.hit }}>before you ever searched</span>.
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: toPayoff }}>
            <Hero style={{ opacity: buildIn, transform: `translateY(${interpolate(buildIn, [0, 1], [22, 0])}px)` }}>
              Let's build one in <span style={{ color: c.hit }}>~30 lines</span>
            </Hero>
            <Body style={{ opacity: linesIn }}>
              We'll watch it get an answer <span style={{ color: c.noise }}>wrong</span> first — then fix it.
            </Body>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
