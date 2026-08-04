import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const fonts = {
  mono: mono.fontFamily,
  display: display.fontFamily,
  body: body.fontFamily,
};

/**
 * ONE palette. Do not inline hex anywhere in a scene -- add a named entry
 * here instead. (A genuinely literal colour, e.g. pure black inside a
 * terminal chrome, is the only fair exception.)
 *
 * Semantics: `up`/`expensive` = the old, costly, pressured thing (coral).
 * `down`/`cheap` = the saving, the cut, the win (green). `accent` is the
 * editorial highlight; `rival` is for competitor/China framing.
 */
export const c = {
  bg: "#0B0E14",
  bgLift: "#0F131B",
  panel: "#11151D",
  panelLine: "#1F2530",
  panelLineBright: "#2C3543",

  ink: "#E8ECF1",
  inkDim: "#9AA5B5",
  muted: "#5B6577",

  accent: "#F2C879", // amber -- headline emphasis, price framing
  cheap: "#37E38A", // green -- savings, the cut, correctness
  expensive: "#FF5D6C", // coral -- cost, waste, pressure
  cool: "#5FB3F0", // blue -- infrastructure, the machinery
  violet: "#C792EA", // the AI doing the work
  rival: "#FF9F6B", // competitor / China framing

  // the three GPT-5.6 models, consistent everywhere they appear
  sol: "#FF5D6C",
  terra: "#F2C879",
  luna: "#37E38A",
};

/**
 * Typography tiers. Four semantic roles, one size each per context.
 * If a scene needs a size that is not here, it is drift -- pick the
 * nearest tier rather than inventing a fifth.
 */
export const type = {
  hero: { fontSize: 104, fontWeight: 700, fontFamily: display.fontFamily, lineHeight: 1.04, letterSpacing: -1.5 },
  sub: { fontSize: 58, fontWeight: 700, fontFamily: display.fontFamily, lineHeight: 1.15, letterSpacing: -0.5 },
  body: { fontSize: 36, fontWeight: 500, fontFamily: body.fontFamily, lineHeight: 1.35 },
  meta: { fontSize: 22, fontWeight: 500, fontFamily: mono.fontFamily, lineHeight: 1.3, letterSpacing: 0.4 },
} as const;

/** Named spacing scale -- no per-component pixel guesses. */
export const space = {
  xs: 8,
  sm: 14,
  md: 24,
  lg: 40,
  xl: 64,
  /** Every scene uses the SAME page padding so hero text sits at a
   *  consistent height across scenes. */
  page: 72,
  /** Captions occupy the bottom ~13% of a 1080-tall frame (the cue block
   *  sits at bottom:34 and is ~76px tall). Scene content must stay above
   *  this line. */
  captionSafe: 140,
} as const;

/** Elevation for the active/focal element so focus is directed. */
export const elevation = {
  flat: "none",
  raised: "0 10px 34px rgba(0,0,0,0.45)",
  focal: (color: string) => `0 12px 44px rgba(0,0,0,0.5), 0 0 0 1px ${color}33, 0 0 34px ${color}22`,
} as const;

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 } as const;
