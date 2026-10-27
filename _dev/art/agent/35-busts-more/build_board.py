"""Build the future busts board. Run after src/make_busts.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402

OUT = HERE / "out"
VERSION = {"thornwick": "v2", "sera": "v2"}
CAST = HERE.parents[1] / "official" / "cast"
BUSTS = [
    ("varn", "Varn, Dragon Recruit", "A young dragon, barely fledged: a big head, wing nubs, wide eyes, and "
     "a wooden practice sword. \"I want to fight like you.\""),
    ("ashara", "Ashara, Elder Wyrm", "Ancient, tired, angry: ash-gray scales, one horn broken off, an old "
     "wound, the brow drawn down over burning eyes, fire behind her teeth, smoke rising."),
    ("thornwick", "Thornwick, the Exiled Mage (v2: a gnome)", "Wry and reckless, now a gnome: small under a "
     "huge hat, ears out to the sides, a round nose, a white beard with singed ends, goggles on the hat band, "
     "a spark in his hand."),
    ("sera", "Sera the Shieldmaiden (v2: bearfolk)", "The old guard, now bearfolk: round ears beside a small "
     "helm, a broad snout gone gray with age, fur braids, mail, and her round shield."),
    ("hollow-knight", "The Hollow Knight", "Nothing shows through the visor, by design. A great helm with a "
     "dent, a black plume, a torn cloak."),
]


def png(bid, v=None):
    return OUT / f"bust_{bid}_{v or VERSION.get(bid, 'v1')}.png"


sections = [section(name, note, [fig(png(bid), 2, "in game (x2)"), fig(png(bid), 8, "detail (x8)")] +
                    ([fig(png(bid, "v1"), 8, "v1, human (x8)")] if bid in VERSION else []))
            for bid, name, note in BUSTS]
sections.append(section("Beside the locked cast", "The five new busts, then the five locked ones, all at x4.",
                        [fig(png(bid), 4, bid) for bid, _, _ in BUSTS] +
                        [fig(CAST / f"bust_{n}.png", 4, n) for n in ("pyreth", "rodain", "mirael", "kael", "lirae")]))

out = page("Draconia Future Busts", "Five more busts",
           "Varn, Ashara, Thornwick, Sera and the Hollow Knight, in the locked simpler style: 22x23, shown at "
           "x2, light from the upper left. Drawn from their Unique Recruit entries in the design doc. v2: "
           "Thornwick is a gnome and Sera is bearfolk, peoples no bust or townsfolk sprite uses yet (v1, both "
           "human, is on board_v1.html) &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
