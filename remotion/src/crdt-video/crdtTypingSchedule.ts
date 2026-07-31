// Word-anchor schedules: map specific spoken words (by their real whisper
// frame timestamp, global to the whole video) to "the highlighted line
// should be this line index right now". The highlight jumps directly to
// each anchor's target line when its frame arrives -- it never scrubs
// through intermediate lines, including on backward ("recap") jumps.
export type Anchor = { atFrame: number; throughLine: number };

export const TYPING_SCHEDULES: Record<string, Anchor[]> = {
  gcounter_code: [
    { atFrame: 3084, throughLine: 0 }, // "here's the trick" -> class GCounter:
    { atFrame: 3110, throughLine: 1 }, // "instead of one shared number"
    { atFrame: 3243, throughLine: 3 }, // "in a dict, one slot per node" -> self.counts = {...}
    { atFrame: 3322, throughLine: 5 }, // "when a node increments" -> def increment(self):
    { atFrame: 3391, throughLine: 6 }, // "it only ever touches its own slot"
    { atFrame: 3550, throughLine: 6 }, // "if node A increments twice, its own slot just goes to 2"
  ],
  merge_code: [
    { atFrame: 3815, throughLine: 8 }, // "now when two nodes sync up" -> def merge(self, other_counts):
    { atFrame: 3903, throughLine: 9 }, // "for every node slot" -> for node in self.counts:
    { atFrame: 3962, throughLine: 10 }, // "we take the max of what I have and what the other has"
    { atFrame: 4062, throughLine: 10 }, // "not the sum, the max, that's important"
    { atFrame: 4618, throughLine: 13 }, // "the total is just the sum of every node's own slot" -> return sum(...)
    { atFrame: 4781, throughLine: 10 }, // "so max when we're merging the same node's count"
    { atFrame: 4891, throughLine: 13 }, // "sum when we're adding up different nodes at the end"
  ],
  run_live: [
    { atFrame: 5147, throughLine: 16 }, // "alright let's actually run this" -> nodes = [...]
    { atFrame: 5180, throughLine: 20 }, // "A increments twice, totally on its own"
    { atFrame: 5266, throughLine: 24 }, // "B increments once, totally separately"
    { atFrame: 5420, throughLine: 27 }, // "now let's merge B with A's counts"
    { atFrame: 5495, throughLine: 28 }, // "look at it, B's total jumps to 3"
    { atFrame: 5654, throughLine: 30 }, // "now let's merge A with B's updated counts too"
    { atFrame: 5801, throughLine: 31 }, // "and yep, A also lands on 3"
  ],
};
