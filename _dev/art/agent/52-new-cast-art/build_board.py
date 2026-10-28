"""Build the chapters 9 to 13 art board. Run after src/make_art.py. Output: board.html."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
OFFICIAL = HERE.parent.parent / "official"
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
CHAPTERS = [("small-wings", "9. A Small Pair of Wings", "A small dragon circling the Keep by day."),
            ("she-did-not-ask", "10. She Did Not Ask", "The wall cracking; Sera at the front of it, shield up."),
            ("the-exile", "11. The Exile", "The eastern ruins at dusk: a monster on fire, and the mage who set it so."),
            ("the-eldest", "12. The Eldest", "Something vast comes down over the Keep."),
            ("hollow-knight", "13. The Hollow Knight", "A boss fallen on the field; a lone knight walks up to the gate.")]
FIGURES = [("ppl_varn_flying", "Varn, flying"), ("ppl_sera", "Sera"), ("ppl_thornwick", "Thornwick"),
           ("ppl_hollow-knight", "The Hollow Knight"), ("ppl_hollow-knight_walk", "walking"),
           ("ppl_ashara_flying", "Ashara")]
# The fighters' slots and the wall walk (src/art/wall.ts); Varn perches on the gatehouse tower between them
WALL_SLOTS, WALL_WALK, FIGHTER_H = [24, 96, 4, 113], 12, 20
VARN_AT = (59, 6)


def png(name):
    return Image.open(OUT / f"{name}_v1.png").convert("RGBA")


def on_wall(varn):
    """The gate at night with its four fighters and Varn on the tower (his feet on the tower's top)."""
    img = Image.new("RGBA", (130, 72), (28, 24, 40, 255))
    img.alpha_composite(Image.open(OFFICIAL / "warfront" / "map_gate_sound.png").convert("RGBA"), (0, 12))
    fighter = Image.open(OFFICIAL / "people" / "ppl_fighter_idle.png").convert("RGBA")
    for x in WALL_SLOTS:
        img.alpha_composite(fighter, (x, 12 + WALL_WALK - FIGHTER_H))
    img.alpha_composite(varn, (VARN_AT[0], 12 + VARN_AT[1] - varn.height + 1))
    return img


idle, breath = png("ppl_varn_idle"), png("ppl_varn_breath_strip2")
w = breath.width // 2
rear, fire = breath.crop((0, 0, w, breath.height)), breath.crop((w, 0, 2 * w, breath.height))
frames = [on_wall(f) for f in (idle, rear, fire, fire, idle)]
gif = PREVIEW / "varn_on_wall.gif"
frames[0].save(gif, save_all=True, append_images=frames[1:], duration=[900, 160, 160, 160, 900], loop=0, disposal=2)

fighter = Image.open(OFFICIAL / "people" / "ppl_fighter_idle.png").convert("RGBA")
sections = [
    section("The story pictures", "130x96, like every story picture, built from the locked city and Warfront. "
            "No protagonist dragon is drawn.",
            [fig(png(f"story_{n}"), 4, f"{title}: {what}") for n, title, what in CHAPTERS]),
    section("Varn on the wall", "Chapter 9 brings him: he perches on the gatehouse tower between the fighters and "
            "strikes on his own. He rears, then breathes fire up at the field.",
            [gif_fig(gif, 5, "on the wall, striking"), fig(on_wall(idle), 5, "perched"),
             fig(idle, 8, "ppl_varn_idle"), fig(breath, 8, "ppl_varn_breath_strip2: rear, breathe")]),
    section("The figures", "At the people's scale; a fighter of the wall beside them for size. Ashara is vast, "
            "far bigger than the people.",
            [fig(png(n), 6, label) for n, label in FIGURES] + [fig(fighter, 6, "a fighter, for scale")]),
]
out = page("Chapters 9 to 13 Art", "Chapters 9 to 13: pictures and figures",
           "The art for the five approved chapters: a story picture for each, the newcomers as small figures, "
           "and Varn on the Warfront wall, who strikes on his own. &middot; v1, 2026-10-28", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
