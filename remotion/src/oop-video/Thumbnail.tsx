import React from "react";
import { AbsoluteFill } from "remotion";
import { fonts } from "./theme";

/**
 * YouTube thumbnail — designed 1280x720, rendered at scale=2 (2560x1440).
 *
 * Same construction as the search-engine thumbnail that worked: a saturated
 * colour field (so it is a hole in a feed of near-black dev thumbnails), a
 * dark rotated slab that keeps the headline at ~15:1 contrast, and a stat
 * column on the right carrying the argument as three readable blocks.
 *
 * The hook needs ZERO setup: everyone who writes code has written the if/elif
 * version. "Same feature. 4 times." plus a 1-vs-4-edits scoreboard states the
 * whole video without requiring any OOP vocabulary.
 *
 * Every claim is true and comes from oop.md's verified comparison table.
 */

const BG_CODE = `class Notifier(ABC):
    @abstractmethod
    def send(self, to, message):
        ...


class EmailNotifier(Notifier):
    def send(self, to, message):
        print(f"[EMAIL] to {to}: {message}")


class NotificationService:
    def __init__(self, notifiers: dict[str, Notifier]):
        self.notifiers = notifiers

    def send(self, kind, to, message):
        self.notifiers[kind].send(to, message)


class SlackNotifier(Notifier):
    def send(self, to, message):
        print(f"[SLACK] to {to}: {message}")`;

const HEADLINE_ROT = -2.5;

export const OopThumbnail: React.FC<{ variant?: "versions" | "edits" }> = ({
  variant = "versions",
}) => {
  const isVersions = variant === "versions";
  const line1 = isVersions ? "SAME FEATURE" : "BAD OOP";
  const line2 = isVersions ? "4 TIMES" : "GOOD OOP";
  const kicker = isVersions ? "bad OOP → good OOP" : "one feature, four versions";

  return (
    <AbsoluteFill style={{ overflow: "hidden", isolation: "isolate", background: "#0E1A3A" }}>
      {/* base gradient — deep blue into teal-green, the video's bad→good arc */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(118deg, #0E1A3A 0%, #123A63 32%, #0E7A6B 66%, #17A34A 100%)",
        }}
      />

      {/* radial bloom behind the headline */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 62% 55% at 34% 40%, rgba(55,227,138,0.34) 0%, rgba(55,227,138,0.12) 45%, transparent 72%)",
          mixBlendMode: "screen",
        }}
      />

      {/* code texture — monochrome, so it reads as RHYTHM not mud at 246px */}
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
        {BG_CODE}
      </div>

      {/* contrast slab — bleeds off the left edge on purpose */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 140,
          width: 940,
          height: 430,
          transform: `rotate(${HEADLINE_ROT}deg)`,
          background: "linear-gradient(180deg, rgba(6,12,18,0.94) 0%, rgba(6,12,18,0.88) 100%)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.5)",
        }}
      />

      {/* stat column — the argument, as three readable blocks */}
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
            background: "rgba(6,12,18,0.90)",
            boxShadow: "0 14px 34px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 24, color: "#9FB3C8", letterSpacing: 1 }}>
            ADDING SLACK
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
            v2: 3 EDITS
          </div>
        </div>

        <div
          style={{
            padding: "18px 22px",
            borderRadius: 8,
            background: "#37E38A",
            boxShadow: "0 14px 34px rgba(0,0,0,0.55)",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, color: "#04301D", letterSpacing: 1 }}>
            SAME TASK
          </div>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 62,
              letterSpacing: -1.5,
              color: "#04240F",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            v4: 1 EDIT
          </div>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderRadius: 8,
            background: "#F2C879",
            boxShadow: "0 14px 34px rgba(0,0,0,0.55)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: -1,
              color: "#3A2405",
              lineHeight: 1.05,
              whiteSpace: "nowrap",
            }}
          >
            PYTHON
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontWeight: 700,
              fontSize: 21,
              letterSpacing: 1,
              color: "#3A2405",
              opacity: 0.82,
            }}
          >
            REAL CODE
          </div>
        </div>
      </div>

      {/* headline */}
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
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 0.88,
            letterSpacing: -5,
            color: "#9FB3C8",
            textShadow: "0 3px 0 rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
          }}
        >
          {line1}
        </div>

        <div style={{ position: "relative", marginTop: 14 }}>
          {/* chroma ghost — print-misregistration fringe, sharpens the glyph */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 0.88,
              letterSpacing: -5,
              color: "#1FD8FF",
              opacity: 0.45,
              filter: "blur(1.5px)",
              transform: "translate(-3px, 2px)",
              whiteSpace: "nowrap",
            }}
          >
            {line2}
          </div>
          <div
            style={{
              position: "relative",
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 0.88,
              letterSpacing: -5,
              color: "#FFE24A",
              WebkitTextStroke: "3px #061018",
              paintOrder: "stroke fill",
              textShadow:
                "0 0 60px rgba(255,226,74,0.35), 0 0 24px rgba(255,226,74,0.28), 0 6px 0px #7A4A00, 0 8px 0px #7A4A00, 0 12px 34px rgba(0,0,0,0.85)",
              whiteSpace: "nowrap",
            }}
          >
            {line2}
          </div>
        </div>

        {/* kicker — naked mono; a pill just becomes grey mush at 246px */}
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
          <span style={{ color: "#5A7A92" }}>↳ </span>
          <span style={{ color: "#FF5D6C" }}>{kicker}</span>
        </div>
      </div>

      {/* wordmark */}
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 648,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: 2.4,
          color: "#B6D8C8",
          opacity: 0.75,
          textTransform: "uppercase",
        }}
      >
        python · oop, for real
      </div>

      {/* vignette, biased toward the headline */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 105% at 42% 44%, transparent 40%, rgba(2,10,20,0.52) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
