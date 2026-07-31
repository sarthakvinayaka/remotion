// Display code shown on screen per segment -- matches token_generation_script.md's
// "Live-type" blocks exactly (not the demo-harness versions in
// gpt-code-segments/*.py, which add @EVENT emission purely so
// capture-gpt-output.py has structured data to capture).
export const CODE = {
  setup_text: `import random
from collections import defaultdict

corpus = """
the cat sat on the mat. the cat likes to sleep on the mat.
the dog sat on the rug. the dog likes to play in the yard.
the cat and the dog are friends. the cat likes the dog.
"""

words = corpus.lower().replace(".", " .").split()`,

  encoding: `import random
from collections import defaultdict

corpus = """
the cat sat on the mat. the cat likes to sleep on the mat.
the dog sat on the rug. the dog likes to play in the yard.
the cat and the dog are friends. the cat likes the dog.
"""

words = corpus.lower().replace(".", " .").split()

vocab = sorted(set(words))
word_to_id = {word: i for i, word in enumerate(vocab)}
id_to_word = {i: word for word, i in word_to_id.items()}

token_ids = [word_to_id[w] for w in words]`,

  building_model: `vocab = sorted(set(words))
word_to_id = {word: i for i, word in enumerate(vocab)}
id_to_word = {i: word for word, i in word_to_id.items()}

token_ids = [word_to_id[w] for w in words]

CONTEXT_SIZE = 2
model = defaultdict(lambda: defaultdict(int))

for i in range(len(token_ids) - CONTEXT_SIZE):
    context = tuple(token_ids[i:i+CONTEXT_SIZE])
    next_id = token_ids[i+CONTEXT_SIZE]
    model[context][next_id] += 1`,

  sampling: `CONTEXT_SIZE = 2
model = defaultdict(lambda: defaultdict(int))

for i in range(len(token_ids) - CONTEXT_SIZE):
    context = tuple(token_ids[i:i+CONTEXT_SIZE])
    next_id = token_ids[i+CONTEXT_SIZE]
    model[context][next_id] += 1


def predict_next_id(context):
    choices = model.get(context)
    if not choices:
        return None
    ids = list(choices.keys())
    weights = list(choices.values())
    return random.choices(ids, weights=weights, k=1)[0]`,

  generating_live: `def predict_next_id(context):
    choices = model.get(context)
    if not choices:
        return None
    ids = list(choices.keys())
    weights = list(choices.values())
    return random.choices(ids, weights=weights, k=1)[0]


def generate(seed_words, length=10):
    context_ids = [word_to_id[w] for w in seed_words]
    result_ids = list(context_ids)
    for _ in range(length):
        context = tuple(result_ids[-2:])
        next_id = predict_next_id(context)
        if next_id is None:
            break
        result_ids.append(next_id)
    return [id_to_word[i] for i in result_ids]


print(" ".join(generate(["the", "cat"])))`,

  three_runs: `def generate(seed_words, length=10):
    context_ids = [word_to_id[w] for w in seed_words]
    result_ids = list(context_ids)
    for _ in range(length):
        context = tuple(result_ids[-2:])
        next_id = predict_next_id(context)
        if next_id is None:
            break
        result_ids.append(next_id)
    return [id_to_word[i] for i in result_ids]


print("Same seed, three separate runs:")
for run in range(3):
    seq = generate(["the", "cat"])
    print(f"Run {run+1}:", " ".join(seq))`,
} as const;

export type SegmentKey = keyof typeof CODE;

// Previous segment's code, used by CodeTypewriter's diff logic to know
// which lines are "new" in this segment (cumulative feel).
export const PREVIOUS_CODE: Partial<Record<SegmentKey, string>> = {
  encoding: CODE.setup_text,
  building_model: CODE.encoding,
  sampling: CODE.building_model,
  generating_live: CODE.sampling,
  three_runs: CODE.generating_live,
};
