import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { ease, idlePulse, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, Chip, GridBg } from "./ui";
import { CodeTypewriter } from "../code-video/CodeTypewriter";
import { TerminalOutput, type TraceLine } from "../code-video/TerminalOutput";
import type { Anchor } from "./searchTypingSchedule";

/**
 * Code-walkthrough shell. In these segments the CODE is primary and the
 * side panel is deliberately secondary -- per the brief, supporting visuals
 * in a code section should not compete with the code.
 *
 * Layout is a fixed two-column grid so the code pane never resizes when the
 * side panel's content changes; a reflowing code pane reads as a glitch.
 */
export const SearchCodeScene: React.FC<{
  title: string;
  code: string;
  previousCode?: string;
  schedule?: Anchor[];
  duration: number;
  trace?: TraceLine[];
  terminalFrames?: number[];
  side?: React.ReactNode;
  /** Per-line terminal colours -- lets a FAILING run render coral. */
  lineColors?: (string | null)[];
  /** Segment mood: tints the grid + ambient glow. Coral on the failure beat,
   *  green on the fix, cool everywhere else. */
  mood?: string;
}> = ({ title, code, previousCode, schedule, duration, trace, terminalFrames, side, lineColors, mood }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");

  // Size the code from the ACTUAL rendered document. `previousCode` is drawn
  // dimmed above the new lines, so sizing off `code` alone under-counts the
  // real height and clipped the last line mid-glyph (frame 2640, which is
  // literally the line the narration calls "the whole index").
  const allLines = Math.max(code.split("\n").length, (previousCode ?? "").split("\n").length);
  const longest = Math.max(...code.split("\n").map((l) => l.length));
  const hasTrace = !!(trace && trace.length);
  // pane inner height: 1080 - page(72) - captionSafe(140) - chip(62) - titlebar(34) - padding(48)
  const AVAIL = 724 - (hasTrace ? 210 : 0);
  const byHeight = Math.floor(AVAIL / (allLines * 1.55));
  const byWidth = Math.floor(1000 / (longest * 0.6));
  const codeFont = Math.max(13, Math.min(byHeight, byWidth, 26));

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.035} color={mood ?? c.cool} />
      <AmbientGlow color={mood ?? c.cool} seed={1} />

      <AbsoluteFill
        style={{
          padding: space.page,
          paddingBottom: space.captionSafe,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [12, 0])}px)`,
            marginBottom: space.md,
            display: "flex",
            alignItems: "center",
            gap: space.md,
          }}
        >
          <Chip label={title} color={mood ?? c.accent} />
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: side ? "1.5fr 1fr" : "1fr",
            gap: space.lg,
            minHeight: 0,
          }}
        >
          {/* CODE -- primary */}
          <div
            style={{
              background: c.panel,
              border: `1.5px solid ${c.panelLine}`,
              borderRadius: radius.lg,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
              padding: space.md,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: space.sm,
            }}
          >
            <div style={{ display: "flex", gap: 7, paddingLeft: 4, flexShrink: 0 }}>
              {[c.noise, c.accent, c.hit].map((dot) => (
                <span key={dot} style={{ width: 11, height: 11, borderRadius: radius.pill, background: `${dot}88` }} />
              ))}
              <span style={{ ...type.meta, color: c.muted, marginLeft: space.sm }}>search.py</span>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <CodeTypewriter
                code={code}
                previousCode={previousCode}
                startFrame={0}
                endFrame={duration}
                schedule={schedule}
                fontSize={codeFont}
              />
            </div>
            {trace && trace.length > 0 && (
              <div
                style={{
                  flexShrink: 0,
                  borderTop: `1px solid ${c.panelLineBright}`,
                  paddingTop: space.sm,
                  fontFamily: fonts.mono,
                }}
              >
                <TerminalOutput
                  trace={trace}
                  startFrame={0}
                  endFrame={duration}
                  fontSize={20}
                  maxLines={6}
                  lineFrames={terminalFrames}
                  lineColors={lineColors}
                  accent={mood}
                />
              </div>
            )}
          </div>

          {/* SIDE PANEL -- secondary by design */}
          {side ? <div style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>{side}</div> : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Small heading for side-panel blocks. */
export const SideTitle: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = c.accent }) => (
  <div style={{ ...type.meta, color, textTransform: "uppercase", marginBottom: space.sm }}>{children}</div>
);

/** A pulsing focal wrapper for whatever the narration is currently about. */
export const Focal: React.FC<{ children: React.ReactNode; color?: string; active?: boolean }> = ({
  children,
  color = c.hit,
  active = true,
}) => {
  const frame = useCurrentFrame();
  const p = idlePulse(frame, 88, 2);
  return (
    <div
      style={{
        borderRadius: radius.lg,
        border: `1.5px solid ${active ? `${color}66` : c.panelLine}`,
        background: active ? c.bgLift : c.panel,
        boxShadow: active
          ? `0 12px 40px rgba(0,0,0,0.5), 0 0 ${18 + p * 20}px ${color}22`
          : "0 8px 24px rgba(0,0,0,0.4)",
        padding: space.md,
      }}
    >
      {children}
    </div>
  );
};
