"""Sound effects, batch 2, v1, 2026-10-27: the list the owner locked in _dev/docs/todo.md.

Synthesized like batch 1 (38-sound), from its building blocks: oscillators, noise, filters, a small
room. The owner's ruling: monsters get no voices (no yips, grunts or roars).

- Warfront: critical hit, ember-claw whoosh, the next monster's footfalls (timed to the walk-up: three
  steps in 350 ms), the gate cracking, the Unmaking rising, the rally horn, mending the wall.
- City: construction starting, the city brightening, research done, an expedition leaving and
  returning, a find, a knock at the gate.
- Forage: food running low, a food raid, the granary full.
- Story: a scene opening, a fanfare, welcome back, stings for Sera, Thornwick and the Hollow Knight.
- Ambient loops (amb_*), 8 seconds each, seamless: Warfront torches, the forge, night wind, horde drums.

Output: out/<name>.wav (44.1 kHz mono 16-bit) and out/<name>.m4a (AAC 96k).
Run: python src/make_sound.py
"""
import pathlib
import subprocess
import sys
import wave

import numpy as np

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "38-sound" / "src"))
from make_sound import SR, at, band, bell, decay, finish, lowpass, mix, noise, reverb, tone, ts  # noqa: E402

OUT = HERE / "out"
RNG = np.random.default_rng(11)
LOOP_S = 8.0


# --- More building blocks ---------------------------------------------------------------------------

def horn(f, d, attack=0.06):
    """A brass horn: a buzzy stack of harmonics, filtered warm, with a slow vibrato."""
    t = ts(d)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(t / 0.3, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(k * ph) / k for k in range(1, 9))
    env = np.minimum(t / attack, 1) * np.minimum((d - t) / 0.12, 1)
    return lowpass(x, 1400) * env


def thud(f0=80, f1=50, d=0.25, tau=0.06, grit=500):
    """Something heavy landing: a falling low tone under a dull slap."""
    return tone(f0, f1, d) * decay(d, tau) + lowpass(noise(d), grit) * decay(d, tau * 0.4) * 0.8


def knock(f=140, d=0.2):
    """A knuckle or mallet on thick wood."""
    return tone(f, f * 0.8, d) * decay(d, 0.035) + lowpass(noise(d), 900) * decay(d, 0.012) * 0.7


def clicks(d, rate, lo=1500, hi=8000, gain=1.0):
    """Sparse random crackles: fire, sparks, grit."""
    x = np.zeros(int(SR * d))
    n = RNG.poisson(rate * d)
    for _ in range(n):
        i = RNG.integers(0, len(x) - 200)
        x[i:i + 200] += RNG.uniform(0.3, 1.0) * np.exp(-np.arange(200) / RNG.uniform(10, 40))
    return band(x * np.sign(RNG.uniform(-1, 1, len(x))), lo, hi) * gain


def wobble(d, lo, hi, points):
    """A smooth random curve between lo and hi, for wind and fire to drift on."""
    xs = np.linspace(0, d, points)
    return np.interp(ts(d), xs, RNG.uniform(lo, hi, points))


def loop(make, d=LOOP_S, fade=0.75):
    """A seamless loop: render a little long, then crossfade the tail into the start (equal power)."""
    x = make(d + fade)
    n, f = int(SR * d), int(SR * fade)
    out = x[:n].copy()
    k = np.linspace(0, np.pi / 2, f)
    out[:f] = x[:f] * np.sin(k) + x[n:n + f] * np.cos(k)
    return out


def level(x, peak):
    """Normalize without finish()'s fade-out, which would click at a loop's seam."""
    return x / (np.max(np.abs(x)) or 1) * peak


def chime(notes, step, tau=0.6, wave="sine", gain=0.4):
    """Notes one after another, each ringing on."""
    return [(i * step, tone(f, f, tau * 4, wave) * decay(tau * 4, tau), gain) for i, f in enumerate(notes)]


C5, D5, E5, G5, A5, C6, D6, E6, G6, B6 = 523.3, 587.3, 659.3, 784.0, 880.0, 1046.5, 1174.7, 1318.5, 1568.0, 1975.5


# --- The Warfront -----------------------------------------------------------------------------------

def crit():
    """A critical hit: a harder, brighter cut, a heavy impact under it, and a sparkle."""
    d = 0.9
    sweep = lowpass(noise(d), np.geomspace(9000, 900, int(SR * d))) * decay(d, 0.06, 0.005)
    impact = thud(110, 45, d, 0.09, 1200)
    sparkle = bell([3136, 4186, 5274, 6272], d, 0.25, [0.5, 0.4, 0.3, 0.2])
    return finish(reverb(sweep * 1.4 + impact * 1.2 + at(0.04, sparkle, d) * 0.5, wet=0.18))


def slash_ember():
    """The ember claws: a fire whoosh to lay over the strike, with a few sparks."""
    d = 0.6
    t = ts(d)
    env = np.sin(np.pi * np.minimum(t / 0.35, 1)) ** 2
    whoosh = band(noise(d), 250, 2800) * env
    rumble = lowpass(noise(d), 150) * env
    return finish(whoosh + rumble * 1.5 + clicks(d, 40, gain=2.5) * env, 0.75)


def walk_up():
    """The next monster's footfalls: three heavy steps across the 350 ms walk-up."""
    d = 0.55
    step = thud(75, 52, 0.22, 0.05, 400)
    return finish(mix(d, (0, step, 0.7), (0.12, step, 0.85), (0.24, step, 1.0)), 0.75)


def gate_crack():
    """The wall cracks: a stone groan, a sharp crack, grit falling."""
    d = 1.4
    groan = band(noise(d), 80, 500) * wobble(d, 0.2, 1.0, 14) * np.minimum(ts(d) / 0.2, 1) * np.exp(-ts(d) / 0.6)
    crack = band(noise(0.1), 900, 7000) * decay(0.1, 0.012)
    grit = [(0.3 + RNG.uniform(0, 0.8), band(noise(0.03), 1500, 5000) * decay(0.03, 0.005), 0.3) for _ in range(14)]
    return finish(reverb(mix(d, (0, groan, 2.0), (0.25, crack, 1.0), (0.25, thud(90, 55, 0.3), 0.6), *grit),
                         wet=0.2))


def unmaking_rise():
    """The Unmaking rises: a reversed shimmer drawing in, then a low, uneasy swell."""
    d = 2.8
    shimmer = np.flip(bell([1661, 2489, 3322], 1.0, 0.35)) * 0.4
    t = ts(d)
    swell = (tone(55, 55, d) + tone(55.8, 55.8, d) + 0.6 * tone(82.4, 81.5, d) + 0.3 * tone(116.5, 116.5, d))
    swell *= np.minimum(t / 1.0, 1) * np.minimum((d - t) / 0.8, 1)
    return finish(reverb(mix(d, (0, shimmer, 1.0), (0.6, swell[:int(SR * 2.2)], 0.5)), wet=0.3, size=1.4))


def rally():
    """The rally horn: a call, then a higher, longer note."""
    d = 1.4
    return finish(reverb(mix(d, (0, horn(196.0, 0.32), 1.0), (0.36, horn(293.7, 0.8), 1.0)), wet=0.2))


def mend():
    """Mending the wall: chisel taps on stone, then a mallet settles the block."""
    d = 1.0
    tap = bell([2400, 3610, 5020], 0.2, 0.04) + band(noise(0.2), 2000, 8000) * decay(0.2, 0.004)
    parts = [(t, tap, g) for t, g in ((0, 0.6), (0.14, 0.7), (0.26, 0.6), (0.42, 0.8))]
    return finish(mix(d, *parts, (0.62, thud(120, 80, 0.3, 0.05, 700), 1.0)), 0.8)


# --- The city ---------------------------------------------------------------------------------------

def build_start():
    """Construction starts: a few saw strokes, then two mallet knocks."""
    d = 1.5
    t = ts(0.9)
    saw = band(noise(0.9), 1500, 5000) * np.abs(np.sin(2 * np.pi * 2.2 * t)) ** 1.5
    return finish(mix(d, (0, saw, 0.7), (0.98, knock(160), 1.0), (1.2, knock(150), 0.9)), 0.8)


def city_brightens():
    """The city brightens: a rising chime, like first light."""
    d = 2.6
    pad = sum(tone(f, f, 2.0, "tri") for f in (261.6, 329.6, 392.0)) * np.sin(np.pi * ts(2.0) / 2.0) ** 2 * 0.25
    return finish(reverb(mix(d, *chime([C5, D5, E5, G5, A5, C6], 0.11, 0.5), (0.1, pad, 1.0)), wet=0.25))


def research_done():
    """Research done: a page turns, then two bright notes."""
    d = 1.4
    t = ts(0.3)
    page = band(noise(0.3), 900, 6500) * np.sin(np.pi * np.minimum(t / 0.3, 1)) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t))
    return finish(mix(d, (0, page, 0.8), *[(0.3 + a, b, c) for a, b, c in chime([E6, B6], 0.12, 0.35)]), 0.75)


def steps(n, gap, rising):
    """Footsteps on a dirt road, getting nearer (rising) or farther."""
    step = lowpass(noise(0.12), 700) * decay(0.12, 0.02) + tone(90, 70, 0.12) * decay(0.12, 0.03) * 0.4
    gains = np.linspace(0.25, 1.0, n) if rising else np.linspace(1.0, 0.2, n)
    return [(i * gap + RNG.uniform(0, 0.02), step, g) for i, g in enumerate(gains)]


def expedition_out():
    """An expedition sets out: one horn note, then footsteps going away."""
    d = 2.2
    return finish(mix(d, (0, horn(293.7, 0.6), 0.9), *[(0.55 + a, b, c) for a, b, c in steps(8, 0.2, False)]))


def expedition_back():
    """An expedition returns: footsteps coming near, then a two-note horn."""
    d = 2.4
    return finish(mix(d, *steps(7, 0.2, True), (1.4, horn(293.7, 0.25), 0.9), (1.66, horn(440.0, 0.7), 0.9)))


def find():
    """A find: a chest creaks open and something glitters inside."""
    d = 1.6
    creak = band(noise(0.45), 300, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * np.geomspace(18, 40, int(SR * 0.45)) * ts(0.45)))
    creak *= np.sin(np.pi * ts(0.45) / 0.45)
    glints = [(0.5 + RNG.uniform(0, 0.5), bell([f, f * 1.5], 0.6, 0.15), 0.25)
              for f in RNG.choice([2093, 2349, 2637, 3136, 3520], 7)]
    return finish(mix(d, (0, knock(180, 0.15), 0.6), (0.05, creak, 0.8), *glints), 0.8)


def gate_knock():
    """Someone at the gate: three knocks on heavy wood."""
    d = 1.0
    k = knock(120, 0.25)
    return finish(reverb(mix(d, (0, k, 1.0), (0.22, k, 0.9), (0.44, k, 1.0)), wet=0.15), 0.85)


# --- Forage -----------------------------------------------------------------------------------------

def church_bell(f, d, tau):
    """A big bell's partials: hum, prime, minor third, fifth, octave."""
    return bell([f * 0.5, f, f * 1.2, f * 1.5, f * 2.0, f * 2.5], d, tau, [0.6, 1.0, 0.5, 0.35, 0.4, 0.15])


def food_low():
    """Food running low: a slow, low bell, tolled twice."""
    d = 3.2
    b = church_bell(262, 2.0, 1.2)
    return finish(reverb(mix(d, (0, b, 1.0), (1.3, b, 0.85)), wet=0.2), 0.75)


def food_raid():
    """A food raid: a quick alarm bell over a scuffle."""
    d = 1.8
    b = church_bell(523, 0.6, 0.25)
    scuffle = [(RNG.uniform(0.1, 1.3), lowpass(noise(0.08), 1500) * decay(0.08, 0.02), RNG.uniform(0.3, 0.7))
               for _ in range(10)]
    return finish(mix(d, *[(i * 0.16, b, 0.8) for i in range(7)], *scuffle))


def granary_full():
    """The granary is full: a sack thumps down, then a pleased two-note chime."""
    d = 1.2
    return finish(mix(d, (0, thud(95, 60, 0.3, 0.06, 300), 1.0), *[(0.22 + a, b, c) for a, b, c in chime([G5, C6], 0.12, 0.3)]), 0.8)


# --- Story ------------------------------------------------------------------------------------------

def scene_open():
    """A story scene opens: a parchment unrolls."""
    d = 0.8
    t = ts(0.6)
    rustle = band(noise(0.6), 1800, 7000) * np.sin(np.pi * t / 0.6) ** 1.5
    crinkle = clicks(0.6, 90, 2500, 9000, 1.5) * np.sin(np.pi * t / 0.6)
    swoosh = lowpass(noise(0.6), 500) * np.sin(np.pi * t / 0.6) ** 2
    return finish(mix(d, (0, rustle, 0.6), (0, crinkle, 1.0), (0, swoosh, 0.6)), 0.7)


def fanfare():
    """A fanfare, for a quest done or Renown gained: horns up a major chord, the last held."""
    d = 2.0
    notes = [(0, 261.6, 0.18), (0.2, 329.6, 0.18), (0.4, 392.0, 0.18), (0.6, 523.3, 1.0)]
    parts = [(t, horn(f, n, 0.03), 1.0) for t, f, n in notes]
    parts.append((0.6, horn(392.0, 1.0, 0.03), 0.6))
    return finish(reverb(mix(d, *parts), wet=0.22))


def welcome_back():
    """Welcome back: a soft dawn, two notes rising over a warm chord."""
    d = 2.4
    pad = sum(tone(f, f, 2.0, "tri") for f in (261.6, 329.6, 392.0, 493.9)) * np.sin(np.pi * ts(2.0) / 2.0) ** 2 * 0.2
    notes = [(0.15, tone(G5, G5, 1.2, "tri") * decay(1.2, 0.4), 0.4), (0.55, tone(D6, D6, 1.5, "tri") * decay(1.5, 0.55), 0.4)]
    return finish(reverb(mix(d, (0, pad, 1.0), *notes), wet=0.25), 0.75)


def sting_sera():
    """Sera arrives: a shield bash, wood and iron."""
    d = 1.1
    hit = lowpass(noise(d), 1800) * decay(d, 0.05) + tone(130, 75, d) * decay(d, 0.08)
    iron = bell([523, 1370, 2210, 3010], d, 0.3, [0.6, 0.5, 0.35, 0.2])
    return finish(reverb(hit * 1.3 + iron * 0.6, wet=0.2))


def sting_thornwick():
    """Thornwick arrives: a spark fizzes up, then pops."""
    d = 1.1
    t = ts(0.7)
    fizz = clicks(0.7, 400, 2000, 10000, 2.0) * np.minimum(t / 0.5, 1)
    zap = tone(400, 2400, 0.7) * np.minimum(t / 0.6, 1) ** 2 * 0.25
    pop = lowpass(noise(0.4), 2500) * decay(0.4, 0.02) + bell([1568, 2349], 0.4, 0.12) * 0.5
    return finish(mix(d, (0, fizz, 1.0), (0, zap, 1.0), (0.7, pop, 1.0)), 0.8)


def sting_hollow_knight():
    """The Hollow Knight arrives: one armored step, ringing on and on, as if the armor were empty."""
    d = 1.0
    clank = bell([310, 787, 1253, 2100, 3170], d, 0.35, [0.5, 0.6, 0.4, 0.3, 0.2]) + band(noise(d), 1000, 6000) * decay(d, 0.01)
    x = mix(2.0, (0, clank, 1.0), (0.36, clank, 0.4), (0.72, clank, 0.16))
    return finish(reverb(lowpass(x, 3500), wet=0.45, size=2.0))


# --- Ambient loops ----------------------------------------------------------------------------------

def amb_torches():
    """The Warfront torches: a soft flame roar and its crackle."""
    def make(d):
        roar = band(noise(d), 80, 400) * wobble(d, 0.5, 1.0, int(d * 3))
        return roar * 0.8 + clicks(d, 14, 1500, 7000, 2.0)
    return level(loop(make), 0.5)


def amb_forge():
    """The forge: a deeper fire, crackling, and the bellows breathing every few seconds."""
    def make(d):
        roar = lowpass(noise(d), 250) * wobble(d, 0.6, 1.0, int(d * 2))
        bellows = np.zeros(int(SR * d))
        for start in np.arange(0.5, d - 1.2, 2.7):
            seg = band(noise(1.1), 150, 1200) * np.sin(np.pi * ts(1.1) / 1.1) ** 2
            bellows = bellows + at(start, seg, d)
        return roar * 1.6 + clicks(d, 22, 1200, 6000, 2.0) + bellows * 0.7
    return level(loop(make), 0.55)


def amb_night_wind():
    """Night wind: air drifting, its pitch and strength wandering."""
    def make(d):
        cut = wobble(d, 250, 1000, int(d * 1.5))
        return lowpass(noise(d), cut) * wobble(d, 0.35, 1.0, int(d * 1.2))
    return level(loop(make), 0.5)


def amb_horde_drums():
    """The horde's drums far off: low, slow, muffled, a pattern of twelve beats at 90 a minute (8 s)."""
    beat = 60 / 90
    pattern = [1, 0, 0.6, 0.6, 1, 0, 0.6, 0, 1, 0, 0.6, 0.8]
    drum = tone(72, 52, 0.6) * decay(0.6, 0.18) + lowpass(noise(0.6), 300) * decay(0.6, 0.03) * 0.6
    bar = len(pattern) * beat
    hits = [(k * bar + i * beat, drum, g) for k in range(2) for i, g in enumerate(pattern) if g]
    x = reverb(lowpass(mix(bar * 2, *hits), 450), wet=0.35, size=1.5)
    n = int(SR * bar)
    out = x[n:2 * n].copy()
    out[:len(x) - 2 * n] += x[2 * n:]                   # the second bar carries the first's tail; wrap the last tail in too
    return level(out, 0.6)


SOUNDS = {
    "sfx_crit": crit, "sfx_slash-ember": slash_ember, "sfx_walk-up": walk_up, "sfx_gate-crack": gate_crack,
    "sfx_unmaking-rise": unmaking_rise, "sfx_rally": rally, "sfx_mend": mend,
    "sfx_build-start": build_start, "sfx_city-brightens": city_brightens, "sfx_research-done": research_done,
    "sfx_expedition-out": expedition_out, "sfx_expedition-back": expedition_back, "sfx_find": find,
    "sfx_gate-knock": gate_knock,
    "sfx_food-low": food_low, "sfx_food-raid": food_raid, "sfx_granary-full": granary_full,
    "sfx_scene-open": scene_open, "sfx_fanfare": fanfare, "sfx_welcome-back": welcome_back,
    "sfx_sting-sera": sting_sera, "sfx_sting-thornwick": sting_thornwick,
    "sfx_sting-hollow-knight": sting_hollow_knight,
    "amb_torches": amb_torches, "amb_forge": amb_forge, "amb_night-wind": amb_night_wind,
    "amb_horde-drums": amb_horde_drums,
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
