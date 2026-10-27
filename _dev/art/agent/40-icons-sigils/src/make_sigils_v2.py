"""Sigils v2, 2026-10-27: Varn's egg with a vertical crack, and new quills for Lirae.

Owner, on v1: "Let's make the crack in the cracked egg look more vertical than horizontal, i think that will
read more like a crack." And: "Lirae's quill doesn't read like a quill to me." The locked quill
(official/cast/cast_sigil-lirae.png) stays; these are options to replace it.

What the owner's reference sheet of pixel quills has in common, and these use: a diagonal, nib low left
and tip high right; a shaft line in a contrasting color the whole length; the vane wider on the upper side
with notched edges; a bare, dark nib past the vane. Some add an ink stroke under the nib (option c).
Lirae's colors are ink blue, pale blue and spectacle gold.

Output: out/cast_sigil-varn_v2[a|b].png, out/cast_sigil-lirae_v2[a|b|c|d].png. Run: python src/make_sigils_v2.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
from make_icons import OUT, PREVIEW, grid, upscale  # noqa: E402

EGG = {"L": "emerald3", "M": "emerald2", "m": "emerald1", "k": "ink"}

SIGILS = {
    # The crack runs down from the top of the shell, zigzagging, and stops short of the bottom.
    "cast_sigil-varn_v2a": (["..........",
                             "....Lk....",
                             "...LMkM...",
                             "..LMkMMm..",
                             ".LMMkMMMm.",
                             ".LMMMkMMm.",
                             ".LMMkMMMm.",
                             "..MMMMMm..",
                             "...mmmm...",
                             ".........."], EGG),
    # The same, with a chip broken out of the top where the crack starts.
    "cast_sigil-varn_v2b": (["..........",
                             "....L.....",
                             "...LM.k...",
                             "..LMMkMm..",
                             ".LMMkMMMm.",
                             ".LMMMkMMm.",
                             ".LMMkMMMm.",
                             "..MMMkMm..",
                             "...mmmm...",
                             ".........."], EGG),
    # a: a pale blue feather, a white shaft, notched upper edge, an ink-dark nib.
    "cast_sigil-lirae_v2a": (["..........",
                              "......vVV.",
                              ".....vVVs.",
                              "....v.VsB.",
                              "...vVVsBB.",
                              "...VVsBB..",
                              "....sBB...",
                              "...s......",
                              "..n.......",
                              ".........."],
                             {"v": "azure4", "V": "azure3", "s": "steel5", "B": "azure2", "n": "night1"}),
    # b: longer and slimmer, the shaft running right to the tip, two notches.
    "cast_sigil-lirae_v2b": ([".......Vs.",
                              "......VsB.",
                              ".....v.B..",
                              "....VVsB..",
                              "...V.sB...",
                              "...VsBB...",
                              "...sB.....",
                              "..s.......",
                              ".n........",
                              ".........."],
                             {"v": "azure4", "V": "azure3", "s": "steel5", "B": "azure2", "n": "night1"}),
    # c: a: with a stroke of ink written under the nib.
    "cast_sigil-lirae_v2c": (["......vVV.",
                              ".....vVVs.",
                              "....v.VsB.",
                              "...vVVsBB.",
                              "...VVsBB..",
                              "....sBB...",
                              "...s......",
                              "..n.......",
                              ".n..kkk.k.",
                              ".........."],
                             {"v": "azure4", "V": "azure3", "s": "steel5", "B": "azure2", "n": "night1", "k": "azure1"}),
    # d: the classic white quill (cream vane, gray shaft), for comparison with the blue.
    "cast_sigil-lirae_v2d": (["..........",
                              "......vVV.",
                              ".....vVVs.",
                              "....v.VsB.",
                              "...vVVsBB.",
                              "...VVsBB..",
                              "....sBB...",
                              "...s......",
                              "..n.......",
                              ".........."],
                             {"v": "steel5", "V": "parch3", "s": "steel2", "B": "parch2", "n": "night1"}),
}


def main():
    for name, (rows, key) in SIGILS.items():
        img = grid(rows, key)
        img.save(OUT / f"{name}.png")
        upscale(img, 8).save(PREVIEW / f"{name}_x8.png")
    print(len(SIGILS), "sigils")


if __name__ == "__main__":
    main()
