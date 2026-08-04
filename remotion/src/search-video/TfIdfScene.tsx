import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub, surface } from "./ui";

/**
 * Segment starts at global 5793. Local = global - 5793.
 *    0 (5793) "It's called TF-IDF, which stands for term frequency,
 *              inverse document frequency"
 *  172 (5965) "Two parts, and both are simpler than the name suggests"
 *  275 (6068) "Term frequency is how often the word appears in this document,
 *              relative to the document's length"
 *  485 (6278) "We divide by length so a long document doesn't win just for being long"
 *  604 (6397) "Inverse document frequency is a measure of how rare the word is"
 *  745 (6538) "If a word is in every document, this value goes to zero"
 *  862 (6655) "If it's in only one, the value is high"
 *  943 (6736) "Multiply those two together and you get a score that rewards
 *              words that are both frequent here and rare elsewhere"
 *
 * All numbers shown are REAL, from scripts/capture-search-output.py:
 *   doc 3 is 6 words; "dog" appears once -> tf = 1/6 = 0.167
 *   "dog" is in 1 of 5 docs -> idf = log(5/1) = 1.609
 *   tf*idf = 0.268
 */

const TWO_PARTS_AT = 172;
const TF_AT = 275;
const LENGTH_AT = 485;
const IDF_AT = 604;
const ZERO_AT = 745;
const HIGH_AT = 862;
const MULTIPLY_AT = 943;

const Part: React.FC<{
  label: string;
  formula: string;
  detail: string;
  value: string;
  color: string;
  inn: number;
  focal: boolean;
  frame: number;
}> = ({ label, formula, detail, value, color, inn, focal, frame }) => {
  const pulse = idlePulse(frame, 90, label.length);
  return (
    <div
      style={{
        opacity: inn,
        transform: `translateY(${interpolate(inn, [0, 1], [20, 0])}px) scale(${focal ? 1 + pulse * 0.008 : 1})`,
        flex: 1,
        padding: space.lg,
        borderRadius: radius.lg,
        ...surface(color, focal),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div style={{ ...type.meta, color, marginBottom: space.sm }}>{label}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 30, color: c.ink, marginBottom: space.xs }}>{formula}</div>
      <div style={{ ...type.body, fontSize: 24, color: c.inkDim, marginBottom: space.sm }}>{detail}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 88, fontWeight: 700, color }}>{value}</div>
    </div>
  );
};

export const TfIdfScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const tfIn = ease(frame, TF_AT, fps, "ENTER");
  const idfIn = ease(frame, IDF_AT, fps, "ENTER");
  const lengthIn = ease(frame, LENGTH_AT, fps, "SETTLE");
  const multiplyIn = ease(frame, MULTIPLY_AT, fps, "SLOW");

  // idf extremes: goes to zero if in every doc, high if in only one
  const zeroIn = ramp(frame, ZERO_AT, 26);
  const highIn = ramp(frame, HIGH_AT, 26);

  const showParts = frame >= TWO_PARTS_AT;

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.violet} />
      <AmbientGlow color={c.violet} seed={6} />

      <Scene chip="TF-IDF" chipColor={c.violet}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub style={{ opacity: introIn }}>
            {showParts ? (
              <>
                Two parts — both <span style={{ color: c.hit }}>simpler</span> than the name
              </>
            ) : (
              <>
                It's called <span style={{ color: c.violet }}>TF-IDF</span>
              </>
            )}
          </Sub>

          {showParts && (
            <div style={{ display: "flex", gap: space.lg, width: "100%", maxWidth: 1560, alignItems: "stretch", minHeight: 330 }}>
              <Part
                label="TERM FREQUENCY"
                formula="count ÷ doc length"
                detail={'"dog" once in a 6-word doc'}
                value="0.167"
                color={c.cool}
                inn={Math.max(tfIn, 0.12)}
                focal={frame >= TF_AT && frame < IDF_AT}
                frame={frame}
              />
              <div style={{ display: "flex", alignItems: "center", opacity: Math.max(idfIn, 0.25) }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: radius.pill,
                    border: `1.5px solid ${c.panelLineBright}`,
                    background: c.panel,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: c.inkDim,
                    fontFamily: fonts.display,
                    fontSize: 44,
                  }}
                >
                  ×
                </div>
              </div>
              <Part
                label="INVERSE DOC FREQUENCY"
                formula="log(total ÷ docs with word)"
                detail={'"dog" in 1 of 5 documents'}
                value="1.609"
                color={c.accent}
                inn={Math.max(idfIn, 0.12)}
                focal={frame >= IDF_AT && frame < MULTIPLY_AT}
                frame={frame}
              />
            </div>
          )}

          {/* the "divide by length" note and the idf extremes */}
          <div style={{ display: "flex", gap: space.md, minHeight: 58 }}>
            {lengthIn > 0.02 && frame < IDF_AT && (
              <div
                style={{
                  opacity: lengthIn,
                  padding: "11px 24px",
                  borderRadius: radius.pill,
                  border: `1px solid ${c.cool}44`,
                  background: `${c.cool}10`,
                  ...type.body,
                  fontSize: 25,
                  color: c.cool,
                }}
              >
                divide by length so long documents don't win for being long
              </div>
            )}
            {zeroIn > 0.02 && frame < MULTIPLY_AT && (
              <div
                style={{
                  opacity: zeroIn,
                  padding: "11px 24px",
                  borderRadius: radius.pill,
                  border: `1px solid ${c.noise}44`,
                  background: `${c.noise}10`,
                  ...type.body,
                  fontSize: 25,
                  color: c.noise,
                }}
              >
                if a word were in EVERY doc → 0
              </div>
            )}
            {highIn > 0.02 && frame < MULTIPLY_AT && (
              <div
                style={{
                  opacity: highIn,
                  padding: "11px 24px",
                  borderRadius: radius.pill,
                  border: `1px solid ${c.hit}44`,
                  background: `${c.hit}10`,
                  ...type.body,
                  fontSize: 25,
                  color: c.hit,
                }}
              >
                in only one → high
              </div>
            )}
          </div>

          {multiplyIn > 0.02 && (
            <div
              style={{
                opacity: multiplyIn,
                transform: `translateY(${interpolate(multiplyIn, [0, 1], [18, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: space.md,
                padding: "16px 40px",
                borderRadius: radius.lg,
                background: c.bgLift,
                border: `1.5px solid ${c.hit}55`,
                boxShadow: `0 12px 44px rgba(0,0,0,0.5), 0 0 ${20 + idlePulse(frame, 88, 7) * 20}px ${c.hit}22`,
              }}
            >
              <span style={{ ...type.body, fontSize: 30, color: c.inkDim }}>frequent here</span>
              <span style={{ ...type.sub, fontSize: 34, color: c.muted }}>+</span>
              <span style={{ ...type.body, fontSize: 30, color: c.inkDim }}>rare elsewhere</span>
              <span style={{ ...type.sub, fontSize: 34, color: c.muted }}>=</span>
              <span style={{ fontFamily: fonts.display, fontSize: 56, fontWeight: 700, color: c.hit }}>0.268</span>
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
