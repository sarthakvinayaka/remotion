#!/usr/bin/env python3
"""
Groups raw whisper word-level captions into stable subtitle "cues" for the
OpenAI price-cut video (cheap_chatgpt_clean.m4a).

TIMING CORRECTNESS -- this differs deliberately from build-gpt-subtitles.py:

Whisper's caption objects carry BOTH `startMs`/`endMs` (the real DTW-aligned
spoken boundaries of the token) and `timestampMs` (a smoothed display/pacing
estimate). Only startMs/endMs are the true spoken boundary.

Measured on this audio, `timestampMs - startMs` ranges from -1040ms to
+1060ms with a median of +80ms -- it drifts in BOTH directions within a
single sentence, so it cannot be corrected with a constant offset. Using it
makes captions land visibly late on some words and early on others.
The first spoken word ("So") has startMs=0 -> frame 0, which is the correct
anchor; timestampMs would place it at frame 13.

So: word timings AND cue-grouping decisions below both key off startMs/endMs.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
MAX_WORDS_PER_CUE = 9
MAX_CUE_MS = 3200
GAP_BREAK_MS = 500
MIN_WORD_MS = 120

captions = json.loads((ROOT / "src" / "cheap-captions.json").read_text())


def to_frame(ms: float) -> int:
    return round(ms / 1000 * FPS)


# Whisper's --max-len 1 tokenizer splits some words across several caption
# tokens ("un"+"g"+"lam"+"orous", "G"+"PT"+"5"+"6"). Merging them keeps the
# burned-in caption readable; the merged word spans from the first token's
# startFrame to the last token's endFrame, so timing stays ASR-accurate.
# Matching is case-insensitive on the token sequence.
TOKEN_MERGES = [
    (["g", "pt", "5"], "GPT-5"),
    (["s", "orting"], "Sorting"),
    (["un", "g", "lam", "orous"], "unglamorous"),
    (["crunch", "ing"], "crunching"),
    (["guess", "er"], "guesser"),
    (["ca", "pping"], "capping"),
    (["threat", "ing"], "threatening"),
    (["take", "aways"], "takeaways"),
    (["y", "ep"], "yep"),
]


def merge_split_tokens(words):
    out = []
    i = 0
    while i < len(words):
        matched = False
        for seq, replacement in TOKEN_MERGES:
            n = len(seq)
            if i + n <= len(words) and [w["text"].lower() for w in words[i : i + n]] == seq:
                out.append(
                    {
                        "text": replacement,
                        "startFrame": words[i]["startFrame"],
                        "endFrame": words[i + n - 1]["endFrame"],
                    }
                )
                i += n
                matched = True
                break
        if not matched:
            out.append(words[i])
            i += 1
    return out


# Whisper emits contractions as separate tokens ("don" + "'t", "it" + "'s")
# and splits the brand "OpenAI" into "Open" + "AI". Glue them onto the
# preceding word so captions read naturally.
CONTRACTION_SUFFIXES = ("'t", "'s", "'re", "'ve", "'ll", "'d", "'m")


def merge_contractions(words):
    out = []
    for w in words:
        if out and w["text"].lower() in CONTRACTION_SUFFIXES:
            out[-1] = {
                "text": out[-1]["text"] + w["text"],
                "startFrame": out[-1]["startFrame"],
                "endFrame": w["endFrame"],
            }
        elif out and out[-1]["text"] == "Open" and w["text"] == "AI":
            out[-1] = {
                "text": "OpenAI",
                "startFrame": out[-1]["startFrame"],
                "endFrame": w["endFrame"],
            }
        else:
            out.append(dict(w))
    return out


# ---------------------------------------------------------------------------
# PROOFREADING PASS
#
# Whisper's raw output is NOT publishable text. It mishears words and mangles
# agreement, and those errors get burned into the frame. Worse, the scene
# graphics were authored from the real script, so an uncorrected caption can
# contradict the graphic in the SAME frame (e.g. caption "100 of experiment"
# under a graphic reading "SOL RAN HUNDREDS OF EXPERIMENTS").
#
# Two of these are factual corruptions rather than typos:
#   "sitting about 30"  -> "sitting above 30"  (reverses the script's argument)
#   "ran 100 of experiment" -> "ran hundreds of experiments"
#
# Corrections are TEXT ONLY -- word timings are never touched, so sync is
# unaffected. Keyed to the script at openai_price_cut_script_simple.md.
# Matching is case-insensitive over a window of consecutive word tokens; the
# replacement inherits the first token's startFrame and the last's endFrame.
PHRASE_FIXES = [
    # --- contradicts the on-screen graphic in the same frame ---
    (["the", "graphic", "cards"], ["the", "graphics", "cards"]),
    (["ran", "100", "of", "experiment"], ["ran", "hundreds", "of", "experiments"]),
    (["entire", "early", "ai", "budget"], ["entire", "yearly", "AI", "budget"]),
    (["sitting", "about", "30"], ["sitting", "above", "30"]),
    # --- clear mishearings ---
    (["nobody", "real", "threatening"], ["nobody's", "really", "threatening"]),
    (["what", "actually", "customer", "will", "pay"], ["what", "customers", "actually", "pay"]),
    # same phrase, but split across a cue boundary ("...in what" | "actually
    # customer will pay"), so it must also be fixable from the tail alone
    (["actually", "customer", "will", "pay"], ["customers", "actually", "pay"]),
    (["shown", "up", "in", "what"], ["show", "up", "in", "what"]),
    (["openai", "'s", "engineer", "described"], ["OpenAI's", "engineers", "described"]),
    (["who", "finish", "your", "sentence"], ["who", "finishes", "your", "sentences"]),
    (["so", "so", "you", "can", "watch", "at", "work"], ["so", "you", "can", "watch", "it", "work"]),
    (["if", "you", "want", "to", "follow", "up"], ["if", "you", "want", "a", "follow-up"]),
    (["in", "comments"], ["in", "the", "comments"]),
    (["and", "the", "biggest", "smart", "model"], ["and", "the", "big", "smart", "model"]),
    (["you", "threw", "the", "guesses", "out"], ["you", "throw", "the", "guesses", "out"]),
    (["they", "were", "under", "pressure"], ["they're", "under", "pressure"]),
    (["amazon", "engineering", "side"], ["Amazon's", "engineering", "side"]),
    (["one", "detail", "i", "like", "though"], ["one", "detail", "I", "liked", "though"]),
    (["the", "ai", "rewritten", "code"], ["the", "AI's", "rewritten", "code"]),
    (["which", "seems", "like", "a", "right", "call"], ["which", "seems", "like", "the", "right", "call"]),
    (["a", "stack", "of", "novel", "worth"], ["a", "stack", "of", "novels", "worth"]),
    (["that", "same", "piles", "cost"], ["that", "same", "pile", "costs"]),
    (["its", "newest", "line", "up"], ["its", "newest", "lineup"]),
    (["a", "small", "improvement", "here", "can", "save"], ["small", "improvements", "there", "save"]),
    (["you", "have", "got", "expensive", "human", "hand", "tuning"],
     ["you've", "got", "expensive", "humans", "hand-tuning"]),
    (["the", "individual", "machine", "on"], ["the", "individual", "machines", "on"]),
    (["their", "code", "is"], ["this", "code", "is"]),
    (["millions", "of", "time", "a", "day"], ["millions", "of", "times", "a", "day"]),
    (["for", "their", "boring", "high"], ["for", "the", "boring", "high"]),
    (["chinese", "model", "went", "from"], ["Chinese", "models", "went", "from"]),
    (["better", "model", "make", "their", "own"], ["better", "models", "make", "their", "own"]),
    (["if", "that", "loop", "hold"], ["if", "that", "loop", "holds"]),
    (["when", "new", "chips", "shows", "up"], ["when", "new", "chips", "show", "up"]),
    (["when", "human", "gets", "around"], ["when", "humans", "get", "around"]),
    (["which", "is", "different", "thing"], ["which", "is", "a", "different", "thing"]),
    (["dozens", "of", "ai", "call", "behind"], ["dozens", "of", "AI", "calls", "behind"]),
    (["the", "scene", "a", "bunch", "of", "idea"], ["the", "scenes", "a", "bunch", "of", "ideas"]),
    (["openai's", "engineer", "described"], ["OpenAI's", "engineers", "described"]),
    (["its", "ai", "model", "by"], ["its", "AI", "models", "by"]),
    (["suddenly", "cost", "a", "fifth"], ["suddenly", "costs", "a", "fifth"]),
    (["something", "is", "going", "on", "there"], ["something's", "going", "on", "there"]),
    (["it", "'s", "the", "how"], ["that's", "the", "how"]),
    (["before", "feeding", "in", "roughly"], ["before", "feeding", "it", "roughly"]),
    (["got", "it", "more", "than", "15"], ["got", "it", "more", "than", "15"]),
    (["two", "take", "aways"], ["two", "takeaways"]),
    (["100", "of", "experiment"], ["hundreds", "of", "experiments"]),
]


def proofread(words):
    out = []
    i = 0
    while i < len(words):
        matched = False
        for src, dst in PHRASE_FIXES:
            n = len(src)
            if i + n <= len(words) and [w["text"].lower().strip() for w in words[i : i + n]] == src:
                start = words[i]["startFrame"]
                end = words[i + n - 1]["endFrame"]
                # spread the replacement words across the original span so
                # karaoke highlighting still tracks the audio
                span = max(end - start, len(dst) * 2)
                for k, text in enumerate(dst):
                    ws = start + round(span * k / len(dst))
                    we = start + round(span * (k + 1) / len(dst))
                    out.append({"text": text, "startFrame": ws, "endFrame": max(we, ws + 2)})
                i += n
                matched = True
                break
        if not matched:
            out.append(words[i])
            i += 1
    return out


cues = []
current = []


def flush():
    if not current:
        return
    raw_words = []
    for c in current:
        text = c["text"].strip()
        if text in ("", ".", ",", "?", "!"):
            continue
        start_ms = c["startMs"]
        # whisper sometimes emits endMs == startMs for very short tokens;
        # give them a floor so the karaoke highlight is actually visible.
        end_ms = max(c["endMs"], start_ms + MIN_WORD_MS)
        raw_words.append(
            {"text": text, "startFrame": to_frame(start_ms), "endFrame": to_frame(end_ms)}
        )
    if not raw_words:
        current.clear()
        return

    # stitch hyphenated tokens ("twenty" "-" "five") back into one word
    words = []
    i = 0
    while i < len(raw_words):
        if raw_words[i]["text"] == "-" and words and i + 1 < len(raw_words):
            words[-1] = {
                "text": words[-1]["text"] + "-" + raw_words[i + 1]["text"],
                "startFrame": words[-1]["startFrame"],
                "endFrame": raw_words[i + 1]["endFrame"],
            }
            i += 2
        else:
            words.append(raw_words[i])
            i += 1

    words = merge_split_tokens(words)
    words = merge_contractions(words)
    words = proofread(words)

    # a word must never end before it starts, and cues must advance monotonically
    for w in words:
        if w["endFrame"] <= w["startFrame"]:
            w["endFrame"] = w["startFrame"] + 4

    text = " ".join(w["text"] for w in words)
    cues.append(
        {
            "text": text,
            "startFrame": words[0]["startFrame"],
            "endFrame": max(words[-1]["endFrame"], words[0]["startFrame"] + 20),
            "words": words,
        }
    )
    current.clear()


prev_end_ms = None
word_count = 0
cue_start_ms = None

for c in captions:
    text = c["text"].strip()
    stripped = text.strip("[]")
    if text == "[BLANK_AUDIO]" or stripped in ("BL", "ANK", "_", "AUD", "IO", ""):
        continue

    # gap detection uses real spoken boundaries, not the display estimate
    if prev_end_ms is not None and c["startMs"] - prev_end_ms > GAP_BREAK_MS:
        flush()
        word_count = 0
        cue_start_ms = None

    if text not in (".", ",", "?", "!") and text != "":
        if cue_start_ms is None:
            cue_start_ms = c["startMs"]
        current.append(c)
        word_count += 1

    is_sentence_end = text in (".", "?", "!")
    too_long = cue_start_ms is not None and (c["startMs"] - cue_start_ms) > MAX_CUE_MS
    too_many = word_count >= MAX_WORDS_PER_CUE

    if is_sentence_end or too_long or too_many:
        flush()
        word_count = 0
        cue_start_ms = None

    prev_end_ms = max(c["endMs"], c["startMs"])

flush()

# --- absorb runt cues ------------------------------------------------------
# A cue that holds for only a few frames makes the caption box snap from full
# width down to one short word and back (e.g. "weeks" for 4 frames, "all" for
# 7). That resize IS the flicker viewers see -- the box opacity can be
# perfectly stable and it still reads as a strobe.
#
# Whisper's sentence-final punctuation splits these off; they are the tail of
# the sentence before them, so merge them back rather than letting them stand
# as their own cue. Word timings are preserved, so karaoke still tracks.
MIN_CUE_FRAMES = 34  # ~1.1s -- below this a cue cannot be read anyway

merged = []
for cue in cues:
    dur = cue["endFrame"] - cue["startFrame"]
    prev = merged[-1] if merged else None
    if (
        prev is not None
        and dur < MIN_CUE_FRAMES
        and cue["startFrame"] - prev["endFrame"] <= 18
        and len(prev["words"]) + len(cue["words"]) <= MAX_WORDS_PER_CUE + 4
    ):
        prev["words"].extend(cue["words"])
        prev["endFrame"] = cue["endFrame"]
        prev["text"] = " ".join(w["text"] for w in prev["words"])
    else:
        merged.append(cue)
cues = merged

# --- cross-cue repairs -----------------------------------------------------
# Some defects straddle a cue boundary and so survive the per-cue passes:
#   * "GPT-5" ends one cue and a bare "6" opens the next -> "6 isn't one model"
#   * a "%" or "%." token opens a cue whose number ended the previous one
# Pull the stranded fragment back onto the previous cue's last word.
for prev, nxt in zip(cues, cues[1:]):
    if not prev["words"] or not nxt["words"]:
        continue
    tail = prev["words"][-1]
    head = nxt["words"][0]
    head_txt = head["text"].strip()
    tail_txt = tail["text"].strip()

    join = None
    if tail_txt.upper() == "GPT-5" and head_txt.rstrip(".") == "6":
        join = "GPT-5.6"
    elif head_txt in ("%", "%.") and tail_txt and tail_txt[-1].isdigit():
        join = tail_txt + "%"

    if join:
        tail["text"] = join
        tail["endFrame"] = max(tail["endFrame"], head["endFrame"])
        nxt["words"] = nxt["words"][1:]
        if nxt["words"]:
            nxt["startFrame"] = nxt["words"][0]["startFrame"]

for cue in cues:
    cue["text"] = " ".join(w["text"] for w in cue["words"])

# a percent sign should never be spaced off its number ("80 %" -> "80%")
for cue in cues:
    cue["text"] = cue["text"].replace(" %", "%")

cues = [cue for cue in cues if cue["words"]]

# never let one cue overlap the next -- a cue holding past its successor's
# start would render two subtitle blocks for the same frame.
for a, b in zip(cues, cues[1:]):
    if a["endFrame"] > b["startFrame"]:
        a["endFrame"] = b["startFrame"]
    for w in a["words"]:
        if w["endFrame"] > a["endFrame"]:
            w["endFrame"] = a["endFrame"]

out_path = ROOT / "src" / "cheap-subtitles.json"
out_path.write_text(json.dumps(cues, indent=2))
print(f"Wrote {len(cues)} cues to {out_path.relative_to(ROOT)}")
print(f"First cue starts at frame {cues[0]['startFrame']}: {cues[0]['text'][:60]!r}")
print(f"Last cue ends at frame {cues[-1]['endFrame']}")
