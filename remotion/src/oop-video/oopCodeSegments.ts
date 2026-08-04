/**
 * The four versions, verbatim from oop.md. Do not reformat -- the whole
 * video is a comparison between these exact shapes, and the narration counts
 * specific lines ("that's thirty four lines now", "the if else chain is still
 * there", "one line").
 *
 * Re-run scripts/capture-oop-output.py after any edit to the runnable parts.
 */

export type SegmentKey =
  | "v1"
  | "v1_grown"
  | "v2"
  | "v3"
  | "v3_run"
  | "v4"
  | "v4_slack"
  | "v4_test";

const V1 = `def send_notification(kind, to, message):
    if kind == "email":
        print(f"[EMAIL] to {to}: {message}")
    elif kind == "sms":
        print(f"[SMS] to {to}: {message}")
    elif kind == "push":
        print(f"[PUSH] to {to}: {message}")
    else:
        raise ValueError(f"Unknown kind: {kind}")`;

/**
 * "So six months later that function looks like this." 34 lines, and the
 * retry loop is copy-pasted three times -- that duplication IS the point of
 * this beat, so the three blocks must stay visibly identical.
 */
const V1_GROWN = `def send_notification(kind, to, message):
    if kind == "email":
        if "@" not in to:
            raise ValueError("bad email")
        for attempt in range(3):
            try:
                print(f"[EMAIL] to {to}: {message}")
                break
            except Exception:
                continue
    elif kind == "sms":
        if len(message) > 160:
            message = message[:157] + "..."
        for attempt in range(3):
            try:
                print(f"[SMS] to {to}: {message}")
                break
            except Exception:
                continue
    elif kind == "push":
        for attempt in range(3):
            try:
                print(f"[PUSH] to {to}: {message}")
                break
            except Exception:
                continue
    else:
        raise ValueError(f"Unknown kind: {kind}")`;

const V2 = `class EmailSender:
    def send(self, to, message):
        print(f"[EMAIL] to {to}: {message}")

class SmsSender:
    def send(self, to, message):
        print(f"[SMS] to {to}: {message}")

class PushSender:
    def send(self, to, message):
        print(f"[PUSH] to {to}: {message}")


class NotificationService:
    def __init__(self):
        self.email = EmailSender()
        self.sms = SmsSender()
        self.push = PushSender()

    def send(self, kind, to, message):
        if kind == "email":
            self.email.send(to, message)
        elif kind == "sms":
            self.sms.send(to, message)
        elif kind == "push":
            self.push.send(to, message)`;

const V3 = `from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, to, message):
        ...

class EmailNotifier(Notifier):
    def send(self, to, message):
        print(f"[EMAIL] to {to}: {message}")

class SmsNotifier(Notifier):
    def send(self, to, message):
        print(f"[SMS] to {to}: {message}")

class PushNotifier(Notifier):
    def send(self, to, message):
        print(f"[PUSH] to {to}: {message}")


class NotificationService:
    def __init__(self):
        self.notifiers = {
            "email": EmailNotifier(),
            "sms": SmsNotifier(),
            "push": PushNotifier(),
        }

    def send(self, kind, to, message):
        self.notifiers[kind].send(to, message)`;

const V3_RUN = `service = NotificationService()

service.send("email", "sarthak@example.com", "Your order shipped")
service.send("sms", "+91999999999", "Your order shipped")
service.send("push", "device-123", "Your order shipped")`;

/** "One change. Instead of building them, the service receives them." */
const V4 = `class NotificationService:
    def __init__(self, notifiers: dict[str, Notifier]):
        self.notifiers = notifiers

    def send(self, kind, to, message):
        self.notifiers[kind].send(to, message)`;

const V4_SLACK = `${V4}


class SlackNotifier(Notifier):
    def send(self, to, message):
        print(f"[SLACK] to {to}: {message}")


service = NotificationService({
    "email": EmailNotifier(),
    "sms": SmsNotifier(),
    "slack": SlackNotifier(),
})`;

const V4_TEST = `class FakeNotifier(Notifier):
    def __init__(self):
        self.sent = []
    def send(self, to, message):
        self.sent.append((to, message))


fake = FakeNotifier()
test_service = NotificationService({"email": fake})
test_service.send("email", "test@test.com", "hello")
print(f"Captured {len(fake.sent)} message(s) -> {fake.sent}")`;

export const CODE: Record<SegmentKey, string> = {
  v1: V1,
  v1_grown: V1_GROWN,
  v2: V2,
  v3: V3,
  v3_run: V3_RUN,
  v4: V4,
  v4_slack: V4_SLACK,
  v4_test: V4_TEST,
};

export const PREVIOUS_CODE: Partial<Record<SegmentKey, string>> = {
  v4_slack: V4,
};

export const TITLES: Record<SegmentKey, string> = {
  v1: "v1 — one function",
  v1_grown: "v1, six months later",
  v2: "v2 — classes, but…",
  v3: "v3 — polymorphism",
  v3_run: "v3 — running it",
  v4: "v4 — injection",
  v4_slack: "adding Slack",
  v4_test: "and it's testable",
};

/** Which version each code segment belongs to -- drives the version badge
 *  and the colour arc (v1/v2 = problem, v3/v4 = fix). */
export const VERSION_OF: Record<SegmentKey, 1 | 2 | 3 | 4> = {
  v1: 1,
  v1_grown: 1,
  v2: 2,
  v3: 3,
  v3_run: 3,
  v4: 4,
  v4_slack: 4,
  v4_test: 4,
};
