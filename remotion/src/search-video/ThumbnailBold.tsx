import React from "react";
import { AbsoluteFill } from "remotion";
import { fonts } from "./theme";
import { tokenizeLine } from "../code-video/pythonHighlight";

/**
 * BOLD / HIGH-CTR THUMBNAIL — designed 1280x720, rendered at scale=2 (2560x1440).
 *
 * A deliberate departure from the channel's restrained dark house style: the
 * problem with a near-black thumbnail is not that it looks bad, it's that six
 * of the eight thumbnails around it in the feed are also near-black. A
 * saturated violet->magenta field is a hole in that grid.
 *
 * Contrast is preserved by putting the headline on a dark rotated slab, so the
 * background can be loud AND the type can sit at ~15:1.
 *
 * Two variants:
 *   "dictionary" — IT'S JUST A / DICTIONARY  (punchline-forward)
 *   "build"      — SEARCH ENGINE / IN 30 LINES  (claim + anomaly)
 *
 * Every claim on screen is true: the index really is a defaultdict, the code
 * imports only stdlib, and `the x 4` is the real captured count that causes
 * the wrong ranking.
 */

const BG_CODE = `index = defaultdict(lambda: defaultdict(int))

for doc_id, text in documents.items():
    for word in tokenize(text):
        index[word][doc_id] += 1


def score(word, doc_id):
    tf = index[word][doc_id] / len(tokenize(documents[doc_id]))
    idf = math.log(len(documents) / len(index[word]))
    return tf * idf


def search(query):
    results = defaultdict(float)
    for word in tokenize(query):
        if word not in index:
            continue
        for doc_id in index[word]:
            results[doc_id] += score(word, doc_id)
    return sorted(results.items(), key=lambda x: x[1], reverse=True)`;

const HEADLINE_ROT = -2.5;
const CAT_ROT = -9;

type Variant = "dictionary" | "build" | "google" | "instant";

/**
 * Copy per variant. The "google"/"instant" variants deliberately avoid the
 * cat: that joke needs three facts to decode (the query was "the dog", a cat
 * came back, stopword counting caused it) and a viewer who hasn't watched
 * cannot reconstruct that from a static frame. These two lead with something
 * every person already knows -- Google is instant -- which needs no setup.
 */
const COPY: Record<Variant, { line1: string; line2: string; kicker: string; accentInLine2?: string }> = {
  dictionary: { line1: "IT'S JUST A", line2: "DICTIONARY", kicker: "then it broke" },
  build: { line1: "SEARCH ENGINE", line2: "IN 30 LINES", kicker: "why is this a cat?", accentInLine2: "30" },
  google: { line1: "GOOGLE NEVER", line2: "READS THE PAGE", kicker: "here's what it actually does" },
  instant: { line1: "WHY SEARCH IS", line2: "INSTANT", kicker: "built in 30 lines of python" },
};

export const ThumbnailBold: React.FC<{ variant?: Variant }> = ({
  variant = "dictionary",
}) => {
  const copy = COPY[variant];
  const isDict = variant === "dictionary";
  const showCat = variant === "dictionary" || variant === "build";
  const line1 = copy.line1;
  const kicker = copy.kicker;

  return (
    <AbsoluteFill style={{ overflow: "hidden", isolation: "isolate", background: "#2B0F4A" }}>
      {/* 2. base gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(118deg, #2B0F4A 0%, #5B1E8C 34%, #A21C7A 68%, #D9256B 100%)",
        }}
      />

      {/* 3. radial bloom behind the headline */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 62% 55% at 34% 40%, rgba(255,92,180,0.42) 0%, rgba(255,92,180,0.14) 45%, transparent 72%)",
          mixBlendMode: "screen",
        }}
      />

      {/* 4. code texture -- monochrome so it reads as RHYTHM, not mud, at 246px */}
      <div
        style={{
          position: "absolute",
          inset: -140,
          transform: "rotate(-8deg) scale(1.22)",
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: 26,
          lineHeight: 1.66,
          whiteSpace: "pre",
          color: "#FFFFFF",
          opacity: 0.1,
          mixBlendMode: "overlay",
          padding: 60,
        }}
      >
        {BG_CODE.split("\n").map((line, i) => (
          <div key={i}>{tokenizeLine(line).map((t) => t.text).join("")}</div>
        ))}
      </div>

      {/* 5. grain -- fixed seed, deterministic */}
      <AbsoluteFill style={{ opacity: 0.055, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="boldGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#boldGrain)" />
        </svg>
      </AbsoluteFill>

      {/* 6. contrast slab -- bleeds off the left edge on purpose */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 140,
          width: 940,
          height: 430,
          transform: `rotate(${HEADLINE_ROT}deg)`,
          background: "linear-gradient(180deg, rgba(9,6,18,0.94) 0%, rgba(9,6,18,0.88) 100%)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.5)",
        }}
      />

      {showCat ? (
        <>
      {/* 7. cat contact shadow */}
      <div
        style={{
          position: "absolute",
          left: 995,
          top: 545,
          width: 210,
          height: 30,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* 8. the cat -- second largest object in the frame */}
      <div
        style={{
          position: "absolute",
          left: 940,
          top: 268,
          fontSize: 300,
          lineHeight: 1,
          transform: `rotate(${CAT_ROT}deg)`,
          filter:
            "drop-shadow(0 18px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 70px rgba(255,226,74,0.22))",
        }}
      >
        🐱
      </div>

      {/* 9. result strip -- turns a random cat into THE JOKE */}
      <div
        style={{
          position: "absolute",
          left: 950,
          top: 178,
          transform: `rotate(${CAT_ROT}deg)`,
          transformOrigin: "left top",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 34,
          whiteSpace: "pre",
          textShadow: "0 2px 8px rgba(0,0,0,0.85)",
        }}
      >
        <span style={{ color: "#FFE24A" }}>1.</span>
        <span style={{ color: "#FFFFFF" }}>{'  "the dog"'}</span>
      </div>

      {/* 10. hand-drawn double strike -- two non-parallel strokes read as DRAWN */}
      <svg
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        width={1280}
        height={720}
        viewBox="0 0 1280 720"
      >
        <g filter="drop-shadow(0 2px 6px rgba(0,0,0,0.7))">
          <path d="M 952 214 L 1218 205" stroke="#FF3355" strokeWidth={7} strokeLinecap="round" opacity={0.95} />
          <path d="M 954 219 L 1216 211" stroke="#FF3355" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
        </g>
      </svg>

      {/* 11. the real reason the cat wins -- five characters of technical payload */}
      <div
        style={{
          position: "absolute",
          left: 946,
          top: 556,
          transform: `rotate(${CAT_ROT}deg)`,
          transformOrigin: "left top",
          padding: "8px 18px",
          background: "#FF3355",
          color: "#FFFFFF",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 1,
          borderRadius: 4,
          boxShadow: "0 8px 22px rgba(0,0,0,0.55)",
          whiteSpace: "pre",
        }}
      >
        "the" × 4
      </div>
        </>
      ) : (
        /* NO-CAT VARIANTS: the right zone carries the one fact every viewer
           already knows -- Google is instant over an absurd corpus. Needs no
           setup, decodes in under a second, and it is the video's real thesis. */
        <div
          style={{
            position: "absolute",
            left: 940,
            top: 208,
            width: 316,
            transform: "rotate(-4deg)",
            transformOrigin: "center center",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderRadius: 8,
              background: "rgba(9,6,18,0.90)",
              boxShadow: "0 14px 34px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 24, color: "#B9A8D8", letterSpacing: 1 }}>
              PAGES SEARCHED
            </div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 62,
                letterSpacing: -1.5,
                color: "#FFFFFF",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                textShadow: "0 4px 0 rgba(0,0,0,0.8)",
              }}
            >
              BILLIONS
            </div>
          </div>

          <div
            style={{
              padding: "18px 22px",
              borderRadius: 8,
              background: "#FFE24A",
              boxShadow: "0 14px 34px rgba(0,0,0,0.55)",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, color: "#7A1F00", letterSpacing: 1 }}>
              TIME TAKEN
            </div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 68,
                letterSpacing: -1.5,
                color: "#120A22",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              0.5s
            </div>
          </div>

          {/* the build promise -- the thumbnail must carry it, not just the
              title, or the hook reads as an explainer the video isn't */}
          <div
            style={{
              padding: "14px 20px",
              borderRadius: 8,
              background: "#37E38A",
              boxShadow: "0 14px 34px rgba(0,0,0,0.55)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 46,
                letterSpacing: -1,
                color: "#042417",
                lineHeight: 1.05,
                whiteSpace: "nowrap",
              }}
            >
              30 LINES
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontWeight: 700,
                fontSize: 21,
                letterSpacing: 1,
                color: "#042417",
                opacity: 0.82,
              }}
            >
              FROM SCRATCH
            </div>
          </div>
        </div>
      )}

      {/* 12-15. headline group, one shared rotation */}
      <div
        style={{
          position: "absolute",
          left: 68,
          top: 196,
          width: 800,
          transform: `rotate(${HEADLINE_ROT}deg)`,
          transformOrigin: "left top",
        }}
      >
        {/* setup line -- deliberately recessive */}
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: line1.length > 12 ? 84 : 104,
            lineHeight: 0.88,
            letterSpacing: -5,
            color: "#B9A8D8",
            textShadow: "0 3px 0 rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
          }}
        >
          {line1}
        </div>

        {/* payload line -- the one thing that must survive 246px */}
        <div style={{ position: "relative", marginTop: 14 }}>
          {/* chroma ghost: print-misregistration fringe, sharpens the main glyph */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: copy.line2.length > 12 ? 104 : copy.line2.length > 10 ? 122 : 150,
              lineHeight: 0.88,
              letterSpacing: -5,
              color: "#FF3E9D",
              opacity: 0.5,
              filter: "blur(1.5px)",
              transform: "translate(-3px, 2px)",
              whiteSpace: "nowrap",
            }}
          >
            {copy.line2}
          </div>
          <div
            style={{
              position: "relative",
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: copy.line2.length > 12 ? 104 : copy.line2.length > 10 ? 122 : 150,
              lineHeight: 0.88,
              letterSpacing: -5,
              color: "#FFE24A",
              WebkitTextStroke: "3px #120A22",
              paintOrder: "stroke fill",
              textShadow:
                "0 0 60px rgba(255,226,74,0.35), 0 0 24px rgba(255,226,74,0.28), 0 6px 0px #7A1F00, 0 8px 0px #7A1F00, 0 12px 34px rgba(0,0,0,0.85)",
              whiteSpace: "nowrap",
            }}
          >
            {copy.accentInLine2
              ? copy.line2.split(copy.accentInLine2).flatMap((part, i, arr) => [
                  <span key={`p${i}`} style={{ color: "#FFFFFF", WebkitTextStroke: "3px #120A22" }}>
                    {part}
                  </span>,
                  i < arr.length - 1 ? <span key={`a${i}`}>{copy.accentInLine2}</span> : null,
                ])
              : copy.line2}
          </div>
        </div>

        {/* kicker -- naked mono, no pill: a lozenge just becomes grey mush at 246px */}
        <div
          style={{
            marginTop: 26,
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: 0.5,
            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#6E5A8F" }}>↳ </span>
          <span style={{ color: "#FF5D6C" }}>{kicker}</span>
        </div>
      </div>

      {/* 16. wordmark */}
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 648,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: 2.4,
          color: "#C9B6E8",
          opacity: 0.75,
          textTransform: "uppercase",
        }}
      >
        python · from scratch
      </div>

      {/* 17. vignette, biased toward the headline */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 105% at 42% 44%, transparent 40%, rgba(20,4,30,0.50) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
