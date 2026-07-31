import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith("--out="));
const rangeArg = args.find((a) => a.startsWith("--frames="));
const outputLocation = outArg ? outArg.split("=")[1] : "/mnt/documents/output.mp4";
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
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

console.log("Rendering to", outputLocation, "range", frameRange);
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation,
  puppeteerInstance: browser,
  muted: false,
  concurrency: 2,
  frameRange: frameRange ?? undefined,
  crf: 22,
});

await browser.close({ silent: false });
console.log("Done:", outputLocation);
