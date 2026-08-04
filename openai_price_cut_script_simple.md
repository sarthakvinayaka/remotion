# Video Script: "OpenAI Cut Its Own Price by 80% — Because the AI Fixed Itself"
**Target length: ~5:50–6:10**
**Audience: general YouTube, not necessarily technical. Analogies over jargon, flat conversational delivery.**
**How to read: every line break is a real pause. If two thoughts flow together without stopping, they're on the same line.**

---

## [0:00–0:30] Hook

So last week OpenAI dropped the price of one of its AI models by eighty percent.

Same model, same day, suddenly costs a fifth of what it did.

And that model had only been out for three weeks.

Companies don't usually cut prices three weeks after launch, so something's going on there.

But the way they pulled it off is the interesting bit.

They had their smartest AI go and fix the machinery that runs their other AI.

Let's talk about it.

**Visual:** Title card, then a price tag flipping from $1.00 to $0.20.

---

## [0:30–1:20] What actually changed

So quick setup.

OpenAI's newest lineup, GPT-5.6, isn't one model, it's three.

There's Sol, the expensive smart one, Terra in the middle, and Luna, the small cheap fast one.

Think of it like shipping options, overnight, standard, and economy.

Luna is economy, it's what companies use for the boring high volume stuff, sorting emails, pulling info out of documents, routing requests, the unglamorous work that happens millions of times a day.

Luna is the one that got cut by eighty percent.

To put it in normal terms, you pay by how much text goes in and out.

Before, feeding it roughly a stack of novels worth of text cost about a dollar.

Now that same pile costs twenty cents.

The middle model got a smaller cut, twenty percent, and the expensive one didn't get cheaper at all.

Worth remembering that, it comes up again later.

---

## [1:20–2:30] They had the AI rewrite its own machinery

So here's what they actually did.

After their top model, Sol, was finished and shipped, they pointed it at their own infrastructure and basically said, go make yourself cheaper to run.

Specifically at the low level code that does the actual number crunching on the graphics cards.

If the AI is a factory, this code is the individual machines on the factory floor, the things physically doing the work.

Normally that's very specialist stuff, you've got expensive humans hand tuning it for months, because small improvements there save a lot of money at scale.

So they had the AI rewrite it instead.

And it worked, running everything got about twenty percent cheaper.

One detail I liked though, they didn't just trust it.

They ran the AI's rewritten code through a separate tool that checks the math is still correct before letting it near production.

Which seems like the right call, you probably shouldn't let a model rewrite the engine and just hope.

---

## [2:30–3:40] Then it improved how it guesses

The second thing it fixed is easier to picture.

Normally an AI writes one word at a time, which is slow, because it does a full round of thinking for every single word.

There's a trick to speed that up.

You have a small fast model guess the next few words ahead, and the big smart model just checks those guesses instead of writing everything itself.

It's like having a junior assistant who finishes your sentences, and you just go, yep, yep, yep, correct.

Faster than saying every word yourself.

But it only works if the junior is decent at guessing.

If it guesses wrong, you throw the guesses out, and you've wasted that effort.

So Sol ran hundreds of experiments improving that little guesser, and got it more than fifteen percent more efficient.

Better guesses, fewer wasted rounds, cheaper to run.

---

## [3:40–4:10] Why both together matters

And those two fixes matter more together than separately.

One made each round of thinking cheaper.

The other made it need fewer rounds.

So you're paying less per step, and taking fewer steps.

That adds up, and that's where the room came from to cut the price.

---

## [4:10–5:15] But why now

That's the how, but I don't think it's the whole story.

Because getting cheaper to run doesn't force you to charge less, you could keep the extra money.

They cut prices because they're under pressure.

Companies have gotten nervous about AI bills, Uber apparently burned through its entire yearly AI budget in four months, Amazon's engineering side started capping spending after going over.

And cheap Chinese AI models have gotten pretty good.

One Berkeley professor said the gap used to be around six to nine months behind, and it's now closer to two or three.

You can see people moving too, on one platform where developers pick between models, Chinese models went from about eleven percent of usage to sitting above thirty, sometimes hitting forty six.

So looking at the price cut again, the cheap high volume model got slashed eighty percent, and the expensive flagship got nothing.

That tracks, nobody's really threatening the flagship, the competition is at the cheap end, so that's where they defended.

---

## [5:15–6:00] What this actually means

Two takeaways.

The practical one, if you build anything with AI, especially where one task quietly triggers dozens of AI calls behind the scenes, a bunch of ideas that were too expensive last month are now affordable.

And the bigger one.

This is the first time we've publicly seen an AI rewrite the code that runs itself, have that checked and approved, and show up in what customers actually pay.

OpenAI's engineers described it as a loop, better models make their own infrastructure cheaper, which pays for the next round of better models.

If that loop holds, prices don't only drop when new chips show up or when humans get around to optimizing things.

They also drop when the AI gets good enough to optimize itself.

Which is a different thing than what we've seen before.

---

## [6:00–6:20] Wrap-up + CTA

Anyway, that's the story.

Eighty percent cut, partly paid for by an AI tuning up its own machinery, and pushed by competition at the cheap end of the market.

If you want a follow up where I build a tiny version of that guessing trick in Python so you can watch it work, tell me in the comments.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Sources (verify before publishing — this is fast-moving news)
- OpenAI announcement: https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/
- OpenAI engineering post on the efficiency work: https://openai.com/index/gpt-5-6-frontier-intelligence-efficiency/
- Tech Times (most technical detail): https://www.techtimes.com/articles/322305/20260730/openai-cuts-luna-80-sol-rewrote-its-own-inference-stack-fund-price-drop.htm
- VentureBeat (competitive framing): https://venturebeat.com/technology/ai-price-wars-openai-cuts-gpt-5-6-luna-prices-by-80-as-model-competition-shifts-toward-cost
- Forbes (enterprise cost angle): https://www.forbes.com/sites/rachelwells/2026/07/31/openai-cuts-gpt-56-pricing-up-to-80-as-ai-costs-come-under-scrutiny/

## Key numbers (double-check on the day you publish)
| Model | Old (in/out per 1M tokens) | New |
|---|---|---|
| Luna | $1.00 / $6.00 | $0.20 / $1.20 |
| Terra | $2.50 / $15.00 | $2.00 / $12.00 |
| Sol | $5.00 / $30.00 | unchanged (+ Fast mode: 2.5× speed, 2× price) |

The technical terms I deliberately avoided saying on camera, in case you want them for the description box or pinned comment:
- The low-level code = **GPU kernels**, rewritten in **Triton** and **Gluon**
- The correctness checker = **FpSan**, OpenAI's floating-point sanitizer
- The guessing trick = **speculative decoding** (small draft model proposes tokens, large model verifies in parallel)
- The usage-share platform = **OpenRouter**
- Chinese model referenced = **Kimi K3** from Moonshot AI

### Production notes
- ~980 words spoken → ~6:00–6:20. Talking-head pacing, no typing pauses.
- **The "stack of novels" line is an approximation.** A million tokens is roughly 750,000 words, which is very roughly eight average novels. I phrased it loosely ("a stack of novels") on purpose so you're not stating a hard number you'd have to defend — but if you'd rather be precise, say "about three quarters of a million words."
- **Publish fast.** This broke July 30. News explainers decay within about a week.
- **Re-verify prices the morning you publish** — AWS rollout was still in progress per one source, and pricing pages move.
- Jargon is stripped from the narration but listed above for the description box — that way non-technical viewers aren't blocked, and technical viewers can still see you know the actual terms. Good for credibility in the comments without hurting accessibility in the video.
- The editorial angle worth protecting: most coverage implies the efficiency gains *caused* the price cut. This script separates them — efficiency created the *option*, competition created the *decision*. That's a better take than most of the coverage and a real reason to watch your version.
- Good visuals: shipping-tiers metaphor for the three models, a factory-floor animation for the kernel section, and for the guessing trick, a junior character rapidly writing words with a senior character stamping them approved (green) or rejected (grey).
