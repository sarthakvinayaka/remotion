export interface VideoSegment {
  id: string;
  startFrame: number;
  endFrame: number;
}

// Generated from cursor_transcript_new.json (Whisper medium.en, word-level timestamps)
// Audio: cursor_clean.m4a — 6m 15.54s @ 30fps
export const SEGMENTS: VideoSegment[] = [
  { id: "01_Intro", startFrame: 0, endFrame: 3336 },
  { id: "02_IdeClient", startFrame: 3336, endFrame: 4350 },
  { id: "03_RepoIntel", startFrame: 4350, endFrame: 5527 },
  { id: "04_ContextEngine", startFrame: 5527, endFrame: 6778 },
  { id: "05_AgentLoop", startFrame: 6778, endFrame: 7711 },
  { id: "06_ToolLayer", startFrame: 7711, endFrame: 8430 },
  { id: "07_LlmGateway", startFrame: 8430, endFrame: 9157 },
  { id: "08_CodePipeline", startFrame: 9157, endFrame: 9647 },
  { id: "09_FinalArch", startFrame: 9647, endFrame: 11266 },
];
