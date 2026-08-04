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
 * ONE palette. Do not inline hex in a scene -- add a named entry here.
 *
 * Semantics for THIS video: `hit`/`rare` = the informative signal we want
 * (green), `noise`/`common` = the stopword problem that breaks naive ranking
 * (coral), `accent` = the index / editorial highlight (amber), `cool` = the
 * documents and structure.
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

  accent: "#F2C879", // amber -- the index, headline emphasis
  hit: "#37E38A", // green -- rare/informative words, correct ranking
  noise: "#FF5D6C", // coral -- "the", stopwords, the wrong answer
  cool: "#5FB3F0", // blue -- documents, structure
  violet: "#C792EA", // the query / the math

  // python syntax highlighting reused from the existing code videos
  keyword: "#C792EA",
  string: "#7FD88F",
  func: "#5FB3F0",
  number: "#F2C879",
  comment: "#525A68",
  builtin: "#F0917A",
  cursor: "#F5F1E8",
  terminalGreen: "#37E38A",
  terminalRed: "#FF5D6C",
  terminalDim: "#5B6577",
};

/** Typography tiers -- 4 semantic roles. Pick the nearest, don't invent a 5th. */
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
  /** Same page padding in every scene so hero text sits at a consistent height. */
  page: 72,
  /** Captions occupy the bottom ~13% of a 1080-tall frame. */
  captionSafe: 140,
} as const;

export const elevation = {
  flat: "none",
  raised: "0 10px 34px rgba(0,0,0,0.45)",
  focal: (color: string) => `0 12px 44px rgba(0,0,0,0.5), 0 0 0 1px ${color}33, 0 0 34px ${color}22`,
} as const;

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 } as const;

/** The five documents, used by every scene that shows the corpus.
 *  These are the REAL corpus from the script -- deliberately tuned so that
 *  naive counting ranks doc 1 first for "the dog". Do not edit without
 *  re-running scripts/capture-search-output.py. */
export const DOCS: { id: number; text: string }[] = [
  { id: 1, text: "the cat sat on the mat and then the cat slept on the mat" },
  { id: 2, text: "dogs are loyal pets and dogs love to play outside" },
  { id: 3, text: "the dog barked loudly at night" },
  { id: 4, text: "python is a great programming language for beginners" },
  { id: 5, text: "learning python programming takes practice and patience" },
];
