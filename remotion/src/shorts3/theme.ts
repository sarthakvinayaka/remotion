import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const anton = loadAnton("normal", { subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

// Visual identity for the "10 Services, 10x the Work" short — reuses the
// channel's thumbnail palette, distinct from the main video's amber/teal theme.
export const s3 = {
  ink: "#0C112D",
  bgTop: "#10163A",
  bgBottom: "#090C20",
  paper: "#F7F4EC",
  alarm: "#FF4A3D",
  signal: "#35E0C1",
  dim: "#7C87B5",
};

export const s3Fonts = {
  display: anton.fontFamily,
  mono: mono.fontFamily,
};
