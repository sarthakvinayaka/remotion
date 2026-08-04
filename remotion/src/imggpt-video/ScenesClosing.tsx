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
  DrawPath,
  NeuralNet,
  TokenStream,
  NoiseField,
  PixelImage,
  EmbeddingBars,
  ParticleBurst,
} from "../motion-kit";
import { Stage } from "./Stage";
import { fonts, radius, space, type } from "./theme";

/* ═══════════════════════════════════════════════════════════════════════
   11. LANGUAGE  (5347-5863)
   5347 "By now ChatGPT has built an internal mathematical understanding"
   5492 "But you didn't upload a photo just to have it analysed"
   5588 "You asked a question"
   5615 "what's wrong with this code / explain this graph / translate this sign"
   ═══════════════════════════════════════════════════════════════════════ */

const PROMPTS = [
  { at: 5615, q: "what's wrong with this code?" },
  { at: 5688, q: "can you explain this graph?" },
  { at: 5750, q: "translate this sign" },
];

export const LanguageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 5347;

  const net = smooth(frame, L(5380), 70);
  const toQuestion = ramp(frame, L(5560), 40);
  const signal = ((frame - L(5380)) % 90) / 90;

  return (
    <Stage label="understanding" tint={mk.purple} duration={516} particles={22}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        {/* VISION → [NeuralNet] ← TEXT — shows what feeds the model */}
        <div style={{ display: "flex", alignItems: "center", gap: space.lg, opacity: 1 - toQuestion * 0.6 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <EmbeddingBars seed={5} count={7} width={148} height={140} t={net} />
            <div style={{ ...type.meta, color: mk.purple }}>VISION</div>
          </div>

          {/* left-feed arrow */}
          <svg width={44} height={24} style={{ overflow: "visible", opacity: net }}>
            <line x1={0} y1={12} x2={34} y2={12} stroke={mk.purple} strokeWidth={2.5} strokeLinecap="round" />
            <path d="M 30 6 L 42 12 L 30 18" fill="none" stroke={mk.purple} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <NeuralNet layers={[5, 8, 8, 6, 3]} width={660} height={310} t={net} signal={signal} />

          {/* right-feed arrow */}
          <svg width={44} height={24} style={{ overflow: "visible", opacity: net }}>
            <line x1={44} y1={12} x2={10} y2={12} stroke={mk.cyan} strokeWidth={2.5} strokeLinecap="round" />
            <path d="M 14 6 L 2 12 L 14 18" fill="none" stroke={mk.cyan} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <GlassPanel
              tint={mk.cyan}
              radius={radius.md}
              style={{ padding: "18px 22px", ...type.body, fontSize: 24, color: mk.white }}
            >
              your question
            </GlassPanel>
            <div style={{ ...type.meta, color: mk.cyan }}>TEXT</div>
          </div>
        </div>

        {toQuestion < 0.4 ? (
          <div style={{ ...type.sub, color: mk.inkDim, opacity: net }}>an internal understanding</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: space.sm, opacity: toQuestion }}>
            {PROMPTS.map((p) => {
              const t = ease(frame, L(p.at), fps, "ENTER");
              if (t <= 0.02) return null;
              return (
                <GlassPanel
                  key={p.q}
                  tint={mk.cyan}
                  radius={radius.lg}
                  style={{
                    padding: `${space.sm}px ${space.lg}px`,
                    opacity: t,
                    transform: `translateY(${(1 - t) * 16}px)`,
                    ...type.body,
                    color: mk.white,
                  }}
                >
                  <span style={{ color: mk.cyan, marginRight: 10 }}>❯</span>
                  {p.q}
                </GlassPanel>
              );
            })}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   12. TOKENS  (5863-6542)
   5863 "The image information is combined with your question"
   5950 "To the language model both become part of the same conversation"
   6060 "no hidden database of captions waiting to be matched"
   6181 "it generates a brand-new response, one word at a time"
   6398 "its understanding comes from both text and vision"
   ═══════════════════════════════════════════════════════════════════════ */

const RESPONSE = "The sun is setting over calm water behind low hills".split(" ");

export const TokensScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 5863;

  const merge = smooth(frame, L(5890), 70);
  const noDb = ramp(frame, L(6060), 40);
  const gen = ramp(frame, L(6181), 30);
  const both = ease(frame, L(6398), fps, "SLOW");

  return (
    <Stage label="language" tint={mk.blue} duration={679} particles={20}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        {/* vision + text converging into one stream */}
        {gen < 0.4 && (
          <div style={{ display: "flex", alignItems: "center", gap: space.lg, opacity: 1 - gen * 2 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <EmbeddingBars seed={3} count={9} width={190} height={110} t={1} />
              <div style={{ ...type.meta, color: mk.purple }}>VISION</div>
            </div>

            <svg width={190} height={130} style={{ overflow: "visible" }}>
              <path
                d="M 6 34 C 90 34, 96 65, 184 65"
                fill="none"
                stroke={mk.purple}
                strokeWidth={2.5}
                opacity={merge}
              />
              <path
                d="M 6 100 C 90 100, 96 65, 184 65"
                fill="none"
                stroke={mk.cyan}
                strokeWidth={2.5}
                opacity={merge}
              />
              <circle
                cx={184}
                cy={65}
                r={7 + idlePulse(frame, 60, 1) * 3}
                fill={mk.white}
                opacity={merge}
                style={{ filter: `drop-shadow(0 0 14px ${mk.white})` }}
              />
            </svg>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <GlassPanel
                tint={mk.cyan}
                radius={radius.md}
                style={{ padding: "16px 26px", ...type.body, fontSize: 26, color: mk.white }}
              >
                your question
              </GlassPanel>
              <div style={{ ...type.meta, color: mk.cyan }}>TEXT</div>
            </div>
          </div>
        )}

        {noDb > 0.02 && gen < 0.4 && (
          <div style={{ opacity: noDb * (1 - gen * 2), ...type.body, color: mk.hot }}>
            no database of captions
          </div>
        )}

        {/* generated one token at a time */}
        {gen > 0.05 && (
          <div style={{ opacity: gen, display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
            <div style={{ ...type.meta, color: mk.cyan }}>ONE WORD AT A TIME</div>
            <TokenStream
              words={RESPONSE}
              startAt={L(6210)}
              perToken={13}
              fontFamily={fonts.body}
              size={42}
              maxWidth={1240}
            />
          </div>
        )}

        {both > 0.02 && (
          <div style={{ opacity: both, ...type.body, color: mk.inkDim }}>
            from <span style={{ color: mk.cyan }}>text</span> and{" "}
            <span style={{ color: mk.purple }}>vision</span>
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   13. STATIC  (6542-7013)
   6542 "Understanding images is one thing, creating them is another"
   6657 "When you ask ChatGPT to generate an image"
   6712 "it doesn't open a library of existing pictures"
   6817 "It starts with something that looks completely random. Just static.
         Pure visual noise."
   ═══════════════════════════════════════════════════════════════════════ */

export const StaticScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 6542;

  const intro = ease(frame + SCENE_LEAD_IN, 4, fps, "SLOW");
  const toStatic = smooth(frame, L(6790), 50);
  const word = ease(frame, L(6880), fps, "SLOW");

  return (
    <Stage label="diffusion" tint={mk.hot} duration={471} particles={0} gridOpacity={0.03}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        {toStatic < 0.3 && (
          <BigWord t={intro * (1 - toStatic * 3)} size={72} color={mk.white} fontFamily={fonts.display}>
            creating one is <span style={{ color: mk.hot }}>different</span>
          </BigWord>
        )}

        {toStatic > 0.02 && (
          <div
            style={{
              position: "relative",
              width: 840,
              height: 500,
              borderRadius: radius.lg,
              overflow: "hidden",
              opacity: toStatic,
              border: `2px solid ${alpha(mk.white, 0.14)}`,
              boxShadow: "0 30px 90px rgba(0,0,0,0.7)",
            }}
          >
            {/* deterministic static — feTurbulence would strobe under
                Remotion's parallel rendering */}
            <NoiseField cols={84} rows={50} amount={1} step={frame / 3} />
            {word > 0.02 && (
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                <BigWord t={word} size={96} color={mk.white} fontFamily={fonts.display}>
                  NOISE
                </BigWord>
              </AbsoluteFill>
            )}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   14. DENOISE  (7013-7708)  — the cinematic centrepiece
   7013 "it removes that noise while following your prompt"
   7092 "If you ask for a futuristic city at sunset in a watercolor style"
   7179 "the model gradually reshapes the random pixels"
   7304 "First, rough colours appear. Then buildings. Then lighting.
         Then tiny details."
   7453 "Each step gets slightly closer to your description"
   7543 "what started as meaningless noise becomes a completely new image"
   ═══════════════════════════════════════════════════════════════════════ */

const STAGES = [
  { at: 7304, label: "colour" },
  { at: 7350, label: "shape" },
  { at: 7396, label: "light" },
  { at: 7440, label: "detail" },
];

export const DenoiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 7013;

  const prompt = ease(frame, L(7092), fps, "ENTER");
  // the whole denoise arc: static -> finished image
  const clean = smooth(frame, L(7179), 380);
  const done = ramp(frame, L(7543), 60);

  // the image resolves as the noise clears
  const cols = Math.round(interpolate(clean, [0, 1], [12, 150]));
  const rows = Math.round(cols * 0.6);

  return (
    <Stage
      label="denoise"
      tint={mk.cyan}
      duration={695}
      particles={0}
      gridOpacity={0.03}
      moves={[{ at: L(7500), len: 90, scale: 1.06 }]}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md }}>
        {/* the prompt driving it */}
        {prompt > 0.02 && (
          <GlassPanel
            tint={mk.cyan}
            radius={radius.pill}
            style={{
              padding: "12px 32px",
              opacity: prompt * (1 - done * 0.5),
              ...type.body,
              fontSize: 26,
              color: mk.white,
            }}
          >
            <span style={{ color: mk.cyan, marginRight: 10 }}>❯</span>
            futuristic city at sunset, watercolour
          </GlassPanel>
        )}

        {/* noise clearing to reveal the image underneath */}
        <div
          style={{
            position: "relative",
            width: 840,
            height: 500,
            borderRadius: radius.lg,
            overflow: "hidden",
            border: `2px solid ${alpha(mk.white, 0.14)}`,
            boxShadow: `0 30px 90px rgba(0,0,0,0.7), 0 0 ${done * 70}px ${alpha(mk.cyan, done * 0.4)}`,
          }}
        >
          <AbsoluteFill style={{ filter: `blur(${(1 - clean) * 14}px)` }}>
            <PixelImage cols={cols} rows={rows} width={840} height={500} />
          </AbsoluteFill>
          <AbsoluteFill style={{ opacity: 1 - clean }}>
            <NoiseField cols={84} rows={50} amount={1} step={frame / 3} />
          </AbsoluteFill>
        </div>

        {/* the four stages, ticking off as they appear */}
        <div style={{ display: "flex", gap: space.sm }}>
          {STAGES.map((s, i) => {
            const t = ease(frame, L(s.at), fps, "SETTLE");
            if (t <= 0.02) return null;
            return (
              <div
                key={s.label}
                style={{
                  opacity: t,
                  transform: `translateY(${(1 - t) * 10}px)`,
                  padding: "9px 22px",
                  borderRadius: radius.pill,
                  border: `1px solid ${alpha(mk.cyan, 0.45)}`,
                  background: alpha(mk.cyan, 0.1),
                  ...type.meta,
                  color: mk.cyan,
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   15. SCULPT  (7708-8021)
   7708 "It's less like drawing with a paintbrush"
   7771 "and more like sculpting order out of chaos"
   7852 "So the next time you upload a photo to ChatGPT, remember"
   ═══════════════════════════════════════════════════════════════════════ */

export const SculptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 7708;

  const intro = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const sculpt = ease(frame, L(7771), fps, "SLOW");
  // order drives the right panel: noise clears, image crystallises
  const order = smooth(frame, L(7771), 210);
  const noiseAmt = Math.max(0, 1 - order);
  const imgCols = Math.max(6, Math.round(interpolate(order, [0, 1], [8, 130])));
  const imgRows = Math.max(4, Math.round(imgCols * 0.75));

  return (
    <Stage label="chaos → order" tint={mk.cyan} duration={313} particles={26}>
      <div style={{ display: "flex", alignItems: "center", gap: space.xl }}>

        {/* LEFT — chaotic brush strokes representing unstructured painting */}
        <div style={{ opacity: intro * (1 - sculpt * 0.55), textAlign: "center", width: 320 }}>
          <div style={{ ...type.sub, fontSize: 38, color: mk.muted, textDecoration: "line-through", marginBottom: space.md }}>
            painting
          </div>
          <svg width={280} height={190} viewBox="0 0 280 190" style={{ overflow: "visible" }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const x1 = 18 + seeded(i * 7) * 224;
              const y1 = 10 + seeded(i * 7 + 1) * 155;
              const x2 = 18 + seeded(i * 7 + 2) * 224;
              const y2 = 10 + seeded(i * 7 + 3) * 155;
              const cx = (x1 + x2) / 2 + (seeded(i * 7 + 4) - 0.5) * 150;
              const cy = (y1 + y2) / 2 + (seeded(i * 7 + 5) - 0.5) * 100;
              const t = Math.max(0, Math.min(1, (intro - seeded(i + 1) * 0.2) * 1.6));
              const colPick = [mk.hot, mk.purple, mk.warm, mk.blue, mk.cyan] as const;
              const col = colPick[i % colPick.length];
              return (
                <DrawPath
                  key={i}
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  t={t}
                  color={alpha(col, 0.82)}
                  width={3 + seeded(i * 3 + 1) * 7}
                  length={380}
                />
              );
            })}
          </svg>
        </div>

        {/* CENTER — animated transform arrow */}
        <div style={{
          opacity: sculpt,
          transform: `scale(${0.78 + sculpt * 0.22})`,
          ...type.hero,
          fontSize: 76,
          color: mk.cyan,
          textShadow: `0 0 50px ${alpha(mk.cyan, 0.85)}`,
          flexShrink: 0,
        }}>→</div>

        {/* RIGHT — noise dissolving into a real image (sculpting) */}
        <div style={{ opacity: sculpt, textAlign: "center", width: 320 }}>
          <div style={{
            ...type.hero,
            fontSize: 52,
            color: mk.cyan,
            textShadow: `0 0 50px ${alpha(mk.cyan, 0.55)}`,
            marginBottom: space.md,
          }}>
            sculpting
          </div>
          <div style={{
            width: 280,
            height: 190,
            borderRadius: radius.md,
            overflow: "hidden",
            position: "relative",
            margin: "0 auto",
            border: `2px solid ${alpha(mk.cyan, Math.max(0.15, order * 0.7))}`,
            boxShadow: `0 0 ${55 * order}px ${alpha(mk.cyan, 0.55 * order)}, 0 20px 60px rgba(0,0,0,0.65)`,
          }}>
            <AbsoluteFill style={{ filter: `blur(${(1 - order) * 14}px)` }}>
              <PixelImage cols={imgCols} rows={imgRows} width={280} height={190} />
            </AbsoluteFill>
            {noiseAmt > 0.02 && (
              <AbsoluteFill style={{ opacity: noiseAmt * 0.76 }}>
                <NoiseField cols={48} rows={32} amount={noiseAmt} step={frame / 3} />
              </AbsoluteFill>
            )}
          </div>
        </div>

      </div>

      {sculpt > 0.22 && (
        <div style={{
          opacity: (sculpt - 0.22) / 0.78,
          marginTop: space.lg,
          ...type.body,
          color: mk.inkDim,
        }}>
          order out of chaos
        </div>
      )}
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   16. RECAP  (8021-8458)
   8021 "It transforms millions of coloured pixels into mathematical patterns"
   8147 "connects those patterns together, combines them with language"
   8252 "and finally generates an answer, one word at a time"
   8355 "And somehow all of that happens in just a few seconds"
   ═══════════════════════════════════════════════════════════════════════ */

const PIPELINE = [
  { at: 8021, label: "pixels", color: mk.blue },
  { at: 8090, label: "patterns", color: mk.purple },
  { at: 8147, label: "connections", color: mk.cyan },
  { at: 8252, label: "words", color: mk.white },
];

export const RecapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 8021;
  const seconds = ease(frame, L(8355), fps, "SLOW");

  return (
    <Stage label="the whole journey" tint={mk.blue} duration={437} particles={24}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        <div style={{ display: "flex", alignItems: "center", gap: space.sm }}>
          {PIPELINE.map((p, i) => {
            const t = ease(frame, L(p.at), fps, "ENTER");
            if (t <= 0.02) return null;
            const pulse = idlePulse(frame, 92, i);
            return (
              <React.Fragment key={p.label}>
                {i > 0 && (
                  <svg width={54} height={20} style={{ opacity: t }}>
                    <line x1={0} y1={10} x2={40} y2={10} stroke={mk.muted} strokeWidth={2} />
                    <path d="M40,4 L52,10 L40,16 z" fill={mk.muted} />
                  </svg>
                )}
                <GlassPanel
                  tint={p.color}
                  radius={radius.lg}
                  style={{
                    padding: `${space.md}px ${space.lg}px`,
                    opacity: t,
                    transform: `translateY(${(1 - t) * 18}px) scale(${1 + pulse * 0.01})`,
                    ...type.sub,
                    fontSize: 34,
                    color: p.color,
                  }}
                >
                  {p.label}
                </GlassPanel>
              </React.Fragment>
            );
          })}
        </div>

        {seconds > 0.02 && (
          <BigWord t={seconds} size={70} color={mk.white} fontFamily={fonts.display}>
            in a few <span style={{ color: mk.cyan }}>seconds</span>
          </BigWord>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   17. REFLECT  (8458-8828)
   8458 "The more I learn about how these systems work"
   8538 "the more fascinating they become"
   8594 "Because behind one simple Upload button is decades of computer
         science, machine learning and engineering working together"
   ═══════════════════════════════════════════════════════════════════════ */

const FIELDS = ["computer science", "machine learning", "engineering"];

export const ReflectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 8458;

  const btn = ease(frame + SCENE_LEAD_IN, 4, fps, "SLOW");
  const behind = ramp(frame, L(8594), 44);
  const pulse = idlePulse(frame, 90, 0);

  return (
    <Stage label="behind one button" tint={mk.cyan} duration={370} particles={30}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
        <GlassPanel
          tint={mk.cyan}
          radius={radius.pill}
          style={{
            padding: "26px 64px",
            opacity: btn,
            transform: `scale(${0.92 + btn * 0.08})`,
            boxShadow: `0 0 ${44 + pulse * 36}px ${alpha(mk.cyan, 0.4)}, 0 20px 56px rgba(0,0,0,0.6)`,
            ...type.sub,
            fontSize: 42,
            color: mk.white,
          }}
        >
          Upload
        </GlassPanel>

        {behind > 0.02 && (
          <div style={{ display: "flex", gap: space.md, opacity: behind }}>
            {FIELDS.map((f, i) => {
              const t = ease(frame, L(8594) + i * 26, fps, "SETTLE");
              return (
                <div
                  key={f}
                  style={{
                    opacity: t,
                    transform: `translateY(${(1 - t) * 14}px)`,
                    padding: "12px 26px",
                    borderRadius: radius.pill,
                    border: `1px solid ${alpha(mk.purple, 0.45)}`,
                    background: alpha(mk.purple, 0.1),
                    ...type.body,
                    fontSize: 25,
                    color: mk.inkDim,
                  }}
                >
                  {f}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   18. CTA  (8828-9368)
   8828 "If you enjoyed this deep dive and want to understand how AI really
         works, consider subscribing"
   9035 "In the next video we'll go even deeper and explore how ChatGPT
         generates images from nothing but a sentence"
   9241 "see you in the next one"
   ═══════════════════════════════════════════════════════════════════════ */

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - 8828;

  const sub = ease(frame + SCENE_LEAD_IN, 4, fps, "SLOW");
  const next = ramp(frame, L(9035), 40);
  const bye = ease(frame, L(9241), fps, "SLOW");

  return (
    <Stage label="next" tint={mk.purple} duration={540} particles={34}>
      {bye < 0.4 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg }}>
          <BigWord t={sub * (1 - next * 0.5)} size={64} color={mk.white} fontFamily={fonts.display}>
            how AI <span style={{ color: mk.cyan }}>really</span> works
          </BigWord>

          {next > 0.05 && (
            <GlassPanel
              tint={mk.purple}
              radius={radius.lg}
              style={{
                padding: `${space.md}px ${space.xl}px`,
                opacity: next,
                transform: `translateY(${(1 - next) * 20}px)`,
                textAlign: "center",
              }}
            >
              <div style={{ ...type.meta, color: mk.muted }}>NEXT VIDEO</div>
              <div style={{ ...type.sub, fontSize: 40, color: mk.white, marginTop: 6 }}>
                images from <span style={{ color: mk.purple }}>nothing but a sentence</span>
              </div>
            </GlassPanel>
          )}
        </div>
      ) : (
        <BigWord t={bye} size={76} color={mk.white} fontFamily={fonts.display}>
          see you in the <span style={{ color: mk.cyan }}>next one</span>
        </BigWord>
      )}
    </Stage>
  );
};
