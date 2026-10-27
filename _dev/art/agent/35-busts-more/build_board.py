"""Build the future busts board. Run after src/make_busts.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402

OUT = HERE / "out"
CAST = HERE.parents[1] / "official" / "cast"
BUSTS = [
    ("varn", "Varn, Dragon Recruit", "A young dragon, barely fledged: a big head, wing nubs, wide eyes, and "
     "a wooden practice sword. \"I want to fight like you.\""),
    ("ashara", "Ashara, Elder Wyrm", "Ancient, tired, angry: ash-gray scales, one horn broken off, an old "
     "wound, the brow drawn down over burning eyes, fire behind her teeth, smoke rising."),
    ("thornwick", "Thornwick, the Exiled Mage", "Wry and reckless: one brow raised, a singed beard, goggles "
     "on his hat band, a scorched tip on the hat, a spark in his hand."),
    ("sera", "Sera the Shieldmaiden", "The old guard: gray braids, a nose-guard helm, mail, and a round "
     "shield with a gold boss held in front."),
    ("hollow-knight", "The Hollow Knight", "Nothing shows through the visor, by design. A great helm with a "
     "dent, a black plume, a torn cloak."),
]

sections = [section(name, note, [fig(OUT / f"bust_{bid}_v1.png", 2, "in game (x2)"),
                                 fig(OUT / f"bust_{bid}_v1.png", 8, "detail (x8)")])
            for bid, name, note in BUSTS]
sections.append(section("Beside the locked cast", "The five new busts, then the five locked ones, all at x4.",
                        [fig(OUT / f"bust_{bid}_v1.png", 4, bid) for bid, _, _ in BUSTS] +
                        [fig(CAST / f"bust_{n}.png", 4, n) for n in ("pyreth", "rodain", "mirael", "kael", "lirae")]))

out = page("Draconia Future Busts", "Five more busts",
           "Varn, Ashara, Thornwick, Sera and the Hollow Knight, in the locked simpler style: 22x23, shown at "
           "x2, light from the upper left. Drawn from their Unique Recruit entries in the design doc. Sera "
           "and Thornwick could be any people; I drew them human &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
