import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  mk,
  alpha,
  ease,
  ramp,
  smooth,
  idlePulse,
  seeded,
  drift,
  SCENE_LEAD_IN,
  BigWord,
  GlassPanel,
  ParticleBurst,
  PixelImage,
  PixelInspector,
  samplePhoto,
  DrawPath,
} from "../motion-kit";
import { Stage } from "./Stage";
import { fonts, radius, space, type } from "./theme";

/* ═══════════════════════════════════════════════════════════════════════
   1. HOOK  (0-462)
   0   "Have you ever uploaded a photo to ChatGPT and wondered how does it
        know all of this"
   163 "It can tell you what's in the image"
   222 "read handwritten notes, explain graphs, solve math problems"
   338 "even understand memes"
   407 "But here's the strange part"
   ═══════════════════════════════════════════════════════════════════════ */

const ABILITIES = [
  { at: 163, label: "what's in it" },
  { at: 222, label: "handwriting" },
  { at: 265, label: "graphs" },
  { at: 300, label: "math" },
  { at: 338, label: "memes" },
];

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const photoIn = ease(frame + SCENE_LEAD_IN, 4, fps, "SLOW");
  const strange = ramp(frame, 407, 30);

  return (
    <Stage label="upload" tint={mk.blue} duration={462} moves={[{ at: 400, len: 62, scale: 1.09 }]}>
      <div style={{ display: "flex", alignItems: "center", gap: space.xl }}>
        {/* the uploaded photo */}
        <div
          style={{
            opacity: photoIn,
            transform: `scale(${0.88 + photoIn * 0.12}) rotate(${(1 - photoIn) * -3}deg)`,
            borderRadius: radius.lg,
            overflow: "hidden",
            border: `2px solid ${alpha(mk.white, 0.18)}`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${alpha(mk.blue, 0.25)}`,
            filter: `saturate(${1 - strange * 0.75})`,
          }}
        >
          <PixelImage cols={150} rows={100} width={720} height={480} />
        </div>

        {/* what it can do */}
        <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: 1 - strange }}>
          {ABILITIES.map((a, i) => {
            const t = ease(frame, a.at, fps, "ENTER");
            if (t <= 0.01) return null;
            return (
              <GlassPanel
                key={a.label}
                tint={mk.cyan}
                radius={radius.md}
                style={{
                  padding: "14px 28px",
                  opacity: t,
                  transform: `translateX(${(1 - t) * 26}px)`,
                  ...type.body,
                  color: mk.ink,
                }}
              >
                <span style={{ color: mk.cyan, marginRight: 12 }}>✓</span>
                {a.label}
              </GlassPanel>
            );
          })}
        </div>
      </div>

      {strange > 0.02 && (
        <BigWord t={strange} size={78} color={mk.white} fontFamily={fonts.display}>
          But here's the strange part…
        </BigWord>
      )}
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   2. NEVER SEES  (462-934)
   462 "ChatGPT never actually sees your photo"
   542 "It doesn't have eyes"
   589 "doesn't recognize faces the way humans do"
   678 "the image you upload disappears almost immediately"
   791 "it gets transformed into something completely different"
   ═══════════════════════════════════════════════════════════════════════ */

export const NeverSeesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 462;

  const claim = ease(frame + SCENE_LEAD_IN, 4, fps, "SLOW");
  const noEyes = ease(frame, L(542), fps, "SETTLE");
  const dissolve = ramp(frame, L(678), 90);
  const transformed = ease(frame, L(791), fps, "SLOW");

  return (
    <Stage label="no eyes" tint={mk.purple} duration={472} particles={34}>
      <BigWord t={claim} size={82} color={mk.white} fontFamily={fonts.display}>
        ChatGPT never <span style={{ color: mk.hot }}>sees</span> your photo
      </BigWord>

      <div style={{ height: space.xl }} />

      <div style={{ position: "relative", width: 700, height: 470 }}>
        {/* the photo dissolving into particles */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - dissolve,
            transform: `scale(${1 - dissolve * 0.12})`,
            filter: `blur(${dissolve * 10}px)`,
            borderRadius: radius.lg,
            overflow: "hidden",
            border: `2px solid ${alpha(mk.white, 0.15)}`,
          }}
        >
          <PixelImage cols={120} rows={80} width={700} height={470} />
        </div>

        {/* struck-out eye, while the claim is being made */}
        {noEyes > 0.02 && dissolve < 0.4 && (
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              opacity: noEyes * (1 - dissolve * 2.4),
            }}
          >
            <svg width={220} height={140} style={{ overflow: "visible" }}>
              <ellipse cx={110} cy={70} rx={92} ry={50} fill="none" stroke={mk.white} strokeWidth={4} opacity={0.9} />
              <circle cx={110} cy={70} r={24} fill={mk.white} opacity={0.9} />
              <DrawPath d="M 18 132 L 202 8" t={noEyes} color={mk.hot} width={7} length={230} />
            </svg>
          </AbsoluteFill>
        )}

        <ParticleBurst t={dissolve} count={90} spread={700} seedBase={41} />
      </div>

      {transformed > 0.02 && (
        <div style={{ opacity: transformed, marginTop: space.lg, ...type.sub, color: mk.cyan }}>
          transformed into something else
        </div>
      )}
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   3. JOURNEY / UPLOAD  (934-1404)
   934  "let's follow your photo on its journey inside ChatGPT"
   1039 "The moment you click Upload, your image begins a transformation"
   1144 "To us it's a picture"
   1198 "Maybe it's your dog, a sunset, or a screenshot of an error message"
   1333 "But to a computer it's nothing more than a giant grid of tiny
         colored dots called pixels"
   ═══════════════════════════════════════════════════════════════════════ */

export const JourneyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 934;

  const btnIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const press = ease(frame, L(1039), fps, "SNAP");
  const ring = ramp(frame, L(1039), 26);
  const toPhoto = ramp(frame, L(1120), 30);
  const toComputer = ramp(frame, L(1333), 34);
  const pulse = idlePulse(frame, 90, 1);

  return (
    <Stage
      label="upload"
      tint={mk.cyan}
      duration={470}
      moves={[{ at: L(1333), len: 60, scale: 1.12 }]}
    >
      {toPhoto < 0.5 ? (
        /* the glowing Upload button */
        <div style={{ position: "relative", opacity: btnIn }}>
          <GlassPanel
            tint={mk.cyan}
            radius={radius.pill}
            style={{
              padding: "30px 74px",
              display: "flex",
              alignItems: "center",
              gap: space.md,
              transform: `scale(${(0.9 + btnIn * 0.1) * (1 - press * 0.05)})`,
              boxShadow: `0 0 ${50 + pulse * 40}px ${alpha(mk.cyan, 0.45)}, 0 24px 60px rgba(0,0,0,0.6)`,
            }}
          >
            <svg width={38} height={38} viewBox="0 0 24 24">
              <path
                d="M12 17V4M12 4l-5 5M12 4l5 5M4 19h16"
                fill="none"
                stroke={mk.cyan}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ ...type.sub, fontSize: 46, color: mk.white }}>Upload</span>
          </GlassPanel>

          {/* impact ring */}
          {ring > 0 && ring < 1 && (
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: radius.pill,
                border: `3px solid ${mk.cyan}`,
                opacity: 1 - ring,
                transform: `scale(${1 + ring * 0.5})`,
              }}
            />
          )}
        </div>
      ) : (
        /* to us a picture — to a computer, dots */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
          <div
            style={{
              borderRadius: radius.lg,
              overflow: "hidden",
              border: `2px solid ${alpha(mk.white, 0.16)}`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.6)`,
              transform: `scale(${0.94 + toPhoto * 0.06})`,
            }}
          >
            <PixelImage
              cols={Math.round(interpolate(toComputer, [0, 1], [160, 26]))}
              rows={Math.round(interpolate(toComputer, [0, 1], [107, 18]))}
              width={620}
              height={415}
              gap={toComputer * 3}
            />
          </div>
          <div style={{ ...type.sub, color: toComputer > 0.5 ? mk.cyan : mk.inkDim }}>
            {toComputer > 0.5 ? "a grid of coloured dots" : "to us — a picture"}
          </div>
        </div>
      )}
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   4. PIXELS  (1404-1828)
   1404 "a giant grid of tiny colored dots called pixels"
   1496 "Zoom in far enough and every image becomes a mosaic of little squares"
   1649 "Each pixel stores just three numbers — red, green and blue"
   1783 "That's it"
   ═══════════════════════════════════════════════════════════════════════ */

export const PixelsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 1404;

  // continuous zoom: the grid resolves from photo to chunky mosaic
  const zoom = smooth(frame, L(1440), 190);
  const cols = Math.max(6, Math.round(interpolate(zoom, [0, 1], [140, 10])));
  const rows = Math.max(4, Math.round(cols * 0.66));

  const toRGB = ramp(frame, L(1649), 36);
  const word = ease(frame, L(1500), fps, "SLOW");

  return (
    <Stage
      label="pixels"
      tint={mk.blue}
      duration={424}
      push={0.05}
      moves={[{ at: L(1440), len: 190, scale: 1.35 }]}
      particles={18}
    >
      {toRGB < 0.5 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
          <div
            style={{
              borderRadius: radius.md,
              overflow: "hidden",
              border: `2px solid ${alpha(mk.white, 0.14)}`,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            }}
          >
            <PixelImage cols={cols} rows={rows} width={900} height={600} gap={zoom * 4} radius={zoom * 3} />
          </div>
          <BigWord t={word} size={92} color={mk.blue} fontFamily={fonts.display}>
            PIXELS
          </BigWord>
        </div>
      ) : (
        /* one pixel, three numbers */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, opacity: toRGB }}>
          <PixelInspector u={0.42} v={0.4} size={240} t={toRGB} fontFamily={fonts.mono} />
          <div style={{ ...type.body, color: mk.inkDim }}>three numbers. that's it.</div>
        </div>
      )}
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   5. NUMBERS  (1828-2422)
   1828 "A normal phone photo can contain millions of pixels"
   1939 "which means millions of tiny colour values"
   2022 "ChatGPT doesn't know it's looking at a dog, or a car, or a human"
   2189 "All it sees is a massive collection of numbers"
   2280 "the first challenge is turning those numbers into something meaningful"
   ═══════════════════════════════════════════════════════════════════════ */

const NUM_COLS = 26;
const NUM_ROWS = 13;

export const NumbersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 1828;

  const fill = smooth(frame, L(1860), 130);
  const dontKnow = ramp(frame, L(2022), 40);
  const challenge = ease(frame, L(2280), fps, "SLOW");

  return (
    <Stage label="numbers" tint={mk.purple} duration={594} particles={20}>
      {/* a wall of numbers, which is all the model actually receives */}
      <div
        style={{
          position: "relative",
          width: 1420,
          height: 470,
          display: "grid",
          gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
          gap: 7,
          opacity: 0.95,
        }}
      >
        {Array.from({ length: NUM_COLS * NUM_ROWS }).map((_, i) => {
          const x = (i % NUM_COLS) / NUM_COLS;
          const y = Math.floor(i / NUM_COLS) / NUM_ROWS;
          const on = Math.max(0, Math.min(1, (fill - seeded(i) * 0.35) * 3));
          if (on <= 0) return null;
          const [r, g, b] = samplePhoto(x, y);
          const val = [r, g, b][i % 3];
          const col = [mk.hot, "#3FE08A", mk.blue][i % 3];
          const flick = idlePulse(frame, 60 + seeded(i + 2) * 90, i);
          return (
            <div
              key={i}
              style={{
                fontFamily: fonts.mono,
                fontSize: 21,
                fontWeight: 500,
                color: col,
                opacity: on * (0.4 + flick * 0.6),
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {val}
            </div>
          );
        })}

        {/* the model has no idea what any of it depicts */}
        {dontKnow > 0.02 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                opacity: dontKnow,
                transform: `scale(${0.92 + dontKnow * 0.08})`,
                padding: `${space.md}px ${space.xl}px`,
                borderRadius: radius.lg,
                background: alpha(mk.bg, 0.86),
                border: `1.5px solid ${alpha(mk.hot, 0.5)}`,
                boxShadow: `0 24px 70px rgba(0,0,0,0.7), 0 0 44px ${alpha(mk.hot, 0.2)}`,
                textAlign: "center",
              }}
            >
              <div style={{ ...type.meta, color: mk.muted }}>NOT A DOG · NOT A CAR · NOT A HUMAN</div>
              <div style={{ ...type.hero, fontSize: 72, color: mk.white, marginTop: 6 }}>
                just <span style={{ color: mk.hot }}>numbers</span>
              </div>
            </div>
          </AbsoluteFill>
        )}
      </div>

      {challenge > 0.02 && (
        <div style={{ opacity: challenge, marginTop: space.lg, ...type.body, color: mk.cyan }}>
          the challenge — turn them into meaning
        </div>
      )}
    </Stage>
  );
};
