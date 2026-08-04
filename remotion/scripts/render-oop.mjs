import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, dflt) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `--${name}=${dflt}`).split("=")[1];

const compId = arg("comp", "oop-video");
const outputLocation = arg("out", path.resolve(__dirname, "../out/oop-video-4k.mp4"));
// Keep the composition at its 1920x1080 design resolution and supersample
// with scale=2 -> 3840x2160. Changing composition dimensions instead would
// strand every hardcoded pixel size on a bigger canvas.
const scale = parseFloat(arg("scale", "2"));
const crf = parseInt(arg("crf", "18"), 10);
const concurrency = parseInt(arg("concurrency", "4"), 10);

const rangeArg = args.find((a) => a.startsWith("--frames="));
let frameRange = null;
if (rangeArg) {
  const [a, b] = rangeArg.split("=")[1].split("-").map((n) => parseInt(n, 10));
  frameRange = [a, b];
}

console.log("Bundling...");
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

console.log("Launching browser...");
const browser = await openBrowser("chrome", {
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: compId, puppeteerInstance: browser });
console.log(
  `Composition ${compId}: ${composition.width}x${composition.height} @${composition.fps}fps, ` +
    `${composition.durationInFrames} frames -> output ${composition.width * scale}x${composition.height * scale}`
);

const t0 = Date.now();
let lastPct = -1;
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation,
  puppeteerInstance: browser,
  muted: false,
  concurrency,
  scale,
  crf,
  frameRange: frameRange ?? undefined,
  onProgress: ({ renderedFrames, encodedFrames }) => {
    const total = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
    const pct = Math.floor((renderedFrames / total) * 100);
    if (pct !== lastPct && pct % 5 === 0) {
      const el = (Date.now() - t0) / 1000;
      const eta = renderedFrames > 0 ? (el / renderedFrames) * (total - renderedFrames) : 0;
      console.log(
        `progress ${pct}% rendered=${renderedFrames}/${total} encoded=${encodedFrames} ` +
          `elapsed=${el.toFixed(0)}s eta=${eta.toFixed(0)}s`
      );
      lastPct = pct;
    }
  },
});

console.log(`Done in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min:`, outputLocation);
await browser.close({ silent: true });
