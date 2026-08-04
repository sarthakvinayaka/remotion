import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, seeded, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 1744. Local anchors (global - 1744):
 *    0 (1744) "by how much text goes in and comes out"
 *   81 (1825) "Before, feeding it roughly a stack of novels worth of text
 *              cost about a dollar"
 *  223 (1967) "Now that same pile costs twenty cents"
 *  323 (2067) "The middle model got a smaller cut, twenty percent,"
 *  398 (2142) "and the expensive one didn't get cheaper at all"
 *  504 (2248) "Worth remembering that, it comes up again later"
 *
 * NOTE: the book stack is hand-authored illustration, not captured data --
 * "a stack of novels" is the script's own deliberate approximation for
 * 1M tokens (~750k words). Prices are the real published figures.
 */

const NOVELS_AT = 81;
const NOW_AT = 223;
const TERRA_AT = 323;
const SOL_AT = 398;
const REMEMBER_AT = 504;

const BOOK_COUNT = 8;

/** A stack of novels = 1M tokens. Deterministic jitter, never Math.random(). */
const BookStack: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{ display: "flex", flexDirection: "column-reverse", gap: 7, alignItems: "center" }}>
    {Array.from({ length: BOOK_COUNT }).map((_, i) => {
      const bookIn = ease(frame, NOVELS_AT + i * 7, fps, "ENTER");
      const width = 330 + seeded(i * 3 + 1) * 80;
      const hue = [c.cool, c.violet, c.accent, c.rival][i % 4];
      const drift = idlePulse(frame, 150, i) * 2 - 1;
      return (
        <div
          key={i}
          style={{
            width,
            height: 46,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${hue}AA, ${hue}55)`,
            border: `1px solid ${hue}88`,
            opacity: bookIn,
            transform: `translateY(${interpolate(bookIn, [0, 1], [-22, 0])}px) translateX(${drift * 2}px)`,
            boxShadow: "0 3px 10px rgba(0,0,0,0.4)",
          }}
        />
      );
    })}
  </div>
);

const PriceRow: React.FC<{
  model: string;
  color: string;
  oldPrice: string;
  newPrice: string;
  cut: string;
  progress: number;
  focal: boolean;
  frame: number;
}> = ({ model, color, oldPrice, newPrice, cut, progress, focal, frame }) => {
  const pulse = idlePulse(frame, 96, model.length);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 120px 1fr 230px",
        alignItems: "center",
        gap: space.md,
        padding: "30px 40px",
        borderRadius: radius.lg,
        background: focal ? c.bgLift : c.panel,
        border: `1.5px solid ${focal ? `${color}66` : c.panelLine}`,
        boxShadow: focal
          ? `0 12px 44px rgba(0,0,0,0.5), 0 0 ${24 + pulse * 22}px ${color}22`
          : "0 8px 24px rgba(0,0,0,0.35)",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [16, 0])}px)`,
      }}
    >
      <div style={{ ...type.sub, fontSize: 38, color, textAlign: "left" }}>{model}</div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 34,
          color: c.muted,
          textDecoration: cut === "unchanged" ? "none" : "line-through",
          textAlign: "right",
        }}
      >
        {oldPrice}
      </div>
      <div style={{ textAlign: "center", color: c.muted, fontSize: 30 }}>→</div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 40,
          fontWeight: 700,
          color: cut === "unchanged" ? c.muted : c.cheap,
          textAlign: "left",
        }}
      >
        {newPrice}
      </div>
      <div
        style={{
          justifySelf: "end",
          padding: "8px 18px",
          borderRadius: radius.pill,
          border: `1px solid ${cut === "unchanged" ? c.muted : c.cheap}44`,
          background: `${cut === "unchanged" ? c.muted : c.cheap}12`,
          color: cut === "unchanged" ? c.muted : c.cheap,
          ...type.meta,
          textTransform: "uppercase",
        }}
      >
        {cut}
      </div>
    </div>
  );
};

export const PricingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const dollarIn = ease(frame, NOVELS_AT + 40, fps, "SETTLE");
  const nowIn = ease(frame, NOW_AT, fps, "SLOW");

  // once we move to the full table, the book illustration steps aside
  const toTable = ramp(frame, TERRA_AT - 30, 26);

  const lunaIn = ease(frame, NOW_AT, fps, "SETTLE");
  const terraIn = ease(frame, TERRA_AT, fps, "SETTLE");
  const solIn = ease(frame, SOL_AT, fps, "SETTLE");
  const rememberIn = ease(frame, REMEMBER_AT, fps, "SETTLE");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.accent} />
      <AmbientGlow color={c.accent} seed={3} />

      <Scene chip="what you actually pay" chipColor={c.accent}>
        {toTable < 0.95 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: space.xl * 1.6,
              opacity: 1 - toTable,
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
              <BookStack frame={frame} fps={fps} />
              <div style={{ ...type.meta, color: c.muted }}>≈ A STACK OF NOVELS</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: space.md, alignItems: "flex-start" }}>
              <Sub style={{ opacity: introIn, textAlign: "left" }}>
                You pay by how much text
                <br />
                goes <span style={{ color: c.cool }}>in</span> and comes <span style={{ color: c.violet }}>out</span>
              </Sub>

              <div style={{ display: "flex", alignItems: "center", gap: space.lg }}>
                <div style={{ opacity: dollarIn * (1 - ramp(frame, NOW_AT, 18) * 0.55) }}>
                  <div style={{ ...type.meta, color: c.muted }}>BEFORE</div>
                  <div
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 96,
                      fontWeight: 700,
                      color: c.expensive,
                      letterSpacing: -2,
                      textDecoration: nowIn > 0.4 ? "line-through" : "none",
                    }}
                  >
                    $1.00
                  </div>
                </div>

                {nowIn > 0.02 && (
                  <div style={{ opacity: nowIn, transform: `scale(${interpolate(nowIn, [0, 1], [0.8, 1])})` }}>
                    <div style={{ ...type.meta, color: c.muted }}>NOW</div>
                    <div
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 140,
                        fontWeight: 700,
                        color: c.cheap,
                        letterSpacing: -2,
                        textShadow: `0 0 40px ${c.cheap}44`,
                      }}
                    >
                      $0.20
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {toTable > 0.05 && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              maxWidth: 1400,
              display: "flex",
              flexDirection: "column",
              gap: space.sm,
              opacity: toTable,
            }}
          >
            <PriceRow model="Luna" color={c.luna} oldPrice="$1.00" newPrice="$0.20" cut="−80%" progress={lunaIn} focal frame={frame} />
            <PriceRow model="Terra" color={c.terra} oldPrice="$2.50" newPrice="$2.00" cut="−20%" progress={terraIn} focal={false} frame={frame} />
            <PriceRow model="Sol" color={c.sol} oldPrice="$5.00" newPrice="$5.00" cut="unchanged" progress={solIn} focal={false} frame={frame} />

            <div
              style={{
                marginTop: space.md,
                opacity: rememberIn,
                transform: `translateY(${interpolate(rememberIn, [0, 1], [14, 0])}px)`,
                textAlign: "center",
                ...type.body,
                color: c.accent,
              }}
            >
              Worth remembering — this comes up again later.
            </div>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
