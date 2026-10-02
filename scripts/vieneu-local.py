#!/usr/bin/env python3
"""VieNeu on-device TTS bridge for auto-video-gen.

Reads text from a file (avoids shell-quoting issues), synthesizes with the
local `vieneu` package, and writes a wav file.

Usage:
    python3 scripts/vieneu-local.py --text-file /tmp/t.txt --out /tmp/s.wav \
        [--voice "Minh Quan Pro"] [--mode v3nano] [--precision int8]

Prereqs: `pip install vieneu` + eSpeak NG (`brew install espeak` on macOS).
Model weights auto-download from HuggingFace on first use.
Docs: https://docs.vieneu.io/docs/sdk/overview
"""

import argparse
import sys
import time


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--text-file", required=True, help="Path to UTF-8 text file to synthesize")
    ap.add_argument("--out", required=True, help="Output wav path")
    ap.add_argument("--voice", default="Minh Quân Pro", help="Preset/enrolled voice name")
    ap.add_argument("--mode", default="", help="SDK mode, e.g. v3nano (empty = SDK default v3 Turbo)")
    ap.add_argument("--precision", default="", help="CPU precision, e.g. int8 (empty = SDK default fp32)")
    args = ap.parse_args()

    try:
        from vieneu import Vieneu
    except ImportError:
        print("ERROR: No module named vieneu. Install with: pip install vieneu", file=sys.stderr)
        return 2

    with open(args.text_file, encoding="utf-8") as f:
        text = f.read().strip()
    if not text:
        print("ERROR: empty input text", file=sys.stderr)
        return 3

    kwargs = {}
    if args.mode:
        kwargs["mode"] = args.mode
    if args.precision:
        kwargs["precision"] = args.precision

    t0 = time.time()
    tts = Vieneu(**kwargs)
    audio = tts.infer(text, voice=args.voice)
    tts.save(audio, args.out)
    dt = time.time() - t0
    # Machine-readable success line for the Node caller.
    print(f"OK seconds={dt:.1f} out={args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
