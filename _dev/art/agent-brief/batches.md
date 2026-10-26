# Batch cards

One card per batch. An agent gets the core brief ([README.md](README.md)) plus its own card,
pasted into its prompt; it does not read the other cards. Sizes are native pixels. "Match" names the
existing art (native copies in `_dev/art/reference/` after Batch 0) the batch must sit beside.

Order: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. Batch 2 must come before 3 (plots). Batch 9 waits on the
owner's interface-kit decision. The last section lists what no agent makes yet.

---

## Batch 0: Foundation (main session, no agents)

**Goal:** everything the other batches depend on.

| Output | Notes |
| --- | --- |
| Owner answers to README section 10 | pixel scale, interface kit as code or images, palette lock |
| `reference/` native copies | shrink every `_dev/mockups/v2/images/*.png` to native size (sizes in `asset-list.md` Part 2) |
| Master palette: `draconia.gpl`, `.hex`, `palette.png` | 32 to 48 colors in ramps; built from the colors already used in the reference art, the protagonist stand-in's ember palette (reserved) and the app's gold ramp (`src/theme/index.ts`); cool shadows, warm highlights; one ink color |
| `night` and `dusk` palette maps, glow colors | README section 4 |
| `pixkit/` | README section 6.1, with a test per function |
| Piskel round trip | write one `.piskel`, open it at piskelapp.com, confirm it loads (README 6.2) |
| Style tile | one board: the palette, the ramps, a lit and a night sample, the outline rule shown on one icon and one person |

**Done when:** the owner approves the style tile.

---

## Batch 1: Icons

**Goal:** a pixel icon for every Ionicon the game uses, plus research and claw icons.
**Match:** the 10 existing icons (`icon-star`, `icon-food`, `icon-villager`, `icon-swords`,
`icon-helm`, `icon-hammer`, `icon-wheat`, `icon-scroll`, `icon-castle`, `icon-cog`) and `chest`.
**Tool:** code. **Pilot:** `icon_hourglass`, `icon_flag`, `icon_skull`.

**Interface icons, 12x12** (shown at x4):

| File | Replaces Ionicon | Meaning |
| --- | --- | --- |
| icon_compass | compass | explorers |
| icon_flame | flame | Warfront tab |
| icon_shield | shield | fighters (replaces the swords stand-in) |
| icon_padlock | lock-closed | locked (redraw of the inline glyph) |
| icon_flag | flag, flag-outline | objective, quests |
| icon_bell | notifications-outline | next meal |
| icon_hourglass | time, timer, hourglass | timers |
| icon_upgrade | arrow-up-circle, arrow-up | upgrade (redraw of the inline glyph) |
| icon_next | arrow-forward | next, go (redraw of the inline glyph) |
| icon_check | checkmark, checkmark-circle | done |
| icon_close | close, close-circle | close |
| icon_unknown | help-circle | unknown "???", help |
| icon_info | information-circle | info |
| icon_skull | skull | death, reset |
| icon_rising, icon_falling | trending-up, trending-down | stores rising and falling |
| icon_reassign | swap-horizontal | reassign |
| icon_train | person-add | train |
| icon_rank | ribbon | rank |
| icon_shield-gear | shield-checkmark | shield gear |
| icon_claws | (hammer today) | claws |
| icon_damage | flash | damage |
| icon_gate | log-in | gate |
| icon_rations | restaurant | rations |
| icon_moon | moon | offline, rest |
| icon_book | library, book | Librarium |
| icon_sparkles | sparkles | Wizard's Tower |
| icon_map | map | map |
| icon_stats | stats-chart | stats |

Hold, until the owner says which stay: eye, search, fitness, flower, hand-left, wallet,
remove-circle, refresh, save, phone, speedometer.

**Research icons, 16x16:**
- Categories (5): `icon_rs-economy`, `icon_rs-military`, `icon_rs-survival`, `icon_rs-exploration`,
  `icon_rs-mystery`.
- Nodes (13): Keen Eye, Efficient Patrols, Golden Harvest, Drill Tactics, Tempered Steel, Veteran
  Training, Rationing, Herbalist Knowledge, Lean Rations, Feast Hall, Frontier Settlement,
  Cartography, Keen Scouts (`icon_rn-keen-eye` and so on). The 2 hidden nodes share one
  `icon_rn-sealed`.

**Claw tiers, 16x16** (`icon_claw-1` to `icon_claw-9`): Fledgling, Sharpened, Hooked, Hardened,
Serrated, Obsidian, Ember, Dragonsteel, Ancient. Claw shapes only, never the dragon. Color follows
the game's slash colors: plain bone and steel for tiers 1 to 4, gold from Serrated, ember from Ember.
The shape grows sharper and more hooked with each tier; each must be told apart at x2.

**Done when:** about 57 icons pass the checks and a sheet shows them beside the existing 10 at x4.

---

## Batch 2: City base map and shared pieces

**Goal:** a Draconia map with no buildings on it, so buildings can appear and disappear.
**Match:** `city-bg` (130x282). Its painted buildings set the plot positions.
**Tool:** Blender for layout and camera, code for the final pixels (README 6.3).
**Pilot:** `map_city_base`, `map_fog`, `map_plot-empty`.

| File | Size | Notes |
| --- | --- | --- |
| map_city_base | 130x282 | ground, roads, the city wall and gate, 10 empty plots; no buildings |
| map_plots.json | | plot id, x, y, width, height, anchor for: keep, garrison, forge, lodge, outpost, librarium, housing, wizard-tower, tower-east, tower-west |
| map_fog | per plot size, or one tile | covers an undiscovered plot |
| map_plot-empty | per plot size | cleared ground, the unbuilt look |
| map_foundation | per plot size | stones laid out, the first build step |
| map_scaffold | per plot size | one design, one file per plot size |
| map_marker-upgrade | 8x8 | "upgrade ready" (redraw of the inline glyph) |
| map_marker-todo | 8x8 | "something to do" badge |
| preview: night, dusk, lit | | the base map through each palette map, to prove the swap works |

**Done when:** the empty map with every plot outlined, and the night and dusk versions, are on a
board.

---

## Batch 3: Buildings

**Goal:** each building as its own sprite on its plot, in every state.
**Match:** the buildings painted into `city-bg`, and `map_city_base` from Batch 2.
**Tool:** Blender, one model per building with a collection per state, then code (README 6.3).
Footprints come from `map_plots.json`. **Pilot:** `bld_garrison_ruin`, `bld_garrison_lv1`,
`icon_bld-garrison`.

| Building | Files (`bld_<id>_<state>`) |
| --- | --- |
| Draconia Keep | ruin, built, restored |
| The Garrison | ruin, lv1, lv3, lv5 |
| The Forge (Kael's) | ruin (cold), built, lit (fire going: 2-3 frame strip for the glow) |
| Ranger's Lodge | ruin, lv1, lv3 |
| Wayfinder's Outpost | ruin, built, upgraded |
| The Librarium | ruin, built |
| Housing (future) | one house, a row of houses (the empty plot comes from Batch 2) |
| Wizard's Tower (future) | ruin, built |
| Tower East (future) | ruin, built |
| Tower West (future) | ruin, built |

Lit windows and forge fire use the glow colors so they stay bright at night. Each upgrade level
keeps the same footprint and adds visible change: banners, roofs, a second floor, stonework.

**Building icons, 16x16:** `icon_bld-<id>` for all 10, readable as the building's silhouette.

Draw the 6 in-game buildings first, then the 4 future ones.

**Done when:** a board shows the city at three moments (start, mid-game, late game) composed from
the base map and the sprites, plus every state of every building in a row.

---

## Batch 4: Warfront

**Goal:** a Warfront where the gate, its torches and the monsters change state.
**Match:** `warfront-bg` (130x282), `kobold`, `goblin`, `crawler`, `ashen-orc`, `minotaur`
(native sizes in `asset-list.md` 2.3). **Tool:** code; Blender only if the gate's perspective
fights you. **Pilot:** `map_gate_sound`, `map_gate_breached`, `mon_goblin_hit`.

| File | Size | Notes |
| --- | --- | --- |
| map_warfront_base | 130x282 | `warfront-bg` with the gate and wall removed and the ground behind them filled in |
| map_gate_sound, _cracking, _failing, _breached | the painted gate's box in `warfront-bg`, full width | the gate and wall in 4 states; anchor on the wall line |
| map_torch_strip3 | about 6x10 | flicker, 3 frames, 6 fps; glow colors |
| mon_`<monster>`_hit | each monster's idle size | recoil on being struck: head back, weight shifted |
| mon_`<monster>`_hurt | same | wounded below half HP: hunched, bruised, a broken weapon or armor piece; no gore |
| mon_raider_idle, _hit, _hurt | about 36x44 | a human bandit from the food event "raid"; masked, a sack, a short blade |

Monsters: kobold, goblin, crawler, ashen-orc, raider; the minotaur boss last (future). Monsters
keep their idle's exact silhouette, size and palette; hit and hurt change the pose only.

**Done when:** a board shows the gate's 4 states on the base, and each monster's 3 states side by
side.

---

## Batch 5: Effects

**Goal:** combat and repair effects as short strips.
**Match:** the Warfront art; replaces `assets/fx/fx_slash`, `fx_spark`, `fx_ember` (not pixel art).
**Tool:** code. **Pilot:** `fx_slash`, `fx_spark`, `fx_crit`.

| File | Frame size | Frames, fps | Notes |
| --- | --- | --- | --- |
| fx_slash | 24x24 | 4, 12 | the tap strike; 3 color variants by palette: plain, gold, ember (claw tiers) |
| fx_spark | 12x12 | 4, 12 | hit spark |
| fx_ember | 4x4 | 3, 8 | floating ember, loops |
| fx_crit | 24x24 | 4, 12 | critical hit burst, bigger and brighter than the slash |
| fx_ally-hit | 16x16 | 3, 12 | the army's hit flash, steel blue |
| fx_wall-impact | 20x16 | 4, 12 | a monster strikes the wall: dust and chips |
| fx_repair | 12x12 | 4, 8 | repair sparkle on the wall, warm |
| fx_breach | gate box | 6, 8 | the wall falls; ends on `map_gate_breached` |

Effects are light, not objects: glow colors, no ink outline (README 3.5 does not apply), hard alpha
still applies.

**Done when:** each effect plays on a GIF over the Warfront base.

---

## Batch 6: People

**Goal:** the game's roles as small sprites, and the wanderer groups.
**Match:** the 8 townsfolk (`folk-human`, `folk-dwarf`, `folk-elf`, `folk-horned`, each with
`-carry`), 11x16. Small sprites stay human or humanoid; any of the four peoples may appear.
**Tool:** code. **Pilot:** `ppl_fighter`, `ppl_knight`, `evt_wanderer-lone`.

| File | Size | Notes |
| --- | --- | --- |
| ppl_fighter_idle, _attack | 11x16 | a rallied villager with a spear; attack as a 2-frame strip |
| ppl_repairer_strip2 | 11x16 | hammering, 2-frame loop, 4 fps |
| ppl_conscript, ppl_footman, ppl_knight | 11x16; the knight up to 13x18 | rank must read from gear: rags and spear, then helmet and shield, then plate and plume |
| ppl_gatherer, ppl_trapper, ppl_ranger | 11x16 | basket; snare and pelts; bow and hood |
| ppl_explorer | 11x16 | pack, staff, lantern |
| evt_wanderer-lone, -couple, -family, -veteran | about 32x20 | small groups at townsfolk scale, on a strip of road |

Anchor every person at the bottom center (the feet).

**Done when:** a line-up board shows all roles beside the townsfolk, and the four wanderer groups.

---

## Batch 7: Forage and events

**Goal:** the Forage screen's pieces and the art for events and reports.
**Match:** `valley-bg` (130x96) and the strips `strip-forest`, `strip-meadow`, `strip-river`
(110x34). **Tool:** code. **Pilot:** `evt_granary_50`, `evt_food-bountiful`, `evt_exp-light`.

| File | Size | Notes |
| --- | --- | --- |
| evt_granary_0, _25, _50, _75, _100 | 32x32 | how full the stores are |
| evt_forage-action | 20x20 | basket and sheaf, sits in the FORAGE orb |
| evt_food-lean, -bountiful, -raid, -refugees | 24x24 | badge per food event |
| evt_food-warning | 12x12 | starvation warning icon |
| evt_exp-light, -find, -survivors, -silent | 110x34 | expedition outcomes: A Light in the Dark, A Lucky Find, Survivors Spotted, The Wasteland Was Silent |
| evt_welcome-back | 110x34 | Welcome Back (offline): dawn over the wall |
| evt_breach-report | 110x34 | the Breach report: a broken gate at dawn |
| evt_refugees | 110x34 | Refugees Approach: a group at the gate |

**Done when:** each piece is shown on a mock of its sheet or screen.

---

## Batch 8: Cast extras

**Goal:** the sigils as real files and the prologue's emblem.
**Match:** the 5 busts (`bust-pyreth`, `bust-rodain`, `bust-mirael`, `bust-kael`, `bust-lirae`,
44x46) and the inline sigil glyphs in `_dev/mockups/v1/*.dc.html` (search for "sigil").
**Tool:** code. **Pilot:** `cast_emblem-gate`, `cast_sigil-kael`, `cast_sigil-lirae`.

| File | Size | Notes |
| --- | --- | --- |
| cast_sigil-pyreth | 10x10 | the ember (gold diamond) |
| cast_sigil-rodain | 10x10 | crossed spears |
| cast_sigil-mirael | 10x10 | the compass star |
| cast_sigil-kael | 10x10 | the anvil |
| cast_sigil-lirae | 10x10 | the quill |
| cast_emblem-gate | 44x46 | "The Gate of Draconia", the prologue's narrator: an emblem in a bust frame, not a face |

**Done when:** each sigil is shown on a dialogue mock beside its bust.

---

## Batch 9: Interface kit (only if the owner chose images)

**Goal:** the interface pieces as 9-slice pixel images. **Match:** mockup v2's styles
(`_dev/mockups/v2/mockup.src.html`): stepped corners, heraldic shapes. Fonts are not drawn; the game
uses Cinzel, Pixelify Sans and Nunito. **Tool:** code; Figma only if the owner asks (README 6.5).
**Pilot:** `ui_plate`, `ui_btn-gold`, `ui_orb-rally`.

| File | Notes |
| --- | --- |
| ui_plate | 9-slice, 4 px stepped corners: cards, sheets, modals |
| ui_ribbon | 9-slice with notched ends: objective strip, titles |
| ui_divider | 3-slice with diamond ends |
| ui_socket | 14x16, the heraldic scale shape that holds an icon |
| ui_btn-gold, -steel, -stone, -red | 9-slice each, states: normal, pressed, disabled |
| ui_orb-rally, -repair, -forage, -train, -recruit | 20x20, normal and pressed; holds the matching icon |
| ui_bar-frame, ui_bar-fill-hp, -gate, -capacity, -progress | 3-slice frame, 1 px wide repeatable fills |
| ui_chip | 9-slice for resource and population chips |
| ui_tab-gem | 16x16: on, off, locked, badge |
| ui_sheet, ui_modal, ui_toast, ui_coach | 9-slice frames for each overlay |
| ui_rations-segment | 3 states: off, on, warning |

Record each 9-slice's insets (left, top, right, bottom) in the manifest.

**Done when:** a mock screen built only from these pieces matches mockup v2's look.

---

## Not for agents yet

| Asset | Why it waits |
| --- | --- |
| The protagonist: portrait, perch, victory, head token, idle, fireball attack, upgrade looks | commissioned from the artist |
| Fireball projectile and critical fireball | the dragon's own fire; the owner decides after the artist delivers |
| The pendant (heartstone) icon | the owner decides: the artist or Batch 1 |
| App icon, adaptive icon, splash, favicon, store art | built around the protagonist's art |
| Future busts: Varn, Ashara, Thornwick, Sera, the Hollow Knight; second expressions | their scenes are not written yet |
| Story illustrations (prologue, the Breach) | optional; the owner decides |
| Building interior headers | optional; the owner decides |
