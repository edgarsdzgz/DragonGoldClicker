# Art and sound wiring brief

For the developer wiring the locked art and sound into Draconia Chronicles. Written 2026-10-27. Everything
listed under "To build" is drawn, locked and already imported into the app; none of it is shown or played
yet. The section after it is what already works, so you can build on it without redoing it.

## How the art reaches the app (read first)

- **The art library** is `_dev/art/official/` (the register is `OFFICIAL.md`). Never edit those files.
  Art changes go through the owner.
- **`scripts/import-art.py`** copies the library into `assets/art/` and `assets/sound/` and writes
  `src/art/manifest.ts`. That file is generated: never hand-edit it, and rerun the script after an art change.
  The script also deletes anything in `assets/sound/` that is not in the library.
- **`SPRITES`** (`src/art/manifest.ts`) holds every sprite by id: native size, frame count, fps and a label.
  A strip `foo_stripN` becomes the id `foo_anim`.
- **Drawing art:**
  - Any sprite: `PixelSprite` (`src/components/PixelSprite.tsx`), with an `id` and a `scale`. It is sharp at
    whole screen pixels and plays strips.
  - A scale that fits a box: `fitScale(boxPts, artPx, PixelRatio.get())`.
  - Interface icons: `GameIcon`. Ionicons names map to pixel icons in `ICON_ART` (`src/art/icons.ts`).
    Players must not see a vector glyph, so add a mapping for any new icon name.

## UI rules now in force

- **Pop-up cards** sit on one bottom baseline inside `ModalStage`, so their buttons land in the same place on
  every card (an owner ruling). Never center a card. For the look, use `ModalEmblem` and `ModalButton`.
- **No gradients** (`expo-linear-gradient`), except inside `ProgressBar`. Use flat theme colors.
- **Colors come from `src/theme`**, including `colors.forage`, `colors.explorer` and `colors.meal`. Never add a
  private palette to a screen.
- **Story scenes play as dialogue** (`NpcDialog`). The speaker stands on a box at the bottom of the screen and
  the text types out. A tap finishes the line, then advances.
  - A scene (`SceneDef`, `src/data/story/lines.ts`) names its speaker (`who`) and may set a face for the whole
    scene (`mood`), a face for one line (`lineMoods`), or two people on stage for a conversation (`stage`).
  - Every character has every face: happy, grieving, angry, alarmed, worried, determined, plus neutral
    (`src/types/cast.ts`, with `portraitSprite` in `src/art/cast.ts`).

## To build

### 1. Sound (the biggest job)

The 41 locked sounds sit in `assets/sound/`, and none of them plays. The game still plays a stock pack from
`assets/music/out/` (see `src/data/sfx.ts`). Playback goes through `useSfx` and `sharedSfxPlayer`, one player
per sound.

- **Replace the stock game-event sounds** with these, and wire each one to its moment. Keep the stock interface
  ticks (taps, clicks) until the owner says otherwise.
- **Warfront:**
  - `sfx_monster-death`: a monster dies.
  - `sfx_wall-hit`: a monster strikes the wall. It replaces the `WEAPON_HIT_WALL` pool.
  - `sfx_crit`: a critical hit.
  - `sfx_slash-ember`: an Ember-tier claw strike.
  - `sfx_walk-up`: the next monster's footfalls.
  - `sfx_gate-crack`: the gate's state worsens.
  - `sfx_unmaking-rise`: the Unmaking's tier rises.
  - `sfx_rally`: Rally.
  - `sfx_mend`: the wall being mended.
  - `sfx_breach`: the wall falls.
- **City:**
  - `sfx_build-start` and `sfx_build-complete`: construction starts, and a building is finished.
  - `sfx_city-brightens`: the city brightening.
  - `sfx_research-done`: a study completes.
  - `sfx_expedition-out` and `sfx_expedition-back`: an expedition leaves, and returns.
  - `sfx_find`: an expedition's find.
  - `sfx_gate-knock`: wanderers or refugees at the gate.
  - `sfx_heartstone`: the heartstone.
- **Forage:**
  - `sfx_food-low`: food running low.
  - `sfx_food-raid`: a food raid.
  - `sfx_granary-full`: the granary is full.
- **Story:**
  - `sfx_scene-open`: a scene opens. It replaces the ring that `NpcDialog` plays now.
  - `sfx_fanfare`: a quest is done, or Renown is earned.
  - `sfx_welcome-back`: the welcome-back report.
  - Character stings, played when each character first appears: `sfx_sting-sera`, `sfx_sting-thornwick` and
    `sfx_sting-hollow-knight`.
- **Studio splash:** the beats `splash_slam`, `splash_medallion-top`, `splash_medallion-left`,
  `splash_medallion-right`, `splash_etch`, `splash_slash`, `splash_spread` and `splash_smash` follow the RAXDEG
  splash's timing (`SPLASH_TIMING`). `splash_full` is the whole sequence as one track. Use either one, not both.
- **Ambient loops:** each is a seamless 8-second loop.
  - `amb_torches`: the Warfront.
  - `amb_forge`: the forge.
  - `amb_horde-drums`: the siege, far off.
  - `amb_night-wind`: night. It is mastered loud, so mix it well under the rest.
- **Owner rule:** monsters have no voices (no yips or roars).
- **Settings:** honor the existing volume controls, and pause loops when the app is in the background.

### 2. Story pictures

There are 19 pictures (130x96), one per scene. Show the scene's picture when it opens, at a whole-pixel scale
across the top of the screen, behind the dialogue. The title already sits at the top.

| Scene (beat id) | Picture |
| --- | --- |
| prologue | `story_prologue` |
| elder_approaches | `story_elder-approaches` |
| first_renown | `story_renown` |
| call_to_arms | `story_wall-holds` |
| the_breach | `story_wall-shakes` |
| sharpen_claws | `story_young-claws` |
| the_wall_is_yours | `story_wall-is-yours` |
| empty_stores | `story_stores-run-low` |
| strangers_at_gate | `story_stranger` |
| a_city_to_build | `story_city-not-a-wall` |
| the_smith | `story_forge-is-cold` |
| beyond_the_walls | `story_beyond-the-walls` |
| the_keep | `story_keep-restored` |
| the_lodge | `story_rangers-lodge` |
| the_scholar | `story_ink-wing` |
| dragonsteel | `story_dragonsteel` |
| the_horde_grows | `story_they-come-bigger` |
| Breach, "The Wall Falls" | `story_breach` |
| Breach, "The Ancient Magic" | `story_ancient-magic` |

Add an optional `picture` field to `SceneDef` rather than deriving it from names, and give it a test that
every scene's picture exists in `SPRITES`.

### 3. Building interior headers

There are nine headers (110x34), shown at the top of each building's interior:

- `int_keep`, `int_garrison`, `int_forge`, `int_lodge`, `int_outpost`, `int_librarium`, `int_housing`,
  `int_tower` and `int_wizard-tower`.
- The interiors live in `src/screens/shop/*Interior.tsx`.
- Make it one shared header component, sized to the sheet's width at a whole art scale.

### 4. City light levels (needs an owner ruling first)

Every city map piece has `_dusk` and `_night` copies. This covers the base, plots, fog, foundations, markers
and buildings.

- **Naming:** the level goes before a strip's suffix, so `bld_forge_lit_night_strip3` becomes the id
  `bld_forge_lit_night_anim`.
- **Plumbing:** build a `cityLight(state)` that returns `'day' | 'dusk' | 'night'`, and pick sprite ids with it
  in `src/art/city.ts`.
- **Ask the owner** what drives the light (the clock, the siege's danger, or story beats) before choosing.

### 5. The new cast in scenes (content)

Varn, Ashara, Thornwick, Sera and the Hollow Knight have busts, sigils, every face and (for three of them)
stings, but no lines yet. When their scenes are written, they work by setting `who`. The Hollow Knight's faces
are a light inside its visor slit.

## Already done (do not redo)

- **The whole bestiary is in the horde:** 46 monsters across all three Unmaking tiers. Elites stand in for their
  kinds, bosses close levels, and fliers hover over their shadows.
- **The gate's damage pictures**, the claw slashes, the monster deaths and the wall fighters.
- **Pop-up cards:** every card is on `ModalStage`, with no gradients and no vector icons.
- **Dialogue:** busts, sigils, all faces, and two-person conversations (the Breach).

## How to work here

- **Git:**
  - Stage files by name; never use `git add .` or `-A`.
  - Commit with a pathspec (`git commit -- <files>`), because other sessions stage work in the same index.
  - Never add AI attribution to a commit.
- **Checks:** run `/verify` before each code commit, and keep `npx tsc --noEmit` and `npx jest` green.
- **Writing:** American English and no emoji, everywhere.
- **Art:** if something needs new or changed art, ask the owner. Never edit the official library.
