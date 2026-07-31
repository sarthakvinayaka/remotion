import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cv, cvFonts } from "./theme";
import { Chip, GridBg } from "../components/shared";

const ease = (frame: number, from: number, fps: number, damping = 16, stiffness = 200) =>
  spring({ frame: frame - from, fps, config: { damping, stiffness } });

// Word anchors (local frames, 0 = "so what happens when two different keys..."):
//   "two different keys hash to the same index" 0-101
//   "this is called a collision, not a bug" 306-401
//   "chaining, each bucket is a list not one value" 486-660
//   "two keys land in same slot, live together side by side" 689-859
export const CollisionExplainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const convergeIn = ease(frame, 0, fps, 14, 210);
  const collisionLabelIn = ease(frame, 306, fps, 13, 230);
  const chainingIn = ease(frame, 486, fps, 14, 210);
  const stackIn = ease(frame, 689, fps, 14, 210);

  const convergeT = interpolate(frame, [0, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the converging-keys visual hands off to the "bucket [2]" stack view at
  // frame 689 (stackIn) -- without an explicit fade+unmount here, the two
  // renders land in the same flex slot and their labels visibly overlap the
  // stack box's text once the "chaining" line above stops rendering.
  const convergeOut = interpolate(frame, [660, 689], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showConverge = frame < 689;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${cv.panel}, ${cv.bg})` }}>
      <GridBg opacity={0.05} color={cv.terminalRed} />
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Chip label="When two keys collide" color={cv.terminalRed} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        {showConverge && (
        <div style={{ opacity: convergeIn * convergeOut, position: "relative", width: 420, height: 160 }}>
          {/* two keys converging on one slot -- they land side by side well
              above the bucket box (which spans y=85-155, x=175-245), not
              stacked on the same x as each other or the box, so neither
              label's text is ever covered by the other chip or by the box
              through the ~20s hold before the scene hands off to the
              "bucket [2]" stack view. */}
          {["apple", "elderberry"].map((k, i) => {
            const startX = i === 0 ? 20 : 400;
            const endX = i === 0 ? 150 : 270;
            const endY = 45;
            const x = interpolate(convergeT, [0, 1], [startX, endX]);
            const y = interpolate(convergeT, [0, 1], [20, endY]);
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  fontFamily: cvFonts.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: i === 0 ? cv.func : cv.string,
                  background: `${i === 0 ? cv.func : cv.string}1a`,
                  border: `1.5px solid ${i === 0 ? cv.func : cv.string}`,
                  borderRadius: 999,
                  padding: "6px 14px",
                  whiteSpace: "nowrap",
                }}
              >
                {k}
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 210,
              top: 120,
              transform: "translate(-50%, -50%)",
              width: 70,
              height: 70,
              borderRadius: 12,
              border: `2px solid ${collisionLabelIn > 0 ? cv.terminalRed : cv.panelLine}`,
              background: collisionLabelIn > 0 ? `${cv.terminalRed}22` : cv.panel,
              boxShadow: collisionLabelIn > 0 ? `0 0 20px ${cv.terminalRed}66` : "none",
            }}
          />
        </div>
        )}

        {collisionLabelIn > 0 && (
          <div
            style={{
              opacity: collisionLabelIn,
              transform: `scale(${interpolate(collisionLabelIn, [0, 1], [0.8, 1])})`,
              fontFamily: cvFonts.display,
              fontSize: 44,
              fontWeight: 700,
              color: cv.ink,
              textAlign: "center",
            }}
          >
            That's called a <span style={{ color: cv.terminalRed }}>collision</span>. Not a bug.
          </div>
        )}

        {chainingIn > 0 && frame < 689 && (
          <div
            style={{
              opacity: chainingIn,
              fontFamily: cvFonts.mono,
              fontSize: 20,
              color: cv.terminalGreen,
            }}
          >
            The fix: <span style={{ color: cv.ink }}>chaining</span> &mdash; each bucket is a list, not one value.
          </div>
        )}

        {stackIn > 0 && (
          <div
            style={{
              opacity: stackIn,
              transform: `translateY(${interpolate(stackIn, [0, 1], [16, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              border: `2px solid ${cv.terminalRed}`,
              background: `${cv.terminalRed}14`,
              borderRadius: 14,
              padding: "16px 22px",
              boxShadow: `0 0 20px ${cv.terminalRed}33`,
            }}
          >
            <div style={{ fontFamily: cvFonts.mono, fontSize: 12, color: cv.muted, marginBottom: 2 }}>bucket [2]</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontFamily: cvFonts.mono, fontSize: 14, fontWeight: 700, color: cv.func, background: `${cv.func}1a`, border: `1px solid ${cv.func}66`, borderRadius: 7, padding: "5px 12px" }}>
                apple
              </div>
              <div style={{ fontFamily: cvFonts.mono, fontSize: 14, fontWeight: 700, color: cv.string, background: `${cv.string}1a`, border: `1px solid ${cv.string}66`, borderRadius: 7, padding: "5px 12px" }}>
                elderberry
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
