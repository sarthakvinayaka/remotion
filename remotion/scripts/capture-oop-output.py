import io, json, contextlib
from abc import ABC, abstractmethod

out = {}

# ---- V3: polymorphism ----
class Notifier(ABC):
    @abstractmethod
    def send(self, to, message): ...

class EmailNotifier(Notifier):
    def send(self, to, message): print(f"[EMAIL] to {to}: {message}")
class SmsNotifier(Notifier):
    def send(self, to, message): print(f"[SMS] to {to}: {message}")
class PushNotifier(Notifier):
    def send(self, to, message): print(f"[PUSH] to {to}: {message}")

class ServiceV3:
    def __init__(self):
        self.notifiers = {"email": EmailNotifier(), "sms": SmsNotifier(), "push": PushNotifier()}
    def send(self, kind, to, message): self.notifiers[kind].send(to, message)

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    s = ServiceV3()
    s.send("email", "sarthak@example.com", "Your order shipped")
    s.send("sms", "+91999999999", "Your order shipped")
    s.send("push", "device-123", "Your order shipped")
out["v3"] = buf.getvalue().strip().split("\n")

# ---- V4: dependency injection + Slack ----
class SlackNotifier(Notifier):
    def send(self, to, message): print(f"[SLACK] to {to}: {message}")

class ServiceV4:
    def __init__(self, notifiers): self.notifiers = notifiers
    def send(self, kind, to, message): self.notifiers[kind].send(to, message)

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    svc = ServiceV4({"email": EmailNotifier(), "sms": SmsNotifier(), "slack": SlackNotifier()})
    svc.send("email", "sarthak@example.com", "Your order shipped")
    svc.send("slack", "#alerts", "Your order shipped")
out["v4"] = buf.getvalue().strip().split("\n")

# ---- the fake-notifier test ----
class FakeNotifier(Notifier):
    def __init__(self): self.sent = []
    def send(self, to, message): self.sent.append((to, message))

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    fake = FakeNotifier()
    t = ServiceV4({"email": fake})
    t.send("email", "test@test.com", "hello")
    print(f"Captured {len(fake.sent)} message(s) -> {fake.sent}")
out["test"] = buf.getvalue().strip().split("\n")

print(json.dumps(out, indent=2))
