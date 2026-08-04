import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, DOCS, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp } from "./motion";
import { Focal, SideTitle } from "./SearchCodeScene";
import { surface } from "./ui";

/** The five documents, as cards. Used across the code segments. */
export const DocList: React.FC<{
  startAt: number;
  highlightWord?: string;
  highlightColor?: string;
  activeDocs?: number[];
}> = ({ startAt, highlightWord, highlightColor = c.noise, activeDocs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.xs, minHeight: 0 }}>
      <SideTitle color={c.cool}>the corpus · 5 documents</SideTitle>
      {DOCS.map((d, i) => {
        const inn = ease(frame, startAt + i * 8, fps, "ENTER");
        const isActive = activeDocs ? activeDocs.includes(d.id) : true;
        const words = d.text.split(" ");
        return (
          <div
            key={d.id}
            style={{
              opacity: inn * (isActive ? 1 : 0.32),
              transform: `translateX(${interpolate(inn, [0, 1], [16, 0])}px)`,
              display: "flex",
              gap: space.sm,
              alignItems: "flex-start",
              padding: "9px 12px",
              borderRadius: radius.md,
              background: isActive ? c.panel : "transparent",
              border: `1px solid ${isActive ? c.panelLine : "transparent"}`,
            }}
          >
            <span
              style={{
                ...type.meta,
                color: c.cool,
                flexShrink: 0,
                width: 22,
              }}
            >
              {d.id}
            </span>
            <span style={{ fontFamily: fonts.mono, fontSize: 17, lineHeight: 1.4, color: c.inkDim }}>
              {words.map((w, wi) => {
                const hit = highlightWord && w.toLowerCase() === highlightWord.toLowerCase();
                return (
                  <span
                    key={wi}
                    style={{
                      color: hit ? highlightColor : c.inkDim,
                      fontWeight: hit ? 700 : 400,
                      background: hit ? `${highlightColor}22` : "transparent",
                      borderRadius: 4,
                      padding: hit ? "1px 3px" : 0,
                    }}
                  >
                    {w}{" "}
                  </span>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * The inverted index building up: word -> {doc: count}.
 * This is the script's suggested visual for the index section.
 * Rows are hardcoded from the REAL captured index, in the order the
 * documents are processed, so what appears matches what the code does.
 */
const INDEX_ROWS: { word: string; postings: string; color: string }[] = [
  { word: "the", postings: "{1: 4, 3: 1}", color: c.noise },
  { word: "cat", postings: "{1: 2}", color: c.hit },
  { word: "mat", postings: "{1: 2}", color: c.inkDim },
  { word: "dogs", postings: "{2: 2}", color: c.inkDim },
  { word: "dog", postings: "{3: 1}", color: c.hit },
  { word: "python", postings: "{4: 1, 5: 1}", color: c.inkDim },
];

export const IndexBuilding: React.FC<{ startAt: number; perRow?: number }> = ({ startAt, perRow = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.xs }}>
      <SideTitle>the index · word → documents</SideTitle>
      {INDEX_ROWS.map((r, i) => {
        const inn = ease(frame, startAt + i * perRow, fps, "ENTER");
        const pulse = idlePulse(frame, 90, i);
        const isKey = r.color !== c.inkDim;
        return (
          <div
            key={r.word}
            style={{
              opacity: inn,
              transform: `translateY(${interpolate(inn, [0, 1], [12, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: space.sm,
              padding: "8px 14px",
              borderRadius: radius.md,
              ...surface(r.color, isKey),
              boxShadow: isKey
                ? `inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 26px rgba(0,0,0,0.5), 0 0 ${10 + pulse * 14}px ${r.color}22`
                : "inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 18px rgba(0,0,0,0.4)",
              fontFamily: fonts.mono,
              fontSize: 19,
            }}
          >
            <span style={{ color: r.color, fontWeight: 700, minWidth: 76 }}>"{r.word}"</span>
            <span style={{ color: c.muted }}>→</span>
            <span style={{ color: c.ink }}>{r.postings}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * The failure explained: doc 1 scores 4 on "the" alone, doc 3 scores 2.
 * Real numbers from the captured run.
 */
export const FailureMath: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d1 = ease(frame, startAt, fps, "SETTLE");
  const d3 = ease(frame, startAt + 60, fps, "SETTLE");
  const verdict = ease(frame, startAt + 130, fps, "SLOW");
  const pulse = idlePulse(frame, 84, 1);

  const Row: React.FC<{ at: number; doc: number; parts: string; total: number; color: string; win: boolean }> = ({
    at,
    doc,
    parts,
    total,
    color,
    win,
  }) => (
    <div
      style={{
        opacity: at,
        transform: `translateY(${interpolate(at, [0, 1], [14, 0])}px)`,
        padding: space.sm,
        borderRadius: radius.md,
        ...surface(color, win),
        boxShadow: win
          ? `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 34px rgba(0,0,0,0.55), 0 0 ${14 + pulse * 18}px ${color}26`
          : "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 22px rgba(0,0,0,0.42)",
      }}
    >
      <div style={{ ...type.meta, color: c.muted, marginBottom: 4 }}>DOCUMENT {doc}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 20, color: c.inkDim }}>{parts}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 44, fontWeight: 700, color }}>{total}</div>
    </div>
  );

  // The stamp lands on "the top result is a document about a cat", which is
  // 276 frames before the "four times" line this panel is anchored to.
  // Derived from startAt so it can't silently decouple if the segment moves.
  const STAMP_AT = startAt - 276;
  const stamp = ease(frame, STAMP_AT, fps, "ENTER");
  const shock = ramp(frame, STAMP_AT, 14);
  if (stamp < 0.02) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.sm }}>
      {stamp > 0.02 && (
        <div style={{ position: "relative", alignSelf: "flex-start", marginBottom: space.xs }}>
          <div
            style={{
              opacity: stamp,
              transform: `scale(${interpolate(stamp, [0, 1], [1.14, 1])}) rotate(${interpolate(stamp, [0, 1], [-2.5, -1.2])}deg)`,
              padding: "10px 28px",
              borderRadius: radius.pill,
              border: `1.5px solid ${c.noise}`,
              background: `${c.noise}14`,
              color: c.noise,
              ...type.meta,
            }}
          >
            TOP RESULT · NO DOG IN IT
          </div>
          {shock < 1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: radius.pill,
                border: `1.5px solid ${c.noise}`,
                opacity: 1 - shock,
                transform: `scale(${1 + shock * 0.5}) rotate(-1.2deg)`,
              }}
            />
          )}
        </div>
      )}
      <SideTitle color={c.noise}>why the cat document won</SideTitle>
      <Row at={d1} doc={1} parts={'"the" × 4' } total={4} color={c.noise} win />
      <Row at={d3} doc={3} parts={'"the" × 1  +  "dog" × 1'} total={2} color={c.cool} win={false} />
      {verdict > 0.02 && (
        <div
          style={{
            opacity: verdict,
            ...type.body,
            fontSize: 26,
            color: c.ink,
            textAlign: "center",
            marginTop: space.xs,
          }}
        >
          4 beats 2 — <span style={{ color: c.noise }}>"the"</span> drowned out{" "}
          <span style={{ color: c.hit }}>"dog"</span>
        </div>
      )}
    </div>
  );
};

/**
 * IDF side by side -- the script explicitly asks for this: "the" low,
 * "dog" high. Real values from math.log(5/len(index[word])).
 */
export const IdfCompare: React.FC<{ startAt: number }> = ({ startAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = ramp(frame, startAt, 40);
  const pulse = idlePulse(frame, 92, 3);

  const ITEMS = [
    { word: "the", idf: 0.9163, docs: "in 2 of 5 docs", color: c.noise },
    { word: "dog", idf: 1.6094, docs: "in 1 of 5 docs", color: c.hit },
  ];
  const maxIdf = 1.6094;

  // Heading and trailer are gated on the same progress that gates the bars --
  // an orphaned title over an empty column read as a broken panel for ~7s.
  const panelIn = ease(frame, startAt, fps, "SETTLE");
  if (panelIn < 0.02) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.md, opacity: panelIn }}>
      <SideTitle color={c.violet}>how rare is the word?</SideTitle>
      {ITEMS.map((it, i) => {
        const inn = ease(frame, startAt + i * 22, fps, "ENTER");
        const w = (it.idf / maxIdf) * 100 * grow;
        return (
          <div key={it.word} style={{ opacity: inn }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 24, fontWeight: 700, color: it.color }}>
                "{it.word}"
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 22, color: c.ink }}>
                {it.idf.toFixed(3)}
              </span>
            </div>
            <div style={{ height: 26, borderRadius: radius.sm, background: `${c.muted}1A`, overflow: "hidden" }}>
              <div
                style={{
                  width: `${w}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${it.color}AA, ${it.color})`,
                  boxShadow: `0 0 ${8 + pulse * 10}px ${it.color}44`,
                }}
              />
            </div>
            <div style={{ ...type.meta, color: c.muted, marginTop: 4 }}>{it.docs}</div>
          </div>
        );
      })}
      {grow > 0.5 && (
        <div style={{ ...type.body, fontSize: 24, color: c.inkDim, textAlign: "center", opacity: ramp(frame, startAt + 22, 18) }}>
          rare word → <span style={{ color: c.hit }}>higher weight</span>
        </div>
      )}
    </div>
  );
};
