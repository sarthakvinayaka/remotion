import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Scene, Sub } from "./ui";

/**
 * Segment starts at global 776. Local anchors (global - 776):
 *    0 (776)  "So quick setup, OpenAI's newest lineup"
 *   77 (853)  "GPT-5.6 isn't one model, it's three"
 *  168 (944)  "There's Sol the expensive smart one, Terra in the middle,
 *              and Luna the small cheap fast one"
 *  336 (1112) "Think of it like shipping options, overnight, standard, economy"
 *  465 (1241) "Luna is economy"
 *  513 (1289) "what companies use for the boring high volume stuff"
 *  603 (1379) "sorting emails, pulling info out of documents, routing requests"
 *  822 (1598) "Luna is the one that got cut by 80%"
 */

const SPLIT_AT = 77;
const NAMES_AT = 168;
const SHIPPING_AT = 336;
const LUNA_FOCUS_AT = 465;
const CHORES_AT = 603;
const CUT_AT = 822;

type Tier = {
  name: string;
  color: string;
  role: string;
  shipping: string;
  price: string;
  height: number;
};

// Bar height is LINEARLY PROPORTIONAL to the real price ($5.00 / $2.50 / $1.00
// -> 1 / 0.5 / 0.2). Any other ratio softens the exact contrast this scene
// exists to make, which is that Luna is dramatically cheaper than Sol.
const TIERS: Tier[] = [
  { name: "Sol", color: c.sol, role: "expensive, smart", shipping: "overnight", price: "$5.00", height: 1 },
  { name: "Terra", color: c.terra, role: "the middle one", shipping: "standard", price: "$2.50", height: 0.5 },
  { name: "Luna", color: c.luna, role: "small, cheap, fast", shipping: "economy", price: "$1.00", height: 0.2 },
];

// the boring high-volume chores Luna actually runs, spoken in order
const CHORES = ["sorting emails", "pulling info out of documents", "routing requests"];

const TierCard: React.FC<{
  tier: Tier;
  index: number;
  frame: number;
  fps: number;
}> = ({ tier, index, frame, fps }) => {
  const isLuna = tier.name === "Luna";
  const cardIn = ease(frame, NAMES_AT + index * 16, fps, "ENTER");
  const shippingIn = ease(frame, SHIPPING_AT + index * 12, fps, "SETTLE");
  const focus = ramp(frame, LUNA_FOCUS_AT, 24);

  // once we're on Luna, the other two recede
  const dim = isLuna ? 0 : focus * 0.62;
  const pulse = idlePulse(frame, 84, index);
  const alive = isLuna && frame > LUNA_FOCUS_AT ? pulse : 0;

  const cut = ease(frame, CUT_AT, fps, "SLOW");
  const priceValue = isLuna ? interpolate(cut, [0, 1], [1.0, 0.2]) : null;

  const barH = interpolate(cardIn, [0, 1], [0, tier.height * 430]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space.sm,
        opacity: cardIn * (1 - dim),
        transform: `translateY(${interpolate(cardIn, [0, 1], [30, 0])}px) scale(${1 + alive * 0.012})`,
        flex: 1,
      }}
    >
      {/* price above the bar, outside the fixed-height zone */}
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 56,
          fontWeight: 700,
          color: isLuna && cut > 0.5 ? c.cheap : tier.color,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -1,
        }}
      >
        {priceValue !== null ? `$${priceValue.toFixed(2)}` : tier.price}
      </div>

      {/* fixed-height zone holds ONLY the bar, so nothing overflows upward */}
      <div style={{ height: 430, display: "flex", alignItems: "flex-end", width: "100%" }}>
        <div
          style={{
            width: "100%",
            height: barH,
            borderRadius: radius.md,
            background: `linear-gradient(180deg, ${tier.color}CC, ${tier.color}55)`,
            border: `1.5px solid ${tier.color}`,
            boxShadow: isLuna
              ? `0 12px 44px rgba(0,0,0,0.5), 0 0 ${26 + alive * 30}px ${tier.color}44`
              : "0 10px 34px rgba(0,0,0,0.45)",
          }}
        />
      </div>

      {/* labels live OUTSIDE the fixed-height zone */}
      <div style={{ ...type.sub, fontSize: 40, color: tier.color }}>{tier.name}</div>
      <div style={{ ...type.body, fontSize: 24, color: c.inkDim, textAlign: "center" }}>{tier.role}</div>
      <div
        style={{
          opacity: shippingIn,
          transform: `translateY(${interpolate(shippingIn, [0, 1], [10, 0])}px)`,
          padding: "6px 16px",
          borderRadius: radius.pill,
          border: `1px solid ${tier.color}44`,
          background: `${tier.color}12`,
          ...type.meta,
          color: tier.color,
          textTransform: "uppercase",
        }}
      >
        {tier.shipping}
      </div>
    </div>
  );
};

export const ThreeModelsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const splitIn = ramp(frame, SPLIT_AT, 20);
  const cutIn = ease(frame, CUT_AT, fps, "SETTLE");

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={c.cool} />
      <AmbientGlow color={frame > LUNA_FOCUS_AT ? c.luna : c.cool} seed={2} />

      <Scene chip="GPT-5.6 · three models" chipColor={c.cool}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, width: "100%" }}>
          <Sub
            style={{
              opacity: introIn,
              transform: `translateY(${interpolate(introIn, [0, 1], [14, 0])}px)`,
            }}
          >
            {splitIn > 0.5 ? (
              <>
                It isn't one model — it's <span style={{ color: c.accent }}>three</span>
              </>
            ) : (
              <>OpenAI's newest lineup</>
            )}
          </Sub>

          <div
            style={{
              display: "flex",
              gap: space.lg,
              width: "100%",
              maxWidth: 1500,
              alignItems: "flex-end",
              opacity: splitIn,
            }}
          >
            {TIERS.map((t, i) => (
              <TierCard key={t.name} tier={t} index={i} frame={frame} fps={fps} />
            ))}
          </div>

          {/* the boring high-volume chores Luna handles -- unmounted once the
              80% payoff line takes this slot, so nothing stacks up */}
          <div style={{ display: frame > CUT_AT ? "none" : "flex", gap: space.sm, minHeight: 52 }}>
            {CHORES.map((chore, i) => {
              const chIn = ease(frame, CHORES_AT + i * 40, fps, "SETTLE");
              const fade = frame > CUT_AT ? 1 - ramp(frame, CUT_AT, 20) : 1;
              return (
                <div
                  key={chore}
                  style={{
                    opacity: chIn * fade,
                    transform: `translateY(${interpolate(chIn, [0, 1], [12, 0])}px)`,
                    padding: "10px 20px",
                    borderRadius: radius.pill,
                    border: `1px solid ${c.panelLineBright}`,
                    background: c.panel,
                    fontFamily: fonts.mono,
                    fontSize: 22,
                    color: c.inkDim,
                  }}
                >
                  {chore}
                </div>
              );
            })}
          </div>

          {/* "Luna is the one that got cut by 80%" -- this REPLACES the chores
              row in normal flow rather than floating over it. An absolute
              bottom offset here collided with the caption safe area. */}
          {frame > CUT_AT && (
            <div
              style={{
                opacity: cutIn,
                transform: `translateY(${interpolate(cutIn, [0, 1], [18, 0])}px)`,
                ...type.sub,
                color: c.ink,
                textAlign: "center",
              }}
            >
              Luna is the one that got cut <span style={{ color: c.cheap }}>80%</span>
            </div>
          )}
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
