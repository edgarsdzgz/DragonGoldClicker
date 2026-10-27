"""Print each bust's cells as a grid of palette names (rows 3-17), to design the expression edits."""
import importlib.util
import pathlib
import sys

AGENT = pathlib.Path(__file__).resolve().parents[2]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


simple = load("make_busts", AGENT / "31-busts-simple" / "src" / "make_busts.py")
more = load("busts_more", AGENT / "35-busts-more" / "src" / "make_busts.py")
Bust, W = simple.Bust, simple.W
_image = Bust.image


def cells_of(draw):
    Bust.image = lambda self: self
    try:
        return draw()
    finally:
        Bust.image = _image


DRAWS = {"pyreth": simple.pyreth, "rodain": simple.rodain, "mirael": simple.mirael, "kael": simple.kael,
         "lirae": simple.lirae, "varn": more.varn, "ashara": more.ashara, "thornwick": more.thornwick_v3,
         "sera": more.sera_v2, "hollow-knight": more.hollow_knight}

if __name__ == "__main__":
    only = sys.argv[1:] or list(DRAWS)
    for bid in only:
        b = cells_of(DRAWS[bid])
        names = sorted({c for c in b.cells.values()})
        code = {n: (chr(ord("a") + i) if i < 26 else chr(ord("A") + i - 26)) for i, n in enumerate(names)}
        print(f"== {bid}  W={W}  " + " ".join(f"{v}={k}" for k, v in code.items()))
        print("    " + "".join(str(x % 10) for x in range(W)))
        for y in range(3, 18):
            print(f"{y:3} " + "".join(code.get(b.cells.get((x, y)), ".") for x in range(W)))
