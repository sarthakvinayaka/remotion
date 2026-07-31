# Video Script: "How a Hash Table Actually Works Inside"
**Target length: ~7:00–7:30**
**How to read: every line break is a real pause. If two thoughts flow together without stopping, they're on the same line.**

---

## [0:00–0:30] Hook

Okay so think about Python's dict, that thing you use every single day.

You write something like apple bracket equals five, and it just works.

But have you ever wondered how it looks something up so fast, no matter how many keys are in there.

It's not magic.

It's a hash table underneath.

Today we're gonna build one from scratch.

No dict, no shortcuts, so you can actually see what's happening inside.

**Visual:** Title card, then a Python dict lookup zooming into a grid of boxes underneath.

---

## [0:30–1:10] The core idea

So here's the idea behind a hash table.

Instead of storing your data in a list and scanning through it to find something, you use a function that turns your key into a number.

That number tells you exactly which slot to check.

No scanning, no searching.

You just go straight to the slot.

That's why lookups are fast, even with a million keys in there.

The function that does this conversion is called a hash function.

Key goes in, number comes out.

Let's build one.

---

## [1:10–2:00] The hash function itself

**Live-type:**
```python
class SimpleHashTable:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        h = 0
        for ch in str(key):
            h = (h * 31 + ord(ch)) % 1000000007
        return h % self.capacity
```

**Narration while typing:**

Alright so first, buckets.

This is just a list of empty lists, one slot for every possible index.

Now the hash function itself.

It looks a bit mathy, but it's simpler than it looks.

We walk through every character in the key, and build up a number as we go.

We multiply by 31 each time, and add the character's code.

That big mod number in there just keeps the value from getting too large.

And this last line is the important part, mod self dot capacity.

It squeezes whatever number we built down into a valid slot index, somewhere between 0 and capacity minus 1.

So no matter how long the key is, you always get back a valid slot to check.

---

## [2:00–2:45] Inserting a value

**Live-type:**
```python
    def insert(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1
```

**Narration while typing:**

To insert something, we hash the key to get our index.

Then we grab that bucket.

One detail worth noting, we loop through whatever's already in that bucket first, and check if this key already exists.

If it does, we just update it in place instead of adding a duplicate.

Otherwise, we append this new key value pair, and increase our size counter.

The bucket itself is a list, not a single slot.

That's on purpose, we'll see why in a second.

---

## [2:45–3:45] What happens when two keys collide

So what happens when two different keys hash to the same index.

It's going to happen eventually.

No hash function avoids this forever, that's just how the math works out.

This is called a collision.

And it's not a bug, every hash table has to handle this somehow.

The way we're handling it here is called chaining.

That's why each bucket is a list, and not just one value.

If two keys land in the same slot, they both just live in that list together, side by side.

When you go looking for one of them, you check that slot, and then scan the short list inside it for the exact match.

Let's watch this happen.

---

## [3:45–4:30] Watching a real collision

**Live-type:**
```python
    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        for k, v in bucket:
            if k == key:
                return v
        raise KeyError(key)
```

**Narration while typing:**

Quick get function first.

Same idea, hash the key, then scan that bucket's list for the match.

**Live-type:**
```python
ht = SimpleHashTable(capacity=8)
ht.insert("apple", "APPLE")
print("hash('apple') =", ht._hash("apple"))
ht.insert("elderberry", "ELDERBERRY")
print("hash('elderberry') =", ht._hash("elderberry"))
```

**Run it. Show terminal output live.**

Apple and elderberry, two different words, both hash to index 2.

That's a real collision, happening right there.

**Live-type:**
```python
print(ht.get("elderberry"))
```

**Run it.**

And get still works.

It hashes to slot 2, finds two entries sitting there, and picks out the one that matches.

That's how the collision gets handled.

---

## [4:30–5:45] Why capacity has to grow

One more piece, and it matters just as much.

If you keep adding keys to a table that never grows, every bucket eventually turns into a long list.

And once buckets get long, you're basically back to scanning through a list one by one.

That defeats the whole point of a hash table.

So hash tables track something called load factor.

That's just how full the table is, size divided by capacity.

Once that crosses a threshold, usually around seventy percent, the table resizes itself.

It doubles its capacity, and re-hashes everything into the new, bigger table.

**Live-type:**
```python
    def _resize(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        for bucket in old_buckets:
            for key, value in bucket:
                self.insert(key, value)
```

**Narration while typing:**

So we double the capacity, clear the buckets, and re-insert every key we had before.

We have to actually re-insert, not just copy the old buckets over.

That's because the capacity changed, and our hash function uses capacity in that final mod step.

Same key, different capacity, means a different index now.

So everything gets reshuffled into its new correct slot.

**Live-type:**
```python
        if self.size / self.capacity > 0.7:
            self._resize()
```

Add this one check at the end of insert.

Now it grows itself automatically whenever it gets too full.

---

## [5:45–6:30] Watching it resize live

**Live-type:**
```python
ht2 = SimpleHashTable(capacity=4)
for key in ["a", "b", "c"]:
    ht2.insert(key, key.upper())
    print(f"after '{key}': size={ht2.size}, capacity={ht2.capacity}")
```

**Narration while typing:**

Let's start a fresh table, small capacity of 4.

We'll insert three keys one at a time, and print the state after each one.

**Run it. Show terminal output live.**

Watch the capacity column.

After a and b, we're still at capacity 4.

But once we insert c, size hits 3.

Load factor crosses that seventy percent line, and capacity jumps to 8, automatically, right in the middle of that insert call.

That's the resize happening exactly when the load factor crosses the threshold.

---

## [6:30–7:00] Wrap-up + CTA

So that's what's inside every dict you've used.

A hash function that turns keys into slot numbers.

Buckets that hold lists to handle collisions.

And a resize step that keeps things fast as it grows.

That's the whole thing, maybe forty lines total.

Full code's in the description.

If you want the next one to cover open addressing, the other way to handle collisions with no lists involved, let me know in the comments.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Full Code (for description box / GitHub)
```python
class SimpleHashTable:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        h = 0
        for ch in str(key):
            h = (h * 31 + ord(ch)) % 1000000007
        return h % self.capacity

    def insert(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1
        if self.size / self.capacity > 0.7:
            self._resize()

    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        for k, v in bucket:
            if k == key:
                return v
        raise KeyError(key)

    def _resize(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        for bucket in old_buckets:
            for key, value in bucket:
                self.insert(key, value)

    def show_buckets(self):
        for i, bucket in enumerate(self.buckets):
            print(f"  [{i}]: {bucket}")


if __name__ == "__main__":
    print("=== Collision demo, fixed capacity 8 ===")
    ht = SimpleHashTable(capacity=8)
    ht.insert("apple", "APPLE")
    print("hash('apple') =", ht._hash("apple"))
    ht.insert("elderberry", "ELDERBERRY")
    print("hash('elderberry') =", ht._hash("elderberry"))
    ht.show_buckets()
    print("get('elderberry') =", ht.get("elderberry"))

    print()
    print("=== Resize demo, starting capacity 4 ===")
    ht2 = SimpleHashTable(capacity=4)
    for key in ["a", "b", "c"]:
        ht2.insert(key, key.upper())
        print(f"after '{key}': size={ht2.size}, capacity={ht2.capacity}")
```

### Production notes
- ~1,150 words spoken → ~7:00–7:30 with typing and run pauses.
- Code actually run and verified before writing this: "apple" and "elderberry" both hash to index 2 at capacity 8 (a real, deterministic collision, not staged), and capacity genuinely doubles from 4 to 8 the moment the third key pushes load factor past 0.7.
- The hash function is a simple polynomial hash chosen specifically because it's deterministic across runs — Python's built-in `hash()` for strings is randomized per process for security reasons, which would make the collision demo produce different, unreproducible results every time you ran it on camera. Worth knowing if anyone asks in the comments why you didn't just use `hash()`.
- If short on time, the safest cut is trimming the "why capacity has to grow" explanation (4:30–5:45) down to two sentences instead of the full paragraph — the resize code and live demo still land fine on their own.
- Good visual for a side panel: a grid of 8 boxes (the buckets), with "apple" and "elderberry" both animating into box 2 and stacking, then later the whole grid animating a split from 4 boxes to 8 during the resize demo.
