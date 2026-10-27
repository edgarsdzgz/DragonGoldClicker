"""Warden head study V5: V4 plus the real-animal details.

Runs head_v4.py up to its outline pass, then adds:
1. reptile scales by region: crown plates, a lip-scale row, sparse scale
   arcs on the shadow side of the cheek and neck
2. an ear opening behind the jaw hinge, skin folds where head meets neck
3. reptile teeth: interlocking conical rows with a few larger ones
4. a hooked snout tip and a raised nostril bump
5. growth rings along the horns
"""
import os
import sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else "v5.png"
src = open(os.path.join(HERE, "head_v4.py"), encoding="utf-8").read()
MARK = "# ---- lit edges take a warmer outline"
pre, post = src.split(MARK)
ns = {"__name__": "v5"}
sys.argv = [sys.argv[0], OUT]
exec(compile(pre, "head_v4.py", "exec"), ns)

lab = ns["lab"]
poly, fill, px, dilate = ns["poly"], ns["fill"], ns["px"], ns["dilate"]
head, jaw, mouth, neck, h1, horn2 = (ns[k] for k in
                                     ("head", "jaw", "mouth", "neck", "h1", "horn2"))
H, W = lab.shape


def recolour(x, y, mapping):
    if 0 <= x < W and 0 <= y < H and lab[y, x] in mapping:
        lab[y, x] = mapping[lab[y, x]]


def arc(x, y, mapping):
    """A small scale: a three-pixel arch, one shade darker than its ground."""
    for dx, dy in ((0, 0), (1, -1), (2, 0)):
        recolour(x + dx, y + dy, mapping)


DARKER = {"c": "b", "b": "a", "d": "c"}

# ---- 3. rebuild the mouth, then reptile teeth -------------------------------
fire = poly([(19, 32), (28, 31), (22, 36)])
for y in range(H):
    for x in range(W):
        if mouth[y, x] and not head[y, x] and not jaw[y, x]:
            lab[y, x] = "r" if fire[y, x] else "q"
ring = (dilate(head) | dilate(jaw)) & mouth & ~head & ~jaw
lab[ring] = "O"
# upper row hangs from the gum; lengths vary, two are enlarged
for x, n in ((9, 1), (11, 3), (13, 1), (15, 2), (17, 1), (19, 2), (21, 1)):
    top = next(y for y in range(H) if head[y, x]) if head[:, x].any() else None
    gum = max(y for y in range(H) if head[y, x]) + 1
    for i in range(n):
        lab[gum + i, x] = "l" if (n >= 3 and i == n - 1) else "m"
# lower row stands on the jaw, set between the upper teeth so they interlock
for x, n in ((10, 1), (12, 2), (14, 1), (16, 2), (18, 1), (20, 1), (22, 1)):
    gum = min(y for y in range(H) if jaw[y, x]) - 1
    for i in range(n):
        lab[gum - i, x] = "m"

# ---- 4. hooked snout tip and a raised nostril -------------------------------
hook = poly([(5, 29), (8, 31), (8, 33), (6, 32)])
hring = dilate(hook) & ~hook & ~head & ~jaw
for y, x in zip(*np.nonzero(hring)):
    if lab[y, x] in (".", "q", "r", "O"):
        lab[y, x] = "O"
lab[hook] = "b"
px("c", (6, 30), (7, 31))
bump = poly([(9, 24), (12, 23), (13, 24)])
for y, x in zip(*np.nonzero(dilate(bump) & ~bump & ~head)):
    if lab[y, x] == ".":
        lab[y, x] = "O"
lab[bump] = "d"
px("e", (10, 23), (11, 23))
px("a", (10, 25), (11, 25))          # nostril on the bump
px("d", (10, 27), (11, 27))           # the old nostril becomes lit snout
px("d", (10, 28))

# ---- 1. scales by region ---------------------------------------------------
# crown and brow: a few large plates, seams one shade darker than the plate
for x0, ys in ((28, (12, 13, 14)), (33, (12, 13, 14)), (37, (13, 14)),
               (24, (14, 15))):
    for y in ys:
        recolour(x0, y, DARKER)
for x in range(29, 33):
    recolour(x, 14, DARKER)
# lip scales: a row of small rectangular scales along the upper jaw
for x in range(9, 25):
    y = max(yy for yy in range(H) if head[yy, x]) - 1
    if x % 3 == 0:
        recolour(x, y, DARKER)
        recolour(x, y + 1 if lab[y + 1, x] in DARKER else y, {})
    recolour(x, y - 1, {"c": "b", "d": "c"})
# sparse scale arcs on the shadow side, densest at the terminator
for x, y in ((49, 31), (51, 35), (53, 39), (52, 44), (55, 47), (56, 52),
             (57, 57), (54, 60), (31, 31), (34, 32), (37, 32), (44, 37)):
    arc(x, y, DARKER)

# ---- 2. ear opening and skin folds -------------------------------------------
px("a", (40, 28), (42, 28), (40, 30))
px("O", (41, 28), (41, 29), (42, 29))
px("b", (41, 27))
for fold in (((39, 38), (40, 39), (41, 39), (42, 39)),
             ((40, 41), (41, 42), (42, 42), (43, 42)),
             ((42, 44), (43, 45), (44, 45))):
    for x, y in fold:
        recolour(x, y, {"c": "b", "d": "c", "e": "d", "b": "a"})

# ---- 5. growth rings along the horns ----------------------------------------
def rings(mask, root, tip, ts):
    (rx, ry), (tx, ty) = root, tip
    dx, dy = tx - rx, ty - ry
    ln = (dx * dx + dy * dy) ** 0.5
    nx, ny = -dy / ln, dx / ln
    for t in ts:
        cx, cy = rx + dx * t, ry + dy * t
        for s in np.arange(-4, 4.01, 0.5):
            x, y = int(round(cx + nx * s)), int(round(cy + ny * s))
            if 0 <= x < W and 0 <= y < H and mask[y, x]:
                recolour(x, y, {"m": "l", "l": "k", "k": "j"})


# closer together at the root, wider toward the tip
rings(h1, (38, 13), (58, 0), (0.12, 0.22, 0.33, 0.46, 0.62))
rings(horn2, (44, 18), (63, 8), (0.14, 0.28, 0.45, 0.64))

# ---- finish with V4's outline pass and save ----------------------------------
exec(compile(MARK + post, "head_v4.py", "exec"), ns)
