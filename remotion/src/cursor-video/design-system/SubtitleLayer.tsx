import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "./Theme";
import subtitles from "../../cursor-subtitles.json";

export const SubtitleLayer: React.FC = () => {
  const frame = useCurrentFrame();

  const currentSub = subtitles.find(
    (sub) => frame >= sub.startFrame && frame <= sub.endFrame
  );

  if (!currentSub) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none", paddingBottom: "100px" }}>
      <div style={{
        background: "rgba(9, 9, 11, 0.7)",
        padding: "16px 32px",
        borderRadius: "16px",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        maxWidth: "80%",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
      }}>
        <div style={{
          ...type.body,
          fontSize: 36,
          color: colors.textMain,
        }}>
          {currentSub.words?.map((word, index) => {
            const isActive = frame >= word.startFrame && frame <= word.endFrame;
            return (
              <span 
                key={index} 
                style={{ 
                  color: isActive ? colors.textMain : colors.textMuted,
                  transition: "color 0.1s"
                }}
              >
                {word.text}{" "}
              </span>
            );
          }) || currentSub.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
