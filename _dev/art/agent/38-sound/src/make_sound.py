"""Sound effects, v1, 2026-10-27: synthesized here from oscillators and noise (no samples, no generators).

The app already plays bought UI sounds (assets/music: coins, taps, chords, weapon hits). These cover what
has no sound yet, timed to the locked art:
- The studio splash, beat by beat from official/studio/seal_build_timing.json (slam, the three
  medallions, etch, slash, spread, smash), and the whole splash as one track.
- A monster's death, on its strip's frames (8 fps: squash, fall, land at 250 ms, unmade at 375 ms).
- The wall struck, the Breach, a building finished, the heartstone's pulse.

Output: out/<name>.wav (44.1 kHz mono 16-bit) and out/<name>.m4a (AAC, as assets/music/out uses).
Run: python src/make_sound.py
"""
import json
import pathlib
import subprocess
import wave

import numpy as np

HERE = pathlib.Path(__file__).resolve().parents[1]
OFFICIAL = HERE.parents[1] / "official"
OUT = HERE / "out"
SR = 44100
RNG = np.random.default_rng(7)


# --- Building blocks --------------------------------------------------------------------------------

def silence(d):
    return np.zeros(int(SR * d))


def ts(d):
    return np.arange(int(SR * d)) / SR


def decay(d, tau, attack=0.002):
    """A fast rise, then an exponential fall with time constant tau."""
    t = ts(d)
    return np.minimum(t / attack, 1.0) * np.exp(-t / tau)


def tone(f0, f1, d, wave="sine"):
    """An oscillator gliding from f0 to f1 (exponentially) over d seconds."""
    t = ts(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if wave == "square":
        return np.sign(np.sin(ph))
    if wave == "tri":
        return 2 / np.pi * np.arcsin(np.sin(ph))
    return np.sin(ph)


def noise(d):
    return RNG.uniform(-1, 1, int(SR * d))


def lowpass(x, fc):
    """One-pole low-pass; fc is a number or an array (a sweep)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def band(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def bell(freqs, d, tau, amps=None):
    """Inharmonic partials, each fading a little faster than the one below it."""
    amps = amps or [1 / (i + 1) for i in range(len(freqs))]
    return sum(a * tone(f, f, d) * decay(d, tau / (1 + i * 0.4)) for i, (f, a) in enumerate(zip(freqs, amps)))


def at(t, x, total):
    """Place x starting at t seconds in a track of `total` seconds."""
    out = np.zeros(int(SR * total))
    i = int(SR * t)
    n = min(len(x), len(out) - i)
    out[i:i + n] = x[:n]
    return out


def mix(total, *parts):
    """parts: (start seconds, signal, gain)."""
    return sum(at(t, x * g, total) for t, x, g in parts)


def reverb(x, wet=0.25, size=1.0):
    """A small Schroeder room: four combs in parallel, two allpasses after."""
    tail = np.concatenate([x, silence(1.2 * size)])
    out = np.zeros_like(tail)
    for ms, g in ((29.7, 0.77), (37.1, 0.75), (41.1, 0.73), (43.7, 0.71)):
        dl = int(SR * ms / 1000 * size)
        buf = tail.copy()
        for i in range(dl, len(buf)):
            buf[i] += g * buf[i - dl]
        out += buf
    out /= 4
    for ms, g in ((5.0, 0.7), (1.7, 0.7)):
        dl = int(SR * ms / 1000)
        y = np.zeros_like(out)
        for i in range(len(out)):
            xd = out[i - dl] if i >= dl else 0.0
            yd = y[i - dl] if i >= dl else 0.0
            y[i] = -g * out[i] + xd + g * yd
        out = y
    return (1 - wet) * tail + wet * out


def finish(x, peak=0.89):
    x = x / (np.max(np.abs(x)) or 1) * peak
    fade = min(len(x), int(SR * 0.01))
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


# --- The studio splash ------------------------------------------------------------------------------

def slam():
    """The seal's plates slam together: a low thud, a slap, a rattle of metal."""
    d = 0.7
    thud = tone(90, 42, d) * decay(d, 0.16)
    slap = lowpass(noise(d), 900) * decay(d, 0.04)
    rattle = bell([930, 1370, 2210, 3020], d, 0.2) * 0.2
    return finish(thud + slap * 1.4 + rattle)


def medallion(pitch=1.0):
    """A medallion settles into place: a small, bright clink."""
    d = 0.6
    tick = band(noise(d), 2000, 8000) * decay(d, 0.006)
    return finish(bell([2100 * pitch, 3170 * pitch, 4730 * pitch, 5810 * pitch], d, 0.18) + tick * 0.6, 0.7)


def etch(d):
    """The runes are etched in arcane blue: a fine scraping hiss under a faint, steady glow."""
    t = ts(d)
    swell = np.minimum(t / 0.15, 1) * np.minimum((d - t) / 0.2, 1)
    scrape = band(noise(d), 1800, 5000) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2)
    glow = (tone(880, 880, d) + 0.5 * tone(1318, 1318, d)) * 0.15
    return finish((scrape * 0.7 + glow) * swell, 0.6)


def slash(d):
    """The name is cut in gold: a fast swoosh, then the blade's ring hanging on."""
    sweep = lowpass(noise(d), np.geomspace(7000, 600, int(SR * d))) * decay(d, 0.09, 0.01)
    ring = bell([2637, 3951, 5274], d, 0.35) * 0.35
    return finish(sweep * 1.6 + at(0.06, ring, d))


def spread(d):
    """Gold runs out from the cut: notes rising quickly, a little sparkle over them."""
    notes = [1046.5, 1318.5, 1568.0, 2093.0, 2637.0]
    step = d / (len(notes) + 2)
    parts = [(i * step, tone(f, f, 0.5, "tri") * decay(0.5, 0.18), 0.5) for i, f in enumerate(notes)]
    sparkle = band(noise(d), 5000, 11000) * np.linspace(0, 1, int(SR * d)) * 0.25
    return finish(mix(d + 0.4, *parts, (0, sparkle, 1)), 0.7)


def smash():
    """The seal smashes to gold: an impact, a deep boom, and a bright ring that fades in the room."""
    d = 2.0
    hit = lowpass(noise(d), 2600) * decay(d, 0.07)
    boom = tone(80, 38, d) * decay(d, 0.45)
    ring = bell([1046.5, 1568.0, 2093.0, 3136.0], d, 0.9, [0.5, 0.4, 0.3, 0.2])
    return finish(reverb(hit * 1.3 + boom + ring * 0.5, wet=0.3, size=1.3))


def splash_beats():
    """Each beat's start in seconds, and how long each span lasts, from the splash's timing file."""
    timing = json.loads((OFFICIAL / "studio" / "seal_build_timing.json").read_text())
    ms, beats = timing["ms"], timing["beats"]
    start = {k: sum(ms[:i]) / 1000 for k, i in beats.items()}
    return start, sum(ms) / 1000


# --- The Warfront and the city ----------------------------------------------------------------------

def monster_death():
    """On the death strip's frames: squash (0), fall (125 ms), land in dust (250), unmade (375)."""
    total = 1.0
    squeal = lowpass(tone(520, 140, 0.24, "square"), 1800) * decay(0.24, 0.12, 0.005)
    thud = tone(110, 50, 0.3) * decay(0.3, 0.07)
    dust = lowpass(noise(0.25), 1100) * decay(0.25, 0.05)
    glints = [(0.375 + i * 0.07, tone(f, f * 0.8, 0.3) * decay(0.3, 0.1), 0.18)
              for i, f in enumerate((1760, 1480, 1245, 988))]
    return finish(mix(total, (0, squeal, 0.45), (0.25, thud, 1.0), (0.25, dust, 0.6), *glints))


def wall_hit():
    """A monster strikes the wall: stone on stone, and a little grit falling."""
    total = 0.6
    knock = lowpass(noise(0.2), 1500) * decay(0.2, 0.03)
    body = tone(130, 75, 0.25) * decay(0.25, 0.06)
    grit = [(0.06 + RNG.uniform(0, 0.3), band(noise(0.02), 1500, 5000) * decay(0.02, 0.004), 0.25)
            for _ in range(9)]
    return finish(mix(total, (0, knock, 1.0), (0, body, 0.8), *grit), 0.8)


def breach():
    """The wall falls: a crack, a long rumble, stones landing one after another."""
    total = 2.6
    crack = band(noise(0.15), 800, 6000) * decay(0.15, 0.025)
    rumble = lowpass(noise(2.2), 260) * np.minimum(ts(2.2) / 0.2, 1) * np.exp(-ts(2.2) / 0.8)
    boom = tone(60, 32, 1.5) * decay(1.5, 0.4)
    stones = [(0.2 + RNG.uniform(0, 1.4), lowpass(noise(0.12), 1200) * decay(0.12, 0.025),
               RNG.uniform(0.3, 0.7)) for _ in range(12)]
    return finish(reverb(mix(total, (0, crack, 0.8), (0.05, rumble, 2.5), (0.05, boom, 1.0), *stones),
                         wet=0.2))


def build_complete():
    """A building finished: three hammer taps, then a warm chord."""
    total = 1.6
    tap = bell([1850, 2780], 0.25, 0.05) + lowpass(noise(0.25), 700) * decay(0.25, 0.015)
    chord = sum(tone(f, f, 1.0, "tri") for f in (523.3, 659.3, 784.0))
    chord *= np.minimum(ts(1.0) / 0.08, 1) * np.exp(-ts(1.0) / 0.35)
    return finish(mix(total, (0, tap, 0.6), (0.16, tap, 0.6), (0.32, tap, 0.8), (0.5, chord, 0.35)))


def heartstone():
    """The heartstone's pulse: a soft, low bloom."""
    d = 1.0
    t = ts(d)
    env = np.minimum(t / 0.12, 1) * np.exp(-t / 0.3)
    body = (tone(196, 196, d) + 0.5 * tone(294, 294, d) + 0.15 * tone(588, 588, d)) * env
    return finish(body, 0.6)


def write(name, x):
    OUT.mkdir(exist_ok=True)
    path = OUT / f"{name}.wav"
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-c:a", "aac", "-b:a", "96k",
                    str(OUT / f"{name}.m4a")], check=True)
    return len(x) / SR


def main():
    start, length = splash_beats()
    beats = {
        "splash_slam": slam(),
        "splash_medallion-top": medallion(1.0),
        "splash_medallion-left": medallion(1.12),
        "splash_medallion-right": medallion(1.26),
        "splash_etch": etch(start["etched"] - start["etch"]),
        "splash_slash": slash(start["spread"] - start["slash"]),
        "splash_spread": spread(start["smash"] - start["spread"]),
        "splash_smash": smash(),
    }
    when = {"splash_slam": "slam", "splash_medallion-top": "medallion_top", "splash_medallion-left":
            "medallion_left", "splash_medallion-right": "medallion_right", "splash_etch": "etch",
            "splash_slash": "slash", "splash_spread": "spread", "splash_smash": "smash"}
    full = finish(mix(length + 0.5, *[(start[when[k]], x, 1.0) for k, x in beats.items()]))
    sounds = {**beats, "splash_full": full, "sfx_monster-death": monster_death(), "sfx_wall-hit": wall_hit(),
              "sfx_breach": breach(), "sfx_build-complete": build_complete(), "sfx_heartstone": heartstone()}
    for name, x in sounds.items():
        print(f"{name}: {write(name, x):.2f} s")
    (OUT / "splash_beats.json").write_text(json.dumps({when[k]: round(start[when[k]], 3) for k in beats},
                                                      indent=2))


if __name__ == "__main__":
    main()
