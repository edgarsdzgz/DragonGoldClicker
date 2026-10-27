"""Build the regulars board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

GROUPS = [
    ("Beasts and the dead", [
        ("war-hound", "War Hound", "A lean, scarred dog of the horde: tall pointed ears, a long snout snarling, "
                                   "a spiked steel collar. Hurt, it loses the collar's spikes."),
        ("skeleton", "Skeleton", "A soldier the Unmaking raised: a bare skull, an open ribcage, a rusted sword, "
                                 "a rotted round shield."),
        ("spectral-hound", "Spectral Hound", "The Wraith's hound: the War Hound's shape in the Wraith's pale "
                                             "steel, jaws open in a howl, legs fading into wisps."),
    ]),
    ("The Wind-Taken and the cult", [
        ("nomad-scout", "Nomad Scout", "A pointed brown hood, a cloak flaring in the wind, a face wrap, a javelin."),
        ("nomad-archer", "Nomad Archer", "The Nomad Warrior's fur hood and face wrap, a recurve bow, a quiver "
                                         "over the shoulder."),
        ("cult-apprentice", "Cult Apprentice", "A young cultist below the Ember Prophet: a plain hood, an open "
                                               "book in ash-gray hands, smoke rising off it. Hurt, the smoke goes out."),
    ]),
]


def monster(mid, name, note):
    n = f"mob_{mid}"
    return section(name, note, [
        fig(OUT / f"{n}_idle.png", 5, "idle"), fig(OUT / f"{n}_hit.png", 5, "hit"),
        fig(OUT / f"{n}_hurt.png", 5, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
        gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
        fig(OUT / f"{n}-strong_idle.png", 5, "strong"), fig(OUT / f"{n}-stronger_idle.png", 5, "stronger")])


sections = []
for group, items in GROUPS:
    sections.append(f"<h2 style='margin-top:12px'>{group}</h2>")
    sections += [monster(*m) for m in items]
sections.append(section("Beside their kin", "Each new one next to the locked monster it belongs with, to check "
                        "size and family.", [
    fig(OFFICIAL / "mobs" / "mob_kobold_idle.png", 5, "kobold"), fig(OUT / "mob_war-hound_idle.png", 5, "war hound"),
    fig(OFFICIAL / "mobs" / "mob_wraith_idle.png", 5, "wraith"),
    fig(OUT / "mob_spectral-hound_idle.png", 5, "spectral hound"),
    fig(OFFICIAL / "mobs" / "mob_nomad-warrior_idle.png", 5, "nomad warrior"),
    fig(OUT / "mob_nomad-scout_idle.png", 5, "scout"), fig(OUT / "mob_nomad-archer_idle.png", 5, "archer"),
    fig(OFFICIAL / "mobs" / "mob_ember-prophet_idle.png", 5, "ember prophet"),
    fig(OUT / "mob_cult-apprentice_idle.png", 5, "apprentice")]))

out = page("Bestiary Regulars", "The bestiary, batch 1 of 3: regular monsters",
           "Six regular monsters, drawn and built exactly like the locked bestiary: shaded from the upper left, "
           "no blending, idle, hit, hurt, walk and death at all three Unmaking tiers. Cracks are long from the "
           "start, so they read. Next: batch 2, the elites; batch 3, the bosses. &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
