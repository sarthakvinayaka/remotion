import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, DOCS, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 5179. Local = global - 5179.
 *    0 (5179) "So let's think about what went wrong"
 *   63 (5242) "The word 'the' is in almost every document"
 *  148 (5327) "That means it tells us almost nothing about which document is relevant"
 *  267 (5446) "The word 'dog' is in exactly one document"
 *  349 (5528) "That makes it extremely informative"
 *  421 (5600) "So common words should count for less, and rare words should count for more"
 *  547 (5726) "That's the fix, and it has a name"
 *
 * Real counts: "the" is in docs 1 and 3; "dog" is in doc 3 only.
 */

const THE_AT = 63;
const NOTHING_AT = 148;
const DOG_AT = 267;
const INFORMATIVE_AT = 349;
const RULE_AT = 421;

const THE_DOCS = [1, 3];
const DOG_DOCS = [3];

const DocGrid: React.FC<{ frame: number; fps: number; word: string; hits: number[]; color: string; startAt: number }> = ({
  frame,
  fps,
  word,
  hits,
  color,
  startAt,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.sm, flex: 1 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: space.sm }}>
      <span style={{ fontFamily: fonts.mono, fontSize: 56, fontWeight: 700, color }}>"{word}"</span>
      <span style={{ ...type.meta, color: c.muted }}>
        IN {hits.length} OF 5
      </span>
    </div>
    <div style={{ display: "flex", gap: space.xs }}>
      {DOCS.map((d, i) => {
        const inn = ease(frame, startAt + i * 7, fps, "ENTER");
        const hit = hits.includes(d.id);
        const pulse = idlePulse(frame, 84, i);
        return (
          <div
            key={d.id}
            style={{
              opacity: inn,
              transform: `translateY(${interpolate(inn, [0, 1], [12, 0])}px)`,
              width: 110,
              height: 150,
              borderRadius: radius.md,
              background: hit ? `${color}1A` : c.panel,
              border: `1.5px solid ${hit ? color : c.panelLine}`,
              boxShadow: hit ? `0 0 ${10 + pulse * 14}px ${color}33` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.mono,
              fontSize: 40,
              color: hit ? color : c.muted,
              fontWeight: hit ? 700 : 400,
            }}
          >
            {d.id}
          </div>
        );
      })}
    </div>
  </div>
);

export const WhyRareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const nothingIn = ease(frame, NOTHING_AT, fps, "SETTLE");
  const informativeIn = ease(frame, INFORMATIVE_AT, fps, "SETTLE");
  const ruleIn = ease(frame, RULE_AT, fps, "SLOW");

  const showDog = frame >= DOG_AT - 20;

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.violet} />
      <AmbientGlow color={ruleIn > 0.4 ? c.hit : c.noise} seed={5} />

      <Scene chip="why rare words matter" chipColor={c.violet}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            Which word actually <span style={{ color: c.hit }}>tells you something</span>?
          </Sub>

          <div style={{ display: "flex", gap: space.xl, width: "100%", justifyContent: "center", alignItems: "flex-start" }}>
            <DocGrid frame={frame} fps={fps} word="the" hits={THE_DOCS} color={c.noise} startAt={THE_AT} />
            {showDog && (
              <>
                <div style={{ width: 2, alignSelf: "stretch", background: c.panelLineBright }} />
                <DocGrid frame={frame} fps={fps} word="dog" hits={DOG_DOCS} color={c.hit} startAt={DOG_AT} />
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: space.lg, minHeight: 64 }}>
            {nothingIn > 0.02 && (
              <div
                style={{
                  opacity: nothingIn * (ruleIn > 0.5 ? 0.4 : 1),
                  padding: "12px 26px",
                  borderRadius: radius.pill,
                  border: `1px solid ${c.noise}44`,
                  background: `${c.noise}10`,
                  ...type.body,
                  fontSize: 26,
                  color: c.noise,
                }}
              >
                everywhere → tells you almost nothing
              </div>
            )}
            {informativeIn > 0.02 && (
              <div
                style={{
                  opacity: informativeIn * (ruleIn > 0.5 ? 0.4 : 1),
                  padding: "12px 26px",
                  borderRadius: radius.pill,
                  border: `1px solid ${c.hit}44`,
                  background: `${c.hit}10`,
                  ...type.body,
                  fontSize: 26,
                  color: c.hit,
                }}
              >
                in exactly one → extremely informative
              </div>
            )}
          </div>

          {ruleIn > 0.02 && (
            <div
              style={{
                opacity: ruleIn,
                transform: `translateY(${interpolate(ruleIn, [0, 1], [18, 0])}px)`,
                ...type.sub,
                fontSize: 46,
                color: c.ink,
                textAlign: "center",
              }}
            >
              Common words count <span style={{ color: c.noise }}>less</span>. Rare words count{" "}
              <span style={{ color: c.hit }}>more</span>.
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
