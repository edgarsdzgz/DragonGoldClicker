"""Copy the owner-approved pixel art into the official library and write its register.

Locked by the owner on 2026-10-26 ("These can be considered the official asset for our game").
Official files are never edited in place: a change is drawn as a new version in a batch folder,
and replaces the official file only when the owner approves it. Run: python collect.py
"""
import pathlib
import shutil
import wave

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
    ("city/map_city_base.png", AGENT / "19-city/out/map_city_base.png", "City base map, no buildings (lit look)", "batch 2"),
    ("city/map_plots.json", AGENT / "19-city/out/map_plots.json", "The ten plots: id, x, y, size, anchor", "batch 2"),
    ("city/map_fog_20x32.png", AGENT / "19-city/out/map_fog_20x32.png", "Fog over an undiscovered plot, 20 x 32", "batch 2"),
    ("city/map_fog_24x40.png", AGENT / "19-city/out/map_fog_24x40.png", "Fog over an undiscovered plot, 24 x 40", "batch 2"),
    ("city/map_fog_32x32.png", AGENT / "19-city/out/map_fog_32x32.png", "Fog over an undiscovered plot, 32 x 32", "batch 2"),
    ("city/map_fog_50x82.png", AGENT / "19-city/out/map_fog_50x82.png", "Fog over an undiscovered plot, 50 x 82", "batch 2"),
    ("city/map_foundation_20x32.png", AGENT / "19-city/out/map_foundation_20x32.png", "Foundation (first build step), 20 x 32", "batch 2"),
    ("city/map_foundation_24x40.png", AGENT / "19-city/out/map_foundation_24x40.png", "Foundation (first build step), 24 x 40", "batch 2"),
    ("city/map_foundation_32x32.png", AGENT / "19-city/out/map_foundation_32x32.png", "Foundation (first build step), 32 x 32", "batch 2"),
    ("city/map_foundation_50x82.png", AGENT / "19-city/out/map_foundation_50x82.png", "Foundation (first build step), 50 x 82", "batch 2"),
    ("city/map_plot-empty_20x32.png", AGENT / "19-city/out/map_plot-empty_20x32.png", "Cleared ground (unbuilt plot), 20 x 32", "batch 2"),
    ("city/map_plot-empty_24x40.png", AGENT / "19-city/out/map_plot-empty_24x40.png", "Cleared ground (unbuilt plot), 24 x 40", "batch 2"),
    ("city/map_plot-empty_32x32.png", AGENT / "19-city/out/map_plot-empty_32x32.png", "Cleared ground (unbuilt plot), 32 x 32", "batch 2"),
    ("city/map_plot-empty_50x82.png", AGENT / "19-city/out/map_plot-empty_50x82.png", "Cleared ground (unbuilt plot), 50 x 82", "batch 2"),
    ("city/map_scaffold_20x32.png", AGENT / "19-city/out/map_scaffold_20x32.png", "Scaffold (building going up), 20 x 32", "batch 2"),
    ("city/map_scaffold_24x40.png", AGENT / "19-city/out/map_scaffold_24x40.png", "Scaffold (building going up), 24 x 40", "batch 2"),
    ("city/map_scaffold_32x32.png", AGENT / "19-city/out/map_scaffold_32x32.png", "Scaffold (building going up), 32 x 32", "batch 2"),
    ("city/map_scaffold_50x82.png", AGENT / "19-city/out/map_scaffold_50x82.png", "Scaffold (building going up), 50 x 82", "batch 2"),
    ("city/map_marker-upgrade.png", AGENT / "19-city/out/map_marker-upgrade.png", "Map marker: upgrade ready", "batch 2"),
    ("city/map_marker-todo.png", AGENT / "19-city/out/map_marker-todo.png", "Map marker: something to do", "batch 2"),
    ("buildings/bld_keep_ruin.png", AGENT / "20-buildings/out/bld_keep_ruin.png", "Draconia Keep: ruin", "batch 3"),
    ("buildings/bld_keep_built.png", AGENT / "20-buildings/out/bld_keep_built.png", "Draconia Keep: built", "batch 3"),
    ("buildings/bld_keep_restored.png", AGENT / "20-buildings/out/bld_keep_restored.png", "Draconia Keep: restored", "batch 3"),
    ("buildings/bld_garrison_ruin.png", AGENT / "20-buildings/out/bld_garrison_ruin.png", "The Garrison: ruin", "batch 3"),
    ("buildings/bld_garrison_lv1.png", AGENT / "20-buildings/out/bld_garrison_lv1.png", "The Garrison: lv1", "batch 3"),
    ("buildings/bld_garrison_lv3.png", AGENT / "20-buildings/out/bld_garrison_lv3.png", "The Garrison: lv3", "batch 3"),
    ("buildings/bld_garrison_lv5.png", AGENT / "20-buildings/out/bld_garrison_lv5.png", "The Garrison: lv5", "batch 3"),
    ("buildings/bld_forge_ruin.png", AGENT / "20-buildings/out/bld_forge_ruin.png", "The Forge: ruin", "batch 3"),
    ("buildings/bld_forge_built.png", AGENT / "20-buildings/out/bld_forge_built.png", "The Forge: built", "batch 3"),
    ("buildings/bld_forge_lit.png", AGENT / "20-buildings/out/bld_forge_lit.png", "The Forge: lit", "batch 3"),
    ("buildings/bld_forge_lit_strip3.png", AGENT / "20-buildings/out/bld_forge_lit_strip3.png", "The Forge: lit, fire flickering (3 frames)", "batch 3"),
    ("buildings/bld_lodge_ruin.png", AGENT / "20-buildings/out/bld_lodge_ruin.png", "Ranger's Lodge: ruin", "batch 3"),
    ("buildings/bld_lodge_lv1.png", AGENT / "20-buildings/out/bld_lodge_lv1.png", "Ranger's Lodge: lv1", "batch 3"),
    ("buildings/bld_lodge_lv3.png", AGENT / "20-buildings/out/bld_lodge_lv3.png", "Ranger's Lodge: lv3", "batch 3"),
    ("buildings/bld_outpost_ruin.png", AGENT / "20-buildings/out/bld_outpost_ruin.png", "Wayfinder's Outpost: ruin", "batch 3"),
    ("buildings/bld_outpost_built.png", AGENT / "20-buildings/out/bld_outpost_built.png", "Wayfinder's Outpost: built", "batch 3"),
    ("buildings/bld_outpost_upgraded.png", AGENT / "20-buildings/out/bld_outpost_upgraded.png", "Wayfinder's Outpost: upgraded", "batch 3"),
    ("buildings/bld_librarium_ruin.png", AGENT / "20-buildings/out/bld_librarium_ruin.png", "The Librarium: ruin", "batch 3"),
    ("buildings/bld_librarium_built.png", AGENT / "20-buildings/out/bld_librarium_built.png", "The Librarium: built", "batch 3"),
    ("buildings/bld_housing_house.png", AGENT / "20-buildings/out/bld_housing_house.png", "Housing: house", "batch 3"),
    ("buildings/bld_housing_row.png", AGENT / "20-buildings/out/bld_housing_row.png", "Housing: row", "batch 3"),
    ("buildings/bld_wizard-tower_ruin.png", AGENT / "20-buildings/out/bld_wizard-tower_ruin.png", "Wizard's Tower: ruin", "batch 3"),
    ("buildings/bld_wizard-tower_built.png", AGENT / "20-buildings/out/bld_wizard-tower_built.png", "Wizard's Tower: built", "batch 3"),
    ("buildings/bld_tower-west_ruin.png", AGENT / "20-buildings/out/bld_tower-west_ruin.png", "Tower West: ruin", "batch 3"),
    ("buildings/bld_tower-west_built.png", AGENT / "20-buildings/out/bld_tower-west_built.png", "Tower West: built", "batch 3"),
    ("buildings/bld_tower-east_ruin.png", AGENT / "20-buildings/out/bld_tower-east_ruin.png", "Tower East: ruin", "batch 3"),
    ("buildings/bld_tower-east_built.png", AGENT / "20-buildings/out/bld_tower-east_built.png", "Tower East: built", "batch 3"),
    ("icons/icon_bld-keep.png", AGENT / "20-buildings/out/icon_bld-keep.png", "Building: Draconia Keep", "batch 3 building icons"),
    ("icons/icon_bld-garrison.png", AGENT / "20-buildings/out/icon_bld-garrison.png", "Building: The Garrison", "batch 3 building icons"),
    ("icons/icon_bld-forge.png", AGENT / "20-buildings/out/icon_bld-forge.png", "Building: The Forge", "batch 3 building icons"),
    ("icons/icon_bld-lodge.png", AGENT / "20-buildings/out/icon_bld-lodge.png", "Building: Ranger's Lodge", "batch 3 building icons"),
    ("icons/icon_bld-outpost.png", AGENT / "20-buildings/out/icon_bld-outpost.png", "Building: Wayfinder's Outpost", "batch 3 building icons"),
    ("icons/icon_bld-librarium.png", AGENT / "20-buildings/out/icon_bld-librarium.png", "Building: The Librarium", "batch 3 building icons"),
    ("icons/icon_bld-housing.png", AGENT / "20-buildings/out/icon_bld-housing.png", "Building: Housing", "batch 3 building icons"),
    ("icons/icon_bld-wizard-tower.png", AGENT / "20-buildings/out/icon_bld-wizard-tower.png", "Building: Wizard's Tower", "batch 3 building icons"),
    ("icons/icon_bld-tower-west.png", AGENT / "20-buildings/out/icon_bld-tower-west.png", "Building: Tower West", "batch 3 building icons"),
    ("icons/icon_bld-tower-east.png", AGENT / "20-buildings/out/icon_bld-tower-east.png", "Building: Tower East", "batch 3 building icons"),
    ("warfront/map_warfront_base.png", AGENT / "21-warfront/out/map_warfront_base.png", "Warfront base map, the gate and wall removed", "batch 4"),
    ("warfront/map_gate.json", AGENT / "21-warfront/out/map_gate.json", "Gate box and torch positions on the Warfront", "batch 4"),
    ("warfront/map_gate_sound.png", AGENT / "21-warfront/out/map_gate_sound.png", "The gate and wall: sound", "batch 4"),
    ("warfront/map_gate_cracking.png", AGENT / "21-warfront/out/map_gate_cracking.png", "The gate and wall: cracking", "batch 4"),
    ("warfront/map_gate_failing.png", AGENT / "21-warfront/out/map_gate_failing.png", "The gate and wall: failing", "batch 4"),
    ("warfront/map_gate_breached.png", AGENT / "21-warfront/out/map_gate_breached.png", "The gate and wall: breached", "batch 4"),
    ("warfront/map_torch_strip3.png", AGENT / "21-warfront/out/map_torch_strip3.png", "Gate torch, flickering (3 frames, 6 fps)", "batch 4"),
    ("fx/fx_slash-plain_strip4.png", AGENT / "23-effects/out/fx_slash-plain_strip4.png", "Slash, plain steel (claw tiers 1-4), 24x24 frames, 12 fps", "batch 5"),
    ("fx/fx_slash-gold_strip4.png", AGENT / "23-effects/out/fx_slash-gold_strip4.png", "Slash, gold (from Serrated), 24x24 frames, 12 fps", "batch 5"),
    ("fx/fx_slash-ember_strip4.png", AGENT / "23-effects/out/fx_slash-ember_strip4.png", "Slash, ember (from Ember), 24x24 frames, 12 fps", "batch 5"),
    ("fx/fx_crit_strip4.png", AGENT / "23-effects/out/fx_crit_strip4.png", "Critical hit burst, 24x24 frames, 12 fps", "batch 5"),
    ("fx/fx_ally-hit_strip3.png", AGENT / "23-effects/out/fx_ally-hit_strip3.png", "The army's hit flash, 16x16 frames, 12 fps", "batch 5"),
    ("fx/fx_ember_strip3.png", AGENT / "23-effects/out/fx_ember_strip3.png", "Floating ember, 4x4 frames, 8 fps, loops", "batch 5"),
    ("fx/fx_wall-impact_strip4.png", AGENT / "23-effects/out/fx_wall-impact_strip4.png", "A monster strikes the wall, 20x16 frames, 12 fps", "batch 5"),
    ("fx/fx_repair_strip4.png", AGENT / "23-effects/out/fx_repair_strip4.png", "Repair sparkle, 12x12 frames, 8 fps, loops", "batch 5"),
    ("fx/fx_breach_strip6.png", AGENT / "23-effects/out/fx_breach_strip6.png", "The wall falls, gate box frames, 8 fps; ends on the breached gate", "batch 5"),
    ("logo/logo_icon.png", AGENT / "25-logo/out/logo_shield_icon.png", "The logo: the claw-struck shield, 64x64 (logo A)", "logo"),
    ("logo/logo_wordmark.png", AGENT / "25-logo/out/logo_wordmark.png", "The wordmark: DRACONIA CHRONICLES", "logo"),
    ("logo/logo_lockup.png", AGENT / "25-logo/out/logo_shield_lockup.png", "The logo with the wordmark", "logo"),
    ("logo/app_icon_1024.png", AGENT / "25-logo/out/app_icon_1024.png", "App icon, stores and iOS (logo A x16)", "logo"),
    ("logo/app_adaptive_1024.png", AGENT / "25-logo/out/app_adaptive_1024.png", "Android adaptive icon foreground (logo A x10, own background)", "logo"),
    ("logo/app_favicon_64.png", AGENT / "25-logo/out/app_favicon_64.png", "Web favicon", "logo"),
    ("logo/splash_lockup.png", AGENT / "25-logo/out/logo_gate_lockup.png", "Splash: the gate under the ember moon with the wordmark (logo B)", "logo"),
    ("logo/splash_frames_strip28.png", AGENT / "25-logo/out/splash_frames_strip28.png", "Splash animation: the gate assembles out of the dark (play with splash_timing.json)", "logo"),
    ("logo/splash_timing.json", AGENT / "25-logo/out/splash_timing.json", "Splash animation: each frame's hold in ms, frame size, background", "logo"),
    ("studio/seal_build_sheet.png", AGENT / "27-raxdeg-seal/out/seal_build_sheet.png", "RAXDEG STUDIOS startup splash: the seal builds in blue, the name is carved in gold, the seal smashes to gold (frames ten to a row; play with seal_build_timing.json)", "RAXDEG seal (v5, locked 2026-10-27)"),
    ("studio/seal_build_timing.json", AGENT / "27-raxdeg-seal/out/seal_build_timing.json", "RAXDEG STUDIOS splash: each frame's hold in ms, frame size, columns, named beats", "RAXDEG seal"),
    ("studio/seal_card.png", AGENT / "27-raxdeg-seal/out/seal_build_card.png", "RAXDEG STUDIOS: the gold seal with the name struck through it", "RAXDEG seal"),
    ("mobs/mob_kobold_idle.png", AGENT / "22-mobs/out/mob_kobold_idle.png", "Kobold: idle", "simple mobs"),
    ("mobs/mob_kobold_hit.png", AGENT / "22-mobs/out/mob_kobold_hit.png", "Kobold: hit, the red flash", "simple mobs"),
    ("mobs/mob_kobold_hurt.png", AGENT / "22-mobs/out/mob_kobold_hurt.png", "Kobold: hurt", "simple mobs"),
    ("mobs/mob_kobold_walk_strip2.png", AGENT / "22-mobs/out/mob_kobold_walk_strip2.png", "Kobold: walk bob (2 frames, 4 fps)", "simple mobs"),
    ("mobs/mob_goblin_idle.png", AGENT / "22-mobs/out/mob_goblin_idle.png", "Goblin: idle", "simple mobs"),
    ("mobs/mob_goblin_hit.png", AGENT / "22-mobs/out/mob_goblin_hit.png", "Goblin: hit, the red flash", "simple mobs"),
    ("mobs/mob_goblin_hurt.png", AGENT / "22-mobs/out/mob_goblin_hurt.png", "Goblin: hurt", "simple mobs"),
    ("mobs/mob_goblin_walk_strip2.png", AGENT / "22-mobs/out/mob_goblin_walk_strip2.png", "Goblin: walk bob (2 frames, 4 fps)", "simple mobs"),
    ("mobs/mob_crawler_idle.png", AGENT / "22-mobs/out/mob_crawler_idle.png", "Shadow Crawler: idle", "simple mobs"),
    ("mobs/mob_crawler_hit.png", AGENT / "22-mobs/out/mob_crawler_hit.png", "Shadow Crawler: hit, the red flash", "simple mobs"),
    ("mobs/mob_crawler_hurt.png", AGENT / "22-mobs/out/mob_crawler_hurt.png", "Shadow Crawler: hurt", "simple mobs"),
    ("mobs/mob_crawler_walk_strip2.png", AGENT / "22-mobs/out/mob_crawler_walk_strip2.png", "Shadow Crawler: walk bob (2 frames, 4 fps)", "simple mobs"),
    ("mobs/mob_orc_idle.png", AGENT / "22-mobs/out/mob_orc_idle.png", "Orc: idle", "simple mobs"),
    ("mobs/mob_orc_hit.png", AGENT / "22-mobs/out/mob_orc_hit.png", "Orc: hit, the red flash", "simple mobs"),
    ("mobs/mob_orc_hurt.png", AGENT / "22-mobs/out/mob_orc_hurt.png", "Orc: hurt", "simple mobs"),
    ("mobs/mob_orc_walk_strip2.png", AGENT / "22-mobs/out/mob_orc_walk_strip2.png", "Orc: walk bob (2 frames, 4 fps)", "simple mobs"),
    ("mobs/mob_raider_idle.png", AGENT / "22-mobs/out/mob_raider_idle.png", "Raider: idle", "simple mobs"),
    ("mobs/mob_raider_hit.png", AGENT / "22-mobs/out/mob_raider_hit.png", "Raider: hit, the red flash", "simple mobs"),
    ("mobs/mob_raider_hurt.png", AGENT / "22-mobs/out/mob_raider_hurt.png", "Raider: hurt", "simple mobs"),
    ("mobs/mob_raider_walk_strip2.png", AGENT / "22-mobs/out/mob_raider_walk_strip2.png", "Raider: walk bob (2 frames, 4 fps)", "simple mobs"),
    ("people/ppl_conscript.png", AGENT / "28-people/out/ppl_conscript.png", "Conscript: rags, rope belt, a dull spear (human)", "Batch 6"),
    ("people/ppl_footman.png", AGENT / "28-people/out/ppl_footman.png", "Footman: nasal helmet, gambeson, round shield, spear (human)", "Batch 6"),
    ("people/ppl_knight.png", AGENT / "28-people/out/ppl_knight.png", "Knight: plate, gold tabard and plume, lance with a pennant (human)", "Batch 6"),
    ("people/ppl_gatherer.png", AGENT / "28-people/out/ppl_gatherer.png", "Gatherer: a basket of greens and berries (halfling)", "Batch 6"),
    ("people/ppl_trapper.png", AGENT / "28-people/out/ppl_trapper.png", "Trapper: fur cap, a pelt, a coil of snare rope (orc)", "Batch 6"),
    ("people/ppl_ranger.png", AGENT / "28-people/out/ppl_ranger.png", "Ranger: green hood and cloak, a longbow (elf)", "Batch 6"),
    ("people/ppl_explorer.png", AGENT / "28-people/out/ppl_explorer.png", "Explorer: pack straps, a crook staff with a lantern (horned folk)", "Batch 6"),
    ("people/ppl_repairer_strip2.png", AGENT / "28-people/out/ppl_repairer_strip2.png", "Repairer: hammer raised, then striking (2 frames, 4 fps) (dwarf)", "Batch 6"),
    ("events/evt_wanderer-lone.png", AGENT / "28-people/out/evt_wanderer-lone.png", "Wanderers on the road: a traveler with a walking staff", "Batch 6"),
    ("events/evt_wanderer-couple.png", AGENT / "28-people/out/evt_wanderer-couple.png", "Wanderers on the road: two travelers", "Batch 6"),
    ("events/evt_wanderer-family.png", AGENT / "28-people/out/evt_wanderer-family.png", "Wanderers on the road: two travelers and a child", "Batch 6"),
    ("events/evt_wanderer-veteran.png", AGENT / "28-people/out/evt_wanderer-veteran.png", "Wanderers on the road: an old soldier on a crutch", "Batch 6"),
    ("events/evt_granary_25.png", AGENT / "29-forage-events/out/evt_granary_25.png", "Granary, a quarter", "Batch 7"),
    ("events/evt_granary_75.png", AGENT / "29-forage-events/out/evt_granary_75.png", "Granary, three quarters", "Batch 7"),
    ("events/evt_forage-action.png", AGENT / "29-forage-events/out/evt_forage-action.png", "The FORAGE orb: basket and sheaf", "Batch 7"),
    ("events/evt_food-lean.png", AGENT / "29-forage-events/out/evt_food-lean.png", "Food event: a lean season", "Batch 7"),
    ("events/evt_food-bountiful.png", AGENT / "29-forage-events/out/evt_food-bountiful.png", "Food event: a bountiful harvest", "Batch 7"),
    ("events/evt_food-raid.png", AGENT / "29-forage-events/out/evt_food-raid.png", "Food event: raiders at the stores", "Batch 7"),
    ("events/evt_food-refugees.png", AGENT / "29-forage-events/out/evt_food-refugees.png", "Food event: more mouths", "Batch 7"),
    ("events/evt_food-warning.png", AGENT / "29-forage-events/out/evt_food-warning.png", "Starvation warning (red: danger)", "Batch 7"),
    ("events/evt_exp-light.png", AGENT / "29-forage-events/out/evt_exp-light.png", "Expedition: A Light in the Dark", "Batch 7"),
    ("events/evt_exp-find.png", AGENT / "29-forage-events/out/evt_exp-find.png", "Expedition: A Lucky Find", "Batch 7"),
    ("events/evt_exp-survivors.png", AGENT / "29-forage-events/out/evt_exp-survivors.png", "Expedition: Survivors Spotted", "Batch 7"),
    ("events/evt_exp-silent.png", AGENT / "29-forage-events/out/evt_exp-silent.png", "Expedition: The Wasteland Was Silent", "Batch 7"),
    ("events/evt_welcome-back.png", AGENT / "29-forage-events/out/evt_welcome-back.png", "Welcome Back: dawn over the wall", "Batch 7"),
    ("events/evt_breach-report.png", AGENT / "29-forage-events/out/evt_breach-report.png", "The Breach report: the broken gate at dawn", "Batch 7"),
    ("events/evt_refugees.png", AGENT / "29-forage-events/out/evt_refugees.png", "Refugees Approach: a group on the road to the gate", "Batch 7"),
    ("cast/cast_sigil-pyreth.png", AGENT / "30-cast/out/cast_sigil-pyreth.png", "Sigil: Elder Pyreth, the ember", "Batch 8"),
    ("cast/cast_sigil-rodain.png", AGENT / "30-cast/out/cast_sigil-rodain.png", "Sigil: Captain Rodain, crossed spears", "Batch 8"),
    ("cast/cast_sigil-mirael.png", AGENT / "30-cast/out/cast_sigil-mirael.png", "Sigil: Scout Mirael, the compass star", "Batch 8"),
    ("cast/cast_sigil-kael.png", AGENT / "30-cast/out/cast_sigil-kael.png", "Sigil: Kael Ironwright, the anvil", "Batch 8"),
    ("cast/cast_sigil-lirae.png", AGENT / "30-cast/out/cast_sigil-lirae.png", "Sigil: Lirae the Ink-Wing, the quill", "Batch 8"),
    ("cast/cast_emblem-gate.png", AGENT / "30-cast/out/cast_emblem-gate.png", "The Gate of Draconia: the narrator's emblem, in a bust's place", "Batch 8"),
    ("cast/bust_pyreth.png", AGENT / "31-busts-simple/out/bust_pyreth_v4.png", "Bust: Elder Pyreth (22x23, shown at x2 in a 44x46 slot)", "simpler busts v4"),
    ("cast/bust_rodain.png", AGENT / "31-busts-simple/out/bust_rodain_v4.png", "Bust: Captain Rodain (22x23, shown at x2 in a 44x46 slot)", "simpler busts v4"),
    ("cast/bust_mirael.png", AGENT / "31-busts-simple/out/bust_mirael_v4.png", "Bust: Scout Mirael (22x23, shown at x2 in a 44x46 slot)", "simpler busts v4"),
    ("cast/bust_kael.png", AGENT / "31-busts-simple/out/bust_kael_v4.png", "Bust: Kael Ironwright (22x23, shown at x2 in a 44x46 slot)", "simpler busts v4"),
    ("cast/bust_lirae.png", AGENT / "31-busts-simple/out/bust_lirae_v4.png", "Bust: Lirae the Ink-Wing (22x23, shown at x2 in a 44x46 slot)", "simpler busts v4"),
    ("cast/bust_varn.png", AGENT / "35-busts-more/out/bust_varn_v1.png", "Bust: Varn, Dragon Recruit (22x23, shown at x2 in a 44x46 slot)", "future busts v1"),
    ("cast/bust_ashara.png", AGENT / "35-busts-more/out/bust_ashara_v1.png", "Bust: Ashara, Elder Wyrm (22x23, shown at x2 in a 44x46 slot)", "future busts v1"),
    ("cast/bust_thornwick.png", AGENT / "35-busts-more/out/bust_thornwick_v3.png", "Bust: Thornwick, the Exiled Mage: human, gnomish ears (22x23, shown at x2 in a 44x46 slot)", "future busts v3"),
    ("cast/bust_sera.png", AGENT / "35-busts-more/out/bust_sera_v2.png", "Bust: Sera the Shieldmaiden: bearfolk (22x23, shown at x2 in a 44x46 slot)", "future busts v2"),
    ("cast/bust_hollow-knight.png", AGENT / "35-busts-more/out/bust_hollow-knight_v1.png", "Bust: The Hollow Knight (22x23, shown at x2 in a 44x46 slot)", "future busts v1"),
    ("interiors/int_keep.png", AGENT / "36-interiors/out/int_keep_v1.png", "Interior header: Draconia Keep: the throne hall (110x34)", "interiors v1"),
    ("interiors/int_lodge.png", AGENT / "36-interiors/out/int_lodge_v1.png", "Interior header: Ranger's Lodge (110x34)", "interiors v1"),
    ("interiors/int_outpost.png", AGENT / "36-interiors/out/int_outpost_v1.png", "Interior header: Explorer's Outpost (110x34)", "interiors v1"),
    ("interiors/int_librarium.png", AGENT / "36-interiors/out/int_librarium_v1.png", "Interior header: Librarium (110x34)", "interiors v1"),
    ("interiors/int_forge.png", AGENT / "36-interiors/out/int_forge_v1.png", "Interior header: The Forge (110x34)", "interiors v1"),
    ("interiors/int_garrison.png", AGENT / "36-interiors/out/int_garrison_v1.png", "Interior header: Garrison (110x34)", "interiors v1"),
    ("interiors/int_housing.png", AGENT / "36-interiors/out/int_housing_v1.png", "Interior header: Housing (110x34)", "interiors v1"),
    ("interiors/int_tower.png", AGENT / "36-interiors/out/int_tower_v1.png", "Interior header: Wall towers, east and west (110x34)", "interiors v1"),
    ("interiors/int_wizard-tower.png", AGENT / "36-interiors/out/int_wizard-tower_v1.png", "Interior header: Wizard's Tower (110x34)", "interiors v1"),
    ("mobs/mob_kobold-strong_idle.png", AGENT / "24-mobs-unmaking/out/strong/mob_kobold-strong_idle.png", "Kobold, strong (deeper cracks): idle", "Unmaking tiers"),
    ("mobs/mob_kobold-strong_hit.png", AGENT / "24-mobs-unmaking/out/strong/mob_kobold-strong_hit.png", "Kobold, strong (deeper cracks): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_kobold-strong_hurt.png", AGENT / "24-mobs-unmaking/out/strong/mob_kobold-strong_hurt.png", "Kobold, strong (deeper cracks): hurt", "Unmaking tiers"),
    ("mobs/mob_kobold-strong_walk_strip2.png", AGENT / "24-mobs-unmaking/out/strong/mob_kobold-strong_walk_strip2.png", "Kobold, strong (deeper cracks): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_goblin-strong_idle.png", AGENT / "24-mobs-unmaking/out/strong/mob_goblin-strong_idle.png", "Goblin, strong (deeper cracks): idle", "Unmaking tiers"),
    ("mobs/mob_goblin-strong_hit.png", AGENT / "24-mobs-unmaking/out/strong/mob_goblin-strong_hit.png", "Goblin, strong (deeper cracks): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_goblin-strong_hurt.png", AGENT / "24-mobs-unmaking/out/strong/mob_goblin-strong_hurt.png", "Goblin, strong (deeper cracks): hurt", "Unmaking tiers"),
    ("mobs/mob_goblin-strong_walk_strip2.png", AGENT / "24-mobs-unmaking/out/strong/mob_goblin-strong_walk_strip2.png", "Goblin, strong (deeper cracks): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_crawler-strong_idle.png", AGENT / "24-mobs-unmaking/out/strong/mob_crawler-strong_idle.png", "Shadow Crawler, strong (deeper cracks): idle", "Unmaking tiers"),
    ("mobs/mob_crawler-strong_hit.png", AGENT / "24-mobs-unmaking/out/strong/mob_crawler-strong_hit.png", "Shadow Crawler, strong (deeper cracks): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_crawler-strong_hurt.png", AGENT / "24-mobs-unmaking/out/strong/mob_crawler-strong_hurt.png", "Shadow Crawler, strong (deeper cracks): hurt", "Unmaking tiers"),
    ("mobs/mob_crawler-strong_walk_strip2.png", AGENT / "24-mobs-unmaking/out/strong/mob_crawler-strong_walk_strip2.png", "Shadow Crawler, strong (deeper cracks): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_orc-strong_idle.png", AGENT / "24-mobs-unmaking/out/strong/mob_orc-strong_idle.png", "Orc, strong (deeper cracks): idle", "Unmaking tiers"),
    ("mobs/mob_orc-strong_hit.png", AGENT / "24-mobs-unmaking/out/strong/mob_orc-strong_hit.png", "Orc, strong (deeper cracks): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_orc-strong_hurt.png", AGENT / "24-mobs-unmaking/out/strong/mob_orc-strong_hurt.png", "Orc, strong (deeper cracks): hurt", "Unmaking tiers"),
    ("mobs/mob_orc-strong_walk_strip2.png", AGENT / "24-mobs-unmaking/out/strong/mob_orc-strong_walk_strip2.png", "Orc, strong (deeper cracks): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_raider-strong_idle.png", AGENT / "24-mobs-unmaking/out/strong/mob_raider-strong_idle.png", "Raider, strong (deeper cracks): idle", "Unmaking tiers"),
    ("mobs/mob_raider-strong_hit.png", AGENT / "24-mobs-unmaking/out/strong/mob_raider-strong_hit.png", "Raider, strong (deeper cracks): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_raider-strong_hurt.png", AGENT / "24-mobs-unmaking/out/strong/mob_raider-strong_hurt.png", "Raider, strong (deeper cracks): hurt", "Unmaking tiers"),
    ("mobs/mob_raider-strong_walk_strip2.png", AGENT / "24-mobs-unmaking/out/strong/mob_raider-strong_walk_strip2.png", "Raider, strong (deeper cracks): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_kobold-stronger_idle.png", AGENT / "24-mobs-unmaking/out/stronger/mob_kobold-stronger_idle.png", "Kobold, stronger (the Unmaking's deepest): idle", "Unmaking tiers"),
    ("mobs/mob_kobold-stronger_hit.png", AGENT / "24-mobs-unmaking/out/stronger/mob_kobold-stronger_hit.png", "Kobold, stronger (the Unmaking's deepest): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_kobold-stronger_hurt.png", AGENT / "24-mobs-unmaking/out/stronger/mob_kobold-stronger_hurt.png", "Kobold, stronger (the Unmaking's deepest): hurt", "Unmaking tiers"),
    ("mobs/mob_kobold-stronger_walk_strip2.png", AGENT / "24-mobs-unmaking/out/stronger/mob_kobold-stronger_walk_strip2.png", "Kobold, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_goblin-stronger_idle.png", AGENT / "24-mobs-unmaking/out/stronger/mob_goblin-stronger_idle.png", "Goblin, stronger (the Unmaking's deepest): idle", "Unmaking tiers"),
    ("mobs/mob_goblin-stronger_hit.png", AGENT / "24-mobs-unmaking/out/stronger/mob_goblin-stronger_hit.png", "Goblin, stronger (the Unmaking's deepest): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_goblin-stronger_hurt.png", AGENT / "24-mobs-unmaking/out/stronger/mob_goblin-stronger_hurt.png", "Goblin, stronger (the Unmaking's deepest): hurt", "Unmaking tiers"),
    ("mobs/mob_goblin-stronger_walk_strip2.png", AGENT / "24-mobs-unmaking/out/stronger/mob_goblin-stronger_walk_strip2.png", "Goblin, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_crawler-stronger_idle.png", AGENT / "24-mobs-unmaking/out/stronger/mob_crawler-stronger_idle.png", "Shadow Crawler, stronger (the Unmaking's deepest): idle", "Unmaking tiers"),
    ("mobs/mob_crawler-stronger_hit.png", AGENT / "24-mobs-unmaking/out/stronger/mob_crawler-stronger_hit.png", "Shadow Crawler, stronger (the Unmaking's deepest): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_crawler-stronger_hurt.png", AGENT / "24-mobs-unmaking/out/stronger/mob_crawler-stronger_hurt.png", "Shadow Crawler, stronger (the Unmaking's deepest): hurt", "Unmaking tiers"),
    ("mobs/mob_crawler-stronger_walk_strip2.png", AGENT / "24-mobs-unmaking/out/stronger/mob_crawler-stronger_walk_strip2.png", "Shadow Crawler, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_orc-stronger_idle.png", AGENT / "24-mobs-unmaking/out/stronger/mob_orc-stronger_idle.png", "Orc, stronger (the Unmaking's deepest): idle", "Unmaking tiers"),
    ("mobs/mob_orc-stronger_hit.png", AGENT / "24-mobs-unmaking/out/stronger/mob_orc-stronger_hit.png", "Orc, stronger (the Unmaking's deepest): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_orc-stronger_hurt.png", AGENT / "24-mobs-unmaking/out/stronger/mob_orc-stronger_hurt.png", "Orc, stronger (the Unmaking's deepest): hurt", "Unmaking tiers"),
    ("mobs/mob_orc-stronger_walk_strip2.png", AGENT / "24-mobs-unmaking/out/stronger/mob_orc-stronger_walk_strip2.png", "Orc, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("mobs/mob_raider-stronger_idle.png", AGENT / "24-mobs-unmaking/out/stronger/mob_raider-stronger_idle.png", "Raider, stronger (the Unmaking's deepest): idle", "Unmaking tiers"),
    ("mobs/mob_raider-stronger_hit.png", AGENT / "24-mobs-unmaking/out/stronger/mob_raider-stronger_hit.png", "Raider, stronger (the Unmaking's deepest): hit, the red flash", "Unmaking tiers"),
    ("mobs/mob_raider-stronger_hurt.png", AGENT / "24-mobs-unmaking/out/stronger/mob_raider-stronger_hurt.png", "Raider, stronger (the Unmaking's deepest): hurt", "Unmaking tiers"),
    ("mobs/mob_raider-stronger_walk_strip2.png", AGENT / "24-mobs-unmaking/out/stronger/mob_raider-stronger_walk_strip2.png", "Raider, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps)", "Unmaking tiers"),
    ("logo/logo_anim_frames_strip20.png", AGENT / "25-logo/out/logo_anim_frames_strip20.png", "Logo animation: the shield slams in, the claws slash upward, the logo assembles (play with logo_anim_timing.json)", "logo"),
    ("logo/logo_anim_timing.json", AGENT / "25-logo/out/logo_anim_timing.json", "Logo animation: each frame's hold in ms, frame size, background", "logo"),
    ("icons/icon_heartstone.png", AGENT / "32-heartstone/out/icon_heartstone-teardrop-flame_12.png", "The heartstone: a teardrop of aetherglass with the heart-flame inside, 12x12", "heartstone v3"),
    ("icons/icon_heartstone_flicker_strip4.png", AGENT / "32-heartstone/out/icon_heartstone-teardrop-flame_12_flicker_strip4.png", "The heartstone, its flame flickering, 12x12 (4 frames, 8 fps; drawn for 140, 90, 160, 110 ms)", "heartstone v3"),
    ("icons/icon_heartstone_16.png", AGENT / "32-heartstone/out/icon_heartstone-teardrop-flame_16.png", "The heartstone, 16x16", "heartstone v3"),
    ("icons/icon_heartstone_16_flicker_strip4.png", AGENT / "32-heartstone/out/icon_heartstone-teardrop-flame_16_flicker_strip4.png", "The heartstone, its flame flickering, 16x16 (4 frames, 8 fps; drawn for 140, 90, 160, 110 ms)", "heartstone v3"),
    ("mobs/mob_kobold_death_strip4.png", AGENT / "33-mob-deaths/out/mob_kobold_death_strip4.png", "Kobold: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_goblin_death_strip4.png", AGENT / "33-mob-deaths/out/mob_goblin_death_strip4.png", "Goblin: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_crawler_death_strip4.png", AGENT / "33-mob-deaths/out/mob_crawler_death_strip4.png", "Shadow Crawler: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_orc_death_strip4.png", AGENT / "33-mob-deaths/out/mob_orc_death_strip4.png", "Orc: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_raider_death_strip4.png", AGENT / "33-mob-deaths/out/mob_raider_death_strip4.png", "Raider: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_kobold-strong_death_strip4.png", AGENT / "33-mob-deaths/out/mob_kobold-strong_death_strip4.png", "Kobold, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_goblin-strong_death_strip4.png", AGENT / "33-mob-deaths/out/mob_goblin-strong_death_strip4.png", "Goblin, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_crawler-strong_death_strip4.png", AGENT / "33-mob-deaths/out/mob_crawler-strong_death_strip4.png", "Shadow Crawler, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_orc-strong_death_strip4.png", AGENT / "33-mob-deaths/out/mob_orc-strong_death_strip4.png", "Orc, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_raider-strong_death_strip4.png", AGENT / "33-mob-deaths/out/mob_raider-strong_death_strip4.png", "Raider, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_kobold-stronger_death_strip4.png", AGENT / "33-mob-deaths/out/mob_kobold-stronger_death_strip4.png", "Kobold, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_goblin-stronger_death_strip4.png", AGENT / "33-mob-deaths/out/mob_goblin-stronger_death_strip4.png", "Goblin, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_crawler-stronger_death_strip4.png", AGENT / "33-mob-deaths/out/mob_crawler-stronger_death_strip4.png", "Shadow Crawler, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_orc-stronger_death_strip4.png", AGENT / "33-mob-deaths/out/mob_orc-stronger_death_strip4.png", "Orc, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
    ("mobs/mob_raider-stronger_death_strip4.png", AGENT / "33-mob-deaths/out/mob_raider-stronger_death_strip4.png", "Raider, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "monster deaths"),
]

ASSETS += [
    ("story/story_prologue.png", AGENT / "37-story/out/story_prologue_v1.png", "Story: the prologue, The Walls of Draconia (130x96, shown at the map's scale)", "story v1"),
    ("story/story_breach.png", AGENT / "37-story/out/story_breach_v1.png", "Story: the Breach, The Wall Falls (130x96, shown at the map's scale)", "story v1"),
]

# The city at night and dusk: every city and building piece above, relit (34-city-light). A strip keeps
# its _stripN ending last, so the game still reads it as a strip.
LIGHT = AGENT / "34-city-light/out"
for dest, src, what, origin in [a for a in ASSETS if a[0].startswith(("city/map_", "buildings/bld_")) and a[0].endswith(".png")]:
    stem = pathlib.Path(dest).stem
    for level in ("night", "dusk"):
        base, _, n = stem.rpartition("_strip") if "_strip" in stem else (stem, "", "")
        name = f"{base}_{level}_strip{n}" if n else f"{stem}_{level}"
        ASSETS.append((f"{pathlib.Path(dest).parent.as_posix()}/{name}.png", LIGHT / f"{stem}_{level}.png",
                       f"{what}, at {level}", "city light levels"))

# Sound effects (38-sound): the .m4a the app plays; the .wav masters stay in the batch folder.
SOUND = AGENT / "38-sound/out"
ASSETS += [(f"sound/{n}.m4a", SOUND / f"{n}.m4a", what, "sound v1") for n, what in [
    ("splash_full", "The studio splash, every beat on the seal's frame timing"),
    ("splash_slam", "Splash: the plates slam together (beat slam)"),
    ("splash_medallion-top", "Splash: a medallion settles (beat medallion_top)"),
    ("splash_medallion-left", "Splash: a medallion settles, a step higher (beat medallion_left)"),
    ("splash_medallion-right", "Splash: a medallion settles, higher again (beat medallion_right)"),
    ("splash_etch", "Splash: the runes etched in blue (beat etch, until the slash)"),
    ("splash_slash", "Splash: the name cut in gold (beat slash)"),
    ("splash_spread", "Splash: gold runs out from the cut (beat spread)"),
    ("splash_smash", "Splash: the seal smashes to gold (beat smash)"),
    ("sfx_monster-death", "A monster dies, on its death strip's frames: the thud at 250 ms, glints at 375 ms"),
    ("sfx_wall-hit", "A monster strikes the wall"),
    ("sfx_breach", "The wall falls"),
    ("sfx_build-complete", "A building finished: three hammer taps and a warm chord"),
    ("sfx_heartstone", "The heartstone's soft pulse"),
]]

SOUND2 = AGENT / "39-sound-2/out"
ASSETS += [(f"sound/{n}.m4a", SOUND2 / f"{n}.m4a", what, "sound batch 2 v1") for n, what in [
    ('sfx_crit', 'A critical hit: a harder cut, a heavy impact, a sparkle'),
    ('sfx_slash-ember', 'The ember claws: a fire whoosh to lay over the strike'),
    ('sfx_walk-up', "The next monster's three footfalls, across the 350 ms walk-up"),
    ('sfx_gate-crack', 'The wall cracks: a stone groan, a crack, grit falling'),
    ('sfx_unmaking-rise', 'The Unmaking rises: a reversed shimmer, then a low, uneasy swell'),
    ('sfx_rally', 'The rally horn'),
    ('sfx_mend', 'Mending the wall: chisel taps, then a mallet'),
    ('sfx_build-start', 'Construction starts: saw strokes, two mallet knocks'),
    ('sfx_city-brightens', 'The city brightens: a rising chime over a warm chord'),
    ('sfx_research-done', 'Research done: a page turns, two bright notes'),
    ('sfx_expedition-out', 'An expedition leaves: a horn note, footsteps going away'),
    ('sfx_expedition-back', 'An expedition returns: footsteps coming near, a two-note horn'),
    ('sfx_find', 'A find: a chest creaks open, something glitters'),
    ('sfx_gate-knock', 'Someone at the gate (wanderers, refugees): three knocks'),
    ('sfx_food-low', 'Food running low: a low bell, tolled twice'),
    ('sfx_food-raid', 'A food raid: an alarm bell over a scuffle'),
    ('sfx_granary-full', 'The granary is full: a sack thumps down, a pleased chime'),
    ('sfx_scene-open', 'A story scene opens: a parchment unrolls'),
    ('sfx_fanfare', 'A quest done or Renown gained: horns up a major chord'),
    ('sfx_welcome-back', 'Welcome back (offline): a soft dawn'),
    ('sfx_sting-sera', 'Sera arrives: a shield bash'),
    ('sfx_sting-thornwick', 'Thornwick arrives: a spark fizzes up and pops'),
    ('sfx_sting-hollow-knight', 'The Hollow Knight arrives: one armored step, ringing hollow'),
    ('amb_torches', 'Loop, 8 s, seamless: the Warfront torches'),
    ('amb_forge', 'Loop, 8 s, seamless: the forge, the bellows every few seconds'),
    ('amb_night-wind', 'Loop, 8 s, seamless: night wind. Mastered loud; play it well under the rest (owner, 2026-10-27)'),
    ('amb_horde-drums', "Loop, 8 s, seamless: the horde's drums far off, 12 beats at 90 a minute"),
]]

ASSETS += [
    ("cast/cast_sigil-varn.png", AGENT / "40-icons-sigils/out/cast_sigil-varn_v2a.png", "Sigil: Varn, a cracked egg", "sigils v2a"),
    ("cast/cast_sigil-ashara.png", AGENT / "40-icons-sigils/out/cast_sigil-ashara_v1.png", "Sigil: Ashara, her burning eye", "sigils v1"),
    ("cast/cast_sigil-thornwick.png", AGENT / "40-icons-sigils/out/cast_sigil-thornwick_v1.png", "Sigil: Thornwick, his scorched hat", "sigils v1"),
    ("cast/cast_sigil-sera.png", AGENT / "40-icons-sigils/out/cast_sigil-sera_v1.png", "Sigil: Sera, her round shield", "sigils v1"),
    ("cast/cast_sigil-hollow-knight.png", AGENT / "40-icons-sigils/out/cast_sigil-hollow-knight_v1.png", "Sigil: the Hollow Knight, an empty helm", "sigils v1"),
    ("icons/icon_res_cartography.png", AGENT / "40-icons-sigils/out/icon_res_cartography_v1.png", "Study: Cartography, a chart and dividers", "icons v1"),
    ("icons/icon_res_keen_scouts.png", AGENT / "40-icons-sigils/out/icon_res_keen_scouts_v1.png", "Study: Keen Scouts, a spyglass", "icons v1"),
    ("icons/icon_warning.png", AGENT / "40-icons-sigils/out/icon_warning_v1.png", "Warning (confirm dialog): a gold triangle", "icons v1"),
    ("icons/icon_hand.png", AGENT / "40-icons-sigils/out/icon_hand_v1.png", "Total clicks: an open hand", "icons v1"),
    ("icons/icon_phone.png", AGENT / "40-icons-sigils/out/icon_phone_v1.png", "Vibration: a phone", "icons v1"),
    ("icons/icon_consumption.png", AGENT / "40-icons-sigils/out/icon_consumption_v2a.png", "Consumption (food eaten per second): a leaking grain sack", "icons v2a"),
]

# The Minotaur boss (41-minotaur), every pose at each Unmaking tier
for _tier, _label in (("", ""), ("-strong", ", strong"), ("-stronger", ", stronger (the Unmaking's deepest)")):
    _n = f"mob_minotaur{_tier}"
    ASSETS += [
        (f"mobs/{_n}_idle.png", AGENT / f"41-minotaur/out/{_n}_idle.png", f"Minotaur{_label}: idle", "Minotaur v1"),
        (f"mobs/{_n}_hit.png", AGENT / f"41-minotaur/out/{_n}_hit.png", f"Minotaur{_label}: hit, the red flash", "Minotaur v1"),
        (f"mobs/{_n}_hurt.png", AGENT / f"41-minotaur/out/{_n}_hurt.png", f"Minotaur{_label}: hurt, the axe broken", "Minotaur v1"),
        (f"mobs/{_n}_walk_strip2.png", AGENT / f"41-minotaur/out/{_n}_walk_strip2.png", f"Minotaur{_label}: walk bob (2 frames, 4 fps)", "Minotaur v1"),
        (f"mobs/{_n}_death_strip4.png", AGENT / f"41-minotaur/out/{_n}_death_strip4.png", f"Minotaur{_label}: death, buckles, falls, lands, unmade (4 frames, 8 fps)", "Minotaur v1"),
    ]

# A second expression for each bust (42-expressions); the Hollow Knight has none, by design
ASSETS += [(f"cast/bust_{b}_{e}.png", AGENT / f"42-expressions/out/bust_{b}_{e}_v1.png", f"Bust: {n}, {e} (22x23)", "expressions v1")
           for b, e, n in (("pyreth", "grieving", "Elder Pyreth"), ("rodain", "grieving", "Captain Rodain"),
                           ("mirael", "alarmed", "Scout Mirael"), ("kael", "angry", "Kael Ironwright"),
                           ("lirae", "grieving", "Lirae the Ink-Wing"), ("varn", "fierce", "Varn"),
                           ("ashara", "grieving", "Ashara"), ("thornwick", "startled", "Thornwick"),
                           ("sera", "roaring", "Sera"))]

# Story scenes (43-story-scenes), one per scene in src/data/story/lines.ts
ASSETS += [(f"story/story_{s}.png", AGENT / f"43-story-scenes/out/story_{s}_v1.png", f"Story: {t} (130x96)", "story scenes v1")
           for s, t in (("elder-approaches", "The Elder Approaches"), ("renown", "Renown"), ("wall-holds", "The Wall Holds"),
                        ("wall-shakes", "The Wall Shakes"), ("young-claws", "Young Claws"), ("wall-is-yours", "The Wall Is Yours"),
                        ("stores-run-low", "Our Stores Run Low"), ("stranger", "A Stranger on the Road"),
                        ("city-not-a-wall", "A City, Not a Wall"), ("forge-is-cold", "The Forge Is Cold"),
                        ("beyond-the-walls", "Beyond the Walls"), ("keep-restored", "The Keep Restored"),
                        ("rangers-lodge", "The Ranger's Lodge"), ("ink-wing", "The Ink-Wing"), ("dragonsteel", "Dragonsteel"),
                        ("they-come-bigger", "They Come Bigger"), ("ancient-magic", "The Ancient Magic"))]

# The bestiary, every pose at each Unmaking tier: 44-bestiary (the rat as its v2, longer cracks and peach in
# place of pink, approved 2026-10-27), 45-bestiary-regulars, 46-bestiary-elites and 47-bestiary-bosses (the
# second round; the Lich as v2a, cold gray bone, owner 2026-10-27)
BESTIARY = AGENT / "44-bestiary/out"
REGULARS = AGENT / "45-bestiary-regulars/out"
ELITES = AGENT / "46-bestiary-elites/out"
BOSSES = AGENT / "47-bestiary-bosses/out"
for _dir, _origin, _id, _name in [(BESTIARY, "bestiary v1", i, n) for i, n in (
                   ("rat", "Giant Rat"), ("goblin-scout", "Goblin Scout"), ("goblin-archer", "Goblin Archer"),
                   ("banner-runner", "Banner-Runner"), ("shield-bearer", "Shield Bearer"),
                   ("beetle-guard", "Beetle Guard"), ("chitin-warrior", "Chitin Warrior"),
                   ("nomad-warrior", "Nomad Warrior"), ("wraith", "Wraith"), ("shadow-phantom", "Shadow Phantom"),
                   ("ashen-convert", "Ashen Convert"), ("ember-prophet", "Ember Prophet"),
                   ("ember-wraith", "Ember Wraith"), ("stone-golem", "Stone Golem (boss)"),
                   ("giant-elemental", "Giant Elemental (boss)"), ("khagan", "Khagan of the Sirocco (boss)"),
                   ("forge-master", "Forge-Master of the Inferno (boss)"),
                   ("corrupted-wyvern", "Corrupted Wyvern (boss)"))] + [(REGULARS, "bestiary regulars v1", i, n) for i, n in (
            ("war-hound", "War Hound"), ("skeleton", "Skeleton"), ("spectral-hound", "Spectral Hound"),
            ("nomad-scout", "Nomad Scout"), ("nomad-archer", "Nomad Archer"), ("cult-apprentice", "Cult Apprentice"))] +         [(ELITES, "bestiary elites v1", i, n) for i, n in (
            ("kobold-shaman", "Kobold Shaman (elite)"), ("goblin-chieftain", "Goblin Chieftain (elite)"),
            ("orc-warchief", "Orc Warchief (elite)"), ("troll", "Troll (elite)"), ("ogre", "Ogre (elite)"),
            ("iron-golem", "Iron Golem (elite)"), ("windcaller", "Windcaller (elite)"))] +         [(BOSSES, "bestiary bosses v1", i, n) for i, n in (
            ("basilisk", "Basilisk (boss)"), ("spider-queen", "Spider Queen (boss)"),
            ("corrupted-drake", "Corrupted Drake (boss)"), ("lich", "Lich (boss, v2a)"))]:
    for _tier, _label in (("", ""), ("-strong", ", strong"), ("-stronger", ", stronger (the Unmaking's deepest)")):
        _n = f"mob_{_id}{_tier}"
        ASSETS += [
            (f"mobs/{_n}_idle.png", _dir / f"{_n}_idle.png", f"{_name}{_label}: idle", _origin),
            (f"mobs/{_n}_hit.png", _dir / f"{_n}_hit.png", f"{_name}{_label}: hit, the red flash", _origin),
            (f"mobs/{_n}_hurt.png", _dir / f"{_n}_hurt.png", f"{_name}{_label}: hurt", _origin),
            (f"mobs/{_n}_walk_strip2.png", _dir / f"{_n}_walk_strip2.png", f"{_name}{_label}: walk bob (2 frames, 4 fps)", _origin),
            (f"mobs/{_n}_death_strip4.png", _dir / f"{_n}_death_strip4.png", f"{_name}{_label}: death, buckles, falls, lands, unmade (4 frames, 8 fps)", _origin),
        ]

# The six monsters already in the game, shaded like the busts (44-bestiary v2, owner 2026-10-27): every
# pose and tier now comes from the shaded set. Same file names and sizes as before.
_SHADED = ("kobold", "goblin", "crawler", "orc", "raider", "minotaur")
for _i, (_dest, _src, _what, _origin) in enumerate(ASSETS):
    _stem = pathlib.Path(_dest).name
    _mob = _stem.split("_")[1].removesuffix("-stronger").removesuffix("-strong")
    if _dest.startswith("mobs/") and _mob in _SHADED and not _stem.endswith(".piskel"):
        _new = BESTIARY / "v2" / _stem
        assert _new.exists(), _new
        ASSETS[_i] = (_dest, _new, _what, "shaded v2 (" + _origin + ")")

rows = []
for dest, src, what, origin in ASSETS:
    out = HERE / dest
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, out)
    if dest.endswith(".m4a"):
        with wave.open(str(src.with_suffix(".wav"))) as w:
            size = f"{w.getnframes() / w.getframerate():.2f} s"
    else:
        size = "" if dest.endswith((".piskel", ".json")) else "{}x{}".format(*Image.open(out).size)
    rows.append(f"| `{dest}` | {size} | {what} | {origin} |")

register = """# Official pixel art and sound: Draconia Chronicles

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
