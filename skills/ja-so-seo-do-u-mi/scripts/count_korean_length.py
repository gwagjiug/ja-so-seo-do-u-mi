#!/usr/bin/env python3
"""Count Korean application essay length in common submission formats."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def read_text(path: str | None) -> str:
    if path:
        return Path(path).read_text(encoding="utf-8")
    return sys.stdin.read()


def count_text(text: str) -> dict[str, int]:
    no_newline = text.replace("\r\n", "\n").strip()
    without_spaces = "".join(ch for ch in no_newline if not ch.isspace())
    return {
        "chars_with_spaces": len(no_newline),
        "chars_without_spaces": len(without_spaces),
        "utf8_bytes": len(no_newline.encode("utf-8")),
        "euc_kr_bytes": len(no_newline.encode("euc-kr", errors="replace")),
        "lines": 0 if not no_newline else no_newline.count("\n") + 1,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Count Korean 자기소개서 length by characters and bytes."
    )
    parser.add_argument("path", nargs="?", help="Text file path. Reads stdin when omitted.")
    parser.add_argument("--json", action="store_true", help="Print JSON output.")
    args = parser.parse_args()

    result = count_text(read_text(args.path))
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        for key, value in result.items():
            print(f"{key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
