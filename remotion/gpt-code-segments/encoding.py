import json


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

if __name__ == "__main__":
    emit({"type": "vocab", "vocab": word_to_id})
    print("Vocabulary:", word_to_id)
    print("token_ids[:10]:", token_ids[:10])
