import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";

const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const cvFonts = {
  mono: mono.fontFamily,
  display: display.fontFamily,
};

// Dark editorial look, distinct accent per service -- consistent across
// CodeTypewriter, TerminalOutput and SystemDiagram.
export const cv = {
  bg: "#0B0E14",
  panel: "#11151D",
  panelLine: "#1F2530",
  ink: "#E8ECF1",
  muted: "#5B6577",
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
  services: {
    "Order Service": "#5FB3F0",
    "Payment Service": "#F2C879",
    "Inventory Service": "#7FD88F",
    "Notification Service": "#C792EA",
  } as Record<string, string>,
};

export const serviceColor = (service: string | null | undefined): string =>
  (service && cv.services[service]) || cv.muted;
