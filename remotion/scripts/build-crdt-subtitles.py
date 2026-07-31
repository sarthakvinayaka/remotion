#!/usr/bin/env python3
"""
Groups the raw whisper word-level captions (src/crdt-captions.json) into
stable subtitle "cues" -- whole phrases that hold on screen for their full
spoken duration, with each word's own frame range for karaoke-style
highlighting -- instead of showing one caption token's tiny time window at a
time (which reads as flickery/fast since punctuation is its own token).

A cue breaks on: sentence-ending punctuation, a word-count cap, or a big
gap in speech. Output matches the shape CodeVideoSubtitles.tsx expects:
  [{ text, startFrame, endFrame, words: [{ text, startFrame, endFrame }] }]
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
MAX_WORDS_PER_CUE = 9
MAX_CUE_MS = 3200
GAP_BREAK_MS = 500

captions = json.loads((ROOT / "src" / "crdt-captions.json").read_text())


def to_frame(ms: float) -> int:
    return round(ms / 1000 * FPS)


cues = []
current = []


def flush():
    if not current:
        return
    raw_words = [
        {"text": c["text"].strip(), "startFrame": to_frame(c["timestampMs"]), "endFrame": to_frame(c["timestampMs"] + max(c["endMs"] - c["startMs"], 120))}
        for c in current
        if c["text"].strip() not in ("", ".", ",", "?", "!")
    ]
    if not raw_words:
        current.clear()
        return
    # whisper splits hyphenated words into separate tokens ("co", "-", "workers")
    # -- glue a lone "-" token onto its neighbors instead of showing it as its
    # own word.
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

    if prev_end_ms is not None and c["timestampMs"] - prev_end_ms > GAP_BREAK_MS:
        flush()
        word_count = 0
        cue_start_ms = None

    if text not in (".", ",", "?", "!") and text != "":
        if cue_start_ms is None:
            cue_start_ms = c["timestampMs"]
        current.append(c)
        word_count += 1

    is_sentence_end = text in (".", "?", "!")
    too_long = cue_start_ms is not None and (c["timestampMs"] - cue_start_ms) > MAX_CUE_MS
    too_many = word_count >= MAX_WORDS_PER_CUE

    if is_sentence_end or too_long or too_many:
        flush()
        word_count = 0
        cue_start_ms = None

    prev_end_ms = c["timestampMs"] + max(c["endMs"] - c["startMs"], 0)

flush()

out_path = ROOT / "src" / "crdt-subtitles.json"
out_path.write_text(json.dumps(cues, indent=2))
print(f"Wrote {len(cues)} cues to {out_path.relative_to(ROOT)}")
