"""The Stats icon (quill and inkpot), v2 options, 2026-10-27.

Owner: "can we revisit the quill and ink symbol as well, please? The quill should look different but I want
to revise it with this new study." The locked icon_stats.png (08-food-journal) stays until one is chosen.

The study (make_sigils_v2.py, from the owner's reference sheet): a diagonal, the tip high right; a shaft line
in a contrasting color the whole length; a vane wider on the upper side, notched; here the quill stands in
its pot. Different from Lirae's blue quill (the owner's pick, cast_sigil-lirae_v2b) by color:
  a: a white feather with a gray shaft, in a dark glass pot;
  b: a gold feather with a brown shaft, in a blue ink bottle;
  c: a dusky gray-violet feather with a white shaft, in a dark pot.

Output: out/icon_stats_v2[a|b|c].png. Run: python src/make_stats_v2.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
from make_icons import OUT, PREVIEW, grid, upscale  # noqa: E402

ROWS = ["............",
        ".........Vs.",
        "........VsB.",
        "......vVsB..",
        "......VsB...",
        "....VVsB....",
        "...LLsLL....",
        "....NkN.....",
        "..PhPPPPP...",
        "..PhPPPPP...",
        "...pPPPp....",
        "............"]

OPTIONS = {
    "icon_stats_v2a": {"V": "steel5", "v": "steel4", "B": "steel3", "s": "steel2",
                       "L": "steel3", "N": "night3", "k": "ink", "P": "night2", "h": "night4", "p": "night1"},
    "icon_stats_v2b": {"V": "gold5", "v": "gold4", "B": "gold3", "s": "wood2",
                       "L": "steel4", "N": "azure2", "k": "night1", "P": "azure1", "h": "azure3", "p": "night2"},
    "icon_stats_v2c": {"V": "night4", "v": "night3", "B": "night3", "s": "steel5",
                       "L": "steel3", "N": "night3", "k": "ink", "P": "night2", "h": "steel3", "p": "night1"},
}


def main():
    for name, key in OPTIONS.items():
        img = grid(ROWS, key)
        img.save(OUT / f"{name}.png")
        upscale(img, 8).save(PREVIEW / f"{name}_x8.png")
    print(len(OPTIONS), "options")


if __name__ == "__main__":
    main()
