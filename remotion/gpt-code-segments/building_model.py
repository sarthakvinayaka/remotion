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
token_ids = [word_to_id[w] for w in words]

CONTEXT_SIZE = 2
model = defaultdict(lambda: defaultdict(int))

for i in range(len(token_ids) - CONTEXT_SIZE):
    context = tuple(token_ids[i:i + CONTEXT_SIZE])
    next_id = token_ids[i + CONTEXT_SIZE]
    model[context][next_id] += 1

if __name__ == "__main__":
    sample_context = (word_to_id["the"], word_to_id["cat"])
    print("contexts learned:", len(model))
    print("model[('the','cat')]:", dict(model[sample_context]))
