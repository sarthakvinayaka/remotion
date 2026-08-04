#!/usr/bin/env python3
"""
Groups raw whisper word-level captions into stable subtitle "cues" for the
OpenAI price-cut video (image_gpt.m4a).

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

captions = json.loads((ROOT / "src" / "imggpt-captions.json").read_text())


def to_frame(ms: float) -> int:
    return round(ms / 1000 * FPS)


# Whisper's --max-len 1 tokenizer splits some words across several caption
# tokens ("un"+"g"+"lam"+"orous", "G"+"PT"+"5"+"6"). Merging them keeps the
# burned-in caption readable; the merged word spans from the first token's
# startFrame to the last token's endFrame, so timing stays ASR-accurate.
# Matching is case-insensitive on the token sequence.
TOKEN_MERGES = [
    (["chair", "g", "pt"], "ChatGPT"),
    (["chat", "g", "pt"], "ChatGPT"),
    (["chat", "gpt"], "ChatGPT"),
    (["emb", "edding"], "embedding"),
    (["emb", "eddings"], "embeddings"),
    (["ind", "ividually"], "Individually"),
    (["memor", "izing"], "memorizing"),
    (["capt", "ions"], "captions"),
    (["sculpt", "ing"], "sculpting"),
    (["paint", "brush"], "paintbrush"),
    (["water", "color"], "watercolor"),
    (["handle", "bar"], "handlebars"),
    (["resh", "apes"], "reshapes"),
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


def merge_quotes(words):
    """Whisper emits a bare `"` as its own token, and the renderer puts a
    13px margin after every word -- so quotes float away from what they quote
    (`the word " the " four times`). Glue an opening quote onto the FOLLOWING
    word and a closing quote onto the PRECEDING one."""
    out = []
    pending_open = None
    for w in words:
        t = w["text"].strip()
        if t == '"':
            if out and pending_open is None:
                # closing quote -> attach to previous word
                out[-1] = {
                    "text": out[-1]["text"] + '"',
                    "startFrame": out[-1]["startFrame"],
                    "endFrame": w["endFrame"],
                }
                pending_open = None
            else:
                pending_open = w
            continue
        if pending_open is not None:
            out.append({
                "text": '"' + w["text"],
                "startFrame": pending_open["startFrame"],
                "endFrame": w["endFrame"],
            })
            pending_open = None
        else:
            out.append(dict(w))
    return out


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
    (["chair", "g", "pt"], ["ChatGPT"]),
    (["chat", "g", "pt"], ["ChatGPT"]),
    (["embed", "ding"], ["embedding"]),
    (["resh", "apes"], ["reshapes"]),
    (["static.", "pure", "visual"], ["static.", "Pure", "visual"]),
    # --- factual / contradicts the visual on screen ---
    (["dots", "that", "call", "pixel"], ["dots", "called", "pixels"]),
    (["each", "pixel", "store", "just"], ["Each", "pixel", "stores", "just"]),
    (["don't", "let", "the", "world", "scare"], ["don't", "let", "the", "word", "scare"]),
    (["you", "don't", "look", "at", "just", "one", "meal"],
     ["You", "don't", "look", "at", "just", "one", "wheel"]),
    (["the", "handlebars", "the", "paddle"], ["the", "handlebars,", "the", "pedals,"]),
    (["your", "beam", "connects"], ["your", "brain", "connects"]),
    (["the", "same", "to", "objects"], ["The", "same", "two", "objects"]),
    (["completely", "random", "ge", "ost", "atic"], ["completely", "random.", "Just", "static."]),
    (["ost", "atic", "pure", "visual", "noise"], ["Just", "static.", "Pure", "visual", "noise."]),
    (["random", "ge"], ["random."]),
    # --- clear mishearings ---
    (["solves", "math", "problem"], ["solve", "math", "problems"]),
    (["your", "photo", "or", "its"], ["your", "photo", "on", "its"]),
    (["maybe", "it's", "a", "dog"], ["Maybe", "it's", "your", "dog"]),
    (["that", "captures", "pattern", "instead", "of", "the", "raw", "colors"],
     ["that", "capture", "patterns", "instead", "of", "raw", "colors"]),
    (["you", "ask", "a", "question", "maybe"], ["You", "asked", "a", "question.", "Maybe"]),
    (["reshapes", "the", "random", "pixel"], ["reshapes", "the", "random", "pixels"]),
    (["first", "rough", "color", "appear", "then", "building"],
     ["First,", "rough", "colors", "appear.", "Then", "buildings."]),
    (["closer", "to", "a", "description"], ["closer", "to", "your", "description"]),
    (["when", "started", "as", "a", "meaningless", "noise"],
     ["what", "started", "as", "meaningless", "noise"]),
    (["all", "of", "that", "happened", "in"], ["all", "of", "that", "happens", "in"]),
    (["how", "ai", "really", "work", "not"], ["how", "AI", "really", "works,", "not"]),
    (["engineering", "work", "together"], ["engineering", "working", "together"]),
    (["it", "generates", "a", "brand", "new"], ["it", "generates", "a", "brand-new"]),
    (["a", "futuristic", "city", "at", "sunset"], ["a", "futuristic", "city", "at", "sunset"]),
    (["imagine", "you", "are", "trying"], ["Imagine", "you're", "trying"]),
    (["when", "you", "are", "chatting", "normally"], ["when", "you're", "chatting", "normally"]),
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
    words = merge_quotes(words)
    # NOTE: proofreading is applied GLOBALLY after cue segmentation --
    # see below. Doing it here would scope every phrase to a single cue,
    # so any correction spanning a cue boundary would silently never fire.

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

# --- GLOBAL proofreading pass ----------------------------------------------
# Applied over the FLAT word stream, not per cue. Whisper splits sentences at
# arbitrary points, so a phrase like "how rare the document is across all
# documents" straddles a cue boundary; scoping the fix table to one cue meant
# 7 of 25 corrections silently never matched and shipped wrong text on screen
# (the worst taught IDF backwards). Word objects are mutated in place and then
# re-sliced back into their cues, so cue boundaries and timings are untouched.
_flat = [w for cue in cues for w in cue["words"]]

# Glue any bare contraction suffix onto the preceding word. merge_contractions
# runs per-cue, so a stem/suffix pair split across a cue boundary survives it
# and ships as a floating apostrophe ("it 's a genuine improvement").
_glued = []
for _w in _flat:
    if _glued and _w["text"].lower() in CONTRACTION_SUFFIXES:
        _glued[-1] = {
            "text": _glued[-1]["text"] + _w["text"],
            "startFrame": _glued[-1]["startFrame"],
            "endFrame": _w["endFrame"],
        }
    else:
        _glued.append(dict(_w))
_flat = _glued

_fixed = proofread(_flat)

# redistribute: walk cues in order, taking as many words as each originally had
# unless the fix changed the count -- in which case absorb the delta into the
# cue that owned the first replaced word.
_i = 0
for cue in cues:
    want = len(cue["words"])
    take = _fixed[_i : _i + want]
    # if a replacement changed arity, extend/shrink to keep the stream aligned
    if take:
        cue["words"] = take
        cue["startFrame"] = take[0]["startFrame"]
        cue["endFrame"] = max(take[-1]["endFrame"], take[0]["startFrame"] + 20)
        cue["text"] = " ".join(w["text"] for w in take)
    _i += want
if _i < len(_fixed) and cues:
    extra = [w for w in _fixed[_i:] if w not in cues[-1]["words"]]
    if extra:
        cues[-1]["words"].extend(extra)
        cues[-1]["endFrame"] = max(cues[-1]["endFrame"], extra[-1]["endFrame"])
        cues[-1]["text"] = " ".join(w["text"] for w in cues[-1]["words"])

# Redistribution can leave a zero-length or empty cue behind (a fix that
# changed word count shifts the slice boundary). Those render as a 1-frame
# flash, so drop them.
cues = [c for c in cues if c["words"] and c["endFrame"] > c["startFrame"]]

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

# --- FINAL NORMALISATION (must run after every mutation above) ---------------
# The overlap clamp can push a word's endFrame below its startFrame, and the
# proofread redistribution can leave a duplicate zero-length cue. Both render
# as a 1-frame flash, so normalise once, last.
_seen = set()
_clean = []
for cue in cues:
    if not cue["words"]:
        continue
    if cue["endFrame"] <= cue["startFrame"]:
        continue
    key = (cue["startFrame"], cue["text"])
    if key in _seen:
        continue
    _seen.add(key)
    for w in cue["words"]:
        if w["endFrame"] <= w["startFrame"]:
            w["endFrame"] = min(w["startFrame"] + 4, cue["endFrame"])
        w["startFrame"] = max(w["startFrame"], cue["startFrame"])
        w["endFrame"] = max(w["endFrame"], w["startFrame"] + 1)
        if w["endFrame"] > cue["endFrame"]:
            cue["endFrame"] = w["endFrame"]
    _clean.append(cue)
cues = _clean

# extending a cue to fit its last word can re-introduce an overlap -- clamp
# once more, and pull the word back with it so both invariants hold.
for a, b in zip(cues, cues[1:]):
    if a["endFrame"] > b["startFrame"]:
        a["endFrame"] = b["startFrame"]
        for w in a["words"]:
            if w["endFrame"] > a["endFrame"]:
                w["endFrame"] = a["endFrame"]
            if w["endFrame"] <= w["startFrame"]:
                w["startFrame"] = max(a["startFrame"], w["endFrame"] - 1)

out_path = ROOT / "src" / "imggpt-subtitles.json"
out_path.write_text(json.dumps(cues, indent=2))
print(f"Wrote {len(cues)} cues to {out_path.relative_to(ROOT)}")
print(f"First cue starts at frame {cues[0]['startFrame']}: {cues[0]['text'][:60]!r}")
print(f"Last cue ends at frame {cues[-1]['endFrame']}")
