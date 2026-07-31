# Video Script: "I Built a Tiny GPT From Scratch (You Can Too)"
**Target length: ~6:30–7:00**
**How to read: every line break is a real pause. If two thoughts flow together without stopping, they're on the same line.**

---

## [0:00–0:30] Hook

Okay so a lot of people have made videos explaining how ChatGPT works.

Diagrams, arrows, boxes labeled attention.

But most of them don't actually let you build something and watch it run yourself.

So that's what we're doing today, we'll walk through the core idea behind how ChatGPT generates text, one word at a time, and then build a small working version of it, live, in about twenty lines of Python.

You don't need a neural network to understand the core mechanism, that's kind of the point.

**Visual:** Title card, then a chat interface with words appearing one at a time, slowed down.

---

## [0:30–1:05] The core idea

So this is called autoregressive generation, which basically just means each new word depends on the words before it.

The model doesn't know the whole sentence ahead of time.

At each step, it looks at what's been generated so far, and figures out what's likely to come next.

It picks one, adds it to the sequence, and then does the same thing again with a bit more context.

This just repeats, one piece at a time, until it stops.

Quick heads up, real models actually work on numbers, not words, and they look at way more context than we will today.

We'll build a simplified version, and I'll be upfront about exactly what's simplified once we're done.

Alright, let's build it.

---

## [1:05–1:35] Why it's not always the same answer

One more thing before we build this.

At each step, the model isn't just picking the single most likely word every time, it's sampling from a probability distribution.

So if "cat" comes up seventy percent of the time and "dog" comes up thirty percent, it won't always pick cat, most of the time it will, but sometimes it'll go with dog instead.

That's why you can ask the same question twice and get slightly different answers.

---

## [1:35–2:10] Setting up our text and vocabulary

**Live-type:**
```python
import random
from collections import defaultdict

corpus = """
the cat sat on the mat. the cat likes to sleep on the mat.
the dog sat on the rug. the dog likes to play in the yard.
the cat and the dog are friends. the cat likes the dog.
"""

words = corpus.lower().replace(".", " .").split()
```

**Narration while typing:**

We're obviously not training a real neural network today, that needs way more data and way more compute.

But we can build something that captures the real mechanism, using this tiny made-up paragraph as our training text.

We lowercase everything, split the periods off so they count as their own token, and split it all into a list of words.

---

## [2:10–2:45] Actually encoding words into numbers

**Live-type:**
```python
vocab = sorted(set(words))
word_to_id = {word: i for i, word in enumerate(vocab)}
id_to_word = {i: word for word, i in word_to_id.items()}

token_ids = [word_to_id[w] for w in words]
```

**Narration while typing:**

Here's the encoding step, and this part is actually real, this is what happens first in any language model, including ours.

We take every unique word in our text and give it a number, word to id, and the reverse mapping too so we can decode later.

Then we turn our entire training text into a list of integers using that mapping.

So from here on, our model never actually touches the word "cat," it only sees whatever number it got assigned.

---

## [2:45–3:25] Building the model, using more than just one word of context

**Live-type:**
```python
CONTEXT_SIZE = 2
model = defaultdict(lambda: defaultdict(int))

for i in range(len(token_ids) - CONTEXT_SIZE):
    context = tuple(token_ids[i:i+CONTEXT_SIZE])
    next_id = token_ids[i+CONTEXT_SIZE]
    model[context][next_id] += 1
```

**Narration while typing:**

This is our whole model, and it's basically just counting, but notice we're using the last two tokens as context now, not just one.

For every pair of consecutive tokens, we look at whatever comes right after that pair, and add one to a counter.

So the model isn't just asking what follows "cat," it's asking what follows "the cat," as a pair, that's a small step closer to real context.

Real models replace this counting with a neural network trained on billions of examples, and they look at the whole sequence so far, but the question they're answering is the same one, given this context, what's likely next.

---

## [3:25–4:00] Picking the next token

**Live-type:**
```python
def predict_next_id(context):
    choices = model.get(context)
    if not choices:
        return None
    ids = list(choices.keys())
    weights = list(choices.values())
    return random.choices(ids, weights=weights, k=1)[0]
```

**Narration while typing:**

Here's the sampling step, and everything here is still in number form, context is just a tuple of two token ids, not words.

We grab every token id that's ever followed this exact pair, along with how many times, and random dot choices with weights picks one, more likely to pick ids with higher counts, but not guaranteed.

This one function is doing the same job as the sampling step inside a real language model, just at a much smaller scale.

---

## [4:00–5:00] Generating live, and decoding back to words

**Live-type:**
```python
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
```

**Narration while typing:**

Here's the actual generation loop, this is the part that matters most.

We take our seed words and encode them into ids first, same as the training data.

Then, one token at a time, we look at the last two ids we have, predict the next id, and add it on.

Only at the very end, this last line, do we turn every id back into its word, that's the decode step.

Encode the input, generate entirely in number space, decode back to text, that's basically the real pipeline, just with a much simpler model doing the middle part.

**Live-type:**
```python
print(" ".join(generate(["the", "cat"])))
```

**Run it. Show terminal output live.**

There it is, a full generated sentence, and underneath, every step was just numbers being predicted and sampled.

---

## [5:00–5:35] Same start, different outputs

**Live-type:**
```python
print("Same seed, three separate runs:")
for run in range(3):
    seq = generate(["the", "cat"])
    print(f"Run {run+1}:", " ".join(seq))
```

**Narration while typing:**

Let's run the exact same generation, starting from the exact same two words, three separate times.

**Run it. Show terminal output live.**

Three different sentences, from the exact same starting point.

That's not a bug, it's just the sampling step picking a different path through the probability distribution each time, same idea as before, just with actual context behind each prediction now instead of just one word.

That's basically why asking ChatGPT the same question twice can give you two different answers, both are valid, both were likely, it just sampled differently along the way.

---

## [5:35–6:05] What's still simplified, and what isn't

One more thing before we wrap up.

The encoding step we built is real, word to number, generate in number space, decode back to words, that's actually how it works, just with a much smaller vocabulary.

What's still simplified is the context and the model itself.

We looked at the last two tokens, real models look at the whole conversation so far, using something called attention, to figure out what actually matters.

And our "model" is just counting, real models replace that with a neural network with billions of learned parameters, trained on huge amounts of text.

But the shape of the pipeline, encode, predict using context, sample, decode, feed it back in, repeat, that part's actually accurate, just running at a much smaller scale here.

---

## [6:05–6:35] Wrap-up + CTA

So that's basically the core pipeline behind every word ChatGPT, Claude, or any other language model generates.

Encode text into numbers, predict a distribution based on context, sample one, decode it back, feed it in as new context, repeat.

Full code's in the description.

If you want the next one to cover how real tokenizers split words into pieces, or how attention actually works, let me know in the comments.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Full Code (for description box / GitHub)
```python
import random
from collections import defaultdict

corpus = """
the cat sat on the mat. the cat likes to sleep on the mat.
the dog sat on the rug. the dog likes to play in the yard.
the cat and the dog are friends. the cat likes the dog.
"""

words = corpus.lower().replace(".", " .").split()

# Step 1: Encoding — real models do this first too, just with a much bigger vocabulary
vocab = sorted(set(words))
word_to_id = {word: i for i, word in enumerate(vocab)}
id_to_word = {i: word for word, i in word_to_id.items()}

token_ids = [word_to_id[w] for w in words]

# Step 2: Build a context-window model (looks at last 2 tokens, not just 1)
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


def generate(seed_words, length=10):
    context_ids = [word_to_id[w] for w in seed_words]
    result_ids = list(context_ids)
    for _ in range(length):
        context = tuple(result_ids[-CONTEXT_SIZE:])
        next_id = predict_next_id(context)
        if next_id is None:
            break
        result_ids.append(next_id)
    return [id_to_word[i] for i in result_ids]


if __name__ == "__main__":
    print("Vocabulary:", word_to_id)
    print()

    print("Generating from ['the', 'cat']:")
    print(" ".join(generate(["the", "cat"])))
    print()

    print("Same seed, three separate runs:")
    for run in range(3):
        seq = generate(["the", "cat"])
        print(f"Run {run+1}:", " ".join(seq))
```

### Production notes
- ~1,060 words spoken → ~6:30–7:00 with typing and run pauses, trimmed down from the original ~8:15 version by cutting redundant explanation (the "two things to know upfront" bit in the core idea section now just teases what the ending caveat covers in full, instead of explaining it twice) and tightening wording throughout without dropping any of the actual technical content.
- This version was rebuilt specifically to fix a real gap: the original demo skipped word-to-integer encoding entirely and only used a single previous word as context, which understated how the actual pipeline works, even for a simplified demo. This version genuinely encodes words to integers before any processing, operates entirely in integer space through generation, decodes back to words only at the end, and uses a 2-token context window instead of 1 — all verified by actually running it.
- The remaining simplification (2-token window instead of full-sequence attention, frequency counting instead of a neural network) is real and unavoidable for a from-scratch demo at this scope — but it's now the *only* remaining gap, not one of several, which makes the honest caveat section more precise and harder to poke holes in.
- Good visual for a side panel: show the word-to-id dict as a small lookup table, with the current context words highlighting their corresponding IDs as generation happens, reinforcing that the model is genuinely working with numbers, not text, at every step.
