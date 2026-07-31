import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES } from "./MainVideo";
import { Short1Vertical } from "./shorts/Short1Vertical";
import { Short2Vertical } from "./shorts/Short2Vertical";
import { Short3Vertical } from "./shorts3/Short3Vertical";
import short3Marks from "./short3-marks.json";
import { CodeVideo, TOTAL_FRAMES as CODE_VIDEO_FRAMES } from "./code-video/CodeVideo";
import { CrdtVideo, TOTAL_FRAMES as CRDT_VIDEO_FRAMES } from "./crdt-video/CrdtVideo";
import { HashTableVideo, TOTAL_FRAMES as HASHTABLE_VIDEO_FRAMES } from "./hashtable-video/HashTableVideo";
import { GptVideo, TOTAL_FRAMES as GPT_VIDEO_FRAMES } from "./gpt-video/GptVideo";

// Short 1: hook through the "10 services x 10 copies of infra" reveal and
// "the platform quietly becomes the product" punchline (Scenes 01-04).
const SHORT1_DURATION = 2655;

// Short 2: recap parallel lines through the closing payoff line, right before
// the like/share/subscribe CTA (Scenes 10 + start of 11).
const SHORT2_DURATION = 903;

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="short1-vertical"
      component={Short1Vertical}
      durationInFrames={SHORT1_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="short2-vertical"
      component={Short2Vertical}
      durationInFrames={SHORT2_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="short3-vertical"
      component={Short3Vertical}
      durationInFrames={short3Marks.total_frames + 45}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="code-video"
      component={CodeVideo}
      durationInFrames={CODE_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="crdt-video"
      component={CrdtVideo}
      durationInFrames={CRDT_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hashtable-video"
      component={HashTableVideo}
      durationInFrames={HASHTABLE_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="gpt-video"
      component={GptVideo}
      durationInFrames={GPT_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
