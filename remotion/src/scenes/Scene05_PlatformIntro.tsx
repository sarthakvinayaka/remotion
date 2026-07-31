import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { palette, fonts } from "../theme";
import { KineticWords, Chip, GridBg } from "../components/shared";

export const Scene05PlatformIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // rescaled for 679f duration (final_audio.m4a)
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  const roadIn = spring({ frame: frame - 100, fps, config: { damping: 22 } });
  // first team-car keyed near "...product for your developers" (local 136-197)
  const carsIn = spring({ frame: frame - 150, fps, config: { damping: 18 } });
  // split to track the actual clauses: "building blocks" lands at local 438, "gives you the paved road" at local 497
  const punch1 = spring({ frame: frame - 438, fps, config: { damping: 18 } });
  const punch2 = spring({ frame: frame - 497, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1000px 600px at 70% 20%, ${palette.accent}18, transparent 60%), ${palette.bg}` }}>
      <GridBg opacity={0.05} color={palette.accent} />
      <AbsoluteFill style={{ padding: 80 }}>
        <div style={{ opacity: titleIn, marginBottom: 16 }}>
          <Chip label="Enter · Platform Engineering" color={palette.accent} />
        </div>
        <KineticWords text="Build an internal product for developers." size={58} />

        {/* Paved road metaphor: horizontal band + dashed centerline */}
        <div style={{
          position: "absolute", left: 60, right: 60, top: 340, height: 220,
          borderRadius: 24, overflow: "hidden",
          background: `linear-gradient(180deg, ${palette.surface}, ${palette.bgAlt})`,
          border: `1.5px solid ${palette.line}`,
          opacity: roadIn,
          transform: `scaleX(${interpolate(roadIn,[0,1],[0.4,1])})`,
          transformOrigin: "left center",
        }}>
          {/* dashed line moving */}
          {new Array(20).fill(0).map((_, i) => {
            const shift = (frame * 6) % 120;
            return (
              <div key={i} style={{
                position: "absolute", top: 100, left: i * 120 - shift,
                width: 60, height: 6, borderRadius: 4, background: palette.primary,
                opacity: 0.9,
              }} />
            );
          })}
          <div style={{ position: "absolute", left: 30, top: 14, fontFamily: fonts.mono, fontSize: 14, color: palette.accent, letterSpacing: 3, textTransform: "uppercase" }}>
            The paved road
          </div>
          <div style={{ position: "absolute", right: 30, top: 14, fontFamily: fonts.mono, fontSize: 12, color: palette.muted, letterSpacing: 2, textTransform: "uppercase" }}>
            standard · defaults · zero yak-shaving
          </div>
        </div>

        {/* Cars = teams moving along road, continuous procession — kept below the label band (label bottom ~34px within the road box, i.e. ~374px absolute) */}
        {[
          { t: "team.orders", off: 0,   lane: 0, color: palette.accent },
          { t: "team.pay",    off: 124, lane: 1, color: palette.primary },
          { t: "team.search", off: 62,  lane: 2, color: palette.violet },
        ].map(({ t, off, lane, color }, i) => {
          const roadLeft = 60, roadRight = 60, laneW = 1280 - roadLeft - roadRight;
          const period = 247;
          const raw = ((frame - 203 - off) % period + period) % period;
          const p = raw / period;
          const travel = interpolate(p, [0, 1], [-140, laneW]);
          const appear = spring({ frame: frame - (150 + off), fps, config: { damping: 18 } });
          return (
            <div key={i} style={{
              position: "absolute", top: 410 + lane * 48, left: roadLeft + travel,
              padding: "6px 12px", borderRadius: 8,
              background: `${color}22`, border: `1.5px solid ${color}`,
              fontFamily: fonts.mono, color, fontSize: 13, fontWeight: 700,
              opacity: appear * interpolate(p, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
              boxShadow: `0 0 14px ${color}44`,
              whiteSpace: "nowrap",
            }}>▸ {t}</div>
          );
        })}

        <div style={{
          position: "absolute", left: 60, right: 60, bottom: 50,
          fontFamily: fonts.display, fontSize: 34, fontWeight: 700, color: palette.ink, lineHeight: 1.2,
        }}>
          <div style={{ opacity: punch1, transform: `translateY(${interpolate(punch1,[0,1],[24,0])}px)` }}>
            Microservices give you <span style={{ color: palette.primary }}>building blocks</span>.
          </div>
          <div style={{ opacity: punch2, transform: `translateY(${interpolate(punch2,[0,1],[24,0])}px)` }}>
            Platform engineering gives you the <span style={{ color: palette.accent }}>paved road</span>.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
