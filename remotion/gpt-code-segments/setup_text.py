corpus = """
the cat sat on the mat. the cat likes to sleep on the mat.
the dog sat on the rug. the dog likes to play in the yard.
the cat and the dog are friends. the cat likes the dog.
"""

words = corpus.lower().replace(".", " .").split()

if __name__ == "__main__":
    print("word count:", len(words))
    print("first 10 words:", words[:10])
