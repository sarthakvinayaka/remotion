import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, dflt) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `--${name}=${dflt}`).split("=")[1];

const compId = arg("comp", "imggpt-video");
const outDir = arg("out", "/tmp/imggpt-stills");
const scale = parseFloat(arg("scale", "0.5"));

// --frames=1,2,3   or   --every=60 (sweep the whole timeline)
const framesArg = args.find((a) => a.startsWith("--frames="));
const everyArg = args.find((a) => a.startsWith("--every="));

console.log("Bundling...");
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/index.ts"), webpackOverride: (c) => c });

const browser = await openBrowser("chrome", {
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: compId, puppeteerInstance: browser });
console.log(`Composition ${compId}: ${composition.width}x${composition.height}, ${composition.durationInFrames} frames`);

let frames;
if (framesArg) {
  frames = framesArg.split("=")[1].split(",").map((n) => parseInt(n, 10));
} else {
  const every = parseInt((everyArg ?? "--every=60").split("=")[1], 10);
  frames = [];
  for (let f = 0; f < composition.durationInFrames; f += every) frames.push(f);
}

fs.mkdirSync(outDir, { recursive: true });
const t0 = Date.now();
for (const f of frames) {
  const out = `${outDir}/f_${String(f).padStart(5, "0")}.png`;
  await renderStill({
    composition,
    serveUrl: bundled,
    output: out,
    frame: f,
    puppeteerInstance: browser,
    imageFormat: "png",
    scale,
  });
}
const dt = (Date.now() - t0) / 1000;
console.log(`Rendered ${frames.length} stills in ${dt.toFixed(1)}s (${(frames.length / dt).toFixed(1)}/s) -> ${outDir}`);
await browser.close({ silent: true });
