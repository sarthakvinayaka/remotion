import { interpolate, Easing } from "remotion";

export const smoothIn = (frame: number, startFrame: number, duration: number = 30) =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const springIn = (frame: number, startFrame: number, duration: number = 30) =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    easing: Easing.out(Easing.back(1.5)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const fadeOut = (frame: number, startFrame: number, duration: number = 20) =>
  interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
