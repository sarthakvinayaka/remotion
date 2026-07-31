#!/usr/bin/env python3
"""
Runs each hashtable-code-segments/*.py file in a subprocess and splits its
real stdout into two parallel traces:

  - a text trace: { line, order, service } for every human-readable
    print() line (same shape as previous videos' TerminalOutput format)
  - a structured event trace: { type: "insert"|"resize", ... } parsed from
    "@EVENT <json>" lines the demo code emits alongside its normal prints,
    giving HashComputer/HashBucketGrid/LoadFactorMeter real key/hash_value/
    bucket_index/capacity/is_collision/old_capacity/new_capacity data to
    animate from -- nothing hardcoded in the components themselves.

Both traces share the same `order` numbering space (computed from stdout's
real line order) so an event and the print line right after/before it can be
correlated by order if needed.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEGMENTS_DIR = ROOT / "hashtable-code-segments"
TEXT_OUTPUT_DIR = ROOT / "src" / "hashtable-traces"
EVENT_OUTPUT_DIR = ROOT / "src" / "hashtable-events"
TEXT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
EVENT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TIMEOUT_SECONDS = 10
SERVICE_PREFIX_RE = re.compile(r"^\[([^\]]+)\]")
EVENT_PREFIX = "@EVENT "


def capture_segment(py_path: Path) -> tuple[list[dict], list[dict]]:
    print(f"Running {py_path.name} (timeout={TIMEOUT_SECONDS}s)...")
    try:
        result = subprocess.run(
            [sys.executable, "-u", str(py_path)],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
            cwd=py_path.parent,
        )
        stdout = result.stdout
        if result.returncode != 0:
            print(f"  !! non-zero exit ({result.returncode}): {result.stderr[-500:]}")
    except subprocess.TimeoutExpired as e:
        stdout = e.stdout.decode() if isinstance(e.stdout, bytes) else (e.stdout or "")

    text_trace = []
    event_trace = []
    order = 0
    for line in stdout.splitlines():
        if line.strip() == "":
            continue
        order += 1
        if line.startswith(EVENT_PREFIX):
            event = json.loads(line[len(EVENT_PREFIX):])
            event["order"] = order
            event_trace.append(event)
            continue
        m = SERVICE_PREFIX_RE.match(line)
        service = m.group(1) if m else None
        text_trace.append({"line": line, "order": order, "service": service})
    return text_trace, event_trace


def main():
    py_files = sorted(p for p in SEGMENTS_DIR.glob("*.py") if not p.name.startswith("_"))
    if not py_files:
        print(f"No .py files found in {SEGMENTS_DIR}")
        return

    for py_path in py_files:
        text_trace, event_trace = capture_segment(py_path)
        text_out = TEXT_OUTPUT_DIR / f"{py_path.stem}.json"
        event_out = EVENT_OUTPUT_DIR / f"{py_path.stem}.json"
        text_out.write_text(json.dumps(text_trace, indent=2))
        event_out.write_text(json.dumps(event_trace, indent=2))
        print(
            f"  -> {len(text_trace)} text lines -> {text_out.relative_to(ROOT)}, "
            f"{len(event_trace)} events -> {event_out.relative_to(ROOT)}"
        )

    print("Done.")


if __name__ == "__main__":
    main()
