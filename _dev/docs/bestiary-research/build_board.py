"""Build the bestiary pick board from rosters.json and the catalogs. Output: board.html, published as an
Artifact whose db keeps the owner's choice per slot (collection "choices", one doc per slot key).
Run: python -I build_board.py
"""
import csv
import html
import json
import pathlib
import re

HERE = pathlib.Path(__file__).parent
ROSTERS = json.loads((HERE / "rosters.json").read_text(encoding="utf-8"))

# My review flags (2026-10-29), shown on the card they concern
FLAGS = {
    "Yara-ma-yha-who": "Aboriginal Australian. The brief defaults these beings to red unless a source shows they "
                       "are openly shared as folklore; the researcher rated it yellow. I suggest the Bungisngis.",
    "Lamashtu": "A Mesopotamian demon-goddess. Her religion is extinct, but she is a goddess. Lagahoo is the "
                "alternate.",
    "Camazotz": "Some Maya traditions treat this bat figure as a god. Kerit, the Nandi bear, is the alternate.",
    "Wild Hunt Rider": "Close to the Storm Rider already in the game. Keep only if it looks clearly different.",
    "Polar Bear": "A real animal: it needs no D&D credit.",
    "Stymphalian Birds": "Its catalog rated it an event creature; here it is a regular minion.",
    "Corrupted Wyvern": "Placed here only because the Tempest Lord holds Mistral Peaks' boss slot.",
    "Tempest Lord of the Peaks": "Named by the old lore. The alternates are creatures, in case you want one instead "
                                 "of a lord.",
}


def load_catalogs():
    rows = {}
    for path in HERE.glob("catalog-*.csv"):
        key = path.stem.removeprefix("catalog-")
        for r in csv.DictReader(path.open(encoding="utf-8")):
            rows[(key, r["name"])] = r
    return rows


CAT = load_catalogs()


def detail(p):
    """Looks and behavior from the creature's catalog row, or the SRD type and size."""
    r = CAT.get((p.get("catalog", ""), p["name"]))
    if p.get("existing"):
        return "Already drawn and locked."
    if not r:
        return ""
    if p.get("catalog") == "srd":
        return f"D&D SRD: {r.get('size', '')} {r.get('type', '')}".strip()
    return " ".join(x for x in (r.get("looks", ""), r.get("behavior", "")) if x)


def option(p):
    return {"name": p["name"], "origin": p.get("origin", ""), "sens": p.get("sensitivity", ""),
            "lic": p.get("license", ""), "existing": bool(p.get("existing")), "detail": detail(p),
            "flag": FLAGS.get(p["name"], "")}


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


lands = []
for land in ROSTERS["lands"]:
    counts, slots = {}, []
    for s in land["slots"]:
        if not s.get("pick") or s["pick"].get("name", "").startswith("("):
            continue
        counts[s["slot"]] = counts.get(s["slot"], 0) + 1
        slots.append({"key": f"{slug(land['land'])}__{s['slot']}-{counts[s['slot']]}", "slot": s["slot"],
                      "note": s.get("note", ""), "options": [option(s["pick"])] + [option(a) for a in s.get("alternates", [])]})
    lands.append({"land": land["land"], "levels": land["levels"], "element": land["element"],
                  "faction": land.get("faction_note", ""), "slots": slots})

seasonal = [{"key": f"seasonal__{slug(p['name'])}", "slot": "seasonal", "note": "", "options": [option(p)]}
            for p in ROSTERS["seasonal"]]
data = {"lands": lands, "seasonal": seasonal, "excluded": ROSTERS["excluded"],
        "dropped": ROSTERS.get("dropped_near_duplicates", [])}

template = (HERE / "board_template.html").read_text(encoding="utf-8")
blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
(HERE / "board.html").write_text(template.replace("/*DATA*/null", blob), encoding="utf-8")
print("board.html:", sum(len(l["slots"]) for l in lands), "slots,", len(seasonal), "seasonal")
