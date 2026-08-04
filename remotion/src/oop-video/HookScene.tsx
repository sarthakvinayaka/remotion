import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, fonts, radius, space, type, VERSIONS } from "./theme";
import { ease, idlePulse, ramp, SCENE_LEAD_IN } from "./motion";
import { AmbientGlow, GridBg, Hero, Scene, Sub, surface } from "./ui";

/**
 * Segment 0-850. Local == global.
 *    3  "Most OOP tutorials give you definitions"
 *  107  "Encapsulation is this, polymorphism is that, here's a Dog class"
 *  252  "you finish it understanding the words, but not why anyone bothered"
 *  358  "So today we're doing it differently"
 *  423  "We're building one feature, a notification system, four separate times"
 *  536  "Each version fixes a real problem in the version before it"
 *  676  "the test that separates all four, which is simply this"
 *  770  "How much do you have to change to add Slack?"
 *
 * The script's own note: the SPINE is the "add Slack" question, asked early
 * and answered in the comparison. So the hook must end on that question.
 */

const JARGON_AT = 107;
const DIFFERENT_AT = 358;
const FOUR_TIMES_AT = 423;
const TEST_AT = 676;
const SLACK_Q_AT = 770;

const JARGON = ["Encapsulation", "Polymorphism", "Inheritance", "Abstraction"];

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = ease(frame + SCENE_LEAD_IN, 4, fps, "ENTER");
  const differentIn = ease(frame, DIFFERENT_AT, fps, "SETTLE");
  const slackIn = ease(frame, SLACK_Q_AT, fps, "SLOW");

  const toVersions = ramp(frame, FOUR_TIMES_AT, 26);
  const toQuestion = ramp(frame, TEST_AT, 26);

  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <GridBg opacity={0.04} color={toQuestion > 0.5 ? c.accent : c.cool} />
      <AmbientGlow color={toQuestion > 0.5 ? c.accent : c.violet} />

      <Scene chip="bad OOP → good OOP" chipColor={c.accent}>
        {toQuestion < 0.5 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: space.lg,
              width: "100%",
              opacity: 1 - toQuestion * 2,
            }}
          >
            {toVersions < 0.5 ? (
              <>
                <Sub style={{ opacity: introIn }}>
                  Most OOP tutorials give you <span style={{ color: c.noise }}>definitions</span>
                </Sub>
                {/* the jargon everyone recites and nobody feels */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: space.md, justifyContent: "center", maxWidth: 1400 }}>
                  {JARGON.map((w, i) => {
                    const wIn = ease(frame, JARGON_AT + i * 26, fps, "ENTER");
                    const fade = differentIn > 0.3 ? 1 - differentIn * 0.65 : 1;
                    return (
                      <div
                        key={w}
                        style={{
                          opacity: wIn * fade,
                          transform: `translateY(${interpolate(wIn, [0, 1], [16, 0])}px)`,
                          padding: "16px 32px",
                          borderRadius: radius.lg,
                          ...surface(c.muted, false),
                          fontFamily: fonts.display,
                          fontSize: 42,
                          fontWeight: 700,
                          color: c.muted,
                        }}
                      >
                        {w}
                      </div>
                    );
                  })}
                </div>
                {differentIn > 0.02 && (
                  <div
                    style={{
                      opacity: differentIn,
                      transform: `translateY(${interpolate(differentIn, [0, 1], [16, 0])}px)`,
                      ...type.body,
                      fontSize: 32,
                      color: c.ink,
                      textAlign: "center",
                    }}
                  >
                    You learn the words — but not <span style={{ color: c.accent }}>why anyone bothered</span>.
                  </div>
                )}
              </>
            ) : (
              /* one feature, four versions */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.lg, opacity: toVersions }}>
                <Sub>
                  One feature. <span style={{ color: c.accent }}>Four</span> versions.
                </Sub>
                <div style={{ display: "flex", gap: space.md, width: "100%", maxWidth: 1560 }}>
                  {VERSIONS.map((v, i) => {
                    const vIn = ease(frame, FOUR_TIMES_AT + 30 + i * 22, fps, "ENTER");
                    const color = v.modified ? c.noise : c.hit;
                    const pulse = idlePulse(frame, 86, i);
                    return (
                      <div
                        key={v.n}
                        style={{
                          flex: 1,
                          opacity: vIn,
                          transform: `translateY(${interpolate(vIn, [0, 1], [24, 0])}px)`,
                          padding: space.lg,
                          borderRadius: radius.lg,
                          ...surface(color, true),
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 36px rgba(0,0,0,0.5), 0 0 ${10 + pulse * 14}px ${color}1F`,
                          minHeight: 340,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontFamily: fonts.display, fontSize: 76, fontWeight: 700, color, lineHeight: 1 }}>
                          v{v.n}
                        </div>
                        <div style={{ ...type.body, fontSize: 24, color: c.inkDim, marginTop: space.sm }}>
                          {v.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* THE SPINE: the question the whole video answers */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.md, opacity: toQuestion }}>
            <div style={{ ...type.meta, color: c.accent }}>THE TEST THAT SEPARATES ALL FOUR</div>
            <Hero
              style={{
                opacity: slackIn,
                transform: `translateY(${interpolate(slackIn, [0, 1], [24, 0])}px)`,
              }}
            >
              How much do you change
              <br />
              to add <span style={{ color: c.accent }}>Slack</span>?
            </Hero>
          </div>
        )}
      </Scene>
    </AbsoluteFill>
  );
};
