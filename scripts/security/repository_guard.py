#!/usr/bin/env python3
"""Fail closed on high-confidence repository security policy violations."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path


MAX_TRACKED_BYTES = 10 * 1024 * 1024
SELF_PATH = "scripts/security/repository_guard.py"

SECRET_PATTERNS = (
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("GitHub token", re.compile(r"gh[pousr]_[A-Za-z0-9]{36,255}")),
    ("OpenAI-style key", re.compile(r"sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}")),
    ("AWS access key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("Google API key", re.compile(r"AIza[0-9A-Za-z_-]{35}")),
    ("Hugging Face token", re.compile(r"hf_[A-Za-z0-9]{30,}")),
    ("Slack token", re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}")),
)

LOCAL_PATH_PATTERNS = (
    ("Windows workstation path", re.compile(r"[A-Za-z]:[\\/](?:Users|Active Projects)[\\/]")),
    ("macOS workstation path", re.compile(r"/Users/[^/\s]+/")),
    ("Linux home path", re.compile(r"/home/[^/\s]+/")),
)

FORBIDDEN_NAMES = {
    ".env",
    "id_rsa",
    "id_ed25519",
    "credentials.json",
    "service-account.json",
}

FORBIDDEN_SUFFIXES = {
    ".ckpt",
    ".dill",
    ".dll",
    ".dylib",
    ".exe",
    ".h5",
    ".hdf5",
    ".joblib",
    ".onnx",
    ".pem",
    ".pickle",
    ".pkl",
    ".pt",
    ".pth",
    ".so",
    ".tflite",
}


def run_git(root: Path, *args: str, binary: bool = False) -> str | bytes:
    completed = subprocess.run(
        ["git", *args],
        cwd=root,
        check=True,
        capture_output=True,
        text=not binary,
    )
    return completed.stdout


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def decode_text(data: bytes) -> str | None:
    if b"\x00" in data[:8192]:
        return None
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return None


def scan_text(path: str, text: str, *, historical: bool) -> list[str]:
    failures: list[str] = []

    for label, pattern in SECRET_PATTERNS:
        for match in pattern.finditer(text):
            failures.append(f"{path}:{line_number(text, match.start())}: possible {label}")

    if not historical:
        for label, pattern in LOCAL_PATH_PATTERNS:
            for match in pattern.finditer(text):
                failures.append(f"{path}:{line_number(text, match.start())}: {label}")

    return failures


def scan_path_policy(path: str, size: int) -> list[str]:
    failures: list[str] = []
    lowered = path.lower()
    name = Path(lowered).name
    suffix = Path(lowered).suffix

    if size > MAX_TRACKED_BYTES:
        failures.append(
            f"{path}: tracked file is {size} bytes; maximum is {MAX_TRACKED_BYTES}"
        )

    if name in FORBIDDEN_NAMES or (name.startswith(".env.") and name != ".env.example"):
        failures.append(f"{path}: secret-bearing filename is forbidden")

    if suffix in FORBIDDEN_SUFFIXES:
        failures.append(f"{path}: executable or unsafe serialized artifact is forbidden")

    return failures


def scan_workflow(path: str, text: str) -> list[str]:
    failures: list[str] = []

    if re.search(r"(?m)^\s*pull_request_target\s*:", text):
        failures.append(f"{path}: pull_request_target is forbidden")
    if re.search(r"(?m)^\s*workflow_run\s*:", text):
        failures.append(f"{path}: workflow_run is forbidden")
    if re.search(r"(?m)^\s*runs-on\s*:.*self-hosted", text):
        failures.append(f"{path}: self-hosted runners require explicit security review")
    if "secrets." in text:
        failures.append(f"{path}: repository secrets are forbidden in the baseline workflow")
    if not re.search(r"(?m)^permissions:\s*\n", text):
        failures.append(f"{path}: top-level permissions block is required")

    for match in re.finditer(
        r"(?m)^[ \t]*(?:-[ \t]*)?uses:[ \t]*([^\s#]+)", text
    ):
        action = match.group(1)
        if action.startswith("./"):
            continue
        if not re.fullmatch(r"[^@]+@[0-9a-f]{40}", action):
            failures.append(
                f"{path}:{line_number(text, match.start())}: action is not pinned to a full SHA"
            )

    return failures


def scan_current(root: Path) -> list[str]:
    failures: list[str] = []
    raw_paths = run_git(root, "ls-files", "--cached", "--others", "--exclude-standard", "-z")
    assert isinstance(raw_paths, str)

    for path in (item for item in raw_paths.split("\x00") if item):
        full_path = root / path
        if not full_path.is_file():
            continue
        data = full_path.read_bytes()
        failures.extend(scan_path_policy(path, len(data)))
        text = decode_text(data)
        if text is None:
            continue
        failures.extend(scan_text(path, text, historical=(path == SELF_PATH)))
        if path.startswith(".github/workflows/") and path.endswith((".yml", ".yaml")):
            failures.extend(scan_workflow(path, text))

    return failures


def scan_history(root: Path) -> list[str]:
    failures: list[str] = []
    commits = run_git(root, "rev-list", "--all")
    assert isinstance(commits, str)
    seen_blobs: set[str] = set()

    for commit in (item for item in commits.splitlines() if item):
        tree = run_git(root, "ls-tree", "-r", "-z", "--full-tree", commit)
        assert isinstance(tree, str)
        for record in (item for item in tree.split("\x00") if item):
            metadata, path = record.split("\t", 1)
            _mode, object_type, blob = metadata.split(" ", 2)
            if object_type != "blob" or blob in seen_blobs:
                continue
            seen_blobs.add(blob)

            size_raw = run_git(root, "cat-file", "-s", blob)
            assert isinstance(size_raw, str)
            size = int(size_raw.strip())
            failures.extend(scan_path_policy(f"history:{path}", size))
            if size > MAX_TRACKED_BYTES:
                continue

            data = run_git(root, "cat-file", "blob", blob, binary=True)
            assert isinstance(data, bytes)
            text = decode_text(data)
            if text is not None and path != SELF_PATH:
                failures.extend(scan_text(f"history:{path}", text, historical=True))

    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--history", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()

    failures = scan_current(root)
    if args.history:
        failures.extend(scan_history(root))

    if failures:
        print("Repository guard failed:", file=sys.stderr)
        for failure in sorted(set(failures)):
            print(f"- {failure}", file=sys.stderr)
        return 1

    scope = "current tree and Git history" if args.history else "current tree"
    print(f"Repository guard passed for {scope}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
