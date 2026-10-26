# Research Brief: Clicker and Gacha UI Aesthetics

**For:** a Claude session picking this up cold.
**Requested by:** the project owner, 2026-10-26.
**Project:** Dragon Gold (`R:\Coding_Projects\_dragonGold`), a React Native (Expo 54) siege-defence
clicker for phones.

---

## 1. Goal

Find out how successful clicker and idle games, and polished gacha RPGs, make their screens look
**polished and pretty**. Write it down in words, backed by screenshots you have actually looked at,
so the owner can redesign Dragon Gold to look modern and attractive.

This is **visual research only**: how things look and feel. It is not about game mechanics,
monetisation or economy design.

## 2. What Dragon Gold looks like now

Four screenshots from the owner's phone (a Galaxy A16, 1080x2340) are in `current-app/` next to this
brief. Look at them first:

- `warfront-early.png`: the main screen early on. One monster in a circle, its HP bar, the gate.
- `warfront-rally.png`: later. Quest line, villager and fighter chips, the RALLY orb, the footer.
- `warfront-fighter-hit.png`: a fighters' hit (the small blue "-0.50") and the white "just lost"
  chunk on the HP bar.
- `scene-dialog-highlight.png`: a story scene (Elder Pyreth) with the renown figure boxed in gold.

The design system is called **"Ember & Stone: torchlit medieval siege defence"**:
- Near-black backgrounds (`#0a0a0f` to `#252530`) with gold accents (`#d4922c` to `#f0c060`).
- Tokens live in `src/theme/index.ts`.
- Monsters are flat gold silhouettes; only the kobold has custom art.
- Most UI is flat panels, thin borders and Ionicons.

The honest gap: it reads as a functional prototype. It works, but nothing about it says
"premium game".

Main UI pieces, so findings can be mapped onto them:

| Piece | File | What it is |
|---|---|---|
| Battlefield | `src/components/Battlefield.tsx` | The tap target: monster circle, hit effects, floating numbers |
| EnemyHp | `src/components/EnemyHp.tsx` | One long HP bar with "cur / max" |
| HarvestOrb | `src/components/HarvestOrb.tsx` | Round action buttons (RALLY, FORAGE, TRAIN) |
| ResourceBar | `src/components/ResourceBar.tsx` | Top bar: renown (gold star), food, journal |
| ObjectiveStrip | `src/components/ObjectiveStrip.tsx` | The quest line ("Rally 5 fighters 2/5") |
| NpcDialog | `src/components/NpcDialog.tsx` | Story scene card over a dimmed screen |
| Gate | `src/screens/warfront/Gate.tsx` | The gate strip at the bottom of the fight |
| Tab bar | `src/navigation/index.tsx` | Bottom tabs: Draconia, Warfront, Forage, Settings |

## 3. Games to study

Cover every game in group A and group C. In group B, pick the 4-6 that are best documented online.

**A. The owner's named references (required)**
- **Cookie Clicker** (web and mobile).
- **"Dicero"**: the owner named this, but the exact title is not confirmed. Search for it, and if
  you cannot identify it with confidence, say so in the report and ask the owner. Do not guess.
  Possible meanings include a dice-based clicker or roguelike.
- **Honkai: Star Rail.** The owner has done this kind of study for Star Rail before, using online
  galleries of its whole UI. Find galleries like that again.
- **Genshin Impact.**

**B. Top clicker, idle and incremental games (pick 4-6)**
- Tap Titans 2, Clicker Heroes, AdVenture Capitalist, Egg, Inc., Idle Slayer, Cell to Singularity,
  Melvor Idle, Realm Grinder, Legends of Idleon.
- **Grow Castle** and other tap-to-defend-a-castle games: the closest premise to ours.
- **AFK Arena and AFK Journey**: idle combined with gacha polish, probably the single most relevant
  bridge.

**C. Other gacha games, for polish**
- Arknights, Zenless Zone Zero, Wuthering Waves, Blue Archive, Epic Seven.
- One fantasy-medieval gacha such as Raid: Shadow Legends, because our theme is medieval.

## 4. Where to find screenshots (verify each one; do not trust this list blindly)

Prefer sources that already collect many UI screens of one game:
- **Game UI Database** (gameuidatabase.com): screens sorted by game and by screen type (HUD, menus,
  dialogs, inventory). Check it first for every game.
- **Interface In Game** (interfaceingame.com): another game UI gallery.
- **App Store and Google Play listings**: official marketing screenshots for every mobile title.
- **Fandom and official wikis**: often have UI screenshots of menus, gacha screens and dialogs.
- **Reddit** (r/incremental_games, r/gameui, each game's own subreddit): "UI breakdown" posts.
- **Dribbble, Behance and ArtStation**: search "<game> UI", "game UI kit", "gacha UI". Studio
  artists sometimes post their real work there.
- Video walkthroughs only when nothing static exists. Note timestamps rather than describing the
  whole video.

For every image you rely on, **open and look at it yourself.** Record its URL in `sources.md`. A
finding with no image you examined behind it is a guess: mark it as one, or drop it.

## 5. What to examine (for each game)

1. **Buttons**:
   - Shape (pill, rounded rectangle, circle, angled or cut corners).
   - Fills (flat, gradient, glossy, textured), borders and outer glow.
   - Pressed and disabled states, and how the primary button differs from the secondary ones.
2. **Accent colour**: what the accent is, and where it is used versus withheld. How rarity or
   importance colours (gold, purple, blue) are layered.
3. **Panels and frames**: card backgrounds (blur, glass, parchment, metal), corner ornaments,
   dividers, inner shadows and borders. How they avoid looking like flat boxes.
4. **Typography**: title faces (serif, display, stylised) versus body text, number fonts, letter
   spacing, outlines and shadows on text over art.
5. **Numbers and currency**:
   - How big numbers are formatted, icon and number pairing.
   - Floating damage numbers and crits.
   - Counters that tick up.
6. **Progress and HP bars**: shape, segments, trailing damage, glow, end caps, labels.
7. **The main tap target** (clicker games): how the "thing you tap" is framed and made satisfying.
   Hit feedback, particles, screen shake, squash.
8. **Juice and motion**: idle animation, shimmer on rewards, pulsing call-to-action, reward
   pop-ups, level-up bursts. Note what is constant versus only on events.
9. **Dialogue and story screens**: character portraits, name plates, text boxes, how the dim is
   handled behind them.
10. **Navigation**: bottom bar, side rail, home "hub" scenes, icon style (line, filled, painted).
11. **Layering and depth**: how the HUD sits over the art without clutter. Safe areas, how much is
    on screen at once, and how the hierarchy is shown.
12. **What makes it read as "premium"**: the 3-5 specific techniques responsible.

## 6. Deliverables

Write everything under `_dev/research/ui-aesthetics/` (this folder; it is inside the repo on
purpose: this project keeps `_dev/` in git).

1. **`report.md`**, the main document:
   - A one-page summary of the techniques that recur across the best-looking games.
   - One section per game, covering the points in section 5 that apply (short, specific, no filler).
   - A **pattern catalogue**: each reusable technique with a name, what it looks like, which games
     use it, and the image URLs that show it.
   - A **"for Dragon Gold" section**: for each piece in the table in section 2, 2-4 concrete
     suggestions in the "Ember & Stone" direction, each tagged with its effort:
     - `token`: only colours, sizes or fonts change.
     - `component`: a reusable component changes.
     - `art`: needs new art.
   - A short **"avoid"** list: things that look busy, cheap or off-theme.
2. **`sources.md`**: every image and page used, as a table: game, screen type, URL, what it shows,
   date checked.
3. Optional: **`moodboard/`** with a small number of reference images saved for local study.
   - Before saving any image, check its licence. Official press kits are usually fine for
     reference.
   - These are for study only, never for shipping. Name files `<game>-<screen>.png`.
   - Keep the total under about 30 images. Do not save copyrighted art into `src/` or `assets/`.

## 7. Constraints

- **Inspiration, not copying.** Describe techniques and principles. Never propose copying a
  game's art, logo, character, icon set or distinctive layout one-to-one.
- The redesign must stay **accessible**: WCAG 2.2 AA text contrast, touch targets of at least
  48dp, and nothing that only colour communicates. Flag any technique that fights these rules.
- It must stay **cheap on a mid-range phone** (the Galaxy A16): flag heavy blur, big particle
  counts or full-screen shaders as costly.
- No code changes in this task. This is research and writing only.
- Owner rules that apply in this repo: no emoji anywhere. Commit only your own files, staged by
  name (never `git add .`), with no AI attribution in the commit message. Never read `.env` files.
- Keep agent use lean. Do the reading yourself, or use at most a few cheap helper agents for
  bulk link-finding. No large parallel sweeps.

## 8. Done when

- Every game in groups A and C has a section with at least 3 examined images cited. For "Dicero",
  either identify it with confidence or record that it could not be identified, and ask the owner.
- The pattern catalogue has at least 12 named techniques, each with image evidence.
- Every piece in the section 2 table has concrete suggestions.
- `sources.md` lists every URL used.
- You end with a short message to the owner covering:
  - The 5 changes that would most improve Dragon Gold's look.
  - Anything you could not find.
  - Any question you have for the owner (for example, which games they liked best).
