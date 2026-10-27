#!/bin/bash
# usage: play.sh key package
S="C:/Users/ediaz/AppData/Local/Temp/claude/r--Coding-Projects--dragonGold/4386bd52-5e6c-41ee-b7e4-9145bd3e3bce/scratchpad"
k=$1; p=$2; d="$S/dl/play-$k"; mkdir -p "$d"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
code=$(curl -sL -A "$UA" "https://play.google.com/store/apps/details?id=$p&hl=en_US&gl=US" -o "$d/page.html" -w "%{http_code}")
title=$(grep -oE '<title[^>]*>[^<]*' "$d/page.html" | sed 's/<title[^>]*>//')
# screenshots carry alt="Screenshot image"
grep -oE '<img[^>]+alt="Screenshot image"[^>]*>' "$d/page.html" | grep -oE 'src="https://play-lh.googleusercontent.com/[^"=]+' | sed 's/src="//' | awk '!s[$0]++' > "$d/urls.txt"
i=0; while read -r u; do i=$((i+1)); curl -sL "$u=w700" -o "$d/$(printf %02d $i).png"; done < "$d/urls.txt"
echo "$k $code [$title] $(wc -l < "$d/urls.txt") shots"
