import type { SegmentKey } from "./searchCodeSegments";

/**
 * Word-anchor schedules: map a spoken phrase (by its REAL whisper frame,
 * global to the video) to "the code should be revealed through this line
 * index by now". Interpolated between anchors so the reveal follows the
 * actual narration instead of a flat linear sweep.
 *
 * Line indices are 0-based into CODE[key] from searchCodeSegments.ts.
 */
export type Anchor = { atFrame: number; throughLine: number };

export const TYPING_SCHEDULES: Partial<Record<SegmentKey, Anchor[]>> = {
  // SETUP (lines): 0 import math | 1 from collections | 3 documents = { |
  // 4-8 the five docs | 9 } | 12 def tokenize | 13 return ...
  setup_docs: [
    { atFrame: 1970, throughLine: 1 }, // "We need something to search through"
    { atFrame: 2041, throughLine: 3 }, // "So here are five short documents"
    { atFrame: 2107, throughLine: 6 }, // "Think of each one as a webpage"
    { atFrame: 2206, throughLine: 9 }, // "Each has an ID number and some text"
    { atFrame: 2286, throughLine: 12 }, // "Then we need a tokenize function"
    { atFrame: 2346, throughLine: 13 }, // "All it does is lowercase the text and split it"
    { atFrame: 2534, throughLine: 13 }, // hold through "as the same word"
  ],

  // INDEX = SETUP + blank + index = defaultdict(...) + for loops.
  // SETUP is 14 lines (0-13), so: 16 index = ... | 18 for doc_id | 19 for word | 20 index[word][doc_id] += 1
  build_index: [
    { atFrame: 2582, throughLine: 16 }, // "This is the whole index, it's four lines"
    { atFrame: 2653, throughLine: 18 }, // "We go through every document"
    { atFrame: 2737, throughLine: 19 }, // "and then through every word in that document"
    { atFrame: 2779, throughLine: 20 }, // "For each word we record which document it appeared in"
    { atFrame: 2967, throughLine: 20 }, // hold on the record line
  ],

  // INDEX_PRINT: 0 index = | 2 for doc_id | 3 for word | 4 += 1 | 7 print cat | 8 print dog
  // Anchors MUST be in ascending frame order -- a later-then-earlier pair
  // makes the interpolation degenerate and pins the whole segment to the
  // final line from frame 0.
  index_output: [
    { atFrame: 3146, throughLine: 4 },
    { atFrame: 3200, throughLine: 8 }, // "Let me show you what it actually looks like"
  ],

  // NAIVE: 0 def naive_search | 1 results = | 2 for word | 3 if word not in |
  // 4 continue | 5 for doc_id | 6 results[doc_id] += | 7 return sorted
  naive: [
    { atFrame: 3641, throughLine: 0 }, // "Now we need to rank the results"
    { atFrame: 3697, throughLine: 1 }, // "The obvious approach is to just count matches"
    { atFrame: 3902, throughLine: 3 }, // "For each word in the search we look it up in our index"
    { atFrame: 4017, throughLine: 5 }, // "Then for every document containing that word"
    { atFrame: 4095, throughLine: 6 }, // "we add up how many times it appeared"
    { atFrame: 4145, throughLine: 7 }, // "Then we sort, highest count first"
  ],

  // NAIVE_RUN = NAIVE (8 lines, 0-7) + blank + for loop at 10, print at 11
  failure: [
    { atFrame: 4326, throughLine: 11 },
  ],

  // FIX: 0 def score | 1 tf = | 2 idf = | 3 return tf * idf |
  // 6 def search | 7 results | 8 for word | 9 if not in | 10 continue |
  // 11 for doc_id | 12 results[doc_id] += score | 13 return sorted
  fix_code: [
    { atFrame: 6944, throughLine: 0 }, // "The score function is those two ideas, one line each"
    { atFrame: 7039, throughLine: 1 }, // "Term frequency is the word count divided by document length"
    { atFrame: 7159, throughLine: 2 }, // "Inverse document frequency is the log of total documents..."
    { atFrame: 7313, throughLine: 3 }, // "The log just keeps that number from growing too aggressively"
    { atFrame: 7420, throughLine: 6 }, // "Then search is almost identical to before"
    { atFrame: 7493, throughLine: 12 }, // "The only change is we add up scores instead of raw counts"
    { atFrame: 7577, throughLine: 13 },
  ],

  // FIX_RUN = FIX (14 lines, 0-13) + blank + for at 16, print at 17
  fix_output: [
    { atFrame: 7630, throughLine: 17 },
  ],
};

/**
 * When each terminal line appears, in GLOBAL frames, landing on the exact
 * spoken moment. Values are the real captured output from
 * scripts/capture-search-output.py.
 */
export const TERMINAL_FRAMES: Partial<Record<SegmentKey, number[]>> = {
  // "So cat appears in document one twice" (3146) / "and dog appears in
  // document three once" (3228)
  index_output: [3146, 3228],
  // "So I searched for the dog" (4326) -> both result lines land together so
  // the wrong ranking is visible as a unit
  failure: [4380, 4400],
  // "Now the dog document is first" (7630)
  fix_output: [7660, 7680],
};
