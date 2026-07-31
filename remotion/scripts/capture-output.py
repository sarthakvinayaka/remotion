#!/usr/bin/env python3
"""
Pre-render capture step. Runs each code segment's .py file in a plain
subprocess (trusted, own code), captures real stdout line-by-line in
execution order (not wall-clock, since the code uses time.sleep()), and
writes a generic execution trace per segment:

  { "line": "<raw stdout line>", "order": <int>, "service": "<name|null>" }

"service" is extracted generically from a "[Some Service]" prefix if present
-- nothing about this script or its output format is specific to the
order/payment/inventory/notification example. Re-run this whenever a
code-segments/*.py file changes to keep the video's terminal output accurate.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEGMENTS_DIR = ROOT / "code-segments"
OUTPUT_DIR = ROOT / "src" / "traces"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Segments whose scripts loop forever (daemon threads) need a hard wall-clock
# timeout since we can't wait for natural completion -- the demo runs inside
# each file already sleep long enough to produce their full output before
# this fires.
TIMEOUT_SECONDS = 10

SERVICE_PREFIX_RE = re.compile(r"^\[([^\]]+)\]")


def capture_segment(py_path: Path) -> list[dict]:
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
    except subprocess.TimeoutExpired as e:
        # Expected for segments with daemon threads that never join --
        # everything printed before the timeout is still real captured output.
        stdout = e.stdout.decode() if isinstance(e.stdout, bytes) else (e.stdout or "")

    trace = []
    order = 0
    for line in stdout.splitlines():
        if line.strip() == "":
            continue
        order += 1
        m = SERVICE_PREFIX_RE.match(line)
        service = m.group(1) if m else None
        trace.append({"line": line, "order": order, "service": service})
    return trace


def main():
    py_files = sorted(SEGMENTS_DIR.glob("*.py"))
    if not py_files:
        print(f"No .py files found in {SEGMENTS_DIR}")
        return

    for py_path in py_files:
        trace = capture_segment(py_path)
        out_path = OUTPUT_DIR / f"{py_path.stem}.json"
        out_path.write_text(json.dumps(trace, indent=2))
        print(f"  -> {len(trace)} lines captured -> {out_path.relative_to(ROOT)}")

    print("Done.")


if __name__ == "__main__":
    main()
