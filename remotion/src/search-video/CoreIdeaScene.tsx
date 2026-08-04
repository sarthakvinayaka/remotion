import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, seeded, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 851. Local = global - 851.
 *    0 (851)  "Think about a textbook for a second"
 *   60 (911)  "If I ask you to find every page that mentions photosynthesis"
 *  206 (1057) "You could flip through all 400 pages and check each one"
 *  295 (1146) "or you could go to the index at the back"
 *  349 (1200) "find photosynthesis and it tells you exactly which pages"
 *  503 (1354) "The index is faster because someone already did the reading"
 *  594 (1445) "They read the book once ahead of time"
 *  750 (1601) "That's what a search engine does"
 *  807 (1758) -> "It reads everything in advance and builds an index"
 *  977 (1828) "This is called an inverted index"
 *
 * The two-options comparison is the script's own suggested visual: scanning
 * every page vs jumping straight to the index.
 */

const ASK_AT = 60;
const FLIP_AT = 206;
const INDEX_AT = 295;
const FASTER_AT = 503;
const SEARCH_ENGINE_AT = 750;
const INVERTED_AT = 977;

const PAGES = 24;
// which pages actually mention the word -- fixed, deterministic
const HITS = [7, 18, 23];

const ScanColumn: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // the slow way: a scan head sweeping every page
  const scan = ramp(frame, FLIP_AT, 150);
  const head = Math.floor(scan * PAGES);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.sm, flex: 1 }}>
      <div style={{ ...type.meta, color: c.noise }}>OPTION 1 · CHECK EVERY PAGE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, width: 380, justifyContent: "center" }}>
        {Array.from({ length: PAGES }).map((_, i) => {
          const scanned = i <= head;
          const isHead = i === head && scan < 1;
          return (
            <div
              key={i}
              style={{
                width: 52,
                height: 66,
                borderRadius: 4,
                background: isHead ? `${c.noise}33` : c.panel,
                border: `1px solid ${isHead ? c.noise : scanned ? `${c.noise}44` : c.panelLine}`,
                opacity: scanned ? 1 : 0.45,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                padding: 5,
              }}
            >
              {[0, 1, 2].map((l) => (
                <div
                  key={l}
                  style={{
                    height: 3,
                    width: `${68 + seeded(i * 3 + l) * 30}%`,
                    background: c.panelLineBright,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ ...type.body, fontSize: 26, color: c.noise }}>400 pages, one at a time</div>
    </div>
  );
};

const IndexColumn: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const inn = ease(frame, INDEX_AT, fps, "ENTER");
  const jump = ramp(frame, INDEX_AT + 54, 26);
  const pulse = idlePulse(frame, 86, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.sm, flex: 1, opacity: inn }}>
      <div style={{ ...type.meta, color: c.hit }}>OPTION 2 · LOOK IT UP</div>
      <div
        style={{
          width: 380,
          padding: space.md,
          borderRadius: radius.lg,
          background: c.bgLift,
          border: `1.5px solid ${c.hit}55`,
          boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 ${16 + pulse * 18}px ${c.hit}22`,
          display: "flex",
          flexDirection: "column",
          gap: space.sm,
        }}
      >
        <div style={{ ...type.meta, color: c.muted }}>INDEX</div>
        <div style={{ display: "flex", alignItems: "center", gap: space.sm, fontFamily: fonts.mono, fontSize: 22 }}>
          <span style={{ color: c.hit, fontWeight: 700 }}>photosynthesis</span>
          <span style={{ color: c.muted }}>→</span>
          <span style={{ color: c.ink, opacity: jump }}>{HITS.join(", ")}</span>
        </div>
        <div style={{ height: 1, background: c.panelLineBright }} />
        {["mitosis", "osmosis"].map((w, i) => (
          <div key={w} style={{ display: "flex", gap: space.sm, fontFamily: fonts.mono, fontSize: 19, opacity: 0.4 }}>
            <span style={{ color: c.muted }}>{w}</span>
            <span style={{ color: c.muted }}>→ …</span>
          </div>
        ))}
      </div>
      <div style={{ ...type.body, fontSize: 26, color: c.hit }}>3 pages, instantly</div>
    </div>
  );
};

export const CoreIdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const askIn = ease(frame, ASK_AT, fps, "SETTLE");
  const fasterIn = ease(frame, FASTER_AT, fps, "SETTLE");
  const invertedIn = ease(frame, INVERTED_AT, fps, "SLOW");

  const toCompare = ramp(frame, FLIP_AT - 24, 22);
  const toPayoff = ramp(frame, SEARCH_ENGINE_AT, 26);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={toPayoff > 0.5 ? c.accent : c.cool} seed={2} />

      <Scene chip="the core idea" chipColor={c.accent}>
        {toPayoff < 0.5 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: space.lg,
              width: "100%",
              opacity: 1 - toPayoff * 2,
            }}
          >
            <Sub style={{ opacity: introIn }}>
              {toCompare > 0.5 ? (
                <>
                  Find every page mentioning <span style={{ color: c.hit }}>photosynthesis</span>
                </>
              ) : (
                <>Think about a textbook</>
              )}
            </Sub>

            {toCompare > 0.1 && (
              <div style={{ display: "flex", gap: space.xl, width: "100%", opacity: toCompare, alignItems: "flex-start", justifyContent: "center" }}>
                <ScanColumn frame={frame} fps={fps} />
                <div style={{ width: 2, alignSelf: "stretch", background: c.panelLineBright }} />
                <IndexColumn frame={frame} fps={fps} />
              </div>
            )}

            {fasterIn > 0.02 && (
              <div
                style={{
                  opacity: fasterIn,
                  transform: `translateY(${interpolate(fasterIn, [0, 1], [14, 0])}px)`,
                  ...type.body,
                  fontSize: 32,
                  color: c.ink,
                  textAlign: "center",
                }}
              >
                The index is faster because <span style={{ color: c.accent }}>someone already did the reading</span>.
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: toPayoff }}>
            <Sub style={{ fontSize: 52 }}>
              A search engine reads everything <span style={{ color: c.accent }}>in advance</span>
            </Sub>
            {invertedIn > 0.02 && (
              <div
                style={{
                  opacity: invertedIn,
                  transform: `scale(${interpolate(invertedIn, [0, 1], [0.9, 1])})`,
                  marginTop: space.md,
                  padding: "20px 44px",
                  borderRadius: radius.lg,
                  background: c.bgLift,
                  border: `1.5px solid ${c.hit}66`,
                  boxShadow: `0 12px 44px rgba(0,0,0,0.5), 0 0 ${20 + idlePulse(frame, 90, 4) * 22}px ${c.hit}22`,
                  fontFamily: fonts.display,
                  fontSize: 56,
                  fontWeight: 700,
                  color: c.hit,
                }}
              >
                the inverted index
              </div>
            )}
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
