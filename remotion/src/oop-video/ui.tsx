import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { c, fonts, radius, space, type } from "./theme";
import { idlePulse } from "./motion";

/**
 * Ambient drifting grid. Used ONLY as a background when a scene would
 * otherwise be completely static -- never as a substitute for animating the
 * thing the narration is actually about.
 */
export const GridBg: React.FC<{ opacity?: number; color?: string; speed?: number }> = ({
  opacity = 0.05,
  color = c.cool,
  speed = 0.25,
}) => {
  const frame = useCurrentFrame();
  const shift = (frame * speed) % 64;
  return (
    <div
      style={{
        position: "absolute",
        inset: -90,
        backgroundImage: `linear-gradient(${color}88 1px, transparent 1px), linear-gradient(90deg, ${color}88 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        transform: `translate(${-shift}px, ${-shift}px)`,
        opacity,
      }}
    />
  );
};

/** Slow radial wash so flat backgrounds still breathe. Deterministic. */
export const AmbientGlow: React.FC<{ color?: string; seed?: number }> = ({ color = c.cool, seed = 0 }) => {
  const frame = useCurrentFrame();
  const p = idlePulse(frame, 260, seed);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(120% 90% at 50% ${34 + p * 6}%, ${color}${p > 0.5 ? "1A" : "14"} 0%, transparent 62%)`,
      }}
    />
  );
};

/** Small uppercase label chip -- the `meta` type tier. */
export const Chip: React.FC<{ label: string; color?: string; dim?: boolean }> = ({
  label,
  color = c.accent,
  dim = false,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: space.xs,
      padding: "7px 15px",
      borderRadius: radius.pill,
      border: `1px solid ${color}${dim ? "33" : "55"}`,
      background: `${color}12`,
      color,
      fontFamily: fonts.mono,
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      opacity: dim ? 0.65 : 1,
    }}
  >
    <span style={{ width: 6, height: 6, background: color, borderRadius: radius.pill, boxShadow: `0 0 8px ${color}` }} />
    {label}
  </div>
);

/**
 * Standard scene shell: consistent page padding + a top-left chip slot, so
 * every scene's hero content starts at the same height. Content is kept
 * clear of the caption safe area automatically.
 */
export const Scene: React.FC<{
  chip?: string;
  chipColor?: string;
  children: React.ReactNode;
  center?: boolean;
}> = ({ chip, chipColor, children, center = true }) => (
  <AbsoluteFill
    style={{
      padding: space.page,
      paddingBottom: space.captionSafe,
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* The chip is absolutely positioned so it does NOT consume vertical
        space -- otherwise every scene's content is pushed down by the chip
        height plus its margin, and then re-centred in a shorter box, which
        left the lower third of the frame empty in every scene. */}
    {chip ? (
      <div style={{ position: "absolute", left: space.page, top: space.page }}>
        <Chip label={chip} color={chipColor} />
      </div>
    ) : null}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: center ? "center" : "flex-start",
        justifyContent: "center",
        minHeight: 0,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/**
 * Shared surface recipe. A flat fill + one drop shadow reads as a CSS div;
 * these three layers read as a physical panel:
 *   - a top-down white gradient + a top rim-light hairline (catches light)
 *   - an inner dark bottom edge (gives the panel thickness)
 *   - a two-tier shadow: tight contact + wide ambient
 * Use this everywhere instead of hand-rolling backgrounds.
 */
export const surface = (color: string, focal = false) => ({
  background: `linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 42%), radial-gradient(120% 80% at 50% -10%, ${color}0E 0%, transparent 60%), ${focal ? c.bgLift : c.panel}`,
  border: `1px solid ${focal ? `${color}55` : "rgba(255,255,255,0.07)"}`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.5), 0 18px 48px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)${focal ? `, 0 0 34px ${color}22` : ""}`,
});

/**
 * REMOVED -- do not reintroduce as an SVG filter.
 *
 * A film-grain overlay via `feTurbulence` looks correct in a single-frame
 * still, but Remotion renders frames in PARALLEL and the filter is not
 * resolved identically each time. The noise field therefore differs frame to
 * frame, and at 30fps that reads as a full-screen strobe -- measured as a
 * 4-unit mean-luminance swing alternating every frame in the opening (frames
 * 1421, 1426, 1510-1513) while the composition was pixel-identical (mean abs
 * pixel diff 0.002 between stills 1510 and 1511).
 *
 * Same class of bug as `backdrop-filter`: fine as a still, broken under
 * parallel encode. If grain is wanted later it must be a static deterministic
 * CSS pattern -- never a per-frame-resolved SVG filter.
 */
export const FilmGrain: React.FC = () => null;

/** Corner falloff, so the frame reads as photographed rather than rendered. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(130% 105% at 50% 45%, transparent 36%, rgba(0,0,0,0.52) 100%)",
    }}
  />
);

/** A surface panel. `focal` raises it with a coloured glow to direct focus. */
export const Panel: React.FC<{
  children: React.ReactNode;
  color?: string;
  focal?: boolean;
  style?: React.CSSProperties;
}> = ({ children, color = c.cool, focal = false, style }) => (
  <div
    style={{
      ...surface(color, focal),
      borderRadius: radius.lg,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Hero-tier line with optional coloured emphasis spans. */
export const Hero: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...type.hero, color: c.ink, textAlign: "center", maxWidth: 1500, ...style }}>{children}</div>
);

export const Sub: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...type.sub, color: c.ink, textAlign: "center", maxWidth: 1400, ...style }}>{children}</div>
);

export const Body: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...type.body, color: c.inkDim, textAlign: "center", maxWidth: 1200, ...style }}>{children}</div>
);
