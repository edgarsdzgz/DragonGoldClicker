# Art in the game: catalog and import plan (approved 2026-10-27)

**Goal:** get the official pixel art out of `_dev/art/official/` and onto the A16, one screen at a
time, without hand-copying files and without the art going blurry.

This is Step 4's visual redesign, first slice. Nothing is built until the owner approves.

---

## 1. What we have (the catalog)

The art session's register is `_dev/art/official/OFFICIAL.md`: 167 PNGs, about 300 KB in all,
every file at native size. None of it is in the game yet. Today the game draws Ionicons
(about 45 names), a tinted 600x600 kobold silhouette (the other monsters are Ionicons), and three
painted strike effects.

| Group | Files | What it is | What it replaces in the game today |
| --- | --- | --- | --- |
| Icons | 71 | 12x12 interface icons, 9 claw tiers (16x16), 13 research icons, 10 building icons (16x16) | Ionicons on every screen, the claws chip, Librarium nodes, building cards |
| Warfront | 7 | Base map 130x282 (no gate), the gate in 4 states, torch flicker, gate layout JSON | The Warfront's plain background and the HP-only gate |
| Mobs | 20 | Kobold, goblin, crawler, orc, raider: idle, hit, hurt, 2-frame walk | The kobold silhouette and the other monsters' Ionicons |
| City | 20 | City base map 130x282, plot layout JSON (10 plots), fog, foundation, empty plot, scaffold in 4 plot sizes, 2 map markers | The Draconia tab's card list |
| Buildings | 27 | All 10 buildings in every state (ruin, levels, lit forge strip) | Building cards' Ionicons |
| People | 12 | 9 townsfolk, the fighter standing and jabbing | The fighter and villager chips (numbers only) |
| Events | 3 | Granary empty, half, full | The food readout |
| FX | 2 | Hit spark (4 frames) and its Piskel file | `assets/fx/fx_spark.png` |

**Still missing** (from `_dev/art/asset-list.md`): the dragon (commissioned), the
fireball, slash and critical bursts, the cast busts, the interface kit (frames, buttons) and the
app icon. Screens keep their current look wherever art is missing.

**Likely icon swaps** (to confirm screen by screen as each one is wired):

| Ionicon now | Official icon |
| --- | --- |
| `flame` (Warfront tab), `leaf` (Forage tab), `settings` | `icon_flame`, `icon_wheat`, `icon_cog` |
| `star` (renown), `nutrition` / `restaurant` (food) | `icon_star`, `icon_food` |
| `hammer` / `construct` (repairers), `shield` (fighters) | `icon_hammer`, `icon_shield` |
| `people` / `person` (villagers), `person-add` (train) | `icon_villager`, `icon_train` |
| `flash` (claws) | `icon_claws`, and the tier icons `icon_claw-1` to `-9` |
| `book` (Librarium), `compass` (explorers), `lock-closed` | `icon_book`, `icon_compass`, `icon_padlock` |
| `skull`, `flag`, `moon`, `time`, `checkmark`, `close` | `icon_skull`, `icon_flag`, `icon_moon`, `icon_hourglass`, `icon_check`, `icon_close` |
| `trending-up` / `-down`, `arrow-up-circle`, `swap-horizontal` | `icon_rising` / `icon_falling`, `icon_upgrade`, `icon_reassign` |
| `information-circle`, `arrow-forward` | `icon_info`, `icon_next` |

---

## 2. How the art gets in

**One source, one script.** `_dev/art/official/` stays the art session's library and is never
touched by the game side. A new script, `scripts/import-art.py`, reads it and writes:

- `assets/art/<group>/...`: copies the game ships, in the same groups as the library.
- `src/art/manifest.ts`, generated: a typed id for every sprite, with its native size and, for
  strips, its frame count and speed (`mob_kobold_walk`: 2 frames, 4 fps). The plot and gate
  layouts come in from their JSON files.

The game asks by meaning, never by file name: `art.icon('hammer')`, `art.building('garrison', 3)`
(the nearest drawn level, so Lv2 shows Lv1 art), `art.mob('orc', 'hit')`. A newly approved sprite
reaches the game when the script runs again. A test checks that every id the game uses exists.

**Sharp at any size.** The brief's rule is whole-number scale with nearest-neighbor, never
smoothing. React Native's own `Image` smooths when it scales up on Android, so a 12x12 icon
would come out blurred. Two ways round it:

- **A. Skia (recommended).** Add `@shopify/react-native-skia`, Expo's supported 2D canvas. It
  draws with nearest-neighbor at any whole-number scale, on any phone, from the native files. It
  can also draw a whole scene (the Warfront map, gate, torches, mobs) in one canvas, which suits
  the coming performance pass. The cost is a native module, so the next APK build is a full
  rebuild, and the APK grows by a few MB.
- **B. Pre-scaled files.** The script writes each sprite already enlarged (for example x8), and
  the game shrinks it to fit. It needs no new library, but the shrink is smoothed, so edges go
  slightly soft, worst on 12x12 icons. Each file is also 64 times larger.

**Reusable pieces** (in `src/components/`, in the barrel):

- `PixelSprite`: one sprite at a whole-number scale. Takes `id`, `scale` and an accessibility label.
- `PixelStrip`: a strip played at its own speed. Holds still on the first frame when Reduce Motion is on.
- `GameIcon`: an interface icon at x4 by default. It falls back to the old Ionicon while an icon
  is still undrawn, so the swap can go screen by screen.

---

## 3. Order (each its own build on the A16)

1. **Import and gallery.** The script, the manifest, the three components, and a dev-only Art
   Gallery in Settings that shows every sprite at its game scale. This is where I check sharpness,
   colors and speeds on the A16 before any screen changes. No gameplay change.
2. **Icons.** The swaps above, screen by screen: the tab bar, the resource bar, then the
   sheets and cards.
3. **The Warfront.** The base map, the gate by HP (sound, cracking, failing, breached), the
   torches, and each monster with its own idle, hit and hurt. The kobold silhouette retires.
4. **Draconia.** The city map with its ten plots: fog until a building is revealed, then the
   empty plot, scaffold, and each building by state, with the markers. Tapping a plot opens the
   building's sheet, as its card does now.
5. **People, events and FX.** The fighter on the wall, the granary for food, and the hit spark.

The performance pass measures before step 3 and after it, so the art's cost on the A16 is known.

---

## Open questions

1. **Sharpness:** Skia (A, recommended), or pre-scaled files (B)?
2. **Order:** import and gallery first, then icons, the Warfront, Draconia, and the rest
   (recommended)? Or the Warfront first, as the screen the player sees most?
3. **Missing art:** keep today's look wherever art is still undrawn and swap as art arrives
   (recommended)? Or wait until a whole screen's art is ready?
4. **Draconia layout:** the city map replaces the card list (recommended, the cards' details move
   into each building's sheet)? Or the map sits above the list?

## Owner rulings (2026-10-27)

All four as recommended: Skia; import and gallery first, then icons, the Warfront, Draconia and
the rest; swap art in as it arrives; the city map replaces the card list.

## Progress

- **Step 1, import and gallery: built 2026-10-27.** Skia 2.2.12; `scripts/import-art.py` writes
  `assets/art/` and `src/art/manifest.ts`; `PixelSprite` draws any sprite or strip; the dev Art
  Gallery (Settings, Dev) shows every sprite. Checked on the A16: sharp, whole-pixel art.
