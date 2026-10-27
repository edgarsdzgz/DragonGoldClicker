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
    ("icons/icon_helm.png", AGENT / "06-options/out/icon_helm_plumed.png", "Soldiers", "options (plumed barbute; replaced the great helm)"),
    ("icons/icon_close.png", AGENT / "06-options/out/icon_close_plate_red.png", "Close", "options (red stone plate; red is an owner exception for Close)"),
    ("icons/icon_reassign.png", AGENT / "06-options/out/icon_reassign_chunky.png", "Reassign", "options (chunky arrows)"),
    ("icons/icon_shield.png", AGENT / "05-icons-3/out/icon_shield.png", "Fighters", "icon sheet 3"),
    ("icons/icon_gate.png", AGENT / "05-icons-3/out/icon_gate.png", "Gate", "icon sheet 3"),
    ("icons/icon_damage.png", AGENT / "05-icons-3/out/icon_damage.png", "Damage", "icon sheet 3"),
    ("icons/icon_skull.png", AGENT / "05-icons-3/out/icon_skull.png", "Death, reset", "icon sheet 3"),
    ("icons/icon_rations.png", AGENT / "05-icons-3/out/icon_rations.png", "Rations", "icon sheet 3"),
    ("icons/icon_bell.png", AGENT / "05-icons-3/out/icon_bell.png", "Next meal", "icon sheet 3"),
    ("icons/icon_train.png", AGENT / "14-busts/out/icon_train_bust.png", "Train", "townsfolk bust (replaced the sheet-3 train)"),
    ("icons/icon_book.png", AGENT / "05-icons-3/out/icon_book.png", "Librarium", "icon sheet 3"),
    ("icons/icon_padlock.png", AGENT / "04-icons-2/out/icon_padlock.png", "Locked", "icon sheet 2"),
    ("icons/icon_flag.png", AGENT / "04-icons-2/out/icon_flag.png", "Objective", "icon sheet 2"),
    ("icons/icon_compass.png", AGENT / "04-icons-2/out/icon_compass.png", "Explorers", "icon sheet 2"),
    ("icons/icon_upgrade.png", AGENT / "04-icons-2/out/icon_upgrade.png", "Upgrade", "icon sheet 2"),
    ("icons/icon_check.png", AGENT / "04-icons-2/out/icon_check.png", "Done", "icon sheet 2"),
    ("icons/icon_star.png", REF / "icon-star.png", "Renown", "mockup v1"),
    ("icons/icon_food.png", AGENT / "08-food-journal/out/icon_food_cheese.png", "Food", "food and journal options (cheese wedge; replaced the bun)"),
    ("icons/icon_villager.png", AGENT / "14-busts/out/icon_villager_bust.png", "Villagers", "townsfolk bust (replaced the mockup villager)"),
    ("icons/icon_swords.png", REF / "icon-swords.png", "Sword gear (stand-in for Fighters)", "mockup v1"),
    ("icons/icon_scroll.png", AGENT / "08-food-journal/out/icon_journal_scroll.png", "Journal", "food and journal options (rolled scroll; replaced the v1 scroll)"),
    ("icons/icon_castle.png", REF / "icon-castle.png", "Draconia tab, Keep", "mockup v1"),
    ("icons/icon_claw-1.png", AGENT / "07-claws/out/icon_claw-1.png", "Claws 1: Fledgling", "claw tiers"),
    ("icons/icon_claw-2.png", AGENT / "07-claws/out/icon_claw-2.png", "Claws 2: Sharpened", "claw tiers"),
    ("icons/icon_claw-3.png", AGENT / "07-claws/out/icon_claw-3.png", "Claws 3: Hooked", "claw tiers"),
    ("icons/icon_claw-4.png", AGENT / "07-claws/out/icon_claw-4.png", "Claws 4: Hardened", "claw tiers"),
    ("icons/icon_claw-5.png", AGENT / "07-claws/out/icon_claw-5.png", "Claws 5: Serrated", "claw tiers"),
    ("icons/icon_claw-6.png", AGENT / "07-claws/out/icon_claw-6.png", "Claws 6: Obsidian", "claw tiers"),
    ("icons/icon_claw-7.png", AGENT / "07-claws/out/icon_claw-7.png", "Claws 7: Ember", "claw tiers"),
    ("icons/icon_claw-8.png", AGENT / "07-claws/out/icon_claw-8.png", "Claws 8: Dragonsteel", "claw tiers"),
    ("icons/icon_claw-9.png", AGENT / "07-claws/out/icon_claw-9.png", "Claws 9: Ancient", "claw tiers"),
    ("icons/icon_next.png", AGENT / "09-icons-4/out/icon_next.png", "Next, go", "icon sheet 4"),
    ("icons/icon_unknown.png", AGENT / "11-options-3/out/icon_unknown_crystal_gold.png", "Unknown, help", "options 3 (crystal ball with the gold question mark)"),
    ("icons/icon_info.png", AGENT / "10-options-2/out/icon_info_runestone.png", "Info", "options 2 (rune stone)"),
    ("icons/icon_rising.png", AGENT / "10-options-2/out/icon_rising_gem.png", "Rising stores", "options 2 (cut gem)"),
    ("icons/icon_falling.png", AGENT / "10-options-2/out/icon_falling_gem.png", "Falling stores", "options 2 (cut gem, brick: red stays for HP and danger)"),
    ("icons/icon_rank.png", AGENT / "09-icons-4/out/icon_rank.png", "Rank", "icon sheet 4"),
    ("icons/icon_shield_gear.png", AGENT / "09-icons-4/out/icon_shield_gear.png", "Shield gear", "icon sheet 4"),
    ("icons/icon_claws.png", AGENT / "09-icons-4/out/icon_claws.png", "Claws (the track)", "icon sheet 4"),
    ("icons/icon_moon.png", AGENT / "09-icons-4/out/icon_moon.png", "Offline, rest", "icon sheet 4"),
    ("icons/icon_sparkles.png", AGENT / "09-icons-4/out/icon_sparkles.png", "Wizard's Tower", "icon sheet 4"),
    ("icons/icon_map.png", AGENT / "09-icons-4/out/icon_map.png", "Map", "icon sheet 4"),
    ("icons/icon_stats.png", AGENT / "08-food-journal/out/icon_journal_quill.png", "Stats", "food and journal options (quill and inkpot)"),
    ("icons/icon_res_dragon_anatomy.png", AGENT / "13-research/out/icon_res_wyrms_fury.png", "Research: Dragon Anatomy", "research (the wyrm's eye)"),
    ("icons/icon_res_weak_points.png", AGENT / "13-research/out/icon_res_weak_points.png", "Research: Weak Points", "research (target)"),
    ("icons/icon_res_wyrms_fury.png", AGENT / "17-gems-hammer/out/icon_res_gem_shard_ruby.png", "Research: Wyrm's Fury", "research options (ruby shard; owner exception to the red rule)"),
    ("icons/icon_res_drill_tactics.png", AGENT / "13-research/out/icon_res_drill_tactics.png", "Research: Drill Tactics", "research (training dummy)"),
    ("icons/icon_res_tempered_steel.png", AGENT / "17-gems-hammer/out/icon_res_steel_hammer_front_big.png", "Research: Tempered Steel", "research options (hammer before Kael's anvil)"),
    ("icons/icon_res_battle_drill.png", AGENT / "13-research/out/icon_res_battle_drill.png", "Research: Battle Drill", "research (three spears)"),
    ("icons/icon_res_rationing.png", AGENT / "13-research/out/icon_res_rationing.png", "Research: Rationing", "research (brass balance)"),
    ("icons/icon_res_lean_rations.png", AGENT / "13-research/out/icon_res_lean_rations.png", "Research: Lean Rations", "research (hardtack)"),
    ("icons/icon_res_snares_and_nets.png", AGENT / "18-snare/out/icon_res_snare_spring.png", "Research: Snares and Nets", "research options (spring snare)"),
    ("icons/icon_res_feast_hall.png", AGENT / "13-research/out/icon_res_feast_hall.png", "Research: Feast Hall", "research (tankard)"),
    ("icons/icon_res_mortar_craft.png", AGENT / "16-research-options-2/out/icon_res_mortar_trowel2.png", "Research: Mortar Craft", "research options (trowel after the owner's reference)"),
    ("icons/icon_res_night_ledgers.png", AGENT / "13-research/out/icon_res_night_ledgers.png", "Research: Night Ledgers", "research (candle with a handle)"),
    ("icons/icon_res_evacuation_drills.png", AGENT / "15-research-options/out/icon_res_evac_door.png", "Research: Evacuation Drills", "research options (the way out)"),
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
