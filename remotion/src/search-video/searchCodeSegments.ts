/**
 * The exact Python from search_engine_script.md, split per walkthrough
 * segment. CODE[key] is what is on screen during that segment;
 * PREVIOUS_CODE[key] is what was already there (rendered dimmed) so the new
 * lines read as the addition.
 *
 * Verbatim from the script -- do not reformat. The corpus in particular is
 * tuned so naive counting fails on "the dog"; changing it breaks the video's
 * central moment. Re-run scripts/capture-search-output.py after any edit.
 */

export type SegmentKey =
  | "setup_docs"
  | "build_index"
  | "index_output"
  | "naive"
  | "failure"
  | "fix_code"
  | "fix_output";

const SETUP = `import math
from collections import defaultdict

documents = {
    1: "the cat sat on the mat and then the cat slept on the mat",
    2: "dogs are loyal pets and dogs love to play outside",
    3: "the dog barked loudly at night",
    4: "python is a great programming language for beginners",
    5: "learning python programming takes practice and patience",
}


def tokenize(text):
    return text.lower().split()`;

const INDEX = `${SETUP}


index = defaultdict(lambda: defaultdict(int))

for doc_id, text in documents.items():
    for word in tokenize(text):
        index[word][doc_id] += 1`;

const INDEX_PRINT = `index = defaultdict(lambda: defaultdict(int))

for doc_id, text in documents.items():
    for word in tokenize(text):
        index[word][doc_id] += 1


print("Index for 'cat':", dict(index["cat"]))
print("Index for 'dog':", dict(index["dog"]))`;

const NAIVE = `def naive_search(query):
    results = defaultdict(int)
    for word in tokenize(query):
        if word not in index:
            continue
        for doc_id in index[word]:
            results[doc_id] += index[word][doc_id]
    return sorted(results.items(), key=lambda x: x[1], reverse=True)`;

const NAIVE_RUN = `${NAIVE}


for doc_id, count in naive_search("the dog"):
    print(f"[{count}] {documents[doc_id]}")`;

const FIX = `def score(word, doc_id):
    tf = index[word][doc_id] / len(tokenize(documents[doc_id]))
    idf = math.log(len(documents) / len(index[word]))
    return tf * idf


def search(query):
    results = defaultdict(float)
    for word in tokenize(query):
        if word not in index:
            continue
        for doc_id in index[word]:
            results[doc_id] += score(word, doc_id)
    return sorted(results.items(), key=lambda x: x[1], reverse=True)`;

const FIX_RUN = `${FIX}


for doc_id, s in search("the dog"):
    print(f"[{s:.4f}] {documents[doc_id]}")`;

export const CODE: Record<SegmentKey, string> = {
  setup_docs: SETUP,
  build_index: INDEX,
  index_output: INDEX_PRINT,
  naive: NAIVE,
  failure: NAIVE_RUN,
  fix_code: FIX,
  fix_output: FIX_RUN,
};

export const PREVIOUS_CODE: Partial<Record<SegmentKey, string>> = {
  build_index: SETUP,
  failure: NAIVE,
  fix_output: FIX,
};

export const TITLES: Record<SegmentKey, string> = {
  setup_docs: "our five documents",
  build_index: "building the inverted index",
  index_output: "what the index looks like",
  naive: "attempt 1 — just count matches",
  failure: "watching it fail",
  fix_code: "the fix — TF-IDF",
  fix_output: "same query, correct answer",
};
