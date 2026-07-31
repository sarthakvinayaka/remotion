import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const frames = (args.find((a) => a.startsWith("--frames=")) ?? "--frames=100").split("=")[1].split(",").map((n) => parseInt(n, 10));
const outDir = (args.find((a) => a.startsWith("--out=")) ?? "--out=/tmp/stills").split("=")[1];

const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/index.ts"), webpackOverride: (c) => c });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });
import fs from "fs";
fs.mkdirSync(outDir, { recursive: true });
for (const f of frames) {
  const out = `${outDir}/f_${f}.png`;
  console.log("Still", f, "->", out);
  await renderStill({ composition, serveUrl: bundled, output: out, frame: f, puppeteerInstance: browser, imageFormat: "png", scale: 0.5 });
}
await browser.close({ silent: false });
