import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { cv, cvFonts } from "./theme";

type Stage = "text" | "encode" | "model" | "sample" | "generate";

const STAGES: { id: Stage; label: string; detail: string; color: string }[] = [
  { id: "text", label: "words", detail: "training text", color: cv.string },
  { id: "encode", label: "token IDs", detail: "words → numbers", color: cv.keyword },
  { id: "model", label: "context", detail: "count what follows", color: cv.func },
  { id: "sample", label: "weights", detail: "possible next IDs", color: cv.number },
  { id: "generate", label: "next token", detail: "append and repeat", color: cv.terminalGreen },
];

// A compact visual compass for the code chapters. It deliberately mirrors the
// final recap so viewers can keep their place while the implementation grows.
export const PipelineMap: React.FC<{ active: Stage }> = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const activeIndex = STAGES.findIndex((stage) => stage.id === active);

  return (
    <div style={{ width: 610, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontFamily: cvFonts.mono, fontSize: 11, color: cv.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
        Tiny GPT pipeline
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 7 }}>
        {STAGES.map((stage, i) => {
          const isActive = i === activeIndex;
          const complete = i < activeIndex;
          const enter = spring({ frame: frame - i * 5, fps, config: { damping: 16, stiffness: 200 } });
          const color = isActive ? stage.color : complete ? cv.terminalGreen : cv.panelLine;
          return (
            <React.Fragment key={stage.id}>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  opacity: interpolate(enter, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(enter, [0, 1], [10, 0])}px)`,
                  border: `1.5px solid ${color}`,
                  background: isActive ? `${stage.color}18` : complete ? `${cv.terminalGreen}0e` : cv.panel,
                  borderRadius: 10,
                  padding: "12px 8px",
                  boxShadow: isActive ? `0 0 18px ${stage.color}2b` : "none",
                }}
              >
                <div style={{ fontFamily: cvFonts.mono, fontSize: 12, fontWeight: 700, color: isActive ? stage.color : complete ? cv.terminalGreen : cv.muted, whiteSpace: "nowrap" }}>
                  {complete ? "✓ " : ""}{stage.label}
                </div>
                <div style={{ fontFamily: cvFonts.mono, fontSize: 9, lineHeight: 1.25, color: isActive ? cv.ink : cv.muted, marginTop: 5 }}>
                  {stage.detail}
                </div>
              </div>
              {i < STAGES.length - 1 && <div style={{ alignSelf: "center", color: i < activeIndex ? cv.terminalGreen : cv.muted, fontFamily: cvFonts.mono, fontSize: 13 }}>→</div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
