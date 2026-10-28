"""Sound effects, batch 3, v1, 2026-10-28: the moments the app developer found silent.

Synthesized like batches 1 and 2 (38-sound, 39-sound-2), from their building blocks: oscillators,
noise, filters, a small room. The owner's ruling holds: monsters get no voices, so the horde speaks
through its war horn and drums, never a roar.

- Bosses: a boss reaching the gate (the horde's war horn, low and wrong, over drums), a mini-boss
  reaching it (one shorter blast), and a boss or mini-boss falling, on its death strip's frames (8 fps:
  lands at 250 ms, unmade at 375 ms), answered by Draconia's own horn.
- Varn's breath, on his strike strip (6 fps, played twice: rears for 167 ms, then breathes). He breathes
  every 3 seconds, so it is soft and short.
- The claws: sharpening (two whetstone strokes and a ring) and reforging (hammer on anvil, the quench,
  an ember's glow), in place of the stock coin.

Output: out/<name>.wav (44.1 kHz mono 16-bit) and out/<name>.m4a (AAC 96k).
Run: python src/make_sound.py [names...]
"""
import importlib.util
import pathlib
import subprocess
import sys
import wave

import numpy as np

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "38-sound" / "src"))
from make_sound import SR, at, band, bell, decay, finish, lowpass, mix, noise, reverb, tone, ts  # noqa: E402

# Batch 2's blocks (its module shares batch 1's name, so it is loaded under its own)
_spec = importlib.util.spec_from_file_location("sound2", HERE.parent / "39-sound-2" / "src" / "make_sound.py")
sound2 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sound2)
horn, thud, clicks, wobble, chime = sound2.horn, sound2.thud, sound2.clicks, sound2.wobble, sound2.chime

OUT = HERE / "out"
RNG = np.random.default_rng(23)


# --- More building blocks ---------------------------------------------------------------------------

def war_horn(f, d, attack=0.12):
    """The horde's horn: rougher than Draconia's, two pipes a little out of tune, darker."""
    a = horn(f, d, attack)
    b = horn(f * 1.012, d, attack * 1.3)
    return lowpass(a + b * 0.8, 900)


def drum(f=60, d=0.9, tau=0.22):
    """A big war drum, far off: a falling low tone and the skin's slap."""
    return tone(f, f * 0.7, d) * decay(d, tau) + lowpass(noise(d), 350) * decay(d, 0.04) * 0.7


def anvil(d=0.7):
    """A hammer on an anvil: a hard strike and a bright, inharmonic ring."""
    ring = bell([1180, 2830, 3620, 5410, 6930], d, 0.28, [0.6, 1.0, 0.5, 0.35, 0.2])
    hit = band(noise(d), 1500, 9000) * decay(d, 0.006)
    return ring + hit * 0.9


def scrape(d, f0, f1):
    """A blade drawn along a whetstone: a gritty hiss whose color slides from f0 to f1."""
    t = ts(d)
    shape = np.sin(np.pi * t / d) ** 1.2
    grit = band(noise(d), 1200, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t))
    return (grit + tone(f0, f1, d) * 0.12 + clicks(d, 60, 3000, 9000, 0.8)) * shape


def roar(d, lo=150, hi=1800):
    """A burst of flame: a breathy roar that swells and dies, with a few sparks."""
    t = ts(d)
    env = np.sin(np.pi * np.minimum(t / d, 1)) ** 1.5
    body = band(noise(d), lo, hi) * env * wobble(d, 0.7, 1.0, 6)
    low = lowpass(noise(d), 120) * env
    return body + low * 1.2 + clicks(d, 30, 1500, 7000, 1.5) * env


# --- Bosses -----------------------------------------------------------------------------------------

def boss_arrives():
    """A boss at the gate: two drum hits, the war horn's long low call (a tritone, wrong on purpose), a third drum."""
    d = 3.4
    call = mix(2.6, (0, war_horn(73.4, 1.1), 1.0), (1.0, war_horn(103.8, 1.5), 1.0))
    return finish(reverb(mix(d, (0, drum(), 2.4), (0.42, drum(), 2.2), (0.75, call, 0.8),
                             (2.35, drum(55, 1.0, 0.3), 2.6)), wet=0.3, size=1.5))


def miniboss_arrives():
    """A mini-boss at the gate: one drum and one shorter blast of the war horn."""
    d = 2.0
    return finish(reverb(mix(d, (0, drum(), 2.4), (0.3, war_horn(82.4, 1.0), 0.8)), wet=0.25, size=1.3))


def boss_falls():
    """A boss falls, on its death strip: it buckles, lands hard at 250 ms in rubble, is unmade at 375 ms;
    then Draconia's horn answers (the rally horn's notes, held longer)."""
    d = 3.0
    buckle = band(noise(0.25), 200, 1500) * np.linspace(0.2, 1, int(SR * 0.25)) * 0.5
    land = thud(70, 34, 0.9, 0.18, 600)
    rubble = [(0.28 + RNG.uniform(0, 0.6), lowpass(noise(0.1), 1300) * decay(0.1, 0.02), RNG.uniform(0.2, 0.5))
              for _ in range(10)]
    unmade = [(0.375 + i * 0.08, tone(f, f * 0.8, 0.4) * decay(0.4, 0.14), 0.18)
              for i, f in enumerate((1568, 1319, 1047, 880, 784))]
    answer = mix(1.9, (0, horn(196.0, 0.35), 1.0), (0.38, horn(293.7, 0.45), 1.0), (0.85, horn(392.0, 1.05), 1.0),
                 (0.85, horn(293.7, 1.05), 0.5))
    return finish(reverb(mix(d, (0, buckle, 1.0), (0.25, land, 1.3), *rubble, *unmade, (1.0, answer, 0.75)),
                         wet=0.25, size=1.3))


# --- Varn -------------------------------------------------------------------------------------------

def varn_breath():
    """Varn's breath: a quick draw of air while he rears (167 ms), then a short burst of flame."""
    d = 0.8
    t = ts(0.17)
    draw = band(noise(0.17), 600, 3000) * (t / 0.17) ** 2 * 0.35
    # Mastered soft: it comes every 3 seconds
    return finish(mix(d, (0, draw, 1.0), (0.17, roar(0.55), 1.0)), 0.45)


# --- The claws --------------------------------------------------------------------------------------

def claw_sharpen():
    """Sharpening the claws: two strokes on the whetstone, the second higher, then the edge rings."""
    d = 1.2
    ring = bell([2794, 4186, 5588], 0.8, 0.3, [0.5, 0.35, 0.2])
    return finish(mix(d, (0, scrape(0.28, 1800, 3200), 0.9), (0.32, scrape(0.3, 2200, 4200), 1.0),
                      (0.6, ring, 0.6)), 0.8)


def claw_reforge():
    """Reforging the claws: three hammer blows on the anvil, the quench's hiss, then an ember's warm glow."""
    d = 2.6
    hiss = band(noise(0.9), 2500, 10000) * np.exp(-ts(0.9) / 0.35) * np.minimum(ts(0.9) / 0.02, 1)
    glow = sum(tone(f, f, 1.4, "tri") for f in (130.8, 196.0, 261.6)) * np.sin(np.pi * ts(1.4) / 1.4) ** 2 * 0.3
    sparkle = chime([1568.0, 2093.0, 2637.0], 0.09, 0.3, gain=0.25)
    return finish(reverb(mix(d, (0, anvil(), 0.8), (0.26, anvil(), 0.85), (0.52, anvil(), 1.0),
                             (0.9, hiss, 0.6), (1.1, glow, 1.0), *[(1.2 + a, b, c) for a, b, c in sparkle]),
                         wet=0.2))


SOUNDS = {
    "sfx_boss-arrives": boss_arrives, "sfx_miniboss-arrives": miniboss_arrives, "sfx_boss-falls": boss_falls,
    "sfx_varn-breath": varn_breath, "sfx_claw-sharpen": claw_sharpen, "sfx_claw-reforge": claw_reforge,
}


def write(name, x):
    OUT.mkdir(exist_ok=True)
    path = OUT / f"{name}.wav"
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-c:a", "aac", "-b:a", "96k",
                    str(OUT / f"{name}.m4a")], check=True)
    return len(x) / SR


def main():
    only = set(sys.argv[1:])
    for name, f in SOUNDS.items():
        if not only or name in only:
            print(f"{name}: {write(name, f()):.2f} s")


if __name__ == "__main__":
    main()
