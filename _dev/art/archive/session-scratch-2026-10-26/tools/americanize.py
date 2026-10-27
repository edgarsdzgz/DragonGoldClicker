"""Convert British spellings and car words to American English, in place.

Markdown: URLs, inline `code` and fenced code blocks are left untouched.
Other files (ts, tsx, py, json): the whole text is converted.

usage: americanize.py [--write] <file>...
Without --write, prints each change and touches nothing.
"""
import re
import sys

WHOLE = {
    "grey": "gray", "greys": "grays", "greyed": "grayed", "greyish": "grayish",
    "greying": "graying", "centre": "center", "centres": "centers",
    "centred": "centered", "centring": "centering", "metre": "meter",
    "metres": "meters", "theatre": "theater", "fibre": "fiber", "sabre": "saber",
    "spectre": "specter", "lustre": "luster", "sombre": "somber", "meagre": "meager",
    "programme": "program", "programmes": "programs", "defence": "defense",
    "defences": "defenses", "offence": "offense", "pretence": "pretense",
    "licence": "license", "licences": "licenses", "whilst": "while",
    "amongst": "among", "learnt": "learned", "spelt": "spelled", "dreamt": "dreamed",
    "catalogue": "catalog", "catalogues": "catalogs", "catalogued": "cataloged",
    "jewellery": "jewelry", "aluminium": "aluminum", "towards": "toward",
    "fulfil": "fulfill", "fulfils": "fulfills", "skilful": "skillful",
    "wilful": "willful", "mould": "mold", "moulds": "molds", "moulded": "molded",
    "storey": "story", "storeys": "stories", "cheque": "check", "plough": "plow",
    "sceptic": "skeptic", "sceptical": "skeptical", "judgement": "judgment",
    "acknowledgement": "acknowledgment", "ageing": "aging", "artefact": "artifact",
    "artefacts": "artifacts", "manoeuvre": "maneuver", "manoeuvres": "maneuvers",
    "focussed": "focused", "focussing": "focusing", "cosy": "cozy",
    "practise": "practice", "practised": "practiced", "practising": "practicing",
    "tyre": "tire", "tyres": "tires", "kerb": "curb", "kerbs": "curbs",
    "bonnet": "hood", "bonnets": "hoods", "windscreen": "windshield",
    "windscreens": "windshields", "petrol": "gas", "lorry": "truck",
    "lorries": "trucks", "maths": "math",
    "analyse": "analyze", "analysed": "analyzed", "analysing": "analyzing",
    "paralyse": "paralyze", "paralysed": "paralyzed", "tick box": "checkbox",
    "tick boxes": "checkboxes", "full stop": "period", "full stops": "periods",
}
# doubled-l past tenses: travelled -> traveled
for stem in ("travel", "cancel", "model", "level", "label", "fuel", "signal",
             "channel", "tunnel", "marshal", "duel", "jewel", "counsel", "dial",
             "pedal", "quarrel", "shovel", "total", "unravel", "equal", "rival"):
    for suf in ("led", "ling", "ler", "lers"):
        WHOLE[stem + suf] = stem + suf[1:]
# -our -> -or anywhere inside these word families
OUR = ("colour", "armour", "honour", "favour", "behaviour", "saviour", "flavour",
       "harbour", "rumour", "vapour", "labour", "neighbour", "parlour", "valour",
       "splendour", "vigour", "clamour", "ardour", "odour", "endeavour", "humour",
       "rancour", "rigour", "tumour", "candour", "fervour", "savour")
# -ise -> -ize, only for these stems (advise, surprise, exercise... stay)
ISE = ("organ", "real", "recogn", "priorit", "summar", "categor", "visual",
       "custom", "optim", "minim", "maxim", "normal", "stabil", "final", "initial",
       "memor", "util", "author", "serial", "special", "standard", "character",
       "apolog", "emphas", "critic", "sympath", "harmon", "synchron", "material",
       "mobil", "capital", "personal", "familiar", "patron", "jeopard", "general",
       "central", "local", "global", "symbol", "theor", "tantal", "modern",
       "human", "civil", "fertil", "steril", "neutral", "item", "author",
       "legal", "vandal", "colon", "terror", "agon", "hypnot", "magnet",
       "polar", "random", "rational", "revolution", "scrutin", "subsid",
       "trivial", "vocal", "fantas", "dramat", "energ", "equal", "formal",
       "ideal", "immun", "industrial", "penal", "real",
       "special", "summar", "sanit", "desensit", "sensit", "digit",
       "monet", "priorit", "visual", "conceptual", "contextual",
       "internal", "external", "parameter", "vector", "regular", "optim", "minim")
ISE_SUF = ("ise", "ised", "ises", "ising", "isation", "isations", "iser", "isers",
           "isable")


def keep_case(src, dst):
    if src.isupper():
        return dst.upper()
    if src[:1].isupper():
        return dst[:1].upper() + dst[1:]
    return dst


WORD = re.compile(r"[A-Za-z]+(?: (?:box|boxes|stop|stops))?")


def convert_word(w):
    lw = w.lower()
    if lw in WHOLE:
        return keep_case(w, WHOLE[lw])
    if " " in w:
        head = w.split(" ")[0]
        return convert_word(head) + w[len(head):]
    for fam in OUR:
        i = lw.find(fam)
        if i >= 0:
            out = lw[:i] + fam[:-2] + "r" + lw[i + len(fam):]
            return keep_case(w, out) if not (w[1:].lower() != w[1:]) else \
                w[:i] + w[i:i + len(fam) - 2] + w[i + len(fam) - 1:]
    for suf in ISE_SUF:
        if lw.endswith(suf):
            stem = lw[: -len(suf)]
            if stem in ISE:
                return w[: len(stem)] + keep_case(w[len(stem):], "iz" + suf[2:])
    return w


PROTECT = re.compile(r"```.*?```|`[^`\n]*`|https?://\S+|\]\([^)]*\)", re.S)


def convert_text(text, md):
    changes = []

    def sub(m):
        out = convert_word(m.group(0))
        if out != m.group(0):
            changes.append((m.group(0), out))
        return out

    if not md:
        return WORD.sub(sub, text), changes
    parts, last = [], 0
    for m in PROTECT.finditer(text):
        parts.append(WORD.sub(sub, text[last:m.start()]))
        parts.append(m.group(0))
        last = m.end()
    parts.append(WORD.sub(sub, text[last:]))
    return "".join(parts), changes


def main():
    write = "--write" in sys.argv
    for path in [a for a in sys.argv[1:] if a != "--write"]:
        with open(path, encoding="utf-8", newline="") as f:
            text = f.read()
        new, changes = convert_text(text, path.lower().endswith(".md"))
        if not changes:
            continue
        print(f"{path}: " + ", ".join(sorted({f'{a}->{b}' for a, b in changes})))
        if write:
            with open(path, "w", encoding="utf-8", newline="") as f:
                f.write(new)


main()
