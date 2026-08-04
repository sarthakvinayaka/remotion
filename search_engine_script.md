# Video Script: "I Built a Tiny Search Engine From Scratch"
**Target length: ~6:45–7:05**
**How to read: every line break is a pause. Each line is one complete thought. Read one line, breathe, read the next.**

---

## [0:00–0:30] Hook

You type something into Google and get results back in about half a second.

Out of billions of pages.

Now here's the thing that should feel strange about that.

There is no way it read billions of pages after you hit enter.

It couldn't. Not in half a second.

So it must have done most of the work before you ever searched.

Today we're going to build a tiny search engine that works the same way.

It's about thirty lines of Python, and we'll watch it get an answer wrong first, then fix it.

**Visual:** Title card, then a search bar with results appearing instantly.

---

## [0:30–1:15] The core idea

Think about a textbook for a second.

If I ask you to find every page that mentions photosynthesis, you have two options.

You could flip through all four hundred pages and check each one.

Or you could go to the index at the back, find photosynthesis, and it tells you exactly which pages to look at.

The index is faster because someone already did the reading.

They read the book once, ahead of time, and wrote down where every word appears.

That's what a search engine does.

It reads everything in advance and builds an index.

Then when you search, it just looks things up.

This is called an inverted index, and that's the first thing we're building.

---

## [1:15–2:00] Setting up our documents

**Live-type:**
```python
import math
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
```

**Narration while typing:**

We need something to search through, so here are five short documents.

Think of each one as a web page, just much smaller.

Each has an ID number and some text.

Then we need a tokenize function.

All it does is lowercase the text and split it into individual words.

We lowercase so that "Cat" and "cat" count as the same word.

---

## [2:00–3:00] Building the index

**Live-type:**
```python
index = defaultdict(lambda: defaultdict(int))

for doc_id, text in documents.items():
    for word in tokenize(text):
        index[word][doc_id] += 1
```

**Narration while typing:**

This is the whole index, and it's four lines.

We go through every document, and then through every word in that document.

For each word, we record which document it appeared in, and how many times.

So the structure we end up with is a word pointing to a list of documents.

Let me show you what that actually looks like.

**Live-type:**
```python
print("Index for 'cat':", dict(index["cat"]))
print("Index for 'dog':", dict(index["dog"]))
```

**Run it. Show terminal output.**

So "cat" appears in document one, twice.

And "dog" appears in document three, once.

Now if someone searches for "cat", we don't touch documents two, four, or five at all.

We already know they're irrelevant.

That's the speed trick, and it's the entire reason search feels instant.

---

## [3:00–3:45] The obvious first attempt

Now we need to rank the results.

The obvious approach is to just count matches.

Whichever document contains the search words the most times wins.

**Live-type:**
```python
def naive_search(query):
    results = defaultdict(int)
    for word in tokenize(query):
        if word not in index:
            continue
        for doc_id in index[word]:
            results[doc_id] += index[word][doc_id]
    return sorted(results.items(), key=lambda x: x[1], reverse=True)
```

**Narration while typing:**

For each word in the search, we look it up in our index.

Then for every document containing that word, we add up how many times it appeared.

Then we sort, highest count first.

That sounds completely reasonable.

Let's see it fail.

---

## [3:45–4:30] Watching it fail

**Live-type:**
```python
for doc_id, count in naive_search("the dog"):
    print(f"[{count}] {documents[doc_id]}")
```

**Run it. Show terminal output.**

So I searched for "the dog".

And the top result is a document about a cat sleeping on a mat.

There is no dog in it anywhere.

The actual dog document came second.

Here's what happened.

Document one contains the word "the" four times.

Document three only has "the" once, plus the word "dog" once, so it scores two.

Four beats two, so the cat document wins.

The word "the" completely drowned out the word we actually cared about.

---

## [4:30–5:30] Why rare words matter more

So let's think about what went wrong.

The word "the" is in almost every document.

That means it tells us almost nothing about which document is relevant.

The word "dog" is in exactly one document.

That makes it extremely informative.

So common words should count for less, and rare words should count for more.

That's the fix, and it has a name.

It's called TF-IDF, which stands for term frequency, inverse document frequency.

Two parts, and both are simpler than the name suggests.

Term frequency is how often the word appears in this document, relative to the document's length.

We divide by length so a long document doesn't win just for being long.

Inverse document frequency is a measure of how rare the word is across all documents.

If a word is in every document, this value goes to zero.

If it's in only one, the value is high.

Multiply those two together and you get a score that rewards words that are both frequent here and rare elsewhere.

---

## [5:30–6:15] Fixing it

**Live-type:**
```python
def score(word, doc_id):
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
    return sorted(results.items(), key=lambda x: x[1], reverse=True)
```

**Narration while typing:**

The score function is those two ideas, one line each.

Term frequency is the word count divided by the document length.

Inverse document frequency is the log of total documents divided by how many contain the word.

The log just keeps that number from growing too aggressively.

Then search is almost identical to before.

The only change is that we add up scores instead of raw counts.

**Live-type:**
```python
for doc_id, s in search("the dog"):
    print(f"[{s:.4f}] {documents[doc_id]}")
```

**Run it. Show terminal output.**

Now the dog document is first.

Same query, same index, same five documents.

The only thing that changed is how we weighted the words.

---

## [6:15–6:45] What real search engines add

So what we built is a real search engine, just a very small one.

Real ones add a lot on top of this.

They crawl the web to find documents in the first place.

They handle word variations, so that "running" and "run" match.

They factor in how many other pages link to a page, which is what PageRank did.

And they consider your location, your history, and hundreds of other signals.

But underneath all of that, the two ideas we just built are still there.

Index everything ahead of time so lookups are fast.

And weight rare words more heavily than common ones.

---

## [6:45–7:05] Wrap-up + CTA

That's a working search engine in about thirty lines.

An inverted index so you never scan everything.

And TF-IDF so the ranking actually makes sense.

Full code is in the description if you want to run it yourself.

If you want a follow up where we add PageRank and rank pages by links, let me know in the comments.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Full Code (for description box / GitHub)
```python
import math
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


# Build the inverted index: word -> {doc_id: count}
index = defaultdict(lambda: defaultdict(int))
for doc_id, text in documents.items():
    for word in tokenize(text):
        index[word][doc_id] += 1


def score(word, doc_id):
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
    return sorted(results.items(), key=lambda x: x[1], reverse=True)


if __name__ == "__main__":
    print("Index for 'cat':", dict(index["cat"]))
    print("Index for 'dog':", dict(index["dog"]))
    print()

    for q in ["the dog", "python programming", "cat"]:
        print(f"Search: '{q}'")
        for doc_id, s in search(q):
            print(f"   [{s:.4f}] {documents[doc_id]}")
        print()
```

---

## Verified outputs (I ran this — these are the real numbers)

**Index lookups:**
```
Index for 'cat': {1: 2}
Index for 'dog': {3: 1}
```

**Naive counting on "the dog" (the failure moment):**
```
[4] the cat sat on the mat and then the cat slept on the mat
[2] the dog barked loudly at night
```

**TF-IDF on "the dog" (the fix):**
```
[0.4210] the dog barked loudly at night
[0.2618] the cat sat on the mat and then the cat slept on the mat
```

---

### Production notes
- ~1,050 words spoken → ~6:45–7:05 with typing and run pauses.
- **The corpus is deliberately tuned.** Document 1 has "the" four times specifically so that naive counting ranks a cat document first when you search for "the dog." That failure is the best moment in the video, so don't edit the documents without re-running and checking the failure still happens.
- The failure-then-fix structure is doing the heavy lifting here. Most search engine explainers just describe TF-IDF. Showing a wrong answer first makes the viewer actually want the fix, instead of accepting a formula on faith.
- Give the failure moment a real pause. Let "there is no dog in it anywhere" sit for a beat before explaining why.
- If you need to trim, the safest cut is the "what real search engines add" section. Reduce it to crawling and PageRank only, and drop the rest.
- Good side-panel visuals: for the index section, show the word-to-document mapping building up as documents get processed. For the failure moment, highlight the four occurrences of "the" in document one in red. For the fix, show the two idf values side by side, with "the" low and "dog" high.
