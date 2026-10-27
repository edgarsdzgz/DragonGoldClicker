# Official pixel art and sound: Draconia Chronicles

Locked by the owner on 2026-10-26. These are the game's official assets.

- **Never edit an official file in place.** Draw a change as a new version in a batch folder under
  `_dev/art/agent/`; it replaces the official file only when the owner approves it.
- Sizes are native pixels. The game scales them by whole numbers with nearest-neighbor, never smoothing.
- The sources and their grids live in the batch folders; `collect.py` copies them here and writes
  this file. Run `python collect.py` after an approved change.

| File | Size | What it is | From |
| --- | --- | --- | --- |
| `icons/icon_hourglass.png` | 12x12 | Timers | test run |
| `icons/icon_flame.png` | 12x12 | Warfront tab | test run |
| `icons/icon_cog.png` | 12x12 | Settings | icon redraw |
| `icons/icon_wheat.png` | 12x12 | Foragers, Forage tab | icon redraw (v2, the ear) |
| `icons/icon_hammer.png` | 12x12 | Repairers | icon redraw |
| `icons/icon_helm.png` | 12x12 | Soldiers | options (plumed barbute; replaced the great helm) |
| `icons/icon_close.png` | 12x12 | Close | options (red stone plate; red is an owner exception for Close) |
| `icons/icon_reassign.png` | 12x12 | Reassign | options (chunky arrows) |
| `icons/icon_shield.png` | 12x12 | Fighters | icon sheet 3 |
| `icons/icon_gate.png` | 12x12 | Gate | icon sheet 3 |
| `icons/icon_damage.png` | 12x12 | Damage | icon sheet 3 |
| `icons/icon_skull.png` | 12x12 | Death, reset | icon sheet 3 |
| `icons/icon_rations.png` | 12x12 | Rations | icon sheet 3 |
| `icons/icon_bell.png` | 12x12 | Next meal | icon sheet 3 |
| `icons/icon_train.png` | 12x12 | Train | townsfolk bust (replaced the sheet-3 train) |
| `icons/icon_book.png` | 12x12 | Librarium | icon sheet 3 |
| `icons/icon_padlock.png` | 12x12 | Locked | icon sheet 2 |
| `icons/icon_flag.png` | 12x12 | Objective | icon sheet 2 |
| `icons/icon_compass.png` | 12x12 | Explorers | icon sheet 2 |
| `icons/icon_upgrade.png` | 12x12 | Upgrade | icon sheet 2 |
| `icons/icon_check.png` | 12x12 | Done | icon sheet 2 |
| `icons/icon_star.png` | 12x12 | Renown | mockup v1 |
| `icons/icon_food.png` | 12x12 | Food | food and journal options (cheese wedge; replaced the bun) |
| `icons/icon_villager.png` | 12x12 | Villagers | townsfolk bust (replaced the mockup villager) |
| `icons/icon_swords.png` | 12x12 | Sword gear (stand-in for Fighters) | mockup v1 |
| `icons/icon_scroll.png` | 12x12 | Journal | food and journal options (rolled scroll; replaced the v1 scroll) |
| `icons/icon_castle.png` | 12x12 | Draconia tab, Keep | mockup v1 |
| `icons/icon_claw-1.png` | 16x16 | Claws 1: Fledgling | claw tiers |
| `icons/icon_claw-2.png` | 16x16 | Claws 2: Sharpened | claw tiers |
| `icons/icon_claw-3.png` | 16x16 | Claws 3: Hooked | claw tiers |
| `icons/icon_claw-4.png` | 16x16 | Claws 4: Hardened | claw tiers |
| `icons/icon_claw-5.png` | 16x16 | Claws 5: Serrated | claw tiers |
| `icons/icon_claw-6.png` | 16x16 | Claws 6: Obsidian | claw tiers |
| `icons/icon_claw-7.png` | 16x16 | Claws 7: Ember | claw tiers |
| `icons/icon_claw-8.png` | 16x16 | Claws 8: Dragonsteel | claw tiers |
| `icons/icon_claw-9.png` | 16x16 | Claws 9: Ancient | claw tiers |
| `icons/icon_next.png` | 12x12 | Next, go | icon sheet 4 |
| `icons/icon_unknown.png` | 12x12 | Unknown, help | options 3 (crystal ball with the gold question mark) |
| `icons/icon_info.png` | 12x12 | Info | options 2 (rune stone) |
| `icons/icon_rising.png` | 12x12 | Rising stores | options 2 (cut gem) |
| `icons/icon_falling.png` | 12x12 | Falling stores | options 2 (cut gem, brick: red stays for HP and danger) |
| `icons/icon_rank.png` | 12x12 | Rank | icon sheet 4 |
| `icons/icon_shield_gear.png` | 12x12 | Shield gear | icon sheet 4 |
| `icons/icon_claws.png` | 12x12 | Claws (the track) | icon sheet 4 |
| `icons/icon_moon.png` | 12x12 | Offline, rest | icon sheet 4 |
| `icons/icon_sparkles.png` | 12x12 | Wizard's Tower | icon sheet 4 |
| `icons/icon_map.png` | 12x12 | Map | icon sheet 4 |
| `icons/icon_stats.png` | 12x12 | Stats | food and journal options (quill and inkpot) |
| `icons/icon_res_dragon_anatomy.png` | 12x12 | Research: Dragon Anatomy | research (the wyrm's eye) |
| `icons/icon_res_weak_points.png` | 12x12 | Research: Weak Points | research (target) |
| `icons/icon_res_wyrms_fury.png` | 12x12 | Research: Wyrm's Fury | research options (ruby shard; owner exception to the red rule) |
| `icons/icon_res_drill_tactics.png` | 12x12 | Research: Drill Tactics | research (training dummy) |
| `icons/icon_res_tempered_steel.png` | 12x12 | Research: Tempered Steel | research options (hammer before Kael's anvil) |
| `icons/icon_res_battle_drill.png` | 12x12 | Research: Battle Drill | research (three spears) |
| `icons/icon_res_rationing.png` | 12x12 | Research: Rationing | research (brass balance) |
| `icons/icon_res_lean_rations.png` | 12x12 | Research: Lean Rations | research (hardtack) |
| `icons/icon_res_snares_and_nets.png` | 12x12 | Research: Snares and Nets | research options (spring snare) |
| `icons/icon_res_feast_hall.png` | 12x12 | Research: Feast Hall | research (tankard) |
| `icons/icon_res_mortar_craft.png` | 12x12 | Research: Mortar Craft | research options (trowel after the owner's reference) |
| `icons/icon_res_night_ledgers.png` | 12x12 | Research: Night Ledgers | research (candle with a handle) |
| `icons/icon_res_evacuation_drills.png` | 12x12 | Research: Evacuation Drills | research options (the way out) |
| `people/ppl_human.png` | 11x16 | Townsfolk: human | mockup v1 |
| `people/ppl_elf.png` | 11x16 | Townsfolk: elf | mockup v1 |
| `people/ppl_horned.png` | 11x16 | Townsfolk: horned folk | mockup v1 |
| `people/ppl_dwarf.png` | 11x16 | Townsfolk: dwarf (stockier redraw) | peoples |
| `people/ppl_halfling.png` | 11x16 | Townsfolk: halfling | peoples |
| `people/ppl_orc.png` | 11x16 | Townsfolk: orc | peoples |
| `people/ppl_birdfolk.png` | 11x16 | Townsfolk: birdfolk | peoples |
| `people/ppl_fishfolk.png` | 11x16 | Townsfolk: fishfolk | peoples |
| `people/ppl_catfolk.png` | 11x16 | Townsfolk: catfolk | peoples |
| `people/ppl_fighter_idle.png` | 11x20 | Fighter, standing | test run |
| `people/ppl_fighter_attack_strip2.png` | 32x20 | Fighter, spear jab (6 fps) | test run |
| `people/ppl_fighter_attack.piskel` |  | Fighter jab, Piskel file | test run |
| `fx/fx_spark_strip4.png` | 48x12 | Hit spark (12 fps) | test run |
| `fx/fx_spark.piskel` |  | Hit spark, Piskel file | test run |
| `events/evt_granary_0.png` | 32x32 | Granary, empty | test run |
| `events/evt_granary_50.png` | 32x32 | Granary, half | test run |
| `events/evt_granary_100.png` | 32x32 | Granary, full | test run |
| `city/map_city_base.png` | 130x282 | City base map, no buildings (lit look) | batch 2 |
| `city/map_plots.json` |  | The ten plots: id, x, y, size, anchor | batch 2 |
| `city/map_fog_20x32.png` | 20x32 | Fog over an undiscovered plot, 20 x 32 | batch 2 |
| `city/map_fog_24x40.png` | 24x40 | Fog over an undiscovered plot, 24 x 40 | batch 2 |
| `city/map_fog_32x32.png` | 32x32 | Fog over an undiscovered plot, 32 x 32 | batch 2 |
| `city/map_fog_50x82.png` | 50x82 | Fog over an undiscovered plot, 50 x 82 | batch 2 |
| `city/map_foundation_20x32.png` | 20x32 | Foundation (first build step), 20 x 32 | batch 2 |
| `city/map_foundation_24x40.png` | 24x40 | Foundation (first build step), 24 x 40 | batch 2 |
| `city/map_foundation_32x32.png` | 32x32 | Foundation (first build step), 32 x 32 | batch 2 |
| `city/map_foundation_50x82.png` | 50x82 | Foundation (first build step), 50 x 82 | batch 2 |
| `city/map_plot-empty_20x32.png` | 20x32 | Cleared ground (unbuilt plot), 20 x 32 | batch 2 |
| `city/map_plot-empty_24x40.png` | 24x40 | Cleared ground (unbuilt plot), 24 x 40 | batch 2 |
| `city/map_plot-empty_32x32.png` | 32x32 | Cleared ground (unbuilt plot), 32 x 32 | batch 2 |
| `city/map_plot-empty_50x82.png` | 50x82 | Cleared ground (unbuilt plot), 50 x 82 | batch 2 |
| `city/map_scaffold_20x32.png` | 20x32 | Scaffold (building going up), 20 x 32 | batch 2 |
| `city/map_scaffold_24x40.png` | 24x40 | Scaffold (building going up), 24 x 40 | batch 2 |
| `city/map_scaffold_32x32.png` | 32x32 | Scaffold (building going up), 32 x 32 | batch 2 |
| `city/map_scaffold_50x82.png` | 50x82 | Scaffold (building going up), 50 x 82 | batch 2 |
| `city/map_marker-upgrade.png` | 8x8 | Map marker: upgrade ready | batch 2 |
| `city/map_marker-todo.png` | 8x8 | Map marker: something to do | batch 2 |
| `buildings/bld_keep_ruin.png` | 50x82 | Draconia Keep: ruin | batch 3 |
| `buildings/bld_keep_built.png` | 50x82 | Draconia Keep: built | batch 3 |
| `buildings/bld_keep_restored.png` | 50x82 | Draconia Keep: restored | batch 3 |
| `buildings/bld_garrison_ruin.png` | 32x32 | The Garrison: ruin | batch 3 |
| `buildings/bld_garrison_lv1.png` | 32x32 | The Garrison: lv1 | batch 3 |
| `buildings/bld_garrison_lv3.png` | 32x32 | The Garrison: lv3 | batch 3 |
| `buildings/bld_garrison_lv5.png` | 32x32 | The Garrison: lv5 | batch 3 |
| `buildings/bld_forge_ruin.png` | 32x32 | The Forge: ruin | batch 3 |
| `buildings/bld_forge_built.png` | 32x32 | The Forge: built | batch 3 |
| `buildings/bld_forge_lit.png` | 32x32 | The Forge: lit | batch 3 |
| `buildings/bld_forge_lit_strip3.png` | 96x32 | The Forge: lit, fire flickering (3 frames) | batch 3 |
| `buildings/bld_lodge_ruin.png` | 32x32 | Ranger's Lodge: ruin | batch 3 |
| `buildings/bld_lodge_lv1.png` | 32x32 | Ranger's Lodge: lv1 | batch 3 |
| `buildings/bld_lodge_lv3.png` | 32x32 | Ranger's Lodge: lv3 | batch 3 |
| `buildings/bld_outpost_ruin.png` | 32x32 | Wayfinder's Outpost: ruin | batch 3 |
| `buildings/bld_outpost_built.png` | 32x32 | Wayfinder's Outpost: built | batch 3 |
| `buildings/bld_outpost_upgraded.png` | 32x32 | Wayfinder's Outpost: upgraded | batch 3 |
| `buildings/bld_librarium_ruin.png` | 32x32 | The Librarium: ruin | batch 3 |
| `buildings/bld_librarium_built.png` | 32x32 | The Librarium: built | batch 3 |
| `buildings/bld_housing_house.png` | 32x32 | Housing: house | batch 3 |
| `buildings/bld_housing_row.png` | 32x32 | Housing: row | batch 3 |
| `buildings/bld_wizard-tower_ruin.png` | 24x40 | Wizard's Tower: ruin | batch 3 |
| `buildings/bld_wizard-tower_built.png` | 24x40 | Wizard's Tower: built | batch 3 |
| `buildings/bld_tower-west_ruin.png` | 20x32 | Tower West: ruin | batch 3 |
| `buildings/bld_tower-west_built.png` | 20x32 | Tower West: built | batch 3 |
| `buildings/bld_tower-east_ruin.png` | 20x32 | Tower East: ruin | batch 3 |
| `buildings/bld_tower-east_built.png` | 20x32 | Tower East: built | batch 3 |
| `icons/icon_bld-keep.png` | 16x16 | Building: Draconia Keep | batch 3 building icons |
| `icons/icon_bld-garrison.png` | 16x16 | Building: The Garrison | batch 3 building icons |
| `icons/icon_bld-forge.png` | 16x16 | Building: The Forge | batch 3 building icons |
| `icons/icon_bld-lodge.png` | 16x16 | Building: Ranger's Lodge | batch 3 building icons |
| `icons/icon_bld-outpost.png` | 16x16 | Building: Wayfinder's Outpost | batch 3 building icons |
| `icons/icon_bld-librarium.png` | 16x16 | Building: The Librarium | batch 3 building icons |
| `icons/icon_bld-housing.png` | 16x16 | Building: Housing | batch 3 building icons |
| `icons/icon_bld-wizard-tower.png` | 16x16 | Building: Wizard's Tower | batch 3 building icons |
| `icons/icon_bld-tower-west.png` | 16x16 | Building: Tower West | batch 3 building icons |
| `icons/icon_bld-tower-east.png` | 16x16 | Building: Tower East | batch 3 building icons |
| `warfront/map_warfront_base.png` | 130x282 | Warfront base map, the gate and wall removed | batch 4 |
| `warfront/map_gate.json` |  | Gate box and torch positions on the Warfront | batch 4 |
| `warfront/map_gate_sound.png` | 130x60 | The gate and wall: sound | batch 4 |
| `warfront/map_gate_cracking.png` | 130x60 | The gate and wall: cracking | batch 4 |
| `warfront/map_gate_failing.png` | 130x60 | The gate and wall: failing | batch 4 |
| `warfront/map_gate_breached.png` | 130x60 | The gate and wall: breached | batch 4 |
| `warfront/map_torch_strip3.png` | 18x12 | Gate torch, flickering (3 frames, 6 fps) | batch 4 |
| `fx/fx_slash-plain_strip4.png` | 96x24 | Slash, plain steel (claw tiers 1-4), 24x24 frames, 12 fps | batch 5 |
| `fx/fx_slash-gold_strip4.png` | 96x24 | Slash, gold (from Serrated), 24x24 frames, 12 fps | batch 5 |
| `fx/fx_slash-ember_strip4.png` | 96x24 | Slash, ember (from Ember), 24x24 frames, 12 fps | batch 5 |
| `fx/fx_crit_strip4.png` | 96x24 | Critical hit burst, 24x24 frames, 12 fps | batch 5 |
| `fx/fx_ally-hit_strip3.png` | 48x16 | The army's hit flash, 16x16 frames, 12 fps | batch 5 |
| `fx/fx_ember_strip3.png` | 12x4 | Floating ember, 4x4 frames, 8 fps, loops | batch 5 |
| `fx/fx_wall-impact_strip4.png` | 80x16 | A monster strikes the wall, 20x16 frames, 12 fps | batch 5 |
| `fx/fx_repair_strip4.png` | 48x12 | Repair sparkle, 12x12 frames, 8 fps, loops | batch 5 |
| `fx/fx_breach_strip6.png` | 780x60 | The wall falls, gate box frames, 8 fps; ends on the breached gate | batch 5 |
| `logo/logo_icon.png` | 64x64 | The logo: the claw-struck shield, 64x64 (logo A) | logo |
| `logo/logo_wordmark.png` | 64x21 | The wordmark: DRACONIA CHRONICLES | logo |
| `logo/logo_lockup.png` | 72x97 | The logo with the wordmark | logo |
| `logo/app_icon_1024.png` | 1024x1024 | App icon, stores and iOS (logo A x16) | logo |
| `logo/app_adaptive_1024.png` | 1024x1024 | Android adaptive icon foreground (logo A x10, own background) | logo |
| `logo/app_favicon_64.png` | 64x64 | Web favicon | logo |
| `logo/splash_lockup.png` | 72x97 | Splash: the gate under the ember moon with the wordmark (logo B) | logo |
| `logo/splash_frames_strip28.png` | 2016x97 | Splash animation: the gate assembles out of the dark (play with splash_timing.json) | logo |
| `logo/splash_timing.json` |  | Splash animation: each frame's hold in ms, frame size, background | logo |
| `studio/seal_build_sheet.png` | 1800x1376 | RAXDEG STUDIOS startup splash: the seal builds in blue, the name is carved in gold, the seal smashes to gold (frames ten to a row; play with seal_build_timing.json) | RAXDEG seal (v5, locked 2026-10-27) |
| `studio/seal_build_timing.json` |  | RAXDEG STUDIOS splash: each frame's hold in ms, frame size, columns, named beats | RAXDEG seal |
| `studio/seal_card.png` | 180x172 | RAXDEG STUDIOS: the gold seal with the name struck through it | RAXDEG seal |
| `mobs/mob_kobold_idle.png` | 13x16 | Kobold: idle | simple mobs |
| `mobs/mob_kobold_hit.png` | 13x16 | Kobold: hit, the red flash | simple mobs |
| `mobs/mob_kobold_hurt.png` | 13x16 | Kobold: hurt | simple mobs |
| `mobs/mob_kobold_walk_strip2.png` | 26x16 | Kobold: walk bob (2 frames, 4 fps) | simple mobs |
| `mobs/mob_goblin_idle.png` | 13x16 | Goblin: idle | simple mobs |
| `mobs/mob_goblin_hit.png` | 13x16 | Goblin: hit, the red flash | simple mobs |
| `mobs/mob_goblin_hurt.png` | 13x16 | Goblin: hurt | simple mobs |
| `mobs/mob_goblin_walk_strip2.png` | 26x16 | Goblin: walk bob (2 frames, 4 fps) | simple mobs |
| `mobs/mob_crawler_idle.png` | 15x11 | Shadow Crawler: idle | simple mobs |
| `mobs/mob_crawler_hit.png` | 15x11 | Shadow Crawler: hit, the red flash | simple mobs |
| `mobs/mob_crawler_hurt.png` | 15x11 | Shadow Crawler: hurt | simple mobs |
| `mobs/mob_crawler_walk_strip2.png` | 30x11 | Shadow Crawler: walk bob (2 frames, 4 fps) | simple mobs |
| `mobs/mob_orc_idle.png` | 14x19 | Orc: idle | simple mobs |
| `mobs/mob_orc_hit.png` | 14x19 | Orc: hit, the red flash | simple mobs |
| `mobs/mob_orc_hurt.png` | 14x19 | Orc: hurt | simple mobs |
| `mobs/mob_orc_walk_strip2.png` | 28x19 | Orc: walk bob (2 frames, 4 fps) | simple mobs |
| `mobs/mob_raider_idle.png` | 13x19 | Raider: idle | simple mobs |
| `mobs/mob_raider_hit.png` | 13x19 | Raider: hit, the red flash | simple mobs |
| `mobs/mob_raider_hurt.png` | 13x19 | Raider: hurt | simple mobs |
| `mobs/mob_raider_walk_strip2.png` | 26x19 | Raider: walk bob (2 frames, 4 fps) | simple mobs |
| `people/ppl_conscript.png` | 11x20 | Conscript: rags, rope belt, a dull spear (human) | Batch 6 |
| `people/ppl_footman.png` | 11x20 | Footman: nasal helmet, gambeson, round shield, spear (human) | Batch 6 |
| `people/ppl_knight.png` | 13x20 | Knight: plate, gold tabard and plume, lance with a pennant (human) | Batch 6 |
| `people/ppl_gatherer.png` | 15x16 | Gatherer: a basket of greens and berries (halfling) | Batch 6 |
| `people/ppl_trapper.png` | 13x16 | Trapper: fur cap, a pelt, a coil of snare rope (orc) | Batch 6 |
| `people/ppl_ranger.png` | 14x19 | Ranger: green hood and cloak, a longbow (elf) | Batch 6 |
| `people/ppl_explorer.png` | 13x20 | Explorer: pack straps, a crook staff with a lantern (horned folk) | Batch 6 |
| `people/ppl_repairer_strip2.png` | 30x16 | Repairer: hammer raised, then striking (2 frames, 4 fps) (dwarf) | Batch 6 |
| `events/evt_wanderer-lone.png` | 34x22 | Wanderers on the road: a traveler with a walking staff | Batch 6 |
| `events/evt_wanderer-couple.png` | 34x22 | Wanderers on the road: two travelers | Batch 6 |
| `events/evt_wanderer-family.png` | 34x22 | Wanderers on the road: two travelers and a child | Batch 6 |
| `events/evt_wanderer-veteran.png` | 34x22 | Wanderers on the road: an old soldier on a crutch | Batch 6 |
| `events/evt_granary_25.png` | 32x32 | Granary, a quarter | Batch 7 |
| `events/evt_granary_75.png` | 32x32 | Granary, three quarters | Batch 7 |
| `events/evt_forage-action.png` | 20x20 | The FORAGE orb: basket and sheaf | Batch 7 |
| `events/evt_food-lean.png` | 24x24 | Food event: a lean season | Batch 7 |
| `events/evt_food-bountiful.png` | 24x24 | Food event: a bountiful harvest | Batch 7 |
| `events/evt_food-raid.png` | 24x24 | Food event: raiders at the stores | Batch 7 |
| `events/evt_food-refugees.png` | 24x24 | Food event: more mouths | Batch 7 |
| `events/evt_food-warning.png` | 12x12 | Starvation warning (red: danger) | Batch 7 |
| `events/evt_exp-light.png` | 110x34 | Expedition: A Light in the Dark | Batch 7 |
| `events/evt_exp-find.png` | 110x34 | Expedition: A Lucky Find | Batch 7 |
| `events/evt_exp-survivors.png` | 110x34 | Expedition: Survivors Spotted | Batch 7 |
| `events/evt_exp-silent.png` | 110x34 | Expedition: The Wasteland Was Silent | Batch 7 |
| `events/evt_welcome-back.png` | 110x34 | Welcome Back: dawn over the wall | Batch 7 |
| `events/evt_breach-report.png` | 110x34 | The Breach report: the broken gate at dawn | Batch 7 |
| `events/evt_refugees.png` | 110x34 | Refugees Approach: a group on the road to the gate | Batch 7 |
| `cast/cast_sigil-pyreth.png` | 10x10 | Sigil: Elder Pyreth, the ember | Batch 8 |
| `cast/cast_sigil-rodain.png` | 10x10 | Sigil: Captain Rodain, crossed spears | Batch 8 |
| `cast/cast_sigil-mirael.png` | 10x10 | Sigil: Scout Mirael, the compass star | Batch 8 |
| `cast/cast_sigil-kael.png` | 10x10 | Sigil: Kael Ironwright, the anvil | Batch 8 |
| `cast/cast_sigil-lirae.png` | 10x10 | Sigil: Lirae the Ink-Wing, the quill | Batch 8 |
| `cast/cast_emblem-gate.png` | 44x46 | The Gate of Draconia: the narrator's emblem, in a bust's place | Batch 8 |
| `cast/bust_pyreth.png` | 22x23 | Bust: Elder Pyreth (22x23, shown at x2 in a 44x46 slot) | simpler busts v4 |
| `cast/bust_rodain.png` | 22x23 | Bust: Captain Rodain (22x23, shown at x2 in a 44x46 slot) | simpler busts v4 |
| `cast/bust_mirael.png` | 22x23 | Bust: Scout Mirael (22x23, shown at x2 in a 44x46 slot) | simpler busts v4 |
| `cast/bust_kael.png` | 22x23 | Bust: Kael Ironwright (22x23, shown at x2 in a 44x46 slot) | simpler busts v4 |
| `cast/bust_lirae.png` | 22x23 | Bust: Lirae the Ink-Wing (22x23, shown at x2 in a 44x46 slot) | simpler busts v4 |
| `cast/bust_varn.png` | 22x23 | Bust: Varn, Dragon Recruit (22x23, shown at x2 in a 44x46 slot) | future busts v1 |
| `cast/bust_ashara.png` | 22x23 | Bust: Ashara, Elder Wyrm (22x23, shown at x2 in a 44x46 slot) | future busts v1 |
| `cast/bust_thornwick.png` | 22x23 | Bust: Thornwick, the Exiled Mage: human, gnomish ears (22x23, shown at x2 in a 44x46 slot) | future busts v3 |
| `cast/bust_sera.png` | 22x23 | Bust: Sera the Shieldmaiden: bearfolk (22x23, shown at x2 in a 44x46 slot) | future busts v2 |
| `cast/bust_hollow-knight.png` | 22x23 | Bust: The Hollow Knight (22x23, shown at x2 in a 44x46 slot) | future busts v1 |
| `interiors/int_keep.png` | 110x34 | Interior header: Draconia Keep: the throne hall (110x34) | interiors v1 |
| `interiors/int_lodge.png` | 110x34 | Interior header: Ranger's Lodge (110x34) | interiors v1 |
| `interiors/int_outpost.png` | 110x34 | Interior header: Explorer's Outpost (110x34) | interiors v1 |
| `interiors/int_librarium.png` | 110x34 | Interior header: Librarium (110x34) | interiors v1 |
| `interiors/int_forge.png` | 110x34 | Interior header: The Forge (110x34) | interiors v1 |
| `interiors/int_garrison.png` | 110x34 | Interior header: Garrison (110x34) | interiors v1 |
| `interiors/int_housing.png` | 110x34 | Interior header: Housing (110x34) | interiors v1 |
| `interiors/int_tower.png` | 110x34 | Interior header: Wall towers, east and west (110x34) | interiors v1 |
| `interiors/int_wizard-tower.png` | 110x34 | Interior header: Wizard's Tower (110x34) | interiors v1 |
| `mobs/mob_kobold-strong_idle.png` | 13x16 | Kobold, strong (deeper cracks): idle | Unmaking tiers |
| `mobs/mob_kobold-strong_hit.png` | 13x16 | Kobold, strong (deeper cracks): hit, the red flash | Unmaking tiers |
| `mobs/mob_kobold-strong_hurt.png` | 13x16 | Kobold, strong (deeper cracks): hurt | Unmaking tiers |
| `mobs/mob_kobold-strong_walk_strip2.png` | 26x16 | Kobold, strong (deeper cracks): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_goblin-strong_idle.png` | 13x16 | Goblin, strong (deeper cracks): idle | Unmaking tiers |
| `mobs/mob_goblin-strong_hit.png` | 13x16 | Goblin, strong (deeper cracks): hit, the red flash | Unmaking tiers |
| `mobs/mob_goblin-strong_hurt.png` | 13x16 | Goblin, strong (deeper cracks): hurt | Unmaking tiers |
| `mobs/mob_goblin-strong_walk_strip2.png` | 26x16 | Goblin, strong (deeper cracks): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_crawler-strong_idle.png` | 15x11 | Shadow Crawler, strong (deeper cracks): idle | Unmaking tiers |
| `mobs/mob_crawler-strong_hit.png` | 15x11 | Shadow Crawler, strong (deeper cracks): hit, the red flash | Unmaking tiers |
| `mobs/mob_crawler-strong_hurt.png` | 15x11 | Shadow Crawler, strong (deeper cracks): hurt | Unmaking tiers |
| `mobs/mob_crawler-strong_walk_strip2.png` | 30x11 | Shadow Crawler, strong (deeper cracks): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_orc-strong_idle.png` | 14x19 | Orc, strong (deeper cracks): idle | Unmaking tiers |
| `mobs/mob_orc-strong_hit.png` | 14x19 | Orc, strong (deeper cracks): hit, the red flash | Unmaking tiers |
| `mobs/mob_orc-strong_hurt.png` | 14x19 | Orc, strong (deeper cracks): hurt | Unmaking tiers |
| `mobs/mob_orc-strong_walk_strip2.png` | 28x19 | Orc, strong (deeper cracks): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_raider-strong_idle.png` | 13x19 | Raider, strong (deeper cracks): idle | Unmaking tiers |
| `mobs/mob_raider-strong_hit.png` | 13x19 | Raider, strong (deeper cracks): hit, the red flash | Unmaking tiers |
| `mobs/mob_raider-strong_hurt.png` | 13x19 | Raider, strong (deeper cracks): hurt | Unmaking tiers |
| `mobs/mob_raider-strong_walk_strip2.png` | 26x19 | Raider, strong (deeper cracks): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_kobold-stronger_idle.png` | 13x16 | Kobold, stronger (the Unmaking's deepest): idle | Unmaking tiers |
| `mobs/mob_kobold-stronger_hit.png` | 13x16 | Kobold, stronger (the Unmaking's deepest): hit, the red flash | Unmaking tiers |
| `mobs/mob_kobold-stronger_hurt.png` | 13x16 | Kobold, stronger (the Unmaking's deepest): hurt | Unmaking tiers |
| `mobs/mob_kobold-stronger_walk_strip2.png` | 26x16 | Kobold, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_goblin-stronger_idle.png` | 13x16 | Goblin, stronger (the Unmaking's deepest): idle | Unmaking tiers |
| `mobs/mob_goblin-stronger_hit.png` | 13x16 | Goblin, stronger (the Unmaking's deepest): hit, the red flash | Unmaking tiers |
| `mobs/mob_goblin-stronger_hurt.png` | 13x16 | Goblin, stronger (the Unmaking's deepest): hurt | Unmaking tiers |
| `mobs/mob_goblin-stronger_walk_strip2.png` | 26x16 | Goblin, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_crawler-stronger_idle.png` | 15x11 | Shadow Crawler, stronger (the Unmaking's deepest): idle | Unmaking tiers |
| `mobs/mob_crawler-stronger_hit.png` | 15x11 | Shadow Crawler, stronger (the Unmaking's deepest): hit, the red flash | Unmaking tiers |
| `mobs/mob_crawler-stronger_hurt.png` | 15x11 | Shadow Crawler, stronger (the Unmaking's deepest): hurt | Unmaking tiers |
| `mobs/mob_crawler-stronger_walk_strip2.png` | 30x11 | Shadow Crawler, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_orc-stronger_idle.png` | 14x19 | Orc, stronger (the Unmaking's deepest): idle | Unmaking tiers |
| `mobs/mob_orc-stronger_hit.png` | 14x19 | Orc, stronger (the Unmaking's deepest): hit, the red flash | Unmaking tiers |
| `mobs/mob_orc-stronger_hurt.png` | 14x19 | Orc, stronger (the Unmaking's deepest): hurt | Unmaking tiers |
| `mobs/mob_orc-stronger_walk_strip2.png` | 28x19 | Orc, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `mobs/mob_raider-stronger_idle.png` | 13x19 | Raider, stronger (the Unmaking's deepest): idle | Unmaking tiers |
| `mobs/mob_raider-stronger_hit.png` | 13x19 | Raider, stronger (the Unmaking's deepest): hit, the red flash | Unmaking tiers |
| `mobs/mob_raider-stronger_hurt.png` | 13x19 | Raider, stronger (the Unmaking's deepest): hurt | Unmaking tiers |
| `mobs/mob_raider-stronger_walk_strip2.png` | 26x19 | Raider, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps) | Unmaking tiers |
| `logo/logo_anim_frames_strip20.png` | 1280x64 | Logo animation: the shield slams in, the claws slash upward, the logo assembles (play with logo_anim_timing.json) | logo |
| `logo/logo_anim_timing.json` |  | Logo animation: each frame's hold in ms, frame size, background | logo |
| `icons/icon_heartstone.png` | 12x12 | The heartstone: a teardrop of aetherglass with the heart-flame inside, 12x12 | heartstone v3 |
| `icons/icon_heartstone_flicker_strip4.png` | 48x12 | The heartstone, its flame flickering, 12x12 (4 frames, 8 fps; drawn for 140, 90, 160, 110 ms) | heartstone v3 |
| `icons/icon_heartstone_16.png` | 16x16 | The heartstone, 16x16 | heartstone v3 |
| `icons/icon_heartstone_16_flicker_strip4.png` | 64x16 | The heartstone, its flame flickering, 16x16 (4 frames, 8 fps; drawn for 140, 90, 160, 110 ms) | heartstone v3 |
| `mobs/mob_kobold_death_strip4.png` | 92x16 | Kobold: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_goblin_death_strip4.png` | 92x16 | Goblin: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_crawler_death_strip4.png` | 84x11 | Shadow Crawler: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_orc_death_strip4.png` | 104x19 | Orc: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_raider_death_strip4.png` | 100x19 | Raider: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_kobold-strong_death_strip4.png` | 92x16 | Kobold, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_goblin-strong_death_strip4.png` | 92x16 | Goblin, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_crawler-strong_death_strip4.png` | 84x11 | Shadow Crawler, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_orc-strong_death_strip4.png` | 104x19 | Orc, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_raider-strong_death_strip4.png` | 100x19 | Raider, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_kobold-stronger_death_strip4.png` | 92x16 | Kobold, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_goblin-stronger_death_strip4.png` | 92x16 | Goblin, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_crawler-stronger_death_strip4.png` | 84x11 | Shadow Crawler, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_orc-stronger_death_strip4.png` | 104x19 | Orc, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `mobs/mob_raider-stronger_death_strip4.png` | 100x19 | Raider, stronger: death, buckles, falls, lands, unmade (4 frames, 8 fps) | monster deaths |
| `story/story_prologue.png` | 130x96 | Story: the prologue, The Walls of Draconia (130x96, shown at the map's scale) | story v1 |
| `story/story_breach.png` | 130x96 | Story: the Breach, The Wall Falls (130x96, shown at the map's scale) | story v1 |
| `city/map_city_base_night.png` | 130x282 | City base map, no buildings (lit look), at night | city light levels |
| `city/map_city_base_dusk.png` | 130x282 | City base map, no buildings (lit look), at dusk | city light levels |
| `city/map_fog_20x32_night.png` | 20x32 | Fog over an undiscovered plot, 20 x 32, at night | city light levels |
| `city/map_fog_20x32_dusk.png` | 20x32 | Fog over an undiscovered plot, 20 x 32, at dusk | city light levels |
| `city/map_fog_24x40_night.png` | 24x40 | Fog over an undiscovered plot, 24 x 40, at night | city light levels |
| `city/map_fog_24x40_dusk.png` | 24x40 | Fog over an undiscovered plot, 24 x 40, at dusk | city light levels |
| `city/map_fog_32x32_night.png` | 32x32 | Fog over an undiscovered plot, 32 x 32, at night | city light levels |
| `city/map_fog_32x32_dusk.png` | 32x32 | Fog over an undiscovered plot, 32 x 32, at dusk | city light levels |
| `city/map_fog_50x82_night.png` | 50x82 | Fog over an undiscovered plot, 50 x 82, at night | city light levels |
| `city/map_fog_50x82_dusk.png` | 50x82 | Fog over an undiscovered plot, 50 x 82, at dusk | city light levels |
| `city/map_foundation_20x32_night.png` | 20x32 | Foundation (first build step), 20 x 32, at night | city light levels |
| `city/map_foundation_20x32_dusk.png` | 20x32 | Foundation (first build step), 20 x 32, at dusk | city light levels |
| `city/map_foundation_24x40_night.png` | 24x40 | Foundation (first build step), 24 x 40, at night | city light levels |
| `city/map_foundation_24x40_dusk.png` | 24x40 | Foundation (first build step), 24 x 40, at dusk | city light levels |
| `city/map_foundation_32x32_night.png` | 32x32 | Foundation (first build step), 32 x 32, at night | city light levels |
| `city/map_foundation_32x32_dusk.png` | 32x32 | Foundation (first build step), 32 x 32, at dusk | city light levels |
| `city/map_foundation_50x82_night.png` | 50x82 | Foundation (first build step), 50 x 82, at night | city light levels |
| `city/map_foundation_50x82_dusk.png` | 50x82 | Foundation (first build step), 50 x 82, at dusk | city light levels |
| `city/map_plot-empty_20x32_night.png` | 20x32 | Cleared ground (unbuilt plot), 20 x 32, at night | city light levels |
| `city/map_plot-empty_20x32_dusk.png` | 20x32 | Cleared ground (unbuilt plot), 20 x 32, at dusk | city light levels |
| `city/map_plot-empty_24x40_night.png` | 24x40 | Cleared ground (unbuilt plot), 24 x 40, at night | city light levels |
| `city/map_plot-empty_24x40_dusk.png` | 24x40 | Cleared ground (unbuilt plot), 24 x 40, at dusk | city light levels |
| `city/map_plot-empty_32x32_night.png` | 32x32 | Cleared ground (unbuilt plot), 32 x 32, at night | city light levels |
| `city/map_plot-empty_32x32_dusk.png` | 32x32 | Cleared ground (unbuilt plot), 32 x 32, at dusk | city light levels |
| `city/map_plot-empty_50x82_night.png` | 50x82 | Cleared ground (unbuilt plot), 50 x 82, at night | city light levels |
| `city/map_plot-empty_50x82_dusk.png` | 50x82 | Cleared ground (unbuilt plot), 50 x 82, at dusk | city light levels |
| `city/map_scaffold_20x32_night.png` | 20x32 | Scaffold (building going up), 20 x 32, at night | city light levels |
| `city/map_scaffold_20x32_dusk.png` | 20x32 | Scaffold (building going up), 20 x 32, at dusk | city light levels |
| `city/map_scaffold_24x40_night.png` | 24x40 | Scaffold (building going up), 24 x 40, at night | city light levels |
| `city/map_scaffold_24x40_dusk.png` | 24x40 | Scaffold (building going up), 24 x 40, at dusk | city light levels |
| `city/map_scaffold_32x32_night.png` | 32x32 | Scaffold (building going up), 32 x 32, at night | city light levels |
| `city/map_scaffold_32x32_dusk.png` | 32x32 | Scaffold (building going up), 32 x 32, at dusk | city light levels |
| `city/map_scaffold_50x82_night.png` | 50x82 | Scaffold (building going up), 50 x 82, at night | city light levels |
| `city/map_scaffold_50x82_dusk.png` | 50x82 | Scaffold (building going up), 50 x 82, at dusk | city light levels |
| `city/map_marker-upgrade_night.png` | 8x8 | Map marker: upgrade ready, at night | city light levels |
| `city/map_marker-upgrade_dusk.png` | 8x8 | Map marker: upgrade ready, at dusk | city light levels |
| `city/map_marker-todo_night.png` | 8x8 | Map marker: something to do, at night | city light levels |
| `city/map_marker-todo_dusk.png` | 8x8 | Map marker: something to do, at dusk | city light levels |
| `buildings/bld_keep_ruin_night.png` | 50x82 | Draconia Keep: ruin, at night | city light levels |
| `buildings/bld_keep_ruin_dusk.png` | 50x82 | Draconia Keep: ruin, at dusk | city light levels |
| `buildings/bld_keep_built_night.png` | 50x82 | Draconia Keep: built, at night | city light levels |
| `buildings/bld_keep_built_dusk.png` | 50x82 | Draconia Keep: built, at dusk | city light levels |
| `buildings/bld_keep_restored_night.png` | 50x82 | Draconia Keep: restored, at night | city light levels |
| `buildings/bld_keep_restored_dusk.png` | 50x82 | Draconia Keep: restored, at dusk | city light levels |
| `buildings/bld_garrison_ruin_night.png` | 32x32 | The Garrison: ruin, at night | city light levels |
| `buildings/bld_garrison_ruin_dusk.png` | 32x32 | The Garrison: ruin, at dusk | city light levels |
| `buildings/bld_garrison_lv1_night.png` | 32x32 | The Garrison: lv1, at night | city light levels |
| `buildings/bld_garrison_lv1_dusk.png` | 32x32 | The Garrison: lv1, at dusk | city light levels |
| `buildings/bld_garrison_lv3_night.png` | 32x32 | The Garrison: lv3, at night | city light levels |
| `buildings/bld_garrison_lv3_dusk.png` | 32x32 | The Garrison: lv3, at dusk | city light levels |
| `buildings/bld_garrison_lv5_night.png` | 32x32 | The Garrison: lv5, at night | city light levels |
| `buildings/bld_garrison_lv5_dusk.png` | 32x32 | The Garrison: lv5, at dusk | city light levels |
| `buildings/bld_forge_ruin_night.png` | 32x32 | The Forge: ruin, at night | city light levels |
| `buildings/bld_forge_ruin_dusk.png` | 32x32 | The Forge: ruin, at dusk | city light levels |
| `buildings/bld_forge_built_night.png` | 32x32 | The Forge: built, at night | city light levels |
| `buildings/bld_forge_built_dusk.png` | 32x32 | The Forge: built, at dusk | city light levels |
| `buildings/bld_forge_lit_night.png` | 32x32 | The Forge: lit, at night | city light levels |
| `buildings/bld_forge_lit_dusk.png` | 32x32 | The Forge: lit, at dusk | city light levels |
| `buildings/bld_forge_lit_night_strip3.png` | 96x32 | The Forge: lit, fire flickering (3 frames), at night | city light levels |
| `buildings/bld_forge_lit_dusk_strip3.png` | 96x32 | The Forge: lit, fire flickering (3 frames), at dusk | city light levels |
| `buildings/bld_lodge_ruin_night.png` | 32x32 | Ranger's Lodge: ruin, at night | city light levels |
| `buildings/bld_lodge_ruin_dusk.png` | 32x32 | Ranger's Lodge: ruin, at dusk | city light levels |
| `buildings/bld_lodge_lv1_night.png` | 32x32 | Ranger's Lodge: lv1, at night | city light levels |
| `buildings/bld_lodge_lv1_dusk.png` | 32x32 | Ranger's Lodge: lv1, at dusk | city light levels |
| `buildings/bld_lodge_lv3_night.png` | 32x32 | Ranger's Lodge: lv3, at night | city light levels |
| `buildings/bld_lodge_lv3_dusk.png` | 32x32 | Ranger's Lodge: lv3, at dusk | city light levels |
| `buildings/bld_outpost_ruin_night.png` | 32x32 | Wayfinder's Outpost: ruin, at night | city light levels |
| `buildings/bld_outpost_ruin_dusk.png` | 32x32 | Wayfinder's Outpost: ruin, at dusk | city light levels |
| `buildings/bld_outpost_built_night.png` | 32x32 | Wayfinder's Outpost: built, at night | city light levels |
| `buildings/bld_outpost_built_dusk.png` | 32x32 | Wayfinder's Outpost: built, at dusk | city light levels |
| `buildings/bld_outpost_upgraded_night.png` | 32x32 | Wayfinder's Outpost: upgraded, at night | city light levels |
| `buildings/bld_outpost_upgraded_dusk.png` | 32x32 | Wayfinder's Outpost: upgraded, at dusk | city light levels |
| `buildings/bld_librarium_ruin_night.png` | 32x32 | The Librarium: ruin, at night | city light levels |
| `buildings/bld_librarium_ruin_dusk.png` | 32x32 | The Librarium: ruin, at dusk | city light levels |
| `buildings/bld_librarium_built_night.png` | 32x32 | The Librarium: built, at night | city light levels |
| `buildings/bld_librarium_built_dusk.png` | 32x32 | The Librarium: built, at dusk | city light levels |
| `buildings/bld_housing_house_night.png` | 32x32 | Housing: house, at night | city light levels |
| `buildings/bld_housing_house_dusk.png` | 32x32 | Housing: house, at dusk | city light levels |
| `buildings/bld_housing_row_night.png` | 32x32 | Housing: row, at night | city light levels |
| `buildings/bld_housing_row_dusk.png` | 32x32 | Housing: row, at dusk | city light levels |
| `buildings/bld_wizard-tower_ruin_night.png` | 24x40 | Wizard's Tower: ruin, at night | city light levels |
| `buildings/bld_wizard-tower_ruin_dusk.png` | 24x40 | Wizard's Tower: ruin, at dusk | city light levels |
| `buildings/bld_wizard-tower_built_night.png` | 24x40 | Wizard's Tower: built, at night | city light levels |
| `buildings/bld_wizard-tower_built_dusk.png` | 24x40 | Wizard's Tower: built, at dusk | city light levels |
| `buildings/bld_tower-west_ruin_night.png` | 20x32 | Tower West: ruin, at night | city light levels |
| `buildings/bld_tower-west_ruin_dusk.png` | 20x32 | Tower West: ruin, at dusk | city light levels |
| `buildings/bld_tower-west_built_night.png` | 20x32 | Tower West: built, at night | city light levels |
| `buildings/bld_tower-west_built_dusk.png` | 20x32 | Tower West: built, at dusk | city light levels |
| `buildings/bld_tower-east_ruin_night.png` | 20x32 | Tower East: ruin, at night | city light levels |
| `buildings/bld_tower-east_ruin_dusk.png` | 20x32 | Tower East: ruin, at dusk | city light levels |
| `buildings/bld_tower-east_built_night.png` | 20x32 | Tower East: built, at night | city light levels |
| `buildings/bld_tower-east_built_dusk.png` | 20x32 | Tower East: built, at dusk | city light levels |
| `sound/splash_full.m4a` | 7.68 s | The studio splash, every beat on the seal's frame timing | sound v1 |
| `sound/splash_slam.m4a` | 0.70 s | Splash: the plates slam together (beat slam) | sound v1 |
| `sound/splash_medallion-top.m4a` | 0.60 s | Splash: a medallion settles (beat medallion_top) | sound v1 |
| `sound/splash_medallion-left.m4a` | 0.60 s | Splash: a medallion settles, a step higher (beat medallion_left) | sound v1 |
| `sound/splash_medallion-right.m4a` | 0.60 s | Splash: a medallion settles, higher again (beat medallion_right) | sound v1 |
| `sound/splash_etch.m4a` | 1.39 s | Splash: the runes etched in blue (beat etch, until the slash) | sound v1 |
| `sound/splash_slash.m4a` | 1.09 s | Splash: the name cut in gold (beat slash) | sound v1 |
| `sound/splash_spread.m4a` | 0.60 s | Splash: gold runs out from the cut (beat spread) | sound v1 |
| `sound/splash_smash.m4a` | 3.56 s | Splash: the seal smashes to gold (beat smash) | sound v1 |
| `sound/sfx_monster-death.m4a` | 1.00 s | A monster dies, on its death strip's frames: the thud at 250 ms, glints at 375 ms | sound v1 |
| `sound/sfx_wall-hit.m4a` | 0.60 s | A monster strikes the wall | sound v1 |
| `sound/sfx_breach.m4a` | 3.80 s | The wall falls | sound v1 |
| `sound/sfx_build-complete.m4a` | 1.60 s | A building finished: three hammer taps and a warm chord | sound v1 |
| `sound/sfx_heartstone.m4a` | 1.00 s | The heartstone's soft pulse | sound v1 |
| `sound/sfx_crit.m4a` | 2.10 s | A critical hit: a harder cut, a heavy impact, a sparkle | sound batch 2 v1 |
| `sound/sfx_slash-ember.m4a` | 0.60 s | The ember claws: a fire whoosh to lay over the strike | sound batch 2 v1 |
| `sound/sfx_walk-up.m4a` | 0.55 s | The next monster's three footfalls, across the 350 ms walk-up | sound batch 2 v1 |
| `sound/sfx_gate-crack.m4a` | 2.60 s | The wall cracks: a stone groan, a crack, grit falling | sound batch 2 v1 |
| `sound/sfx_unmaking-rise.m4a` | 4.48 s | The Unmaking rises: a reversed shimmer, then a low, uneasy swell | sound batch 2 v1 |
| `sound/sfx_rally.m4a` | 2.60 s | The rally horn | sound batch 2 v1 |
| `sound/sfx_mend.m4a` | 1.00 s | Mending the wall: chisel taps, then a mallet | sound batch 2 v1 |
| `sound/sfx_build-start.m4a` | 1.50 s | Construction starts: saw strokes, two mallet knocks | sound batch 2 v1 |
| `sound/sfx_city-brightens.m4a` | 3.80 s | The city brightens: a rising chime over a warm chord | sound batch 2 v1 |
| `sound/sfx_research-done.m4a` | 1.40 s | Research done: a page turns, two bright notes | sound batch 2 v1 |
| `sound/sfx_expedition-out.m4a` | 2.20 s | An expedition leaves: a horn note, footsteps going away | sound batch 2 v1 |
| `sound/sfx_expedition-back.m4a` | 2.40 s | An expedition returns: footsteps coming near, a two-note horn | sound batch 2 v1 |
| `sound/sfx_find.m4a` | 1.60 s | A find: a chest creaks open, something glitters | sound batch 2 v1 |
| `sound/sfx_gate-knock.m4a` | 2.20 s | Someone at the gate (wanderers, refugees): three knocks | sound batch 2 v1 |
| `sound/sfx_food-low.m4a` | 4.40 s | Food running low: a low bell, tolled twice | sound batch 2 v1 |
| `sound/sfx_food-raid.m4a` | 1.80 s | A food raid: an alarm bell over a scuffle | sound batch 2 v1 |
| `sound/sfx_granary-full.m4a` | 1.20 s | The granary is full: a sack thumps down, a pleased chime | sound batch 2 v1 |
| `sound/sfx_scene-open.m4a` | 0.80 s | A story scene opens: a parchment unrolls | sound batch 2 v1 |
| `sound/sfx_fanfare.m4a` | 3.20 s | A quest done or Renown gained: horns up a major chord | sound batch 2 v1 |
| `sound/sfx_welcome-back.m4a` | 3.60 s | Welcome back (offline): a soft dawn | sound batch 2 v1 |
| `sound/sfx_sting-sera.m4a` | 2.30 s | Sera arrives: a shield bash | sound batch 2 v1 |
| `sound/sfx_sting-thornwick.m4a` | 1.10 s | Thornwick arrives: a spark fizzes up and pops | sound batch 2 v1 |
| `sound/sfx_sting-hollow-knight.m4a` | 4.40 s | The Hollow Knight arrives: one armored step, ringing hollow | sound batch 2 v1 |
| `sound/amb_torches.m4a` | 8.00 s | Loop, 8 s, seamless: the Warfront torches | sound batch 2 v1 |
| `sound/amb_forge.m4a` | 8.00 s | Loop, 8 s, seamless: the forge, the bellows every few seconds | sound batch 2 v1 |
| `sound/amb_night-wind.m4a` | 8.00 s | Loop, 8 s, seamless: night wind. Mastered loud; play it well under the rest (owner, 2026-10-27) | sound batch 2 v1 |
| `sound/amb_horde-drums.m4a` | 8.00 s | Loop, 8 s, seamless: the horde's drums far off, 12 beats at 90 a minute | sound batch 2 v1 |
| `cast/cast_sigil-varn.png` | 10x10 | Sigil: Varn, a cracked egg | sigils v2a |
| `cast/cast_sigil-ashara.png` | 10x10 | Sigil: Ashara, her burning eye | sigils v1 |
| `cast/cast_sigil-thornwick.png` | 10x10 | Sigil: Thornwick, his scorched hat | sigils v1 |
| `cast/cast_sigil-sera.png` | 10x10 | Sigil: Sera, her round shield | sigils v1 |
| `cast/cast_sigil-hollow-knight.png` | 10x10 | Sigil: the Hollow Knight, an empty helm | sigils v1 |
| `icons/icon_res_cartography.png` | 12x12 | Study: Cartography, a chart and dividers | icons v1 |
| `icons/icon_res_keen_scouts.png` | 12x12 | Study: Keen Scouts, a spyglass | icons v1 |
| `icons/icon_warning.png` | 12x12 | Warning (confirm dialog): a gold triangle | icons v1 |
| `icons/icon_hand.png` | 12x12 | Total clicks: an open hand | icons v1 |
| `icons/icon_phone.png` | 12x12 | Vibration: a phone | icons v1 |
| `icons/icon_consumption.png` | 12x12 | Consumption (food eaten per second): a leaking grain sack | icons v2a |
| `mobs/mob_minotaur_idle.png` | 20x25 | Minotaur: idle | Minotaur v1 |
| `mobs/mob_minotaur_hit.png` | 20x25 | Minotaur: hit, the red flash | Minotaur v1 |
| `mobs/mob_minotaur_hurt.png` | 20x25 | Minotaur: hurt, the axe broken | Minotaur v1 |
| `mobs/mob_minotaur_walk_strip2.png` | 40x25 | Minotaur: walk bob (2 frames, 4 fps) | Minotaur v1 |
| `mobs/mob_minotaur_death_strip4.png` | 128x25 | Minotaur: death, buckles, falls, lands, unmade (4 frames, 8 fps) | Minotaur v1 |
| `mobs/mob_minotaur-strong_idle.png` | 20x25 | Minotaur, strong: idle | Minotaur v1 |
| `mobs/mob_minotaur-strong_hit.png` | 20x25 | Minotaur, strong: hit, the red flash | Minotaur v1 |
| `mobs/mob_minotaur-strong_hurt.png` | 20x25 | Minotaur, strong: hurt, the axe broken | Minotaur v1 |
| `mobs/mob_minotaur-strong_walk_strip2.png` | 40x25 | Minotaur, strong: walk bob (2 frames, 4 fps) | Minotaur v1 |
| `mobs/mob_minotaur-strong_death_strip4.png` | 128x25 | Minotaur, strong: death, buckles, falls, lands, unmade (4 frames, 8 fps) | Minotaur v1 |
| `mobs/mob_minotaur-stronger_idle.png` | 20x25 | Minotaur, stronger (the Unmaking's deepest): idle | Minotaur v1 |
| `mobs/mob_minotaur-stronger_hit.png` | 20x25 | Minotaur, stronger (the Unmaking's deepest): hit, the red flash | Minotaur v1 |
| `mobs/mob_minotaur-stronger_hurt.png` | 20x25 | Minotaur, stronger (the Unmaking's deepest): hurt, the axe broken | Minotaur v1 |
| `mobs/mob_minotaur-stronger_walk_strip2.png` | 40x25 | Minotaur, stronger (the Unmaking's deepest): walk bob (2 frames, 4 fps) | Minotaur v1 |
| `mobs/mob_minotaur-stronger_death_strip4.png` | 128x25 | Minotaur, stronger (the Unmaking's deepest): death, buckles, falls, lands, unmade (4 frames, 8 fps) | Minotaur v1 |
| `cast/bust_pyreth_grieving.png` | 22x23 | Bust: Elder Pyreth, grieving (22x23) | expressions v1 |
| `cast/bust_rodain_grieving.png` | 22x23 | Bust: Captain Rodain, grieving (22x23) | expressions v1 |
| `cast/bust_mirael_alarmed.png` | 22x23 | Bust: Scout Mirael, alarmed (22x23) | expressions v1 |
| `cast/bust_kael_angry.png` | 22x23 | Bust: Kael Ironwright, angry (22x23) | expressions v1 |
| `cast/bust_lirae_grieving.png` | 22x23 | Bust: Lirae the Ink-Wing, grieving (22x23) | expressions v1 |
| `cast/bust_varn_fierce.png` | 22x23 | Bust: Varn, fierce (22x23) | expressions v1 |
| `cast/bust_ashara_grieving.png` | 22x23 | Bust: Ashara, grieving (22x23) | expressions v1 |
| `cast/bust_thornwick_startled.png` | 22x23 | Bust: Thornwick, startled (22x23) | expressions v1 |
| `cast/bust_sera_roaring.png` | 22x23 | Bust: Sera, roaring (22x23) | expressions v1 |
| `story/story_elder-approaches.png` | 130x96 | Story: The Elder Approaches (130x96) | story scenes v1 |
| `story/story_renown.png` | 130x96 | Story: Renown (130x96) | story scenes v1 |
| `story/story_wall-holds.png` | 130x96 | Story: The Wall Holds (130x96) | story scenes v1 |
| `story/story_wall-shakes.png` | 130x96 | Story: The Wall Shakes (130x96) | story scenes v1 |
| `story/story_young-claws.png` | 130x96 | Story: Young Claws (130x96) | story scenes v1 |
| `story/story_wall-is-yours.png` | 130x96 | Story: The Wall Is Yours (130x96) | story scenes v1 |
| `story/story_stores-run-low.png` | 130x96 | Story: Our Stores Run Low (130x96) | story scenes v1 |
| `story/story_stranger.png` | 130x96 | Story: A Stranger on the Road (130x96) | story scenes v1 |
| `story/story_city-not-a-wall.png` | 130x96 | Story: A City, Not a Wall (130x96) | story scenes v1 |
| `story/story_forge-is-cold.png` | 130x96 | Story: The Forge Is Cold (130x96) | story scenes v1 |
| `story/story_beyond-the-walls.png` | 130x96 | Story: Beyond the Walls (130x96) | story scenes v1 |
| `story/story_keep-restored.png` | 130x96 | Story: The Keep Restored (130x96) | story scenes v1 |
| `story/story_rangers-lodge.png` | 130x96 | Story: The Ranger's Lodge (130x96) | story scenes v1 |
| `story/story_ink-wing.png` | 130x96 | Story: The Ink-Wing (130x96) | story scenes v1 |
| `story/story_dragonsteel.png` | 130x96 | Story: Dragonsteel (130x96) | story scenes v1 |
| `story/story_they-come-bigger.png` | 130x96 | Story: They Come Bigger (130x96) | story scenes v1 |
| `story/story_ancient-magic.png` | 130x96 | Story: The Ancient Magic (130x96) | story scenes v1 |
