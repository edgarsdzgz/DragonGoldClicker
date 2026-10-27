#!/bin/bash
# usage: appstore.sh <name> <appstore-url>
S="C:/Users/ediaz/AppData/Local/Temp/claude/r--Coding-Projects--dragonGold/4386bd52-5e6c-41ee-b7e4-9145bd3e3bce/scratchpad"
n=$1; u=$2; d="$S/dl/$n"; mkdir -p "$d"
curl -sL -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" "$u" -o "$d/page.html"
grep -oE 'https://is[0-9]-ssl\.mzstatic\.com/image/thumb/PurpleSource[^" ]+' "$d/page.html" | sed -E 's#/[^/]+$##' | grep -v Placeholder | awk '!seen[$0]++' > "$d/urls.txt"
i=0; while read -r b; do i=$((i+1)); curl -sL "$b/600x0w.jpg" -o "$d/$(printf %02d $i).jpg"; done < "$d/urls.txt"
cat -n "$d/urls.txt"
