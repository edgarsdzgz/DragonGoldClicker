"""Copy the owner-approved pixel art into the official library and write its register.

Locked by the owner on 2026-10-26 ("These can be considered the official asset for our game").
Official files are never edited in place: a change is drawn as a new version in a batch folder,
and replaces the official file only when the owner approves it. Run: python collect.py
"""
import pathlib
import shutil

from PIL import Image

HERE = pathlib.Path(__file__).parent
ART = HERE.parent
AGENT = ART / "agent"
REF = ART / "reference"

# (official path, source path, what it is, where it came from)
ASSETS = [
    ("icons/icon_hourglass.png", AGENT / "01-test-run/out/icon_hourglass.png", "Timers", "test run"),
    ("icons/icon_flame.png", AGENT / "01-test-run/out/icon_flame.png", "Warfront tab", "test run"),
    ("icons/icon_cog.png", AGENT / "02-icon-redraw/out/icon_cog.png", "Settings", "icon redraw"),
    ("icons/icon_wheat.png", AGENT / "02-icon-redraw/out/icon_wheat.png", "Foragers, Forage tab", "icon redraw (v2, the ear)"),
    ("icons/icon_hammer.png", AGENT / "02-icon-redraw/out/icon_hammer.png", "Repairers", "icon redraw"),
    ("icons/icon_helm.png", AGENT / "02-icon-redraw/out/icon_helm.png", "Soldiers", "icon redraw"),
    ("icons/icon_padlock.png", AGENT / "04-icons-2/out/icon_padlock.png", "Locked", "icon sheet 2"),
    ("icons/icon_flag.png", AGENT / "04-icons-2/out/icon_flag.png", "Objective", "icon sheet 2"),
    ("icons/icon_compass.png", AGENT / "04-icons-2/out/icon_compass.png", "Explorers", "icon sheet 2"),
    ("icons/icon_upgrade.png", AGENT / "04-icons-2/out/icon_upgrade.png", "Upgrade", "icon sheet 2"),
    ("icons/icon_check.png", AGENT / "04-icons-2/out/icon_check.png", "Done", "icon sheet 2"),
    ("icons/icon_star.png", REF / "icon-star.png", "Renown", "mockup v1"),
    ("icons/icon_food.png", REF / "icon-food.png", "Food", "mockup v1"),
    ("icons/icon_villager.png", REF / "icon-villager.png", "Villagers", "mockup v1"),
    ("icons/icon_swords.png", REF / "icon-swords.png", "Sword gear (stand-in for Fighters)", "mockup v1"),
    ("icons/icon_scroll.png", REF / "icon-scroll.png", "Journal", "mockup v1"),
    ("icons/icon_castle.png", REF / "icon-castle.png", "Draconia tab, Keep", "mockup v1"),
    ("people/ppl_human.png", REF / "folk-human.png", "Townsfolk: human", "mockup v1"),
    ("people/ppl_elf.png", REF / "folk-elf.png", "Townsfolk: elf", "mockup v1"),
    ("people/ppl_horned.png", REF / "folk-horned.png", "Townsfolk: horned folk", "mockup v1"),
    ("people/ppl_dwarf.png", AGENT / "03-peoples/out/folk-dwarf.png", "Townsfolk: dwarf (stockier redraw)", "peoples"),
    ("people/ppl_halfling.png", AGENT / "03-peoples/out/folk-halfling.png", "Townsfolk: halfling", "peoples"),
    ("people/ppl_orc.png", AGENT / "03-peoples/out/folk-orc.png", "Townsfolk: orc", "peoples"),
    ("people/ppl_birdfolk.png", AGENT / "03-peoples/out/folk-birdfolk.png", "Townsfolk: birdfolk", "peoples"),
    ("people/ppl_fishfolk.png", AGENT / "03-peoples/out/folk-fishfolk.png", "Townsfolk: fishfolk", "peoples"),
    ("people/ppl_catfolk.png", AGENT / "03-peoples/out/folk-catfolk.png", "Townsfolk: catfolk", "peoples"),
    ("people/ppl_fighter_idle.png", AGENT / "01-test-run/out/ppl_fighter_idle.png", "Fighter, standing", "test run"),
    ("people/ppl_fighter_attack_strip2.png", AGENT / "01-test-run/out/ppl_fighter_attack_strip2.png", "Fighter, spear jab (6 fps)", "test run"),
    ("people/ppl_fighter_attack.piskel", AGENT / "01-test-run/piskel/ppl_fighter_attack.piskel", "Fighter jab, Piskel file", "test run"),
    ("fx/fx_spark_strip4.png", AGENT / "01-test-run/out/fx_spark_strip4.png", "Hit spark (12 fps)", "test run"),
    ("fx/fx_spark.piskel", AGENT / "01-test-run/piskel/fx_spark.piskel", "Hit spark, Piskel file", "test run"),
    ("events/evt_granary_0.png", AGENT / "01-test-run/out/evt_granary_0.png", "Granary, empty", "test run"),
    ("events/evt_granary_50.png", AGENT / "01-test-run/out/evt_granary_50.png", "Granary, half", "test run"),
    ("events/evt_granary_100.png", AGENT / "01-test-run/out/evt_granary_100.png", "Granary, full", "test run"),
]

rows = []
for dest, src, what, origin in ASSETS:
    out = HERE / dest
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, out)
    size = "" if dest.endswith(".piskel") else "{}x{}".format(*Image.open(out).size)
    rows.append(f"| `{dest}` | {size} | {what} | {origin} |")

register = """# Official pixel art: Draconia Chronicles

Locked by the owner on 2026-10-26. These are the game's official assets.

- **Never edit an official file in place.** Draw a change as a new version in a batch folder under
  `_dev/art/agent/`; it replaces the official file only when the owner approves it.
- Sizes are native pixels. The game scales them by whole numbers with nearest-neighbor, never smoothing.
- The sources and their grids live in the batch folders; `collect.py` copies them here and writes
  this file. Run `python collect.py` after an approved change.

| File | Size | What it is | From |
| --- | --- | --- | --- |
""" + "\n".join(rows) + "\n"
(HERE / "OFFICIAL.md").write_text(register, encoding="utf-8")
print(f"{len(ASSETS)} files locked")
