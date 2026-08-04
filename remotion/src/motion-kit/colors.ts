/**
 * MOTION KIT — shared palette.
 *
 * Generic across videos. Per-video accents belong in that video's own theme,
 * which should import and extend this rather than redefining hexes.
 */

export const mk = {
  /** deep navy base, per brief */
  bg: "#0B1020",
  bgLift: "#111830",
  panel: "#141C33",
  panelLine: "#222C4A",
  panelLineBright: "#33405F",

  ink: "#EAF0FF",
  inkDim: "#9BA9CC",
  muted: "#5E6B8F",

  blue: "#4D8DFF",
  purple: "#A87BFF",
  cyan: "#3FE0E0",
  white: "#FFFFFF",

  /** semantic helpers */
  warm: "#FFB547",
  hot: "#FF5D73",
} as const;

/** Channel colours for RGB decomposition — used by the pixel scene. */
export const RGB = { r: "#FF5D73", g: "#3FE08A", b: "#4D8DFF" } as const;

/** A hex + alpha helper so scenes stop hand-concatenating "44"/"88". */
export const alpha = (hex: string, a: number): string => {
  const clamped = Math.max(0, Math.min(1, a));
  const byte = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${byte}`;
};

/** Evenly sample an accent ramp — for particles, patch grids, token streams. */
export const RAMP = [mk.blue, mk.purple, mk.cyan] as const;
export const rampAt = (t: number): string => {
  const i = Math.floor(Math.max(0, Math.min(0.999, t)) * RAMP.length);
  return RAMP[i];
};
