"""Draft a 12x12 wheat ear: herringbone kernels on a stem, awns, a leaf. Prints a .px grid."""
W = H = 12
g = [["." for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    g[y][x] = c


# Tip kernel and the taper into the ear.
put(6, 1, "H")
for x, c in zip(range(5, 8), "HKk"):
    put(x, 2, c)
# Herringbone: left kernels start on odd rows, right kernels on even rows; stem down the middle.
for y in range(3, 9):
    put(6, y, "s")
    left_top = (y - 3) % 2 == 0
    for x, c in zip(range(3, 6), "HKK" if left_top else "Kkk"):
        put(x, y, c)
    for x, c in zip(range(7, 10), "Kkk" if left_top else "HKk"):
        put(x, y, c)
# Taper at the base of the ear.
for x, c in zip(range(4, 9), "Kks" + "Kk"):
    put(x, 9, c)
put(6, 9, "s")
put(6, 10, "s")  # stem
# Outline every filled region.
filled = {(x, y) for y in range(H) for x in range(W) if g[y][x] != "."}
for y in range(H):
    for x in range(W):
        if (x, y) not in filled and any((x + dx, y + dy) in filled
                                        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            g[y][x] = "a"
# Awns: ink bristles angled up and out from the kernel tips.
for x, y in ((1, 3), (0, 2), (1, 5), (0, 4), (1, 7), (10, 4), (11, 3), (10, 6), (11, 5), (10, 8)):
    g[y][x] = "a"
for row in g:
    print("".join(row))
