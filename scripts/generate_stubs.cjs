const fs = require('fs');
const path = require('path');

const scenes = [
  "01_Intro", "02_IdeClient", "03_RepoIntel", "04_ContextEngine", 
  "05_AgentLoop", "06_ToolLayer", "07_LlmGateway", "08_CodePipeline", "09_FinalArch"
];

const scenesDir = path.join(__dirname, '../remotion/src/cursor-video/scenes');
fs.mkdirSync(scenesDir, { recursive: true });

scenes.forEach(scene => {
  const content = `import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, type } from "../design-system/Theme";

export const ${scene.split('_')[1]}Scene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...type.hero, color: colors.textMuted, fontSize: 40 }}>${scene}</div>
    </AbsoluteFill>
  );
};
`;
  fs.writeFileSync(path.join(scenesDir, `${scene}.tsx`), content);
});
console.log('Stubs created');
