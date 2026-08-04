import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 7878. Local = global - 7878.
 *    0 (7878) "So what we built is a real search engine, just a very small one"
 *  119 (7997) "Real ones add a lot on top of this"
 *  221 (8099) "They crawl the web to find documents in the first place"
 *  314 (8192) "They handle word variations, so that running and run match"
 *  422 (8300) "They factor in how many other pages link to a page, which is PageRank"
 *  577 (8455) "And they consider your location, your history, and hundreds of other signals"
 *  703 (8581) "But underneath all of that, the two ideas we just built are still there"
 *  844 (8722) "Index everything ahead of time so lookups are fast"
 *  932 (8810) "And weight rare words more heavily than common ones"
 */

const REAL_ONES_AT = 119;
const CRAWL_AT = 221;
const STEM_AT = 314;
const PAGERANK_AT = 422;
const SIGNALS_AT = 577;
const UNDERNEATH_AT = 703;
const IDEA1_AT = 844;
const IDEA2_AT = 932;

const ADDITIONS = [
  { at: CRAWL_AT, label: "Crawling", detail: "find the documents at all", color: c.cool },
  { at: STEM_AT, label: "Word variations", detail: '"running" matches "run"', color: c.violet },
  { at: PAGERANK_AT, label: "PageRank", detail: "who links to this page?", color: c.accent },
  { at: SIGNALS_AT, label: "Hundreds more", detail: "location, history, …", color: c.muted },
];

export const RealEnginesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const idea1In = ease(frame, IDEA1_AT, fps, "SETTLE");
  const idea2In = ease(frame, IDEA2_AT, fps, "SETTLE");
  const toCore = ramp(frame, UNDERNEATH_AT, 26);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.cool} />
      <AmbientGlow color={toCore > 0.5 ? c.hit : c.cool} seed={8} />

      <Scene chip="what real engines add" chipColor={c.cool}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            {toCore > 0.5 ? (
              <>
                Underneath all of it — the <span style={{ color: c.hit }}>same two ideas</span>
              </>
            ) : (
              <>
                What we built is real — just <span style={{ color: c.cool }}>small</span>
              </>
            )}
          </Sub>

          {toCore < 0.5 && frame >= REAL_ONES_AT - 20 && (
            <div
              style={{
                display: "flex",
                gap: space.md,
                width: "100%",
                maxWidth: 1620,
                opacity: 1 - toCore * 2,
              }}
            >
              {ADDITIONS.map((a, i) => {
                const inn = ease(frame, a.at, fps, "ENTER");
                const pulse = idlePulse(frame, 88, i);
                const focal = frame >= a.at && frame < (ADDITIONS[i + 1]?.at ?? UNDERNEATH_AT);
                return (
                  <div
                    key={a.label}
                    style={{
                      flex: 1,
                      opacity: inn,
                      transform: `translateY(${interpolate(inn, [0, 1], [22, 0])}px) scale(${focal ? 1 + pulse * 0.01 : 1})`,
                      padding: space.lg,
                      borderRadius: radius.lg,
                      ...surface(a.color, focal),
                      minHeight: 320,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: 10,
                        bottom: -18,
                        fontFamily: fonts.display,
                        fontSize: 150,
                        fontWeight: 700,
                        color: a.color,
                        opacity: 0.055,
                        lineHeight: 1,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ ...type.sub, fontSize: 42, color: a.color, marginBottom: 8 }}>{a.label}</div>
                    <div style={{ ...type.body, fontSize: 26, color: c.inkDim }}>{a.detail}</div>
                  </div>
                );
              })}
            </div>
          )}

          {toCore > 0.1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: space.md, opacity: toCore, width: "100%", maxWidth: 1320 }}>
              {[
                { at: idea1In, n: "1", text: "Index everything ahead of time", tail: "so lookups are fast", color: c.accent },
                { at: idea2In, n: "2", text: "Weight rare words more heavily", tail: "than common ones", color: c.hit },
              ].map((it) => (
                <div
                  key={it.n}
                  style={{
                    opacity: it.at,
                    transform: `translateX(${interpolate(it.at, [0, 1], [-24, 0])}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: space.lg,
                    padding: `${space.md}px ${space.lg}px`,
                    borderRadius: radius.lg,
                    background: c.bgLift,
                    border: `1.5px solid ${it.color}55`,
                    boxShadow: `0 10px 34px rgba(0,0,0,0.45), 0 0 ${14 + idlePulse(frame, 92, Number(it.n)) * 16}px ${it.color}18`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 64,
                      fontWeight: 700,
                      color: it.color,
                      lineHeight: 1,
                      minWidth: 48,
                    }}
                  >
                    {it.n}
                  </span>
                  <span style={{ ...type.sub, fontSize: 40, color: c.ink, textAlign: "left" }}>
                    {it.text}
                    <span style={{ ...type.body, fontSize: 26, color: c.inkDim, display: "block", marginTop: 4 }}>
                      {it.tail}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
