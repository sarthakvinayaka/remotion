const fs = require('fs');

const subs = JSON.parse(fs.readFileSync('src/cursor-subtitles.json', 'utf8'));

// We want to find the start frame of specific words to mark chapter boundaries
const cues = [
  { id: "hook", find: "5 years ago" },
  { id: "wrong_arch", find: "Because cursor is not just a chat" },
  { id: "high_level", find: "Today we are going to design" },
  { id: "ide_client", find: "The first layer is the application" },
  { id: "repo_intel", find: "Now it is the first major engineering" },
  { id: "context_engine", find: "Now the system understand" },
  { id: "agent_loop", find: "Now we reach the core" },
  { id: "tool_layer", find: "The AI model itself cannot" },
  { id: "llm_gateway", find: "The final piece is the model layer" },
  { id: "code_pipeline", find: "half the challenge" },
  { id: "final_arch", find: "So if we put everything together" },
  { id: "outro", find: "And the architecture is not unique" }
];

let segments = [];
let lastFrame = 0;

for (let i = 0; i < cues.length; i++) {
  const cue = cues[i];
  let startFrame = 0;
  
  if (i > 0) {
    // find the block in subs that matches
    const sub = subs.find(s => s.text.toLowerCase().includes(cue.find.toLowerCase()));
    if (sub) {
       startFrame = sub.startFrame;
    } else {
       console.log("NOT FOUND:", cue.find);
       // fallback search in words
       for (const s of subs) {
         const joined = s.words.map(w => w.text).join(" ");
         if (joined.toLowerCase().includes(cue.find.toLowerCase())) {
            startFrame = s.startFrame;
            break;
         }
       }
    }
  }
  
  if (i > 0) {
    segments[i-1][3] = startFrame;
  }
  
  segments.push([cue.id, "narration", startFrame, 0]);
}

segments[segments.length - 1][3] = subs[subs.length - 1].endFrame; // Last frame

console.log(JSON.stringify(segments, null, 2));
fs.writeFileSync('src/cursor-segments.json', JSON.stringify(segments, null, 2));

