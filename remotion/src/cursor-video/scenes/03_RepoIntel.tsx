import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, type } from "../design-system/Theme";
import { smoothIn, springIn } from "../design-system/Utils";
import { ArchNode } from "../design-system/ArchNode";
import { FlowArrow } from "../design-system/FlowArrow";

// 03_RepoIntel  4350→5527 frames (1177 local frames, 39.2s)
// Beat map (local frames):
//   frame   0 : "now it is the first major engineering challenge..."
//   frame 175 : "Imagine a large compute repository..."
//   frame 535 : "The system analyzes files, functions, classes..."
//   frame 788 : "similar to how Google works..."
//   frame 1109: "search engine for your code..."

export const RepoIntelScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title
  const titleIn  = smoothIn(frame, 5, 40);
  const titleOut = 1 - smoothIn(frame, 155, 30);

  // "Imagine a large repo..." — raw files appear @175
  const repoIn  = springIn(frame, 175, 50);

  // Parser + arrows @554 ("analyzes files")
  const a1In       = smoothIn(frame, 545, 35);
  const parserIn   = springIn(frame, 554, 45);
  const a2In       = smoothIn(frame, 590, 35);
  const symbolsIn  = springIn(frame, 612, 45); // "classes"
  const a3In       = smoothIn(frame, 680, 35);
  const graphIn    = springIn(frame, 717, 45); // "creates a map"

  // Google index analogy @769
  const analogyIn  = springIn(frame, 769, 60);

  // Search index + KB @957
  const a4In    = smoothIn(frame, 930, 35);
  const indexIn = springIn(frame, 957, 45);
  const a5In    = smoothIn(frame, 980, 35);
  const kbIn    = springIn(frame, 1004, 50);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>

      {/* Title */}
      <div style={{ position: "absolute", top: 100, opacity: titleIn * titleOut, textAlign: "center" }}>
        <div style={{ ...type.hero, fontSize: 60, color: colors.accentPurple }}>Repository Intelligence</div>
        <div style={{ ...type.body, fontSize: 24, color: colors.textMuted, marginTop: 12 }}>
          Engineering challenge: understanding a massive codebase
        </div>
      </div>

      {/* Horizontal pipeline — scrolls into view */}
      {repoIn > 0.1 && (
        <div style={{
          display: "flex", flexDirection: "row", alignItems: "center", gap: 0,
          padding: "0 60px",
        }}>
          {/* 1. Repo */}
          <ArchNode label="Raw Repository" icon="📁" sublabel="Thousands of files" progress={repoIn} accentColor={colors.textMuted} width={200}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8, position: "relative" }}>
              {["auth.ts","db.ts","routes.ts","models.ts","utils.ts","index.ts"].map((f, i) => (
                <div key={f} style={{
                  opacity: smoothIn(frame, 185 + i * 10, 20),
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 5, padding: "5px 8px", ...type.mono, fontSize: 11, color: colors.textMuted,
                }}>📄 {f}</div>
              ))}
              {/* Laser scan effect */}
              {parserIn > 0.01 && (
                <div style={{
                  position: "absolute",
                  top: `${smoothIn(frame, 550, 40) * 100}%`,
                  left: -10, right: -10,
                  height: 2,
                  background: colors.accentBlue,
                  boxShadow: `0 0 8px ${colors.accentBlue}`,
                  opacity: 1 - smoothIn(frame, 590, 10),
                  zIndex: 10
                }} />
              )}
            </div>
          </ArchNode>

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentBlue} progress={a1In} active={parserIn > 0.5} />

          {/* 2. Parser */}
          <ArchNode label="Code Parser" sublabel="AST analysis" icon="⚙️" progress={parserIn} active accentColor={colors.accentBlue} width={200} />

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentGreen} progress={a2In} active={symbolsIn > 0.5} />

          {/* 3. Symbol extraction */}
          <ArchNode label="Symbol Extraction" sublabel="Functions · Classes · Types" icon="🔍" progress={symbolsIn} active accentColor={colors.accentGreen} width={240}>
            {symbolsIn > 0.6 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                {["fn authenticate()", "class UserModel", "type AuthConfig"].map((s, i) => (
                  <div key={s} style={{
                    opacity: smoothIn(frame, 680 + i * 12, 20),
                    ...type.mono, fontSize: 11, color: colors.accentGreen,
                    background: "rgba(16,185,129,0.08)", padding: "3px 8px", borderRadius: 4,
                  }}>{s}</div>
                ))}
              </div>
            )}
          </ArchNode>

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentPurple} progress={a3In} active={graphIn > 0.5} />

          {/* 4. Dependency graph */}
          <ArchNode label="Dependency Graph" sublabel="Import relationships" icon="🕸️" progress={graphIn} active accentColor={colors.accentPurple} width={230}>
            {graphIn > 0.6 && (
              <svg width="130" height="80" viewBox="0 0 130 80" style={{ marginTop: 8 }}>
                <circle cx="65" cy="16" r="7" fill={colors.accentPurple} opacity={smoothIn(frame, 765, 10)} />
                <circle cx="22" cy="64" r="7" fill={colors.cardBg} stroke={colors.accentPurple} strokeWidth={2} opacity={smoothIn(frame, 775, 10)} />
                <circle cx="108" cy="64" r="7" fill={colors.cardBg} stroke={colors.accentPurple} strokeWidth={2} opacity={smoothIn(frame, 785, 10)} />
                
                {/* Dynamic edges */}
                <line x1="65" y1="23" x2="22" y2="57" stroke={colors.accentPurple} strokeWidth={1.5} opacity={0.6}
                  strokeDasharray="60" strokeDashoffset={60 - smoothIn(frame, 780, 20) * 60} />
                <line x1="65" y1="23" x2="108" y2="57" stroke={colors.accentPurple} strokeWidth={1.5} opacity={0.6}
                  strokeDasharray="60" strokeDashoffset={60 - smoothIn(frame, 790, 20) * 60} />
                <line x1="29" y1="64" x2="101" y2="64" stroke={colors.cardBorder} strokeWidth={1.5}
                  strokeDasharray="80" strokeDashoffset={80 - smoothIn(frame, 800, 20) * 80} />
              </svg>
            )}
          </ArchNode>

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentOrange} progress={a4In} active={indexIn > 0.5} />

          {/* 5. Search Index */}
          <ArchNode label="Search Index" sublabel="Embeddings + BM25" icon="🗂️" progress={indexIn} active accentColor={colors.accentOrange} width={200} />

          <FlowArrow d="M 0 1 L 50 1" viewBox="0 0 50 2" width={50} height={3} color={colors.accentBlue} progress={a5In} active={kbIn > 0.5} />

          {/* 6. Knowledge Base */}
          <ArchNode label="Code Knowledge Base" sublabel="Queryable" icon="🧠" progress={kbIn} active accentColor={colors.accentBlue} width={230}>
            {kbIn > 0.8 && (
              <div style={{
                position: "absolute", top: -20, right: -20,
                fontSize: 40, opacity: 0.5 + Math.sin(frame * 0.1) * 0.5,
                transform: `rotate(${Math.sin(frame * 0.05) * 10}deg)`,
                filter: `drop-shadow(0 0 10px ${colors.accentBlue})`
              }}>✨</div>
            )}
          </ArchNode>
        </div>
      )}

      {/* Google analogy */}
      {analogyIn > 0.01 && (
        <div style={{
          position: "absolute", bottom: 110, opacity: analogyIn,
          background: colors.cardBg, border: `1.5px solid ${colors.cardBorder}`,
          borderRadius: 16, padding: "20px 48px", textAlign: "center", maxWidth: 900,
        }}>
          <div style={{ ...type.body, fontSize: 24, color: colors.textMain }}>
            Like <span style={{ color: colors.accentBlue }}>Google indexing the web</span> before answering searches — Cursor indexes your repo before answering any question.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
