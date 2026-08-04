#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
MAX_WORDS_PER_CUE = 8
MAX_CUE_MS = 3000
GAP_BREAK_MS = 450
MIN_WORD_MS = 120

raw_data = json.loads((ROOT / "src" / "cursor-raw-transcription.json").read_text())

# Extract tokens from whisper-cpp transcription
raw_tokens = []
for seg in raw_data["transcription"]:
    for tok in seg["tokens"]:
        txt = tok["text"].strip()
        if txt and not txt.startswith("[") and txt != "_BEG_":
            start_ms = tok["offsets"]["from"]
            end_ms = max(tok["offsets"]["to"], start_ms + MIN_WORD_MS)
            raw_tokens.append({
                "text": txt,
                "startMs": start_ms,
                "endMs": end_ms,
            })

def to_frame(ms: float) -> int:
    return round(ms / 1000 * FPS)

# Merge split tokens and contractions
TOKEN_MERGES = [
    (["cur", "sor"], "Cursor"),
    (["code", "base"], "codebase"),
    (["arche", "stration"], "orchestration"),
    (["orche", "stration"], "orchestration"),
    (["chat", "bot"], "chatbot"),
    (["middle", "ware"], "middleware"),
    (["analy", "zes"], "analyzes"),
    (["co", "-", "p", "ilot"], "Copilot"),
    (["co", "p", "ilot"], "Copilot"),
    (["w", "ern", "'s", "serve"], "Windsurf"),
    (["w", "ern", "serve"], "Windsurf"),
    (["open", "ai"], "OpenAI"),
    (["codec", "s"], "Codex"),
    (["c", "ursor"], "Cursor"),
]

CONTRACTION_SUFFIXES = ("'t", "'s", "'re", "'ve", "'ll", "'d", "'m")

def clean_and_group(tokens):
    words = []
    i = 0
    while i < len(tokens):
        matched = False
        for seq, rep in TOKEN_MERGES:
            n = len(seq)
            if i + n <= len(tokens) and [t["text"].lower() for t in tokens[i:i+n]] == seq:
                words.append({
                    "text": rep,
                    "startFrame": to_frame(tokens[i]["startMs"]),
                    "endFrame": to_frame(tokens[i+n-1]["endMs"]),
                })
                i += n
                matched = True
                break
        if not matched:
            t = tokens[i]
            words.append({
                "text": t["text"],
                "startFrame": to_frame(t["startMs"]),
                "endFrame": to_frame(t["endMs"]),
            })
            i += 1

    # Merge contractions
    out = []
    for w in words:
        if out and w["text"].lower() in CONTRACTION_SUFFIXES:
            out[-1] = {
                "text": out[-1]["text"] + w["text"],
                "startFrame": out[-1]["startFrame"],
                "endFrame": w["endFrame"],
            }
        elif out and out[-1]["text"].lower() == "open" and w["text"].lower() == "ai":
            out[-1] = {
                "text": "OpenAI",
                "startFrame": out[-1]["startFrame"],
                "endFrame": w["endFrame"],
            }
        else:
            out.append(dict(w))
    return out

words = clean_and_group(raw_tokens)

# Build cues
cues = []
current = []
cue_start_ms = None
prev_end_ms = None

for w in raw_tokens:
    txt = w["text"].strip()
    if txt in ("", ".", ",", "?", "!"):
        continue

    if prev_end_ms is not None and w["startMs"] - prev_end_ms > GAP_BREAK_MS:
        if current:
            w_list = clean_and_group(current)
            if w_list:
                cues.append({
                    "text": " ".join(item["text"] for item in w_list),
                    "startFrame": w_list[0]["startFrame"],
                    "endFrame": max(w_list[-1]["endFrame"], w_list[0]["startFrame"] + 15),
                    "words": w_list,
                })
            current = []
            cue_start_ms = None

    if cue_start_ms is None:
        cue_start_ms = w["startMs"]
    current.append(w)
    prev_end_ms = w["endMs"]

    is_end = txt.endswith((".", "?", "!"))
    too_long = (w["startMs"] - cue_start_ms) > MAX_CUE_MS
    too_many = len(current) >= MAX_WORDS_PER_CUE

    if is_end or too_long or too_many:
        w_list = clean_and_group(current)
        if w_list:
            cues.append({
                "text": " ".join(item["text"] for item in w_list),
                "startFrame": w_list[0]["startFrame"],
                "endFrame": max(w_list[-1]["endFrame"], w_list[0]["startFrame"] + 15),
                "words": w_list,
            })
        current = []
        cue_start_ms = None

if current:
    w_list = clean_and_group(current)
    if w_list:
        cues.append({
            "text": " ".join(item["text"] for item in w_list),
            "startFrame": w_list[0]["startFrame"],
            "endFrame": max(w_list[-1]["endFrame"], w_list[0]["startFrame"] + 15),
            "words": w_list,
        })

# Ensure monotonicity & non-overlapping cues
for i in range(len(cues) - 1):
    if cues[i]["endFrame"] > cues[i+1]["startFrame"]:
        cues[i]["endFrame"] = cues[i+1]["startFrame"]

(ROOT / "src" / "cursor-subtitles.json").write_text(json.dumps(cues, indent=2))
print(f"Wrote {len(cues)} subtitle cues to cursor-subtitles.json")

# Write cursor-segments.json
segments = [
    ["hook", "narration", 0, 1750],
    ["wrong_arch", "narration", 1750, 2890],
    ["high_level", "narration", 2890, 3450],
    ["ide_client", "narration", 3450, 4500],
    ["repo_intel", "narration", 4500, 5750],
    ["context_engine", "narration", 5750, 7150],
    ["agent_loop", "narration", 7150, 8100],
    ["tool_layer", "narration", 8100, 8900],
    ["llm_gateway", "narration", 8900, 9600],
    ["code_pipeline", "narration", 9600, 10200],
    ["final_arch", "narration", 10200, 11000],
    ["outro", "narration", 11000, 11876],
]

(ROOT / "src" / "cursor-segments.json").write_text(json.dumps(segments, indent=2))
print(f"Wrote {len(segments)} segments to cursor-segments.json")
