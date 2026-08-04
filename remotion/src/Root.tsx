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
import { CheapVideo, TOTAL_FRAMES as CHEAP_VIDEO_FRAMES } from "./cheap-video/CheapVideo";
import { SearchVideo, TOTAL_FRAMES as SEARCH_VIDEO_FRAMES } from "./search-video/SearchVideo";
import { Thumbnail } from "./search-video/Thumbnail";
import { ThumbnailBold } from "./search-video/ThumbnailBold";
import { OopVideo, TOTAL_FRAMES as OOP_VIDEO_FRAMES } from "./oop-video/OopVideo";
import { OopThumbnail } from "./oop-video/Thumbnail";
import { ImgGptVideo, TOTAL_FRAMES as IMGGPT_FRAMES } from "./imggpt-video/ImgGptVideo";
import { CursorVideo, TOTAL_FRAMES as CURSOR_VIDEO_FRAMES } from "./cursor-video/CursorVideo";

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
    <Composition
      id="cheap-video"
      component={CheapVideo}
      durationInFrames={CHEAP_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Thumbnails: designed at 1280x720, render with --scale=2 for 2560x1440.
        A/B pair -- identical except for the failure badge. */}
    <Composition
      id="search-thumb-bold"
      component={ThumbnailBold}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ variant: "dictionary" as const }}
    />
    <Composition
      id="search-thumb-bold-build"
      component={ThumbnailBold}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ variant: "build" as const }}
    />
    <Composition
      id="search-thumb-google"
      component={ThumbnailBold}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ variant: "google" as const }}
    />
    <Composition
      id="search-thumb-instant"
      component={ThumbnailBold}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ variant: "instant" as const }}
    />
    <Composition
      id="search-thumb"
      component={Thumbnail}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ showBadge: true }}
    />
    <Composition
      id="search-thumb-plain"
      component={Thumbnail}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ showBadge: false }}
    />
    <Composition
      id="imggpt-video"
      component={ImgGptVideo}
      durationInFrames={IMGGPT_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="oop-thumb"
      component={OopThumbnail}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ variant: "versions" as const }}
    />
    <Composition
      id="oop-thumb-badgood"
      component={OopThumbnail}
      durationInFrames={1}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ variant: "edits" as const }}
    />
    <Composition
      id="oop-video"
      component={OopVideo}
      durationInFrames={OOP_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="search-video"
      component={SearchVideo}
      durationInFrames={SEARCH_VIDEO_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="cursor-video"
      component={CursorVideo}
      durationInFrames={CURSOR_VIDEO_FRAMES}
      fps={30}
      width={2560}
      height={1440}
    />
  </>
);
