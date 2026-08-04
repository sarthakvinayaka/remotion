import type { SegmentKey } from "./oopCodeSegments";

/**
 * Word-anchor schedules: map a spoken phrase (by its REAL whisper frame,
 * global to the video) to "the code should be revealed through this line
 * index by now". Anchors MUST be in ascending frame order -- a descending
 * pair makes the interpolation degenerate and pins the segment to its last
 * line from frame 0.
 *
 * Line indices are 0-based into CODE[key] from oopCodeSegments.ts.
 */
export type Anchor = { atFrame: number; throughLine: number };

export const TYPING_SCHEDULES: Partial<Record<SegmentKey, Anchor[]>> = {
  // V1: 0 def | 1 if email | 2 print | 3 elif sms | 4 print | 5 elif push |
  //     6 print | 7 else | 8 raise
  v1: [
    { atFrame: 850, throughLine: 0 }, // "One function. Check the type, do the right thing."
    { atFrame: 900, throughLine: 4 },
    { atFrame: 960, throughLine: 8 },
    { atFrame: 1171, throughLine: 8 }, // hold through "features get added"
  ],

  // V1_GROWN is shown whole -- the point is the SHAPE (34 lines, retry x3),
  // not any individual line, so reveal it fast and let the side panel carry
  // the "copy-pasted three times" callout.
  v1_grown: [
    { atFrame: 1432, throughLine: 30 },
  ],

  // V2: 0 class EmailSender ... 12 class NotificationService | 13 __init__ |
  //     14-16 self.email/sms/push | 18 def send | 19 if | 20 call | 21 elif ...
  v2: [
    { atFrame: 1964, throughLine: 2 }, // "the obvious next step is classes"
    { atFrame: 2020, throughLine: 10 }, // "Now we have classes, each one handles its own channel"
    { atFrame: 2126, throughLine: 16 }, // "the email logic lives with email"
    { atFrame: 2289, throughLine: 21 }, // "that's encapsulation... duplication is gone"
    { atFrame: 2374, throughLine: 25 }, // "But look at the bottom of the service class"
  ],

  // V3: 0 from abc | 2 class Notifier | 3 @abstractmethod | 4 def send |
  //     7 EmailNotifier ... 19 class NotificationService | 20 __init__ |
  //     21-25 dict | 27 def send | 28 self.notifiers[kind].send(...)
  v3: [
    { atFrame: 3005, throughLine: 0 }, // "here's the actual fix"
    { atFrame: 3034, throughLine: 5 }, // "First we define a Notifier base class"
    { atFrame: 3104, throughLine: 5 }, // "must have a send method"
    { atFrame: 3250, throughLine: 5 }, // "That's abstraction" -- hold on the ABC
    { atFrame: 3385, throughLine: 17 }, // "each real notifier keeps that promise"
  ],

  v3_run: [
    { atFrame: 3385, throughLine: 17 },
    { atFrame: 3478, throughLine: 28 }, // "now look at the send method at the bottom"
    { atFrame: 3544, throughLine: 28 }, // "one line"
  ],

  // V4: 0 class NotificationService | 1 __init__(self, notifiers) |
  //     2 self.notifiers = notifiers | 4 def send | 5 dispatch
  v4: [
    { atFrame: 4098, throughLine: 0 }, // "Version 3 is good, but there's one problem left"
    { atFrame: 4436, throughLine: 2 }, // "Instead of building them, the service receives them"
    { atFrame: 4559, throughLine: 5 }, // "That's dependency injection"
  ],

  // V4_SLACK = V4 (6 lines) + blank + SlackNotifier at 9 + service = at 14
  v4_slack: [
    { atFrame: 4821, throughLine: 11 }, // "I just added Slack"
    { atFrame: 4887, throughLine: 18 }, // "and I did not touch NotificationService at all"
  ],

  // V4_TEST: 0 class FakeNotifier | 1 __init__ | 2 self.sent | 3 def send |
  //          4 append | 7 fake = | 8 test_service = | 9 send | 10 print
  v4_test: [
    { atFrame: 5085, throughLine: 4 }, // "There's a second benefit that people miss"
    { atFrame: 5182, throughLine: 9 }, // "I passed in a fake notifier that records messages"
    { atFrame: 5305, throughLine: 10 }, // "so I can test the whole service"
  ],
};

/**
 * When each terminal line appears, in GLOBAL frames, landing on the spoken
 * moment. Values are the real captured output from
 * scripts/capture-oop-output.py.
 */
export const TERMINAL_FRAMES: Partial<Record<SegmentKey, number[]>> = {
  // v3 run: three notifications firing as "each real notifier keeps that
  // promise in its own way" resolves
  v3_run: [3700, 3740, 3780],
  // "I just added Slack" -- email then slack
  v4_slack: [4860, 4900],
  // "Captured 1 message(s)" lands on "that's a test"
  v4_test: [5420],
};
