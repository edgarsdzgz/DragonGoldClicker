# Draconia Chronicles: pixel art brief for Claude agents

The core brief. Every agent that makes art for the game reads this file, then the one card from
[batches.md](batches.md) that it was given. The full list of what the game needs is
[../asset-list.md](../asset-list.md); the batch cards already carry the parts each agent needs.

Written 2026-10-26. The owner approves every batch before its assets go into the game.

---

## 1. What you are making

Pixel art for Draconia Chronicles, a mobile idle siege game (React Native, portrait phone). The
player is the last dragon of its color, perched on the gate of Draconia, the final bastion of light,
while a horde besieges it. The city rebuilds as the game goes on.

**The look in one line:** the glow of a fireside fantasy painting meets 16-bit pixel art.

- **Grand over cute.** Epic scale and dramatic light come first. Playful touches (expressive
  monsters, bouncy feedback) come second.
- **Light is progress.** Dark, cool night is the world. Warm firelight, torches and gold are hope,
  and the city gets brighter as it rebuilds.
- **Heraldry.** Shields, scales, banners and stepped stone shapes, not soft rounded app shapes.

## 2. What you must not make

- **The protagonist.** A human pixel artist is commissioned to draw the player dragon. Never draw,
  redraw, recolor or extend it. Where a screen needs it, place the stand-in files
  (`dragon-standin.png`, `dragon-portrait-standin.png`) and nothing else.
- **Anything from an image generator.** No AI image tools: no Figma `generate_image`, no Blender
  `generate_3d`, no outside generators. Every pixel is placed by your code or by hand.
- **Anything that copies another game's art.** Reference ideas, never pixels.
- **Final placement in the game.** You deliver to `_dev/art/agent/`. Moving art into `assets/` and
  wiring it into code is a separate, owner-approved step.

## 3. Pixel craft rules

These come from the owner's feedback on earlier attempts. Breaking one is a failed asset.

1. **Flat color clusters.** Shade with a few flat clusters per material (2 to 4 tones). No noise
   or texture stamped across a surface; the owner rejected that as a "strange 3D effect".
2. **No dithering on characters or objects.** Ordered dithering is allowed only in large skies and
   atmospheric gradients in backdrops.
3. **Hard alpha.** Every pixel is fully opaque or fully transparent. No anti-aliasing against
   transparency, no soft glows made of partial alpha (draw a glow as solid lighter pixels).
4. **Palette locked.** Use only colors from the master palette (section 4).
5. **Outlines.** A 1px outline on every sprite's outer silhouette in the ink color. Inner lines use
   the darkest tone of the local color ramp, never ink. A lit edge may break the outline with the
   ramp's darkest tone (selective outline).
6. **One light.** The key light comes from the upper left, warm. Shadows go cool (shift toward
   violet and blue), highlights go warm (toward yellow). Local light sources (torches, forges,
   windows) add warm light on the faces near them.
7. **Clean pixels.** No orphan single pixels of a different color inside a cluster, no "jaggies"
   (stair steps of uneven length on a curve), no pillow shading (shading that follows the outline
   inward instead of the light).
8. **Readable at 1x.** The silhouette alone must say what it is. Check the solid black silhouette at
   native size before shading.
9. **Creatures with real anatomy.** Dragons and monsters are built on real animals: a lizard skull,
   a raptor brow, ram horns, a bat wing, a bird's chest. Dragons must not read as silly: no big
   round eyes, no thin horns, no lean bodies.
10. **Color budget.** A small sprite (icon, person) uses at most 8 colors plus ink; a large sprite
    (building, monster, bust) at most 16 plus ink.

## 4. Palette

- **Master palette:** made in Batch 0 at `_dev/art/agent/00-foundation/palette/`, as
  `draconia.gpl` (GIMP palette, opens in Piskel, Aseprite and GIMP), `draconia.hex` (one hex color
  per line) and `palette.png` (one pixel per color). Every asset uses only these colors.
- **Reserved colors:** the protagonist's ember palette (crimson hide, gold plates, ivory horns)
  belongs to the protagonist alone; it is the last dragon of that color. No other creature uses
  crimson hide with gold plates.
- **Action colors in the interface:** steel blue for everyday actions, ember gold for key actions,
  stone gray for quiet ones, red only for HP, damage and danger.
- **Light levels by palette swap:** Batch 0 also defines a `night` map and a `dusk` map (each master
  color to a darker, cooler master color). Draw everything in its lit look; the game darkens it with
  the map. Window, torch and fire colors are "glow" colors that keep their value in every map.
- **Save PNGs as indexed (palette) PNGs** where the tool allows. They are small, and the palette
  swaps above work on them directly.

## 5. Sizes, scale and files

- **Native pixels.** Draw at native size. Display scale is the game's job, always a whole number
  (x2, x3, x4) with nearest-neighbor scaling, never smoothing.
- **Reference scale:** backdrops are 130 px wide and fill the 390 pt screen at x3. Icons are 12x12
  shown at x4. Each batch card gives exact sizes; when a size comes from an existing asset, match
  that asset.
- **Existing art is saved enlarged** in `_dev/mockups/v2/images/` (x3 to x5). Batch 0 writes native
  copies to `_dev/art/reference/`; use those, not the enlarged files.
- **Names:** `<kind>_<subject>_<state>.png`, lowercase with hyphens inside a part. Kinds: `icon`,
  `bld` (building), `map`, `mon` (monster), `fx`, `ppl` (people), `cast`, `ui`, `evt` (event art),
  `app`. Examples: `bld_garrison_lv3.png`, `mon_goblin_hurt.png`, `icon_hourglass.png`.
- **Animations** are horizontal strips: `<name>_strip<frames>.png`, every frame the same size, the
  anchor (feet or base) at the same spot in each frame. Each strip also gets a `.piskel` file and a
  `.gif` preview (section 6.2), and its frame rate goes in the manifest.
- **Never overwrite a version.** A redraw is `_v2`, `_v3`. The owner keeps every version.

**Batch folder layout** (`_dev/art/agent/<NN-batch>/`):

```
src/        generator scripts (Python), one per asset group
out/        native-size PNGs, the deliverables
piskel/     .piskel files for animated and multi-state assets
preview/    x4 previews, GIFs, the contact sheet, the in-scene composite
manifest.json   one entry per asset: file, size, frames, fps, anchor, palette check result
```

## 6. Tools: which to use for what

### 6.1 Code first: Python and Pillow (every asset)

Draw each sprite as code: a character grid (one letter per palette color) or shape calls on a
palette-indexed image, then run the shared kit's checks. This is how every existing asset was
made. It is exact, repeatable, versionable, and it keeps the palette locked.

Batch 0 builds the shared kit at `_dev/art/agent/00-foundation/pixkit/` (Python 3, Pillow 12):

| Function | Does |
| --- | --- |
| `load_palette()` | reads `draconia.gpl` |
| `from_grid(rows, key)` | builds an indexed image from a character grid |
| `outline(img)` | adds the 1px ink outline to the outer silhouette |
| `quantize(img)` | snaps any image to the palette, nearest color, no dithering (for Blender renders and Piskel edits) |
| `strip(frames)` / `write_piskel(frames, fps, path)` / `write_gif(...)` | animation output |
| `upscale(img, n)` | nearest-neighbor previews |
| `contact_sheet(files)` / `composite(sprite, backdrop, xy)` | review images |
| `check(path, spec)` | the automatic checks in section 7 |

### 6.2 Piskel: preview, animation, and the owner's touch-ups

Piskel (piskelapp.com, free, in the browser) is where the owner opens, plays and edits sprites.
- **You hand over `.piskel` files**, written by `write_piskel`. The format is JSON:
  `{"modelVersion": 2, "piskel": {"name", "description", "fps", "width", "height", "layers": [...]}}`,
  where each entry of `layers` is itself a JSON **string** of
  `{"name", "opacity", "frameCount", "chunks": [{"layout": [[0],[1],...], "base64PNG": "data:image/png;base64,..."}]}`
  and the PNG holds the frames side by side, left to right.
- **Batch 0 proves the writer once:** open a written `.piskel` at piskelapp.com in the browser,
  confirm frames, size and fps load, save it back, and compare. Fix the writer before any batch
  depends on it.
- **Do not draw by clicking in Piskel.** Each click is a round trip with a screenshot, a 64x64
  sprite has 4,096 cells, and a screenshot cannot confirm single pixels reliably. Draw in code; use
  Piskel to look and to let the owner adjust.
- **Edits come back through code:** when the owner edits in Piskel and exports a PNG strip, run it
  through `quantize` and `check` and save it as the next version.

### 6.3 Blender: buildings and the city map

Use Blender (connected through the Blender MCP) where many images must share one camera and one
light: the city base map, the 10 buildings and their states, and the gate and wall.
1. Start with `get_addon_status` and `get_scene_info`.
2. Block out each building from simple primitives, one collection per state (ruin, built, levels,
   scaffold), on its plot of a blocked-out city.
3. One orthographic camera matched to the city backdrop's angle: overlay a test render on
   `city-bg` and adjust until the ground lines agree. One sun from the upper left; warm point lights
   in windows and forges.
4. Render each state at its **native sprite size**, with anti-aliasing off and the view transform
   set to Standard. Read enum identifiers from Blender rather than hardcoding them (the MCP's rule).
5. **A render is an underlay, never the asset.** Run it through `quantize`, then redraw in code or
   by hand: flat clusters, clean edges, the outline. If the result still reads as 3D, redraw more.
6. Save the `.blend` in the batch's `src/` so every later state comes from the same model.

Also export a plot table (`map_plots.json`: plot id, x, y, width, height, anchor) from the same
scene, so the game can show and hide each building on its plot.

### 6.4 Claude Design: review boards

Every review round goes on a **new** board in the Draconia canvas (the one mockup v1 came from),
never over an earlier one. A board shows the batch's contact sheet at x4 and each asset composited
on its real backdrop at display scale, beside the existing art it must match. The main session
makes the boards; a builder agent supplies the `preview/` images.

### 6.5 Figma: only if the owner asks

Figma is not used to draw sprites. If the owner wants the interface kit (Batch 9) as a Figma
library, upload the finished PNGs and lay out their 9-slice specs there. Otherwise skip it.

## 7. Checks before you report

Automatic (`check` from pixkit; every asset must pass):
- size matches the card; every animation frame the same size
- every pixel's color is in the master palette; alpha is only 0 or 255
- color count within the budget (section 3, rule 10)
- outer silhouette fully outlined in ink
- no single-pixel islands of a different color (warning; justify any you keep)

By eye, on the preview images:
- the silhouette reads at 1x
- the light comes from the upper left; shadows cool, highlights warm
- it sits on its backdrop and next to the existing art without looking like a different game
- nothing reads as 3D-rendered, noisy or dithered

## 8. How a batch runs

1. **Pilot.** Make the 3 assets the card marks as the pilot. Write their previews and stop. The
   main session shows them to the owner on a board.
2. **Rest of the batch,** after the owner's OK, in the same agent (continued, not a new one).
3. **Review.** One reviewer agent checks the whole batch against sections 3 and 7 and the card.
4. **One fix round** at most, back in the builder; then it returns to the main session.
5. **Commit** each finished batch: stage the batch folder's files by name, conventional message
   `art(<batch>): ...`, no co-author or AI attribution lines.

**Report** in under 200 words: what was made (count and names), the check results, anything that
failed or was skipped, and the questions for the owner.

## 9. Agent plan

| Role | Model | Count |
| --- | --- | --- |
| Batch 0 (palette, kit, decisions) | main session | 0 agents |
| Builder, one per batch, continued through pilot, rest and fix | Sonnet | 1 per batch |
| Reviewer, one per batch, at the end | Sonnet | 1 per batch |

Batches 1 to 9 are about 18 agents in total. Run them one or two at a time, in the order on the
batch list. A workflow that runs several batches needs the owner's OK first, with the agent count
and models stated.

## 10. Open questions for the owner (answer before Batch 0)

1. **Pixel scale.** Backdrops show at x3 and the commissioned protagonist (128x128) at x2, so its
   pixels will look smaller than the world's. Accept the mix, or redraw backdrops at a different
   size later?
2. **Interface kit.** Keep panels, buttons and bars as code (CSS-like styles in React Native), or
   draw them as 9-slice pixel images (Batch 9)?
3. **Palette lock.** Lock the master palette now, or wait for the artist's dragon and fold its
   colors in? Indexed PNGs make a later palette change cheap either way.
