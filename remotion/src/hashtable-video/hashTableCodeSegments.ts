// Display code shown on screen per segment -- matches hashtable_script.md's
// "Live-type" blocks exactly (not the demo-harness versions in
// hashtable-code-segments/*.py, which import a shared _hashtable_base and
// add @EVENT emission purely so capture-hashtable-output.py has real,
// structured data to capture).
export const CODE = {
  hash_function_code: `class SimpleHashTable:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        h = 0
        for ch in str(key):
            h = (h * 31 + ord(ch)) % 1000000007
        return h % self.capacity`,

  insert_code: `class SimpleHashTable:
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
        self.size += 1`,

  get_and_collision_code: `class SimpleHashTable:
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

    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        for k, v in bucket:
            if k == key:
                return v
        raise KeyError(key)


ht = SimpleHashTable(capacity=8)
ht.insert("apple", "APPLE")
print("hash('apple') =", ht._hash("apple"))
ht.insert("elderberry", "ELDERBERRY")
print("hash('elderberry') =", ht._hash("elderberry"))
print(ht.get("elderberry"))`,

  resize_code: `    def _resize(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        for bucket in old_buckets:
            for key, value in bucket:
                self.insert(key, value)

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
            self._resize()`,

  resize_demo_code: `    def _resize(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        for bucket in old_buckets:
            for key, value in bucket:
                self.insert(key, value)

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


ht2 = SimpleHashTable(capacity=4)
for key in ["a", "b", "c"]:
    ht2.insert(key, key.upper())
    print(f"after '{key}': size={ht2.size}, capacity={ht2.capacity}")`,
} as const;

export type SegmentKey = keyof typeof CODE;

// Previous segment's code, used by CodeTypewriter's diff logic to know
// which lines are "new" in this segment (cumulative feel). resize_code and
// resize_demo_code are their own focused snippet per the script's callout
// framing (just _resize + the auto-trigger check), so they have no
// "previous" within this set.
export const PREVIOUS_CODE: Partial<Record<SegmentKey, string>> = {
  insert_code: CODE.hash_function_code,
  get_and_collision_code: CODE.insert_code,
  resize_demo_code: CODE.resize_code,
};
