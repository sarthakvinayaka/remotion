// Display code shown on screen per segment -- matches the CRDT script's
// "Live-type" blocks exactly (not the demo-harness versions in
// crdt-code-segments/*.py, which include extra `if __name__` blocks purely
// so capture-crdt-output.py has something runnable to execute).
export const CODE = {
  gcounter_code: `class GCounter:
    def __init__(self, node_id, all_nodes):
        self.node_id = node_id
        self.counts = {node: 0 for node in all_nodes}

    def increment(self):
        self.counts[self.node_id] += 1`,

  merge_code: `class GCounter:
    def __init__(self, node_id, all_nodes):
        self.node_id = node_id
        self.counts = {node: 0 for node in all_nodes}

    def increment(self):
        self.counts[self.node_id] += 1

    def merge(self, other_counts):
        for node in self.counts:
            self.counts[node] = max(self.counts[node], other_counts.get(node, 0))

    def value(self):
        return sum(self.counts.values())`,

  run_live: `class GCounter:
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
print("A after merging B's counts:", counter_a.counts, "total:", counter_a.value())`,
} as const;

export type SegmentKey = keyof typeof CODE;

// Previous segment's code, used by CodeTypewriter's diff logic to know which
// lines are "new" in this segment (cumulative feel).
export const PREVIOUS_CODE: Partial<Record<SegmentKey, string>> = {
  merge_code: CODE.gcounter_code,
  run_live: CODE.merge_code,
};

// One-line "what this does" captions keyed by line index, shown as a small
// annotation strip beneath the code panel so the (otherwise empty) lower
// half of that panel reinforces whatever line is currently highlighted --
// paraphrased directly from the real narration anchored in
// crdtTypingSchedule.ts, not new invented copy/timing.
export const LINE_CAPTIONS: Partial<Record<SegmentKey, Record<number, string>>> = {
  gcounter_code: {
    0: "one class, shared by every node in the system",
    1: "each node gets its own id when it's created",
    3: "a dict -- one counting slot per node, all starting at 0",
    5: "incrementing never touches another node's slot",
    6: "node A incrementing twice only moves A's own slot: 0 → 2",
  },
  merge_code: {
    8: "merge takes in the other node's raw slot dict",
    9: "walk every slot this node knows about",
    10: "keep the larger of the two values — max, never sum",
    13: "value() adds up every node's slot to get the grand total",
  },
  run_live: {
    16: "three nodes, three independent GCounter instances",
    20: "A increments twice — totally on its own, no coordination",
    24: "B increments once, in total isolation from A",
    27: "merge B with A's raw counts",
    28: "B's total jumps from 1 to 3 — A's increments are now visible to B",
    30: "merge A with B's updated counts",
    31: "A lands on 3 too — both nodes agree without ever talking directly",
  },
};
