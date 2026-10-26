# Draconia Chronicles: art asset list

Everything the game shows or will show, and every piece of pixel art made so far. Taken from the
code (`src/`) and the docs on 2026-10-26.

**Status:** **Have** = pixel art exists. **Stand-in** = something usable exists but is not final.
**Missing** = nothing exists yet. **Future** = planned in the docs, not in the game yet.

**Where existing art lives:** `v1/` = `_dev/mockups/v1/images/` and `v2/` = `_dev/mockups/v2/images/`
(both saved in the repo). **Scratch** = only in the session's temporary scratch folder, at risk until
archived.

Sizes are native pixels; files are mostly saved enlarged (x3 to x5).

---

## Part 1: What the game needs

### 1.1 The protagonist (commissioned; see the artist brief V3)

| Asset | Size | Status |
| --- | --- | --- |
| Portrait bust (profile, facing right) | 48x48 | Stand-in: head study V7 |
| Perched full body on the gate | 128x128 | Stand-in: body study V2 |
| Victory pose, wings spread | 128x128 | Missing |
| Head token (map marker, tab icon) | 32x32 | Missing |
| Idle loop for the perch (breathing, tail, blink) | 128x128, 4-6 frames | Missing (optional in brief) |
| Fireball attack for the perch | 128x128, 6-8 frames | Missing (optional in brief) |
| Fireball projectile and critical fireball | ~16x16, a few frames each | Missing |
| The pendant (heartstone), as an item icon | 12x12 to 16x16 | Missing |
| Upgrade looks: claws, fangs, armor, horns | per sprite | Future |

### 1.2 Warfront

| Asset | States or frames | Status |
| --- | --- | --- |
| Night backdrop: sky, blood moon, the road, the horde's camp | 1 | Have, but the gate is painted in; needs a version without it |
| Gate and wall, as its own sprite | sound, cracking, failing, breached (4) | Missing |
| Gate torches | 2-3 frame flicker | Missing (painted into the backdrop) |
| Kobold | idle, hit, hurt (3) | Have idle only (the game's own kobold is painted 600x600 art) |
| Goblin | idle, hit, hurt (3) | Have idle only |
| Shadow Crawler | idle, hit, hurt (3) | Have idle only |
| Orc (drawn as the Ashen Orc) | idle, hit, hurt (3) | Have idle only |
| Raider (food event "raid") | idle, hit, hurt (3) | Missing |
| Minotaur boss | idle, hit, hurt (3) | Have idle only (Future: no boss in the code yet) |
| Tap strike slash | 3-4 frames | Stand-in: `assets/fx/fx_slash.png` (not pixel art) |
| Hit spark | 3-4 frames | Stand-in: `assets/fx/fx_spark.png` |
| Ember | 1-3 frames | Stand-in: `assets/fx/fx_ember.png` |
| Critical hit burst | 3-4 frames | Missing |
| Ally (army) hit flash | 2-3 frames | Missing |
| Monster strikes the wall (impact) | 3-4 frames | Missing |
| Repair sparkle on the wall | 3-4 frames | Missing |
| Breach: the wall falls | 4-6 frames or one illustration | Missing |
| Fighters on the wall (rallied villagers) | idle, attack | Missing (the game shows them as a number chip) |
| Repairers at work | 2-frame loop | Missing |

### 1.3 Draconia (the city)

Buildings must appear, disappear and change state, so each is its own sprite on a plot of the base map.

**Shared pieces**

| Asset | Status |
| --- | --- |
| Base map with empty plots: ground, roads, the city wall, the gate | Missing (the current city backdrop has buildings painted in) |
| Fog over an undiscovered plot | Missing |
| Empty plot or foundation | Missing |
| Construction scaffold (one shared, sized per plot) | Have, painted into the backdrop only |
| "Upgrade ready" marker | Have, inline glyph on the v1 Draconia board |
| "Something to do" badge | Missing (drawn in CSS in the mocks) |
| Light level of the city (it brightens as it rebuilds) | Missing: night, dusk and lit versions of the base map, or a light overlay |

**Buildings** (each needs a ruin or unbuilt look, a built look, and a look per upgrade tier where it has levels)

| Building | In the game | Levels | States to draw | Status |
| --- | --- | --- | --- | --- |
| Draconia Keep | Yes | offline tiers | ruin, built, restored | Have, painted into the backdrop only |
| The Garrison | Yes | Lv1-5 | ruin, Lv1, Lv3, Lv5 | Missing |
| The Forge (Kael's) | Yes | none | cold ruin, built, lit | Missing |
| Ranger's Lodge | Yes | Lv1-3+ | ruin, Lv1, Lv3 | Have one look, painted into the backdrop only |
| Wayfinder's Outpost | Yes | Lv1+ | ruin, built, upgraded | Missing |
| The Librarium | Yes | none | ruin, built | Have a ruin, painted into the backdrop only |
| Housing | Future ("Coming soon") | several houses | plot, one house, a row | Have houses, painted into the backdrop only |
| Wizard's Tower | Future (needs Thornwick) | none | ruin, built | Missing |
| Tower East | Future | none | ruin, built | Have one look, painted into the backdrop only |
| Tower West | Future | none | ruin, built | Have one look, painted into the backdrop only |

**Building icons** for sheets and lists: one per building (10). Missing.

**Building interiors:** the sheets show text only today. A small header illustration per interior
(6 now, 10 later) is optional. Missing.

### 1.4 Forage

| Asset | Status |
| --- | --- |
| Valley backdrop | Have |
| Granary (shows how full the stores are) | Missing |
| FORAGE action art (basket, sheaf or hands) | Missing (the orb is CSS with the wheat icon) |
| Food events: lean season, bountiful harvest, raid, refugees (badge or banner each) | Missing |
| Expedition strips: forest, meadow, river | Have (made for the v1 mock; the game has no forage zones yet) |

### 1.5 People

| Asset | Size | Status |
| --- | --- | --- |
| Townsfolk: human, dwarf, elf, horned folk; standing and carrying (8) | 11x16 | Have |
| Fighter (a rallied villager) | 11x16 | Missing |
| Repairer | 11x16 | Missing |
| Conscript, Footman, Knight | 11x16 or larger | Missing |
| Gatherer, Trapper, Ranger | 11x16 | Missing |
| Explorer (wayfinder) | 11x16 | Missing |
| Wanderers: Lone Wanderer, Traveling Couple, Small Family, Veteran | small group portraits | Missing (the v2 mock borrows a dwarf) |

### 1.6 Cast (dialogue busts and sigils)

| Character | Bust | Sigil | Status |
| --- | --- | --- | --- |
| Elder Pyreth (elder dragon) | 44x46, plus an earlier drawing (44x46) and a redraw (46x48) | The ember (gold diamond) | Have both; sigil is an inline glyph only |
| Captain Rodain (orc veteran) | 44x46 | Crossed spears | Have both; sigil inline only |
| Scout Mirael | 44x46 | The compass star | Have both; sigil inline only |
| Kael Ironwright (smith) | 44x46 | The anvil | Have both; sigil inline only |
| Lirae the Ink-Wing (archivist) | 44x46 | The quill | Have both; sigil inline only |
| "The Gate of Draconia" (prologue narrator) | an emblem, not a face | | Missing |
| Varn, Dragon Recruit | bust | | Future |
| Ashara, Elder Wyrm | bust | | Future |
| Thornwick, the Exiled Mage | bust | | Future |
| Sera the Shieldmaiden | bust | | Future |
| The Hollow Knight | bust | | Future |

Expressions: each bust has one face today. Scenes may want a second (angry, grieving) later. Future.

### 1.7 Icons

The game uses Ionicons today. Each needs a pixel version (12x12, shown at x4) to match the look.

| Purpose | Ionicon in code | Pixel icon |
| --- | --- | --- |
| Renown | star | Have (star) |
| Food | nutrition | Have (food) |
| Villagers | home, people | Have (villager) |
| Fighters | shield | Stand-in (swords) |
| Soldiers | people | Have (helm) |
| Repairers | construct | Have (hammer) |
| Foragers | leaf | Have (wheat) |
| Explorers | compass | Missing |
| Journal | book | Have (scroll) |
| Draconia tab | hammer | Have (castle) |
| Warfront tab | flame | Missing (the mock uses swords) |
| Forage tab | leaf | Have (wheat) |
| Settings tab | settings-outline | Have (cog) |
| Locked | lock-closed | Have, inline glyph only |
| Objective and quests | flag, flag-outline | Missing |
| Next meal | notifications-outline | Missing |
| Timers | time, timer, hourglass | Missing |
| Upgrade | arrow-up-circle, arrow-up | Have, inline glyph only |
| Next, go | arrow-forward | Have, inline glyph only |
| Done | checkmark, checkmark-circle | Missing |
| Close | close, close-circle | Missing |
| Unknown ("???") and help | help-circle | Missing |
| Info | information-circle | Missing |
| Death, reset | skull | Missing |
| Rising and falling stores | trending-up, trending-down | Missing |
| Reassign | swap-horizontal | Missing |
| Train | person-add | Missing |
| Rank | ribbon | Missing |
| Shield gear | shield-checkmark | Missing |
| Sword gear | (text today) | Have (swords) |
| Claws | (hammer today) | Missing |
| Damage | flash | Missing |
| Gate | log-in | Missing |
| Rations | restaurant | Missing |
| Offline, rest | moon | Missing |
| Keep | business | Have (castle) |
| Librarium | library, book | Missing |
| Wizard's Tower | sparkles | Missing |
| Map | map | Missing |
| Stats | stats-chart | Missing |
| Smaller uses: eye, search, fitness, flower, hand-left, wallet, remove-circle, refresh, save, phone, speedometer | various | Missing (review which stay) |
| Treasure and rewards | (none) | Have (chest) |

**Research** (Librarium): one icon per category and per node.
- Categories (5): Economy, Military, Survival, Exploration, ??? (mystery). Missing.
- Nodes (13 named plus 2 hidden): Keen Eye, Efficient Patrols, Golden Harvest, Drill Tactics,
  Tempered Steel, Veteran Training, Rationing, Herbalist Knowledge, Lean Rations, Feast Hall,
  Frontier Settlement, Cartography, Keen Scouts, ???, ???. Missing.

**Claws track** (9 tiers): Fledgling, Sharpened, Hooked, Hardened, Serrated, Obsidian, Ember,
Dragonsteel, Ancient. One icon each is optional. Missing.

### 1.8 Interface kit

Drawn with CSS in both mocks. Each needs a decision: keep it in code, or make it a 9-slice pixel image.

| Piece | Used for |
| --- | --- |
| Stepped-corner panel ("Plate") | cards, sheets, modals |
| Ribbon with notched ends | the objective strip, titles |
| Ornament divider with diamond ends | section breaks |
| Icon socket (the heraldic scale shape) | icons on ribbons, levels |
| Buttons: gold (key action), steel blue (everyday), stone (quiet), red (destructive) | every action |
| Action orbs: RALLY, REPAIR, FORAGE, TRAIN, RECRUIT | Warfront and Forage |
| Bars: enemy HP, gate, capacity, progress | everywhere |
| Resource chips and population chips | top bar, Warfront |
| Tab bar with gem tabs (on, off, locked, badge) | navigation |
| Bottom sheet frame, modal frame, toast, coach-mark frame | overlays |
| Rations selector segments | Forage |

Fonts (Google Fonts, SIL Open Font License): Cinzel for titles, Pixelify Sans for numbers, Nunito
for body text. Not yet in the app.

### 1.9 Events and story

| Asset | Status |
| --- | --- |
| Welcome Back (offline): a dawn or ledger illustration | Missing |
| Refugees Approach: a group at the gate | Stand-in: townsfolk sprites |
| The Breach report | Missing |
| Expedition outcomes: A Light in the Dark, A Lucky Find, Survivors Spotted, The Wasteland Was Silent | Missing |
| Food warning, starvation | Missing (text and icons only) |
| Story scenes (19): The Last Bastion, The Elder Approaches, Renown, The Wall Holds, The Wall Shakes, Young Claws, The Wall Is Yours, Our Stores Run Low, A Stranger on the Road, A City Not a Wall, The Forge Is Cold, Word Spreads, Lean Times, Beyond the Walls, The Keep Restored, The Ink-Wing, Fifty Became Thirty, The Wall Falls, The Ancient Magic | Use the busts today; a full illustration for the prologue and the Breach is optional |

### 1.10 App and store

| Asset | Size | Status |
| --- | --- | --- |
| App icon | 1024x1024 | Check: `assets/icon.png` exists; likely a placeholder |
| Android adaptive icon foreground | 1024x1024 | Check: `assets/adaptive-icon.png` |
| Splash screen | per Expo | Check: `assets/splash.png` is 64x64 |
| Favicon (web) | 48x48 | Check: `assets/favicon.png` |
| Store screenshots and feature graphic | per store | Missing |

---

## Part 2: Every piece of pixel art made so far

### 2.1 Scenes and strips

| File | Native size | Where |
| --- | --- | --- |
| warfront-bg | 130x282 | v1, v2, scratch `mock/assets` |
| city-bg | 130x282 | v1, v2, scratch |
| valley-bg | 130x96 | v1, v2, scratch |
| strip-forest, strip-meadow, strip-river | 110x34 each | v1, v2, scratch |

### 2.2 Icons

| File | Native size | Where |
| --- | --- | --- |
| icon-star, icon-food, icon-villager, icon-swords, icon-helm, icon-hammer, icon-wheat, icon-scroll, icon-castle, icon-cog | 12x12 each | v1, v2, scratch |
| chest | 16x13 | v1, v2, scratch |
| Inline glyphs on the v1 boards: 2 padlocks (Draconia, Forage), the upgrade arrow (Draconia), the level arrow and a button arrow (Keep upgrade), the sigils (Cast, Lirae, Mirael), button arrows (Lirae, Mirael, Rodain): 14 in all | 8x8 to 10x11 | inside the `.dc.html` boards only |

### 2.3 Monsters

| File | Native size | Where |
| --- | --- | --- |
| kobold (battle, x5) and b-kobold (bestiary, x3) | 38x51 | v1, v2, scratch |
| goblin (x5) and b-goblin (x3) | 36x40 | v1 (bestiary), v2, scratch `mock/heroes`, `mock/bestiary` |
| crawler (x5) and b-crawler (x3) | 50x34 | same |
| ashen-orc (x5) and b-ashen-orc (x3) | 46x54 | same |
| minotaur (x5) and b-minotaur (x3) | 56x60 | v1, v2, scratch |

### 2.4 Cast and people

| File | Native size | Where |
| --- | --- | --- |
| bust-pyreth, bust-rodain, bust-mirael, bust-kael, bust-lirae | 44x46 each | v1, v2, scratch `mock/cast` |
| pyreth (the first-mock Pyreth, an earlier drawing than bust-pyreth) | 44x46 | v1, scratch `mock/assets` |
| bust-pyreth2 (redraw) | 46x48 | v1, scratch `mock/heroes` |
| folk-human, folk-dwarf, folk-elf, folk-horned, each plus a -carry pose (8) | 11x16 each | v1, v2, scratch `mock/cast` |
| villager, villager-carry (identical copies of folk-human and folk-human-carry) | 11x16 each | v1, v2, scratch `mock/assets` |

### 2.5 Protagonist studies

| File | Native size | What it is | Where |
| --- | --- | --- | --- |
| dragon | 64x54 | First-mock dragon, rearing on the gate | v1, scratch `mock/assets` |
| hero-dragon | 80x72 | Hero dragon from the cast pass | v1, scratch `mock/heroes` |
| eye-, portrait-, rearing-, spread-, token- x azure, ember, obsidian, verdant (20) | 32x22, 64x64, 96x88, 96x80, 32x32 | Procedural studies (rejected: texture read as a "3D effect") | v1 (ember portrait only), scratch `mock/study` |
| head v1, v2, v4, v5, tmp | 48x48 | Early head tests | scratch `head/` only |
| head v3 = **Head study V2** (the favorite) | 48x48 | | v1, scratch |
| head v6 = Head study V3 (lean neck) | 48x48 | | v1, scratch |
| head v4a, v4b (drafts), v4c = Head study V4 | 64x64 | Three-quarter view, facing left | v4c in v1; drafts scratch only |
| head v5a = Head study V5 | 64x64 | V4 plus horn rings and scales | v1, scratch |
| head v6a, v6b (drafts), v6c = Head study V6 | 64x64 | New skull, facing right | v6c in v1; drafts scratch only |
| **head v7 = Head study V7 (chosen)**, v7a (draft) | 48x48 | V2 plus horn rings and scales | v7 in v1 and v2; v7a scratch only |
| body b1a (draft), b1b = Body V1 | 96x96 | Pose check, flat colors | b1b in v1; b1a scratch only |
| **body b2a = Body V2** | 128x128 | V7's head pasted 1:1 on the body; the current stand-in | v1, v2 |

### 2.6 Previews and sheets (not separate art)

Enlarged copies, silhouettes and comparison sheets of the art above:
- `head/`: every -x6, -x8, -sil, -silhouette, -face file, plus `cmp27`, `cmp45`, `v6c-cmp`. Scratch only, except those used on boards.
- `body/`: b1a/b1b -cmp, -flat-x4, -sil-x4; b2a -x2, -x3, -sil-x3, -head. Board ones in v1.
- `mock/study/token-ember-x10`. Scratch.
- `small/`: assets-preview, cast-preview, heroes-preview, study-preview, study-fix, fix, hero-on-wall, pyreth2. Scratch only.

### 2.7 Generator scripts (scratch only)

`tools/`: pixelgen.py, busts.py, heroes.py, herostudy.py, headstudy.py, head_v4.py, head_v5.py,
head_v6.py, head_v7.py, body_v1.py, body_v2.py, body_v3.py (never run), sheet.py, shrink.py, crop.py.

### 2.8 In the game folder already (not from this pixel pass)

| File | Size | Note |
| --- | --- | --- |
| assets/monsters/kobold_idle, kobold_hit, kobold_hurt | 600x600 | Painted, not pixel art |
| assets/fx/fx_slash | 400x400 | Not pixel art |
| assets/fx/fx_spark | 64x64 | |
| assets/fx/fx_ember | 48x48 | |
| assets/icon, adaptive-icon (1024x1024), splash (64x64), favicon (48x48) | | See 1.10 |
