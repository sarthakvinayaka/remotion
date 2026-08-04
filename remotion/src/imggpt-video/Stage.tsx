import React from "react";
import { AbsoluteFill } from "remotion";
import { mk, alpha, GridBg, Glow, Particles, Vignette, Camera, type CameraMove } from "../motion-kit";
import { space, type } from "./theme";

/**
 * Shared stage for every scene: consistent page padding, an ambient layer,
 * a camera rig, and a one-word chapter label.
 *
 * Content is centred in a box that already excludes the caption safe area,
 * so nothing a scene renders can collide with the burned-in subtitle.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  label?: string;
  tint?: string;
  duration?: number;
  moves?: CameraMove[];
  push?: number;
  particles?: number;
  gridOpacity?: number;
}> = ({
  children,
  label,
  tint = mk.blue,
  duration = 300,
  moves,
  push = 0.022,
  particles = 26,
  gridOpacity = 0.05,
}) => (
  <AbsoluteFill style={{ background: mk.bg }}>
    <GridBg opacity={gridOpacity} color={tint} speed={0.2} />
    <Glow color={tint} seed={2} intensity={0.26} />
    {particles > 0 ? <Particles count={particles} opacity={0.35} seedBase={7} /> : null}

    <Camera duration={duration} moves={moves} push={push}>
      <AbsoluteFill
        style={{
          padding: space.page,
          paddingBottom: space.captionSafe,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </AbsoluteFill>
    </Camera>

    {label ? (
      <div
        style={{
          position: "absolute",
          left: space.page,
          top: space.page,
          ...type.meta,
          color: alpha(tint, 0.95),
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    ) : null}

    <Vignette strength={0.52} />
  </AbsoluteFill>
);
