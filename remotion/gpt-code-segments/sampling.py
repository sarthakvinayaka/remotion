import json
import random
from collections import defaultdict

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
model = defaultdict(lambda: defaultdict(int))
for i in range(len(token_ids) - CONTEXT_SIZE):
    context = tuple(token_ids[i:i + CONTEXT_SIZE])
    next_id = token_ids[i + CONTEXT_SIZE]
    model[context][next_id] += 1


def predict_next_id(context):
    choices = model.get(context)
    if not choices:
        return None
    ids = list(choices.keys())
    weights = list(choices.values())
    return random.choices(ids, weights=weights, k=1)[0]


if __name__ == "__main__":
    ctx = (word_to_id["the"], word_to_id["cat"])
    choices = model.get(ctx)
    total = sum(choices.values())
    emit({
        "type": "candidates",
        "context_ids": list(ctx),
        "candidates": [
            {"id": i, "word": id_to_word[i], "probability": w / total}
            for i, w in choices.items()
        ],
    })
    picked = predict_next_id(ctx)
    print("context:", [id_to_word[c] for c in ctx])
    print("predicted next id:", picked, "->", id_to_word[picked])
