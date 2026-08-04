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
  SCENE_LEAD_IN,
  BigWord,
  GlassPanel,
  PatchGrid,
  PixelImage,
  EmbeddingBars,
  AttentionWeb,
  type Node2D,
} from "../motion-kit";
import { Stage } from "./Stage";
import { fonts, radius, space, type } from "./theme";

/* ═══════════════════════════════════════════════════════════════════════
   6. PATCHES  (2422-3197)
   2422 "Instead of understanding the whole image at once, the model breaks it
         into hundreds of small squares"
   2591 "Think of cutting a giant puzzle into tiny pieces"
   2681 "Each piece is called a patch"
   2754 "Every patch contains just a tiny part of the image — part of an eye,
         a wheel, a leaf, a keyboard key"
   2987 "Individually these patches don't tell the full story"
   3067 "but together they contain everything"
   ═══════════════════════════════════════════════════════════════════════ */

export const PatchesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 2422;

  const gridOn = smooth(frame, L(2450), 40);
  const split = smooth(frame, L(2591), 90);
  const lift = smooth(frame, L(2681), 80);
  const word = ease(frame, L(2681), fps, "SLOW");
  const together = ramp(frame, L(3067), 44);

  return (
    <Stage
      label="patches"
      tint={mk.cyan}
      duration={775}
      moves={[{ at: L(2591), len: 110, scale: 1.06, y: -14 }]}
      particles={22}
    >
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        <PatchGrid
          n={8}
          width={1020}
          height={430}
          split={split * (1 - together * 0.85)}
          lift={lift * (1 - together * 0.7)}
          gridT={gridOn}
        />

        {/* label sits BELOW the grid in normal flow. Overlaying it collided
            with the patches -- `split` opens gaps at the edges, never the
            centre, so there is no safe spot to float a word over. */}
        {word > 0.02 && together < 0.5 && (
          <div style={{ marginTop: 60 }}>
            <BigWord t={word * (1 - together * 2)} size={74} color={mk.cyan} fontFamily={fonts.display}>
              PATCHES
            </BigWord>
          </div>
        )}

        {together > 0.02 && (
          <div style={{ opacity: together, ...type.sub, color: mk.white, textAlign: "center" }}>
            alone, almost nothing —{" "}
            <span style={{ color: mk.cyan }}>together, everything</span>
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   7. EMBEDDINGS  (3197-3809)
   3197 "Each patch is converted into a mathematical representation called an
         embedding"
   3343 "don't let the word scare you"
   3376 "an embedding is simply a way of representing information as numbers
         that capture patterns instead of raw colours"
   3609 "At this stage the original image is already gone"
   3719 "What remains is a collection of mathematical descriptions"
   ═══════════════════════════════════════════════════════════════════════ */

const EMB_COUNT = 6;

export const EmbeddingsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 3197;

  const barsIn = smooth(frame, L(3230), 60);
  const compress = smooth(frame, L(3450), 90);
  const gone = ramp(frame, L(3609), 60);
  const word = ease(frame + SCENE_LEAD_IN, 6, fps, "SLOW");

  return (
    <Stage label="embeddings" tint={mk.purple} duration={612} particles={30}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        <BigWord t={word * (1 - gone * 0.6)} size={78} color={mk.purple} fontFamily={fonts.display}>
          EMBEDDINGS
        </BigWord>

        {/* patches becoming bars of numbers, then compressing to chips */}
        <div style={{ display: "flex", gap: space.md, alignItems: "flex-end", opacity: barsIn }}>
          {Array.from({ length: EMB_COUNT }).map((_, i) => {
            const t = ease(frame, L(3230) + i * 12, fps, "ENTER");
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <EmbeddingBars
                  seed={i + 1}
                  count={10}
                  width={168}
                  height={150}
                  t={t}
                  compress={compress}
                />
                <div
                  style={{
                    width: 168 * (1 - compress) + 56 * compress,
                    height: 4,
                    borderRadius: 99,
                    background: alpha(mk.purple, 0.45),
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ ...type.body, color: mk.inkDim, opacity: barsIn * (1 - gone) }}>
          patterns — not colours
        </div>

        {gone > 0.02 && (
          <div
            style={{
              opacity: gone,
              transform: `translateY(${(1 - gone) * 16}px)`,
              ...type.sub,
              color: mk.white,
              textAlign: "center",
            }}
          >
            the original image is <span style={{ color: mk.hot }}>gone</span>
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   8. TOGETHER / BICYCLE  (3809-4446)
   3809 "Now comes the clever part"
   3865 "ChatGPT doesn't examine these patches one after another"
   3973 "It looks at all of them together"
   4043 "Imagine you're trying to identify a bicycle"
   4103 "You don't look at just one wheel"
   4194 "You notice another wheel, the handlebars, the pedals, the seat"
   4284 "and your brain connects them into one object"
   4375 "The AI does something similar"
   ═══════════════════════════════════════════════════════════════════════ */

/** Bicycle parts, positioned so the assembled whole reads as a bike. */
const BIKE_PARTS: { label: string; x: number; y: number; at: number }[] = [
  { label: "wheel", x: 170, y: 300, at: 4103 },
  { label: "wheel", x: 610, y: 300, at: 4194 },
  { label: "handlebars", x: 560, y: 130, at: 4230 },
  { label: "pedals", x: 390, y: 340, at: 4258 },
  { label: "seat", x: 250, y: 140, at: 4284 },
];

export const TogetherScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 3809;

  const seq = ramp(frame, L(3865), 60);
  const allTogether = ramp(frame, L(3973), 44);
  const assemble = smooth(frame, L(4284), 70);
  const similar = ease(frame, L(4375), fps, "SLOW");

  return (
    <Stage label="all at once" tint={mk.blue} duration={637} particles={24}>
      {allTogether < 0.4 ? (
        /* one after another vs all together */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
          <div style={{ ...type.sub, color: mk.inkDim }}>not one after another…</div>
          <div style={{ display: "flex", gap: space.sm }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const active = Math.floor(seq * 9) === i;
              return (
                <div
                  key={i}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: radius.md,
                    background: active ? alpha(mk.cyan, 0.28) : alpha(mk.panel, 0.9),
                    border: `1.5px solid ${active ? mk.cyan : mk.panelLine}`,
                    boxShadow: active ? `0 0 26px ${alpha(mk.cyan, 0.55)}` : "none",
                    opacity: seq > 0 ? 1 : 0.2,
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* the bicycle: parts noticed separately, then connected */
        <div style={{ position: "relative", width: 800, height: 470 }}>
          <svg width={800} height={470} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* connections drawn as the brain assembles the object */}
            {BIKE_PARTS.map((p, i) =>
              BIKE_PARTS.slice(i + 1).map((q, j) => (
                <line
                  key={`${i}-${j}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke={mk.cyan}
                  strokeWidth={1.6}
                  opacity={assemble * 0.55}
                />
              ))
            )}
          </svg>

          {BIKE_PARTS.map((p, i) => {
            const t = ease(frame, L(p.at), fps, "ENTER");
            if (t <= 0.01) return null;
            const pulse = idlePulse(frame, 90, i);
            return (
              <GlassPanel
                key={`${p.label}-${i}`}
                tint={mk.cyan}
                radius={radius.md}
                style={{
                  position: "absolute",
                  left: p.x - 74,
                  top: p.y - 32,
                  width: 148,
                  padding: "14px 0",
                  textAlign: "center",
                  opacity: t,
                  transform: `scale(${(0.8 + t * 0.2) * (1 + pulse * 0.012)})`,
                  ...type.body,
                  fontSize: 26,
                  color: mk.white,
                }}
              >
                {p.label}
              </GlassPanel>
            );
          })}

          {assemble > 0.4 && (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div
                style={{
                  opacity: (assemble - 0.4) / 0.6,
                  ...type.hero,
                  fontSize: 68,
                  color: mk.white,
                  textShadow: `0 0 50px ${alpha(mk.cyan, 0.6)}`,
                }}
              >
                one <span style={{ color: mk.cyan }}>object</span>
              </div>
            </AbsoluteFill>
          )}
        </div>
      )}

      {similar > 0.02 && (
        <div style={{ opacity: similar, marginTop: space.md, ...type.body, color: mk.inkDim }}>
          the AI does the same thing
        </div>
      )}
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   9. ATTENTION  (4446-5106)
   4446 "It compares every patch with every other patch"
   4526 "It asks: which parts belong together"
   4635 "what seems important, what objects are interacting"
   4742 "This process is called attention"
   4812 "Attention allows the model to understand relationships, not just
         objects"
   ═══════════════════════════════════════════════════════════════════════ */

const ATT_N = 12;
const ATT_NODES: Node2D[] = Array.from({ length: ATT_N }).map((_, i) => {
  const a = (i / ATT_N) * Math.PI * 2 - Math.PI / 2;
  return { x: 520 + Math.cos(a) * 400, y: 290 + Math.sin(a) * 250 };
});
const STRONG: [number, number][] = [
  [0, 4],
  [4, 8],
  [8, 0],
  [2, 7],
  [5, 10],
];

export const AttentionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 4446;

  const web = smooth(frame, L(4470), 90);
  const focus = smooth(frame, L(4635), 80);
  const word = ease(frame, L(4742), fps, "SLOW");
  const flow = ((frame - L(4635)) % 70) / 70;

  const QUESTIONS = [
    { at: 4526, q: "which parts belong together?" },
    { at: 4635, q: "what seems important?" },
    { at: 4690, q: "what is interacting?" },
  ];

  return (
    <Stage
      label="attention"
      tint={mk.cyan}
      duration={660}
      moves={[{ at: L(4742), len: 70, scale: 1.08 }]}
      particles={16}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
        <div style={{ position: "relative", width: 1040, height: 580 }}>
          <svg width={1040} height={580} style={{ overflow: "visible" }}>
            <AttentionWeb
              nodes={ATT_NODES}
              t={web}
              focus={focus}
              strong={STRONG}
              flow={focus > 0.4 ? flow : -1}
            />
            {ATT_NODES.map((n, i) => {
              const p = idlePulse(frame, 110, i);
              const isStrong = STRONG.some(([a, b]) => a === i || b === i);
              const col = isStrong && focus > 0.4 ? mk.cyan : mk.blue;
              return (
                <circle
                  key={i}
                  cx={n.x}
                  cy={n.y}
                  r={13 + p * 2}
                  fill={col}
                  opacity={web * (isStrong || focus < 0.4 ? 1 : 0.35)}
                  style={{ filter: `drop-shadow(0 0 12px ${col})` }}
                />
              );
            })}
          </svg>

          {word > 0.02 && (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <BigWord t={word} size={92} color={mk.cyan} fontFamily={fonts.display}>
                ATTENTION
              </BigWord>
            </AbsoluteFill>
          )}
        </div>

        {/* the questions it is asking */}
        <div style={{ display: "flex", gap: space.sm, minHeight: 60 }}>
          {QUESTIONS.map((q) => {
            const t = ease(frame, L(q.at), fps, "SETTLE");
            if (t <= 0.02) return null;
            return (
              <GlassPanel
                key={q.q}
                tint={mk.blue}
                radius={radius.pill}
                style={{
                  padding: "12px 26px",
                  opacity: t * (1 - word * 0.75),
                  transform: `translateY(${(1 - t) * 12}px)`,
                  ...type.body,
                  fontSize: 24,
                  color: mk.inkDim,
                }}
              >
                {q.q}
              </GlassPanel>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   10. RELATIONSHIPS  (5106-5347)
   5106 "The same two objects, but a completely different story"
   5197 "It isn't memorizing images, it's understanding patterns and
         relationships"
   ═══════════════════════════════════════════════════════════════════════ */

/** Stick-figure person with animated running legs. */
const RunningPerson: React.FC<{ color: string; bob: number }> = ({ color, bob }) => (
  <svg width={50} height={88} viewBox="0 0 50 88">
    <circle cx={25} cy={13} r={11} fill="none" stroke={color} strokeWidth={3} />
    <line x1={25} y1={24} x2={25} y2={56} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={7} y1={36} x2={43} y2={33} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={25} y1={56} x2={10 + bob * 4} y2={82} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={25} y1={56} x2={40 - bob * 4} y2={82} stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/** Simple quadruped dog with animated legs. */
const RunningDog: React.FC<{ color: string; bob: number; flip?: boolean }> = ({ color, bob, flip = false }) => (
  <svg width={82} height={58} viewBox="0 0 82 58" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    <ellipse cx={40} cy={34} rx={24} ry={14} fill="none" stroke={color} strokeWidth={3} />
    <circle cx={64} cy={22} r={13} fill="none" stroke={color} strokeWidth={3} />
    <path d={`M 64 9 Q ${73 + bob} 3 ${76 + bob} 14`} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <ellipse cx={73} cy={26} rx={5} ry={3.5} fill="none" stroke={color} strokeWidth={2} />
    <line x1={24} y1={46} x2={20 + bob * 2} y2={58} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={34} y1={48} x2={32 - bob * 2} y2={58} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={48} y1={48} x2={50 + bob * 2} y2={58} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={58} y1={46} x2={54 - bob * 2} y2={58} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <path d="M 16 30 Q 5 22 7 12" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/** Animated directional arrows showing chase direction. */
const ChaseArrows: React.FC<{ color: string; flow: number }> = ({ color, flow }) => (
  <svg width={96} height={28} viewBox="0 0 96 28">
    {[0, 1, 2].map((i) => {
      const x = 8 + i * 28;
      const op = Math.max(0.12, Math.sin((flow + i * 0.33) * Math.PI * 2) * 0.44 + 0.56);
      return (
        <g key={i} opacity={op}>
          <line x1={x} y1={14} x2={x + 20} y2={14} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <path
            d={`M ${x + 16} 8 L ${x + 24} 14 L ${x + 16} 20`}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    })}
  </svg>
);

export const RelationshipsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 5106;

  const a = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const b = ease(frame, L(5160), fps, "ENTER");
  const verdict = ease(frame, L(5197), fps, "SLOW");

  const bob = Math.sin(frame * 0.28) * 5;
  const arrowFlow = (frame * 0.042) % 1;

  return (
    <Stage label="relationships" tint={mk.purple} duration={241} particles={18}>
      <div style={{ display: "flex", flexDirection: "column", gap: space.lg, alignItems: "center" }}>

        {/* Row 1: dog chasing person */}
        <GlassPanel
          tint={mk.cyan}
          radius={radius.lg}
          style={{
            padding: `${space.md}px ${space.lg}px`,
            opacity: a,
            transform: `translateX(${(1 - a) * 28}px)`,
            display: "flex",
            alignItems: "center",
            gap: space.md,
          }}
        >
          <div style={{ transform: `translateY(${bob * 0.45}px)` }}>
            <RunningDog color={mk.cyan} bob={bob} />
          </div>
          <ChaseArrows color={mk.cyan} flow={arrowFlow} />
          <div style={{ transform: `translateY(${-bob * 0.45}px)` }}>
            <RunningPerson color={alpha(mk.ink, 0.8)} bob={bob} />
          </div>
          <div style={{ ...type.body, fontSize: 26, color: mk.inkDim, marginLeft: space.sm }}>
            dog <span style={{ color: mk.cyan }}>chasing</span> person
          </div>
        </GlassPanel>

        {/* Row 2: person chasing dog */}
        <GlassPanel
          tint={mk.hot}
          radius={radius.lg}
          style={{
            padding: `${space.md}px ${space.lg}px`,
            opacity: b,
            transform: `translateX(${(1 - b) * 28}px)`,
            display: "flex",
            alignItems: "center",
            gap: space.md,
          }}
        >
          <div style={{ transform: `translateY(${-bob * 0.45}px)` }}>
            <RunningPerson color={mk.hot} bob={-bob} />
          </div>
          <ChaseArrows color={mk.hot} flow={arrowFlow} />
          <div style={{ transform: `translateY(${bob * 0.45}px)` }}>
            <RunningDog color={alpha(mk.ink, 0.8)} bob={-bob} flip />
          </div>
          <div style={{ ...type.body, fontSize: 26, color: mk.inkDim, marginLeft: space.sm }}>
            person <span style={{ color: mk.hot }}>chasing</span> dog
          </div>
        </GlassPanel>

        {verdict > 0.02 && (
          <div style={{ opacity: verdict, marginTop: space.sm, ...type.body, color: mk.inkDim, textAlign: "center" }}>
            same objects — <span style={{ color: mk.white }}>different story</span>
          </div>
        )}
      </div>
    </Stage>
  );
};
