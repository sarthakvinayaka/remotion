import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpace } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const inter = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
const space = loadSpace("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const fonts = {
  body: inter.fontFamily,
  display: space.fontFamily,
  mono: mono.fontFamily,
};

// Palette: warm-tech, dark editorial. Amber primary, teal accent, magenta accent2.
export const palette = {
  bg: "#0B0D10",
  bgAlt: "#12161B",
  surface: "#1A2029",
  ink: "#F5F1E8",
  muted: "#8A93A0",
  line: "#242B36",
  primary: "#FFB547", // amber
  primaryDim: "#8A5A1A",
  accent: "#4DD4B0", // teal
  accent2: "#FF5D73", // coral for pain
  violet: "#8B7CFF",
};
