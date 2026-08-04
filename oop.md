# Video Script: "I Built the Same Feature 4 Ways: Bad OOP to Good OOP"
**Target length: ~6:40–7:00**
**How to read: every line break is a pause. Each line is one complete thought. Read one line, breathe, read the next.**

---

## [0:00–0:35] Hook

Most OOP tutorials give you definitions.

Encapsulation is this. Polymorphism is that. Here's a Dog class that inherits from Animal.

And you finish it understanding the words, but not why anyone bothered.

So today we're doing it differently.

We're building one feature, a notification system, four separate times.

Each version fixes a real problem in the version before it.

And at the end I'll show you the test that separates all four, which is simply this.

How much do you have to change to add Slack?

**Visual:** Title card, then four code blocks side by side, briefly.

---

## [0:35–1:25] Version one, the honest beginning

Let's start where everyone starts.

**Live-type:**
```python
def send_notification(kind, to, message):
    if kind == "email":
        print(f"[EMAIL] to {to}: {message}")
    elif kind == "sms":
        print(f"[SMS] to {to}: {message}")
    elif kind == "push":
        print(f"[PUSH] to {to}: {message}")
    else:
        raise ValueError(f"Unknown kind: {kind}")
```

**Narration while typing:**

One function. Check the type, do the right thing.

And I want to be clear, this is fine. If this is all you need, ship it.

The problem isn't this code. The problem is what this code becomes.

Because features get added. Email needs address validation. SMS has a 160 character limit.

Everything needs retry logic when the network fails.

So six months later that function looks like this.

**Show `v1_grown.py` on screen.**

That's thirty four lines now, and look at the retry loop.

It's copy pasted three times. Once inside each branch.

So when you find a bug in the retry logic, you fix it in three places.

And if you miss one, you now have a bug that only happens for SMS.

---

## [1:25–2:30] Version two, the trap

So the obvious next step is classes.

**Live-type:**
```python
class EmailSender:
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
            self.push.send(to, message)
```

**Narration while typing:**

Now we have classes. Each one handles its own channel.

The email logic lives with email. The SMS logic lives with SMS.

That's encapsulation, and it's a genuine improvement. The duplication is gone.

But look at the bottom of that service class.

The if else chain is still there.

We moved the mess, we didn't remove it.

This is the trap I want to point out, because a lot of code looks like this in production.

Using classes doesn't automatically mean you're doing OOP well.

If your code still asks "what type is this" before deciding what to do, you haven't finished the job.

---

## [2:30–3:40] Version three, where it clicks

So here's the actual fix.

**Live-type:**
```python
from abc import ABC, abstractmethod

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
        self.notifiers[kind].send(to, message)
```

**Narration while typing:**

First we define a Notifier base class.

It says any notifier must have a send method that takes a recipient and a message.

That's abstraction. It's a promise about shape, with no implementation.

Then each real notifier keeps that promise in its own way.

And now look at the send method at the bottom.

One line. Look up the notifier, call send on it.

The if else chain is completely gone.

That's polymorphism, and this is the part that actually clicks for people.

The service no longer knows or cares what kind of notifier it's holding.

It just knows the thing has a send method, because the base class guaranteed it.

**Run it. Show all three notifications working.**

---

## [3:40–4:40] Version four, the one that survives

Version three is good. But there's one problem left, and it's subtle.

Look at that init method. The service is building its own notifiers.

That means the service is permanently wired to those three specific classes.

**Live-type:**
```python
class NotificationService:
    def __init__(self, notifiers: dict[str, Notifier]):
        self.notifiers = notifiers

    def send(self, kind, to, message):
        self.notifiers[kind].send(to, message)
```

**Narration while typing:**

One change. Instead of building them, the service receives them.

That's dependency injection, and the name is much scarier than the idea.

You're just passing things in instead of creating them inside.

And here's what that buys you.

**Live-type:**
```python
class SlackNotifier(Notifier):
    def send(self, to, message):
        print(f"[SLACK] to {to}: {message}")


service = NotificationService({
    "email": EmailNotifier(),
    "sms": SmsNotifier(),
    "slack": SlackNotifier(),
})
```

I just added Slack.

And I did not touch NotificationService at all. Not one line.

It has no idea Slack exists, and it doesn't need to.

---

## [4:40–5:20] The other thing you just got for free

There's a second benefit that people miss.

**Live-type:**
```python
class FakeNotifier(Notifier):
    def __init__(self):
        self.sent = []
    def send(self, to, message):
        self.sent.append((to, message))

fake = FakeNotifier()
test_service = NotificationService({"email": fake})
test_service.send("email", "test@test.com", "hello")
print(f"Captured {len(fake.sent)} message(s) -> {fake.sent}")
```

**Run it. Show the output.**

That's a test.

I passed in a fake notifier that records messages instead of sending them.

So I can test the whole service without sending a single real email.

In version one, that was impossible. The sending was welded into the function.

Testable code usually isn't a separate goal you work toward.

It's usually just what good structure gives you as a side effect.

---

## [5:20–6:15] The comparison

So let's line up all four with the same question.

What does it take to add Slack?

Version one. You edit the function itself. New elif branch, inside the code that already works.

Version two. Three separate edits. New class, add it to init, add another elif.

Version three. Two edits. New class, add it to the dictionary.

Version four. One edit. Write the class. That's it.

But the number of edits isn't really the point.

The point is which code you had to open.

In the first three versions, you had to modify NotificationService.

That's code that already worked, that other things already depend on.

Every time you edit it, you can break something unrelated.

In version four you didn't open it at all.

You added new code instead of changing old code.

That's the whole goal, and it has a name. It's the open closed principle.

Open to extension, closed to modification.

---

## [6:15–6:50] What to actually take from this

Now a caveat, because I don't want to oversell this.

Version four is not always the right answer.

If you have two notification types and you're never adding more, version one is genuinely fine.

All of this structure has a cost. More files, more indirection, more to hold in your head.

The reason to add it is that you know change is coming.

So the honest rule is this.

Don't apply patterns because they're correct. Apply them when the pain shows up.

Write version one. When adding a feature starts feeling dangerous, that's your signal to move.

---

## [6:50–7:10] Wrap-up + CTA

So that's one feature, four versions.

Classes alone aren't OOP. If you're still checking types, you're not there yet.

Polymorphism removes the if else. Injection removes the wiring.

And the test is simple. To add something new, do you edit old code or just write new code?

All four versions are in the description.

If you want a follow up where we do the same thing with a payment system, tell me in the comments.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Full Code (for description box / GitHub)

**Version 1 — one function**
```python
def send_notification(kind, to, message):
    if kind == "email":
        print(f"[EMAIL] to {to}: {message}")
    elif kind == "sms":
        print(f"[SMS] to {to}: {message}")
    elif kind == "push":
        print(f"[PUSH] to {to}: {message}")
    else:
        raise ValueError(f"Unknown kind: {kind}")
```

**Version 2 — classes, but still if/else**
```python
class EmailSender:
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
            self.push.send(to, message)
        else:
            raise ValueError(f"Unknown kind: {kind}")
```

**Version 3 — polymorphism**
```python
from abc import ABC, abstractmethod

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
        self.notifiers[kind].send(to, message)
```

**Version 4 — dependency injection**
```python
from abc import ABC, abstractmethod

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


class NotificationService:
    def __init__(self, notifiers: dict[str, Notifier]):
        self.notifiers = notifiers

    def send(self, kind, to, message):
        self.notifiers[kind].send(to, message)


# Adding Slack requires ZERO changes to NotificationService
class SlackNotifier(Notifier):
    def send(self, to, message):
        print(f"[SLACK] to {to}: {message}")


service = NotificationService({
    "email": EmailNotifier(),
    "sms": SmsNotifier(),
    "slack": SlackNotifier(),
})

service.send("email", "sarthak@example.com", "Your order shipped")
service.send("slack", "#alerts", "Your order shipped")


# And testing becomes trivial
class FakeNotifier(Notifier):
    def __init__(self):
        self.sent = []
    def send(self, to, message):
        self.sent.append((to, message))

fake = FakeNotifier()
test_service = NotificationService({"email": fake})
test_service.send("email", "test@test.com", "hello")
print(f"Captured {len(fake.sent)} message(s) -> {fake.sent}")
```

---

## Verified output (I ran all four)

**Version 3:**
```
[EMAIL] to sarthak@example.com: Your order shipped
[SMS] to +91999999999: Your order shipped
[PUSH] to device-123: Your order shipped
```

**Version 4, including the test:**
```
[EMAIL] to sarthak@example.com: Your order shipped
[SLACK] to #alerts: Your order shipped

Captured 1 message(s) -> [('test@test.com', 'hello')]
```

**Cost of adding Slack:**

| Version | Edits | Did you modify NotificationService? |
|---|---|---|
| V1 — one function | new elif inside the function | Yes |
| V2 — classes + if/else | 3 edits | Yes |
| V3 — polymorphism | 2 edits | Yes |
| V4 — injection | 1 edit | **No** |

---

### Production notes
- ~1,050 words spoken → ~6:40–7:00 with typing and run pauses.
- **The spine of the video is the "add Slack" question**, not the four versions themselves. Ask it early in the hook, then answer it in the comparison section. That's what makes this different from every other OOP video, which just defines terms in order.
- **Don't skip the version two beat.** "You used classes but you're still checking types" is the most useful thing in the whole video, because that's what a lot of real production code actually looks like. It's also the moment where experienced viewers nod.
- **Keep the caveat section.** Ending on "version four is not always right, apply patterns when the pain shows up" is what makes this credible instead of dogmatic. Most OOP content oversells, and the comments punish it.
- The fake notifier test is a strong beat because it demonstrates a benefit people don't expect. Give it a pause.
- If you need to trim, shorten the version one growth section. Show `v1_grown.py` briefly and say the retry logic is duplicated three times, without walking through it line by line.
- Good side-panel visuals: a running diagram of NotificationService with arrows to each notifier, and for the comparison section, four columns lighting up red for "modified existing code" and green for "only added new code."
