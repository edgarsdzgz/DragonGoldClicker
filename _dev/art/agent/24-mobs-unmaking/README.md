# Mobs marked by the Unmaking (version 2 of 22-mobs)

Owner, 2026-10-27: "our monsters are affected by the unmaking, so they all need the purple cracks
throughout their body. Regardless of the color of their skin."

`src/make_unmade.py` takes each mob's idle from `22-mobs`, lays crack lines over head, body and limbs,
and rebuilds hit, hurt and walk from it. Two looks for the owner to choose from:

- `out/dark/`: magenta2 lines, a magenta3 heart.
- `out/glow/`: magenta3 lines, a magenta4 heart; shines like the eyes.

The raider is a human bandit, not a monster, so it stays uncracked unless the owner says otherwise.
The official mobs are replaced only when the owner approves one look.
