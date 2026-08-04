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
 * Typography tiers. The brief caps on-screen text at ~4 words, so `word` is
 * the workhorse — big single-concept labels (PIXELS, PATCHES, ATTENTION).
 */
export const type = {
  word: { fontSize: 140, fontWeight: 700, fontFamily: display.fontFamily, letterSpacing: -4, lineHeight: 1 },
  hero: { fontSize: 96, fontWeight: 700, fontFamily: display.fontFamily, letterSpacing: -2.5, lineHeight: 1.05 },
  sub: { fontSize: 54, fontWeight: 700, fontFamily: display.fontFamily, letterSpacing: -1, lineHeight: 1.15 },
  body: { fontSize: 34, fontWeight: 500, fontFamily: body.fontFamily, lineHeight: 1.35 },
  meta: { fontSize: 22, fontWeight: 500, fontFamily: mono.fontFamily, letterSpacing: 1.6, lineHeight: 1.3 },
} as const;

export const space = {
  xs: 8,
  sm: 14,
  md: 24,
  lg: 40,
  xl: 68,
  page: 76,
  /** captions occupy the bottom ~13% of a 1080-tall frame */
  captionSafe: 140,
} as const;

export const radius = { sm: 8, md: 14, lg: 24, xl: 34, pill: 999 } as const;

/**
 * SOUND DESIGN CUE SHEET — placeholders only, no audio files, per the brief.
 * Global frames. Wire these to real assets later if wanted; the composition
 * currently plays narration only.
 *
 *   [whoosh]     0, 934, 2422, 4446, 6542, 8828     scene/chapter changes
 *   [click]      1039                               the Upload button press
 *   [camera]     1404, 1560                         zoom into the pixel grid
 *   [pop]        1649, 1720, 1790                   R, G, B values landing
 *   [particles]  2422-3197                          patches separating
 *   [synth]      3197, 5347                         embeddings / language
 *   [digital]    4446-5106                          attention web
 *   [typing]     6214-6542                          token generation
 *   [riser]      6817-7708                          diffusion denoise
 */
export const SFX_CUES = [
  { at: 0, kind: "whoosh" },
  { at: 934, kind: "whoosh" },
  { at: 1039, kind: "click" },
  { at: 1404, kind: "camera" },
  { at: 1649, kind: "pop" },
  { at: 2422, kind: "whoosh" },
  { at: 3197, kind: "synth" },
  { at: 4446, kind: "digital" },
  { at: 5347, kind: "synth" },
  { at: 6214, kind: "typing" },
  { at: 6542, kind: "whoosh" },
  { at: 6817, kind: "riser" },
  { at: 8828, kind: "whoosh" },
] as const;
