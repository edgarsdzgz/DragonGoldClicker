"""Draft masks for the cog, sheaf and hammer; auto-outline and auto-shade; print grids."""
import sys

N = 12


def grid_from(mask, shade):
    """mask: set of (x, y). shade(x, y, up_left_open, down_right_open) -> letter."""
    rows = []
    for y in range(N):
        row = ""
        for x in range(N):
            if (x, y) in mask:
                ul = (x - 1, y) not in mask or (x, y - 1) not in mask
                dr = (x + 1, y) not in mask or (x, y + 1) not in mask
                row += shade(x, y, ul, dr)
            elif any((x + dx, y + dy) in mask for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                row += "a"
            else:
                row += "."
        rows.append(row)
    return rows


def tone(ul, dr, hi="h", mid="m", lo="s"):
    if ul and not dr:
        return hi
    if dr and not ul:
        return lo
    return mid


# Cog: 8 teeth, 2x2 hole.
cog = set()
for y, xs in {1: [5, 6], 2: [2, 3, 5, 6, 8, 9], 3: range(2, 10), 4: range(3, 9), 5: range(1, 11),
              6: range(1, 11), 7: range(3, 9), 8: range(2, 10), 9: [2, 3, 5, 6, 8, 9],
              10: [5, 6]}.items():
    cog |= {(x, y) for x in xs}
cog -= {(5, 5), (6, 5), (5, 6), (6, 6)}

# Hammer: head along x - y = 4, handle along x + y = 11..12.
ham = set()
for x in range(N):
    for y in range(N):
        if abs(x - y - 4) <= 1 and 6 <= x + y <= 16:
            ham.add((x, y))
        if x + y in (11, 12) and -9 <= x - y <= 2:
            ham.add((x, y))
ham -= {(5, 1)}  # notch the claw end

for name, m in (("cog", cog), ("hammer", ham)):
    print(name)
    for r in grid_from(m, lambda x, y, ul, dr: tone(ul, dr)):
        print(" ", r)
