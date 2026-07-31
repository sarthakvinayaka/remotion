import json
import random

random.seed(7)


def emit(event):
    print("@EVENT " + json.dumps(event))


corpus = """
the cat sat on the mat. the cat likes to sleep on the mat.
the dog sat on the rug. the dog likes to play in the yard.
the cat and the dog are friends. the cat likes the dog.
"""

words = corpus.lower().replace(".", " .").split()

vocab = sorted(set(words))
word_to_id = {word: i for i, word in enumerate(vocab)}
id_to_word = {i: word for word, i in word_to_id.items()}

token_ids = [word_to_id[w] for w in words]

CONTEXT_SIZE = 2
from collections import defaultdict

model = defaultdict(lambda: defaultdict(int))

for i in range(len(token_ids) - CONTEXT_SIZE):
    context = tuple(token_ids[i:i + CONTEXT_SIZE])
    next_id = token_ids[i + CONTEXT_SIZE]
    model[context][next_id] += 1


def predict_next_id(context, emit_candidates=False):
    choices = model.get(context)
    if not choices:
        if emit_candidates:
            emit({"type": "candidates", "context_ids": list(context), "candidates": []})
        return None
    ids = list(choices.keys())
    weights = list(choices.values())
    total = sum(weights)
    sampled = random.choices(ids, weights=weights, k=1)[0]
    if emit_candidates:
        emit({
            "type": "candidates",
            "context_ids": list(context),
            "candidates": [
                {"id": i, "word": id_to_word[i], "probability": w / total}
                for i, w in zip(ids, weights)
            ],
            "sampled_id": sampled,
        })
    return sampled


def generate(seed_words, length=10, trace=False):
    context_ids = [word_to_id[w] for w in seed_words]
    result_ids = list(context_ids)
    if trace:
        emit({"type": "generate_start", "context_ids": list(result_ids)})
    for _ in range(length):
        context = tuple(result_ids[-CONTEXT_SIZE:])
        next_id = predict_next_id(context, emit_candidates=trace)
        if next_id is None:
            break
        result_ids.append(next_id)
        if trace:
            emit({"type": "append", "context_ids": list(result_ids)})
    decoded = [id_to_word[i] for i in result_ids]
    if trace:
        emit({"type": "decoded", "ids": list(result_ids), "words": decoded})
    return decoded
