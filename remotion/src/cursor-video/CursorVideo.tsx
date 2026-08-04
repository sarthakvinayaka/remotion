import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { SEGMENTS } from "./cursor-segments";
import { colors } from "./design-system/Theme";

import { IntroScene } from "./scenes/01_Intro";
import { IdeClientScene } from "./scenes/02_IdeClient";
import { RepoIntelScene } from "./scenes/03_RepoIntel";
import { ContextEngineScene } from "./scenes/04_ContextEngine";
import { AgentLoopScene } from "./scenes/05_AgentLoop";
import { ToolLayerScene } from "./scenes/06_ToolLayer";
import { LlmGatewayScene } from "./scenes/07_LlmGateway";
import { CodePipelineScene } from "./scenes/08_CodePipeline";
import { FinalArchScene } from "./scenes/09_FinalArch";
import { SubtitleLayer } from "./design-system/SubtitleLayer";
import { AnimatedGrid } from "./design-system/AnimatedGrid";

export const TOTAL_FRAMES = 11266; // cursor_clean.m4a = 375.54s @ 30fps

const FadeTransition: React.FC<{ children: React.ReactNode, durationInFrames: number }> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  // 15 frame fade in, 15 frame fade out
  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <div style={{ position: "absolute", inset: 0, opacity }}>{children}</div>;
};

const getSceneComponent = (id: string) => {
  switch (id) {
    case "01_Intro": return <IntroScene />;
    case "02_IdeClient": return <IdeClientScene />;
    case "03_RepoIntel": return <RepoIntelScene />;
    case "04_ContextEngine": return <ContextEngineScene />;
    case "05_AgentLoop": return <AgentLoopScene />;
    case "06_ToolLayer": return <ToolLayerScene />;
    case "07_LlmGateway": return <LlmGatewayScene />;
    case "08_CodePipeline": return <CodePipelineScene />;
    case "09_FinalArch": return <FinalArchScene />;
    default: return <div style={{ color: "white" }}>Missing: {id}</div>;
  }
};

export const CursorVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AnimatedGrid />
      <Audio src={staticFile("cursor_clean.m4a")} />

      {SEGMENTS.map((segment) => {
        const duration = segment.endFrame - segment.startFrame;
        return (
          <Sequence key={segment.id} from={segment.startFrame} durationInFrames={duration}>
            <FadeTransition durationInFrames={duration}>
              {getSceneComponent(segment.id)}
            </FadeTransition>
          </Sequence>
        );
      })}
      
      <SubtitleLayer />
    </AbsoluteFill>
  );
};
