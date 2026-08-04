import React from "react";
import { AbsoluteFill } from "remotion";
import { c, fonts } from "./theme";
import { tokenizeLine } from "../code-video/pythonHighlight";

/**
 * YouTube thumbnail — designed at 1280x720, rendered at scale=2 for 2560x1440.
 *
 * BACKGROUND CHOICE: real Python from the video, darkened to ~18% and pushed
 * behind a vignette + gradient scrim. Reasoning:
 *   - Code is the single fastest genre signal for a dev audience. A viewer
 *     scrolling knows what this video IS before reading a word.
 *   - It is REAL code from the actual video, not decoration, so the thumbnail
 *     doesn't over-promise.
 *   - Heavy darkening keeps contrast ratio high for the headline, which is
 *     what actually drives legibility at 120px-wide mobile previews.
 * A flat background tests worse for this genre; a photo/stock image would
 * misrepresent the content.
 *
 * TEXT: two lines, all caps, one accent word. "30" is the only coloured
 * token — two accents split the eye and neither lands.
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

export const Thumbnail: React.FC<{ showBadge?: boolean }> = ({ showBadge = true }) => {
  const lines = BG_CODE.split("\n");

  return (
    <AbsoluteFill style={{ background: c.bg, overflow: "hidden" }}>
      {/* --- background: real code, tilted and dimmed --- */}
      <div
        style={{
          position: "absolute",
          inset: -120,
          transform: "rotate(-6deg) scale(1.15)",
          opacity: 0.22,
          fontFamily: fonts.mono,
          fontSize: 27,
          lineHeight: 1.62,
          whiteSpace: "pre",
          padding: 60,
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>
            {tokenizeLine(line).map((tok, j) => (
              <span key={j} style={{ color: tok.color }}>
                {tok.text}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* --- scrim: keeps the headline at high contrast over the code --- */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,14,20,0.72) 0%, rgba(11,14,20,0.93) 44%, rgba(11,14,20,0.98) 100%)",
        }}
      />
      {/* warm key light behind the text, so the centre reads lifted */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 55% at 50% 44%, ${c.hit}1C 0%, transparent 62%)`,
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(125% 100% at 50% 46%, transparent 38%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {/* --- headline --- */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 56,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 152,
            lineHeight: 0.97,
            letterSpacing: -4.5,
            color: c.ink,
            textAlign: "center",
            textShadow: "0 6px 34px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.9)",
          }}
        >
          <div>SEARCH ENGINE</div>
          <div style={{ marginTop: 6 }}>
            IN{" "}
            <span
              style={{
                color: c.hit,
                textShadow: `0 0 46px ${c.hit}77, 0 6px 30px rgba(0,0,0,0.8)`,
              }}
            >
              30
            </span>{" "}
            LINES
          </div>
        </div>

        {/* --- supporting badge: the failure, demoted to a second-look reward --- */}
        {showBadge && (
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "13px 30px",
              borderRadius: 999,
              border: `2px solid ${c.noise}88`,
              background: "rgba(11,14,20,0.72)",
              boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 26px ${c.noise}22`,
              fontFamily: fonts.mono,
              fontSize: 36,
              fontWeight: 500,
              color: c.inkDim,
              transform: "rotate(-1.4deg)",
            }}
          >
            <span style={{ color: c.ink }}>"the dog"</span>
            <span style={{ color: c.muted }}>→</span>
            <span style={{ fontSize: 38 }}>🐱</span>
          </div>
        )}
      </AbsoluteFill>

      {/* python wordmark, bottom-left -- reinforces the language without
          stealing a line from the headline */}
      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 40,
          fontFamily: fonts.mono,
          fontSize: 28,
          letterSpacing: 2.4,
          color: c.accent,
          opacity: 0.92,
          textTransform: "uppercase",
        }}
      >
        python · from scratch
      </div>
    </AbsoluteFill>
  );
};
