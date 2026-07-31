import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const whisperDir = path.join(import.meta.dirname, "..", "whisper-cpp");
const audioSrc = path.join(import.meta.dirname, "..", "..", "gptworking_clean.m4a");
const wavPath = path.join(import.meta.dirname, "..", "public", "gpt_vo.wav");

fs.mkdirSync(path.dirname(wavPath), { recursive: true });

console.log("Converting to 16kHz mono wav...");
execSync(`ffmpeg -y -i "${audioSrc}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`, { stdio: "inherit" });

console.log("Transcribing...");
const whisperCppOutput = await transcribe({
  inputPath: wavPath,
  whisperPath: whisperDir,
  whisperCppVersion: "1.5.5",
  model: "medium.en",
  tokenLevelTimestamps: true,
});

fs.writeFileSync(
  path.join(import.meta.dirname, "..", "src", "gpt-raw-transcription.json"),
  JSON.stringify(whisperCppOutput, null, 2)
);

const { captions } = toCaptions({ whisperCppOutput });

fs.writeFileSync(
  path.join(import.meta.dirname, "..", "src", "gpt-captions.json"),
  JSON.stringify(captions, null, 2)
);

console.log(`Done. ${captions.length} caption tokens written to src/gpt-captions.json`);
