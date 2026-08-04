import math, json
from collections import defaultdict

documents = {
    1: "the cat sat on the mat and then the cat slept on the mat",
    2: "dogs are loyal pets and dogs love to play outside",
    3: "the dog barked loudly at night",
    4: "python is a great programming language for beginners",
    5: "learning python programming takes practice and patience",
}

def tokenize(text):
    return text.lower().split()

index = defaultdict(lambda: defaultdict(int))
for doc_id, text in documents.items():
    for word in tokenize(text):
        index[word][doc_id] += 1

def naive_search(query):
    results = defaultdict(int)
    for word in tokenize(query):
        if word not in index: continue
        for doc_id in index[word]:
            results[doc_id] += index[word][doc_id]
    return sorted(results.items(), key=lambda x: x[1], reverse=True)

def score(word, doc_id):
    tf = index[word][doc_id] / len(tokenize(documents[doc_id]))
    idf = math.log(len(documents) / len(index[word]))
    return tf * idf

def search(query):
    results = defaultdict(float)
    for word in tokenize(query):
        if word not in index: continue
        for doc_id in index[word]:
            results[doc_id] += score(word, doc_id)
    return sorted(results.items(), key=lambda x: x[1], reverse=True)

out = {}
out["index_cat"] = dict(index["cat"])
out["index_dog"] = dict(index["dog"])
out["naive_the_dog"] = [[d, c, documents[d]] for d, c in naive_search("the dog")]
out["tfidf_the_dog"] = [[d, round(s,4), documents[d]] for d, s in search("the dog")]
# per-word idf for the side-by-side visual the script asks for
out["idf"] = {w: round(math.log(len(documents)/len(index[w])),4) for w in ["the","dog","cat","python"]}
out["doc_lengths"] = {d: len(tokenize(t)) for d,t in documents.items()}
out["the_count_doc1"] = index["the"][1]
out["index_build"] = {w: dict(v) for w,v in sorted(index.items())}
print(json.dumps(out, indent=2))
