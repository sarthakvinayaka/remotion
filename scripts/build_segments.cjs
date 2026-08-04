const fs = require('fs');
const path = require('path');

const subtitlesPath = path.join(__dirname, '../remotion/src/cursor-subtitles.json');
const subtitles = JSON.parse(fs.readFileSync(subtitlesPath, 'utf8'));

// We will find the exact start frame of the first subtitle that matches or contains our search string
const scenes = [
  { id: '01_Intro', searchStr: '5 years ago' },
  { id: '02_IdeClient', searchStr: 'the cursor editor is responsible for' },
  { id: '03_RepoIntel', searchStr: 'the first engineering challenge is understanding' },
  { id: '04_ContextEngine', searchStr: 'the context engine decides what information' },
  { id: '05_AgentLoop', searchStr: 'unlike a chatbot' },
  { id: '06_ToolLayer', searchStr: 'the model cannot interact' },
  { id: '07_LlmGateway', searchStr: 'the final piece is the model layer' },
  { id: '08_CodePipeline', searchStr: 'coding code is only half' }, // Might be "C oding code" in whisper
  { id: '09_FinalArch', searchStr: 'so if we put everything together' },
  { id: '10_Outro', searchStr: 'and the architecture is not unique' }
];

let segments = [];
let currentSceneIndex = 0;

for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  
  // Find the matching subtitle
  // Some whisper transcripts are messy, so we normalize
  const searchNormalized = scene.searchStr.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let startFrame = 0;
  if (i > 0) {
    const match = subtitles.find(s => {
      const textNormalized = s.text.toLowerCase().replace(/[^a-z0-9]/g, '');
      return textNormalized.includes(searchNormalized);
    });
    
    if (match) {
      startFrame = match.startFrame;
    } else {
      console.warn(`WARNING: Could not find match for "${scene.searchStr}"`);
      // Fallback: just use some arbitrary offset if not found (should not happen)
      startFrame = segments[i-1].endFrame;
    }
  }

  // Update previous segment's endFrame
  if (i > 0) {
    segments[i - 1].endFrame = startFrame;
  }

  segments.push({
    id: scene.id,
    startFrame: startFrame,
    endFrame: 11238 // Will be overridden by the next scene, or remains 11238 for the last scene
  });
}

// Generate the TypeScript file content
let tsContent = `// AUTO-GENERATED from cursor-subtitles.json
export interface VideoSegment {
  id: string;
  startFrame: number;
  endFrame: number;
}

export const SEGMENTS: VideoSegment[] = [
`;

segments.forEach(seg => {
  tsContent += `  { id: "${seg.id}", startFrame: ${seg.startFrame}, endFrame: ${seg.endFrame} },\n`;
});

tsContent += `];\n`;

const outPath = path.join(__dirname, '../remotion/src/cursor-video/cursor-segments.ts');
// Ensure directory exists
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, tsContent);

console.log('Successfully generated cursor-segments.ts');
