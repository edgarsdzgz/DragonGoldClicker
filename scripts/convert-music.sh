#!/usr/bin/env bash
# Convert MP3 files in assets/music/src/ to AAC (.m4a) in assets/music/out/
# Requires: ffmpeg
# Usage: bash scripts/convert-music.sh [--quality 1-5] [file.mp3 ...]
#   --quality  AAC VBR quality (1=~80kbps, 3=~128kbps, 5=~192kbps). Default: 3
#   file.mp3   Optional specific file(s) in src/. Omit to convert all.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$PROJECT_ROOT/assets/music/src"
OUT_DIR="$PROJECT_ROOT/assets/music/out"

QUALITY=3

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --quality)
      QUALITY="$2"
      shift 2
      ;;
    *)
      break
      ;;
  esac
done

if ! command -v ffmpeg &>/dev/null; then
  echo "[ERROR] ffmpeg is not installed or not in PATH."
  exit 1
fi

mkdir -p "$OUT_DIR"

# Build file list
FILES=()
if [[ $# -gt 0 ]]; then
  for f in "$@"; do
    FILES+=("$SRC_DIR/$f")
  done
else
  shopt -s nullglob
  FILES=("$SRC_DIR"/*.mp3)
  shopt -u nullglob
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "[ERROR] No MP3 files found in $SRC_DIR"
  exit 1
fi

CONVERTED=0
SKIPPED=0

for src in "${FILES[@]}"; do
  if [[ ! -f "$src" ]]; then
    echo "[WARN] File not found: $src -- skipping"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  basename="$(basename "$src" .mp3)"
  dest="$OUT_DIR/${basename}.m4a"

  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    echo "[SKIP] $basename.m4a is up to date"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "[CONVERT] $basename.mp3 -> $basename.m4a (VBR quality $QUALITY)"
  ffmpeg -y -i "$src" -c:a aac -vbr "$QUALITY" -movflags +faststart "$dest" 2>/dev/null
  CONVERTED=$((CONVERTED + 1))
done

echo ""
echo "[COMPLETE] Converted: $CONVERTED | Skipped: $SKIPPED"
