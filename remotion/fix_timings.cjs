const fs = require('fs');

const SCENES = [
  // ScenesIntro
  { name: 'WrongArchScene', file: 'ScenesIntro.tsx', oldStart: 1750, oldLen: 1140, newStart: 1380, newLen: 680 },
  { name: 'HighLevelScene', file: 'ScenesIntro.tsx', oldStart: 2890, oldLen: 560, newStart: 2060, newLen: 506 },
  // ScenesCore
  { name: 'IdeClientScene', file: 'ScenesCore.tsx', oldStart: 3450, oldLen: 1050, newStart: 2566, newLen: 786 },
  { name: 'RepoIntelScene', file: 'ScenesCore.tsx', oldStart: 4500, oldLen: 1250, newStart: 3352, newLen: 791 },
  { name: 'ContextEngineScene', file: 'ScenesCore.tsx', oldStart: 5750, oldLen: 1400, newStart: 4143, newLen: 919 },
  { name: 'AgentLoopScene', file: 'ScenesCore.tsx', oldStart: 7150, oldLen: 950, newStart: 5062, newLen: 1042 },
  // ScenesExecution
  { name: 'ToolLayerScene', file: 'ScenesExecution.tsx', oldStart: 8100, oldLen: 800, newStart: 6104, newLen: 590 },
  { name: 'LlmGatewayScene', file: 'ScenesExecution.tsx', oldStart: 8900, oldLen: 700, newStart: 6694, newLen: 731 },
  { name: 'CodePipelineScene', file: 'ScenesExecution.tsx', oldStart: 9600, oldLen: 600, newStart: 7425, newLen: 579 },
  { name: 'FinalArchScene', file: 'ScenesExecution.tsx', oldStart: 10200, oldLen: 800, newStart: 8004, newLen: 2744 },
  { name: 'OutroScene', file: 'ScenesExecution.tsx', oldStart: 11000, oldLen: 876, newStart: 10748, newLen: 490 }
];

['ScenesIntro.tsx', 'ScenesCore.tsx', 'ScenesExecution.tsx'].forEach(file => {
  let content = fs.readFileSync(`src/cursor-video/${file}`, 'utf-8');
  
  SCENES.filter(s => s.file === file).forEach(scene => {
    // Find the block for this scene
    const regex = new RegExp(`(export const ${scene.name}.*?)(?=\nexport const|$)`, 's');
    content = content.replace(regex, (match) => {
      let updatedMatch = match;
      
      // Remove const L = ... (if it hasn't been removed yet)
      updatedMatch = updatedMatch.replace(/const L = \(g: number\) => g - \d+;\n\s*/g, '');
      
      // Replace L(X) with relative calculated frame
      updatedMatch = updatedMatch.replace(/L\(([^)]+)\)/g, (full, exp) => {
        try {
          const oldG = eval(exp);
          const rel = oldG - scene.oldStart;
          const newRel = Math.floor(rel * (scene.newLen / scene.oldLen));
          return `${newRel}`;
        } catch(e) {
          console.error("Failed to eval:", exp);
          return full;
        }
      });
      return updatedMatch;
    });
  });
  
  fs.writeFileSync(`src/cursor-video/${file}`, content);
});
console.log("Done");
