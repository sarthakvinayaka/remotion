# Video Script: "CRDTs — How Notion and Figma Merge Edits Without Conflicts"
**Target length: ~6:30–6:50**
**How to read: every line break is a real pause. If two thoughts are meant to flow together without stopping, they're on the same line.**

---

## [0:00–0:30] Hook

Okay so imagine you're using Notion on a flight with bad wifi.

Your co-worker's editing the same page from another city, at the same time.

Both of you keep dropping offline for a few seconds here and there.

And when your internet comes back, your edits just merge in perfectly, no popup asking which version to keep, nothing.

That's not luck.

That's a specific kind of data structure called a CRDT.

Sounds fancy, but honestly the simplest version of it is like ten lines of Python.

Let's just build it.

**Visual:** Title card, then two devices editing offline, then syncing.

---

## [0:30–1:10] The core idea

So CRDT stands for Conflict-free Replicated Data Type.

Big name, honestly pretty simple idea once you see it.

It's just a data structure that you can update on multiple machines at the same time, independently.

And no matter what order those updates get merged back together in.

You always end up at the same final answer.

No coordinator telling everyone what to do, no locking, nobody waiting on anybody.

So today we're gonna build the simplest CRDT there is.

Just a counter.

Think likes on a post, or view counts, spread across a bunch of servers.

**Visual:** Diagram — three small counter boxes, one per server.

---

## [1:10–2:00] Why a normal counter breaks

Quick gut check before we jump into the fix.

Say server A's counter is sitting at 5, and server B's copy is also at 5.

Now, without talking to each other, A bumps it up once, and B bumps it up once too.

A's now at 6.

B's now at 6.

Looks totally fine right, they match.

But the real answer should actually be 7, because two separate increments happened, one on each server.

If you just sync these two 6's together, you quietly lose one increment, and nothing even looks wrong, no error, no warning, just a number that's off.

That's the bug we're fixing.

---

## [2:00–3:00] The G-Counter class

**Live-type:**
```python
class GCounter:
    def __init__(self, node_id, all_nodes):
        self.node_id = node_id
        self.counts = {node: 0 for node in all_nodes}

    def increment(self):
        self.counts[self.node_id] += 1
```

**Narration while typing:**

Okay here's the trick.

Instead of one shared number, every node just keeps its own personal count.

In a dict, one slot per node.

When a node increments, it only ever touches its own slot.

Never anyone else's, doesn't even look at them.

So if node A increments twice, its own slot just goes to two.

B and C don't even need to know that happened yet.

---

## [3:00–4:00] Merging two counters

**Live-type:**
```python
    def merge(self, other_counts):
        for node in self.counts:
            self.counts[node] = max(self.counts[node], other_counts.get(node, 0))

    def value(self):
        return sum(self.counts.values())
```

**Narration while typing:**

Now when two nodes sync up, here's what happens.

For every node's slot, we take the max of what I have and what the other one has.

Not the sum, the max, that's important.

Because if I already know A did three increments, and you tell me A did three increments too, that's literally the same information, not six increments.

Taking the max is what protects us from double counting.

And that's different from the total value, by the way, the total is just the sum of every node's own slot, all added up.

So max when we're merging the same node's count from two places, sum when we're adding up different nodes at the end.

That's it, that's genuinely the whole merge logic.

---

## [4:00–5:15] Run it live

**Live-type:**
```python
nodes = ["A", "B", "C"]
counter_a = GCounter("A", nodes)
counter_b = GCounter("B", nodes)

counter_a.increment()
counter_a.increment()
print("A's view:", counter_a.counts, "total:", counter_a.value())

counter_b.increment()
print("B's view:", counter_b.counts, "total:", counter_b.value())

counter_b.merge(counter_a.counts)
print("B after merging A's counts:", counter_b.counts, "total:", counter_b.value())

counter_a.merge(counter_b.counts)
print("A after merging B's counts:", counter_a.counts, "total:", counter_a.value())
```

**Narration while typing:**

Alright let's actually run this.

A increments twice, totally on its own.

B increments once, totally separately, doesn't even know A exists right now.

Now let's merge B with A's counts.

**Run it. Show terminal output live.**

Look at that, B's total jumps to three, two from A, one from itself.

Now let's merge A with B's updated counts too.

And yep, A also lands on three.

Doesn't matter what order we merge in, doesn't matter how many times we merge.

Both nodes land on the exact same final number.

No lost increments, no coordinator, no conflict, nothing.

---

## [5:15–6:00] Where this actually gets used

This exact pattern is what powers offline-first apps.

Notion and Linear actually use CRDTs for this, and a lot of collaborative tools are built on CRDT libraries like Yjs or Automerge under the hood.

Riak and Redis actually use counter CRDTs like this one directly, for stuff like distributed view counts and like counts.

Quick honest note, Google Docs actually does not use CRDTs, it uses something called Operational Transformation, an older, different technique, worth knowing that distinction if it ever comes up in an interview.

One limitation worth knowing though.

A plain G-Counter can only go up, never down.

So if you need decrements too, like an actual like or unlike button, you'd use something called a PN-Counter, which is basically just two G-Counters, one for increments and one for decrements, subtracted at the end.

---

## [6:00–6:40] Wrap-up + CTA

So that's a fully working CRDT counter.

Each node tracks its own slot, increments only touch your own slot, merging just takes the max per slot, and the total is just the sum of everything.

That's genuinely the whole algorithm.

Full code's down in the description.

If you want the PN-Counter version next, so it can actually go down too, let me know in the comments.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Full Code (for description box / GitHub)
```python
class GCounter:
    def __init__(self, node_id, all_nodes):
        self.node_id = node_id
        self.counts = {node: 0 for node in all_nodes}

    def increment(self):
        self.counts[self.node_id] += 1

    def merge(self, other_counts):
        for node in self.counts:
            self.counts[node] = max(self.counts[node], other_counts.get(node, 0))

    def value(self):
        return sum(self.counts.values())


if __name__ == "__main__":
    nodes = ["A", "B", "C"]
    counter_a = GCounter("A", nodes)
    counter_b = GCounter("B", nodes)

    counter_a.increment()
    counter_a.increment()
    print("A's view:", counter_a.counts, "total:", counter_a.value())

    counter_b.increment()
    print("B's view:", counter_b.counts, "total:", counter_b.value())

    counter_b.merge(counter_a.counts)
    print("B after merging A's counts:", counter_b.counts, "total:", counter_b.value())

    counter_a.merge(counter_b.counts)
    print("A after merging B's counts:", counter_a.counts, "total:", counter_a.value())
```

### Production notes
- ~750 words spoken → ~6:30–6:50 with typing and run pauses.
- If running long, the "where this gets used" section is the safest to trim first.
