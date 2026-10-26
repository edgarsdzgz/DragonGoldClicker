# Clicker and Gacha UI Aesthetics: Research Report

**Project:** Dragon Gold. **Date:** 2026-10-26. **Brief:** `BRIEF.md` in this folder.
**Sources:** every image cited here is listed in `sources.md` with its URL. Citations like
[DIC-A3] link to the image.

**How to read the evidence.** Every claim below comes from a screenshot I opened and examined. Two
limits apply to all of it:
- **Static images cannot show motion.** Animation notes describe what a frame shows (motion
  trails, echo copies, glow halos). Anything about timing is marked *(unverified: motion)*.
- **Pressed and disabled button states** appear in almost none of the images. Where the report
  suggests them, it says so.

---

## 1. Summary: what the best-looking games do

Across 20 games, the same seven moves account for most of the "premium" feel. Dragon Gold today
uses almost none of them [DG-RALLY]. It has flat panels, one system font, Ionicons glyphs and an
empty black field.

1. **The scene is the background, not black.** Every polished game puts a painted or lit scene
   behind the UI.
   - Dicero's campfire [OWN-HOME], Cookie Clicker's lit backdrop [CC-1], Grow Castle's field
     [GC-P2] and HSR's starfield stage [HSR-CD] all do this.
   - The UI sits at the edges, and the centre stays open for the art.
2. **Everything you interact with is a shaped object, not a box.**
   - Buttons are diamonds, hexagons, ribbons and notched plates ([DIC-P1], [OWN-HOME], [TT-P16],
     [CAP-2]).
   - They are built in layers: a dark outer rim, a lighter top edge, a saturated face and a drop
     shadow.
3. **A display typeface with a dark outline for every number and title.** All the mobile games
   outline or shadow text over art.
   - Damage numbers are italic, hand-lettered and coloured by element ([DIC-A3], [DIC-P1],
     [CAP-5]).
   - Body text stays a clean sans.
4. **One dominant primary action per screen,** placed in the thumb zone and coloured to contrast
   with the scene.
   - Examples: Dicero's blue "New Game" [OWN-HOME] and diamond "Attack" [DIC-P1], Egg, Inc.'s red
     hold button [EGG-2], HSR's gold "Claim" [HSR-LV].
   - Secondary buttons are smaller, quieter and often neutral (white or cream pills in HSR and
     Genshin, [HSR-CD], [GI-BUY]).
5. **Strict colour roles.**
   - Gold means value and reward.
   - Purple means rare or premium (HSR 4-star cards [HSR-CL], Genshin shop [GI-SHOP], Dicero's
     offer [OWN-OFFER]).
   - Red means danger, HP and alerts.
   - The primary action colour is reserved for actions.
6. **HP bars with character.** End caps (a level badge on the left, a reward icon on the right), a
   white trailing chunk, layer counts on bosses ("x13", "x5") and a name plate
   ([DIC-A4], [CAP-5], [BA-7], [ARC-6]).
7. **Feedback is stacked and generous.** Numbers stack and fade upward ([CAP-5], [DIC-A3]), totals
   log their gains [IS-2], rewards get radial light bursts and glow halos ([DIC-A2], [DIC-A5],
   [GI-REW]), and progress visibly changes the world ([GC-P2] vs [GC-P5], [CC-1] vs [CC-5]).

---

## 2. Game by game

### 2.1 Dicero (Habby / Lark Games): the owner's main reference

Images: [OWN-HOME], [OWN-OFFER], [OWN-TITLE], [DIC-A1] to [DIC-A5], [DIC-P1], [DIC-P5].

**Checking the brief's first observations** against the owner's screenshots (zoomed crops):

| Observation in the brief | Verdict | Detail |
|---|---|---|
| Pixel-art frames with smooth, outlined type | **Confirmed** | Stepped pixel corners on chips, rails, buttons and the tab bar. Labels are a bold rounded sans with a dark outline [OWN-HOME]. |
| The scene is the backdrop | **Confirmed** | A lava-sky campfire with two idle characters fills the middle third; the UI hugs the edges. |
| Stage card is the hero | **Confirmed, corrected** | It is an elongated hexagon with a **white** outer glow, not a gold one. The lava thumbnail fills the card. A dark pill holds the power figure (17310); a skull badge in the corner shows difficulty; "28" is large white numerals. |
| Currency chips at the top | **Confirmed, refined** | Each chip is dark, with a stepped or torn right edge. A big glossy icon **overlaps** the chip's left edge, and a small green "+" sits at the icon's foot. |
| Profile corner | **Confirmed** | Portrait in an ornate frame, level "20" in a black square, name, green XP bar, power figure with a shield icon. |
| Two vertical icon rails | **Confirmed, corrected** | Only the **left** rail (events, packs) has large colourful painted icons. The **right** rail (Tasks, Codex, Bag, Friends, Mail) uses muted grey-blue pixel icons. Saturation separates "offers and events" from "utility". |
| Red square "!" badges | **Confirmed** | Square, red, white "!", on 9 elements of one screen. This is busy; see the avoid list. |
| One dominant primary button | **Confirmed** | "New Game" is a cyan rectangle with stepped corners, a lighter inner border, a faint diamond pattern on its face and diamond end-caps outside each side. The cost line ("meat x10") sits under the label, with a dark shadow beneath. |
| Secondary actions smaller | **Confirmed** | Guild and Mode are half-tiles tucked into the screen edges, with a sawtooth inner edge. |
| Bottom nav of diamond tiles | **Confirmed** | Unselected tabs: light-blue icon in a mid-blue diamond, **no label**. Selected tab: a taller notched plate rising above the bar, with a white icon and label. |
| Timers as dark pills | **Partly** | "25:22:10" is in a dark pill. "10:57:35" is bare outlined text over the scene. |
| Offer pop-up is all juice | **Confirmed** | Gold 3D display text with a thick purple outline and inner highlight. A purple frame with pagoda-like finials. A chest spilling dice, four-point sparkles at the frame corners, and a faint dice pattern in the body. Gold and green highlight words. A gold hex GO button with a dark outline. A separate square close button below the frame [OWN-OFFER]. |
| Calm title screen | **Confirmed** | Soft winter scene, white logo with a crown and sparkles, "Start" between thin lines with diamond marks [OWN-TITLE]. |
| Colour strategy | **Confirmed** | Warm scene; cool blue for the primary action and the tab bar; gold for currency and rewards; purple for premium; red only for "!" and HP. |

**New findings from the store screens:**
- **The main combat button is a diamond.** "Attack" is a pale-blue diamond with chevron wings,
  crossed swords and an outlined label. It sits on a soft circular halo ring [DIC-P1]. The same
  diamond language appears in the power badge ("657", [DIC-A3]) and the tab bar.
- **Damage numbers take their element's colour and style.**
  - Fire hits are italic, red-orange with a lighter gradient and a dark outline [DIC-A3].
  - Magic hits are white-lilac; ice hits are pale blue with a navy outline [DIC-P1].
  - Bigger hits are bigger.
  - Repeat hits leave **ghost echoes** stacked behind the newest number (visible in a single
    frame).
- **The HP bar** is red on a dark rounded track, with a **white trailing chunk** (the same idea
  Dragon Gold already has [DG-HIT]).
  - A hexagon level badge caps the left end.
  - The boss bar adds "x13" for the bar layers left [DIC-A4].
  - Under the player bar sits a row of five orange shield pips [DIC-P1].
- **Choice cards are colour-coded** (orange, red, blue). The picked card gets a **radial light
  burst** behind it, while the others stay flat [DIC-A2].
- **Talent hexagons:** the unlocked one glows gold with sparkles and the rest are dimmed to
  near-silhouette [DIC-A5]. Locked versus unlocked is shown by brightness *and* by a "?" glyph,
  not colour alone.
- **Dice glow** with vertical light shafts rising from them [DIC-P1], which reads as "charged and
  ready".

**What makes it read as premium:** one consistent shape language (stepped pixel corners plus
diamonds) on every element; a lit scene behind everything; outlined, chunky type; a single
saturated primary button; and colour roles held to strictly.

**Do not take literally:** the pixel-art direction itself. It is Dicero's signature, and Dragon
Gold's "Ember & Stone" direction is painted and torchlit. Take the *principles*: shape language,
scene backdrop, layered buttons and colour roles.

### 2.2 Habby house style: Archero, Capybara Go!, Survivor!.io

Images: [ARC-3], [ARC-5], [ARC-6], [ARC-7], [CAP-1], [CAP-2], [CAP-5], [SUR-2], [SUR-5].

- **Thick dark outlines on everything,** UI included: icon tiles, ribbons and text [CAP-2],
  [SUR-5]. This gives one cartoon "ink line" across art and UI.
- **Title ribbons and plates.**
  - "SELECT SKILL" sits on a gold ribbon with folded ends [CAP-2].
  - "Skill Selection" is a yellow plate with hexagonal ends [SUR-2].
  - Archero labels buildings with small blue ribbon plates and a round level badge [ARC-5].
- **Cards with coloured header tabs** show rarity or type. Icons sit in square tiles with a thick
  outline [CAP-2], [SUR-2].
- **Stat pills whose icon breaks the pill edge** (heart, sword, shield bigger than the pill)
  [CAP-1]. This is the same trick as Dicero's currency chips.
- **HP bars with meaningful end caps:**
  - Capybara puts a flame at the left and a **treasure chest at the right** ("reward at the end of
    this bar") [CAP-5].
  - Archero's boss bar has a horned emblem sitting on top of its centre [ARC-6].
- **Damage numbers stack downward,** with older ones fading above (-13200 three times, three
  opacities) [CAP-5].
- **Parchment-cream text cards** with a dark border carry story and log text [CAP-1]. Cream on a
  dark surround gives excellent contrast.
- **Hero on a spotlit stage:** a radial light behind the character and an outlined name plate
  [ARC-7].

**Premium techniques:** a unified outline weight; ribbons and plates instead of plain headers;
icons that break their containers; end caps that tell you what the bar leads to.

### 2.3 Cookie Clicker (mobile)

Images: [CC-1], [CC-2], [CC-4], [CC-5], [CC-6].

- **The tap target is a big, detailed, painted object** (the cookie) on a backdrop lit like a
  stage: a blue patterned curtain, brighter at the centre, with a vignette [CC-1].
- **Hit feedback:** small "+1" pops in an outlined serif, and **mini cookies falling** from the
  tap point [CC-1]. *(unverified: motion speed)*
- **Progress changes the scene.** Late in the game a ring of cursors orbits the cookie and the
  backdrop turns to a rainbow gradient [CC-5]. Your investment is visible around the tap target.
- **Typography:** a chunky serif display face with a dark outline for the cookie count, and a
  smaller "per second" line beneath [CC-1].
- **Panels:** bevelled dark wood and stone with an ornate border [CC-4]. Locked buildings appear
  as dark silhouettes marked "???" [CC-2]. That builds curiosity without colour-only meaning.
- **Prestige tree** as a constellation of round nodes on a starfield [CC-6].

**Premium techniques:** a lit stage behind the tap target; the target's surroundings evolve with
progress; a serif display face with outlines fits a "classic" mood.

### 2.4 Tap Titans 2

Images: [TT-P16], [TT-A2], [TT-A3], [TT-A4].

- **Stage progress as three bubbles:** previous, current (larger, with a scene thumbnail) and next,
  joined by dots [TT-P16]. You always know where you are at a glance.
- **Boss HP bar is a slanted parallelogram** in orange, with the name on the left and the HP
  figure on the right *inside* the bar [TT-P16].
- **"FIGHT BOSS" is an angled orange plate** with a demon icon: the call to action has an edge
  and a direction [TT-P16].
- **Gold total in italic, outlined numerals** next to a coin [TT-P16].
- **Skill buttons are round medallions,** each with its own hue, a thick white inner ring and a
  dark outer ring [TT-P16]. All six are identical in structure and differ only in colour and icon.
  That makes a strong set, though it is colour-led (the icons do carry the meaning).
- **Menus** are dark slate modals with an angled header tab and a close "X". Your own row is
  highlighted [TT-A2]. Skill tree icons are painted in one orange family [TT-A3].

### 2.5 Grow Castle: the closest premise to ours

Images: [GC-P1], [GC-P2], [GC-P4], [GC-P5].

- **The castle is the hero, and it visibly grows.** It goes from a small stone tower [GC-P2] to a
  crowned tower [GC-P5] to a tall wooden fortress crowded with heroes [GC-P1]. That growth is the
  game's whole reward loop, made visible.
- The HUD is purely functional: flat HP / MP / BOSS bars in a pixel font across the top, and a
  speed dial bottom-left [GC-P2]. It is *not* pretty. The appeal comes from the scene and the
  growth.
- Pop-ups use dark framed panels. A **heraldic banner emblem breaks the frame edge** at top-left
  [GC-P4], which is the one decorative move and an effective one.

**Lesson for Dragon Gold:** show the gate and the defences changing as the player invests. That
fits our premise and does more than any chrome.

### 2.6 Idle Slayer

Images: [IS-2], [IS-3], [IS-4], [IS-7].

- **The currency total is the screen's headline:** huge outlined numerals with a coin icon. A
  **gain log** stacks below it ("+97,236", "+7,447", ...) [IS-2].
- **The offline reward is a parchment card:** "While you were away", with icon + count pairs
  [IS-4]. It maps directly onto Dragon Gold's `OfflineModal`.
- Pixel-framed item slots, and tooltips with colour-coded stat lines [IS-3].
- **Dialogue:** a dark box with the speaker's name in a colour, and a requirement card with a green
  action button [IS-7].

### 2.7 Egg, Inc.

Images: [EGG-2], [EGG-3], [EGG-8].

- **One giant primary button,** a red circle centred at the bottom that you hold. The four
  secondary buttons are small white circles around it [EGG-2]. This is the clearest
  primary-versus-secondary split in the set.
- **Big numbers written as words** with a small-caps suffix ("1.287 sextillion") [EGG-2]. It reads
  better than "1.287e21".
- **Modals take the colour of their category** (blue research, purple artifacts, green vehicles)
  and sit over a blurred farm [EGG-3], [EGG-8]. *Blur cost: see the performance notes.*
- The look is clean, flat 3D with a toy feel. It is premium through **consistency and
  restraint,** not ornament.

### 2.8 AFK Journey and AFK Arena

Images: [AFKJ-P3], [AFKJ-P7], [AFKA-P3], [AFKA-P5].

The store images are mostly marketing compositions; the in-game parts are small insets. I relied
only on those insets and on the frames, and the findings are thin as a result.
- **Storybook idle battle:** a hand-painted battle strip sits inside a cream "page" frame, with
  stage nodes along the top and a **treasure chest at the bottom** that holds the idle reward
  [AFKJ-P7].
- **Hero cards with ornate, scalloped frames** tinted by rarity (gold, silver-blue), star rows on
  top, and a crest-topped title ribbon. Dividers are **dotted lines with small glyph marks**
  [AFKJ-P3].
- **AFK Arena's gothic arch frames,** coloured by faction (red, purple, teal), with braziers on the
  pillars and a gem-set name plate [AFKA-P3], [AFKA-P5]. This is marketing art, but it states the
  game's frame language. It is the most "medieval premium" frame in the study.

### 2.9 Honkai: Star Rail

Images: [HSR-BP], [HSR-CD], [HSR-CL], [HSR-TIP], [HSR-EV], [HSR-HUD], [HSR-LV], [HSR-TUT].

- **Buttons are fully rounded pills.**
  - The primary is **warm gold with dark text** ("Claim", "Purchase Level", "Unlock")
    [HSR-LV], [HSR-BP].
  - The secondary is **white or light grey** ("Level Up", "Confirm" with a check icon)
    [HSR-CD], [HSR-TIP].
  - Usually one gold button per screen.
- **Hairline ornament.** Dividers are 1px lines with tiny end marks [HSR-TIP]. The tutorial icon
  sits inside thin orbit circles [HSR-TUT]. The ornament is delicate, never heavy.
- **Rarity is the card's back:** purple gradient for 4-star, gold for 5-star, plus a star row
  [HSR-CL]. Colour is backed up by the star count.
- **Characters on a lit stage platform,** with stats as icon + label + value rows and a lot of
  empty space [HSR-CD].
- **Dialogue:** big art on the left and a text column on the right over a darkened panel. The
  speaker's name is on a **pink tag**, and **key words are tinted gold** [HSR-EV].
- **Level badges are shield shapes;** the current one is larger and brighter [HSR-LV].
- **HUD:** sparse corner clusters, and a gold diamond waypoint as the single accent [HSR-HUD].

**Premium techniques:** restraint (few elements, generous spacing); a gold pill reserved for the
one key action; delicate line ornament; translucent dark panels over a lit scene.

**Accessibility flag:** HSR's small, light-grey secondary text on busy art is often below WCAG AA
contrast. Do not copy its text sizes.

### 2.10 Genshin Impact (mobile)

Images: [GI-AR], [GI-AT], [GI-LOOT], [GI-ING], [GI-SHOP], [GI-BUY], [GI-REW], [GI-WISH].

- **Signature button: a cream pill with a dark circular "socket" at its left end** holding an
  icon ("Claim Rewards", "Purchase", [GI-AR], [GI-BUY]). The close button is a round "X" in a
  cream ring [GI-SHOP].
- **Rarity-coloured reward tiles:** gold, purple, blue and green backgrounds, each with a cream
  quantity strip underneath [GI-AR].
- **Progress as a node track:** finished nodes carry green ticks; the current node is larger, blue
  and glowing [GI-AR].
- **Wish results** come as tall cards with pointed ends. The rarest card has a **glow halo** and
  stars sit at each base [GI-REW].
- **Loot log:** translucent dark strips whose text is coloured by rarity [GI-LOOT]. **Subtitle
  dialogue:** the speaker's name in gold above white text [GI-LOOT].
- **"New" toasts** pair an icon tile with a short description [GI-ING].
- Red dots mark things that need attention, used sparingly [GI-AT].

**Premium techniques:** a warm cream-and-slate palette; an icon socket built into every key
button; rarity colour always paired with stars.

### 2.11 Arknights

Images: [ARK-1], [ARK-3], [ARK-5].

- **Home hub as perspective-tilted tiles.** The menu panels are skewed in 3D toward the character
  art. Each has a huge condensed label ("Squads", "Operator") and a faint watermark icon
  [ARK-1].
- **One big functional number** ("185 Sanity / 210") gets display-size treatment [ARK-1].
- **The battle HUD is almost bare:** counters in a thin top strip, a blue deploy-cost badge
  ("99"), and outlined red and blue cubes for spawn and goal [ARK-3].
- Industrial "flat 2.0": light grey, black and one accent colour per context (blue for the store
  and recruitment).

**Premium techniques:** bold typographic hierarchy; a 3D tilt to flat panels; ruthless minimalism
in battle. The look is off-theme for us, but the **tilt** and the **one big number** transfer.

### 2.12 Zenless Zone Zero

Images: [ZZZ-2], [ZZZ-4], [ZZZ-5].

- **Slanted, two-tone HP bar** with the portrait in a slanted frame [ZZZ-2].
- **Graffiti-style score badge** ("3000PTS MAXIMUM") in italic orange with a heavy outline: the
  street-comic equivalent of Dicero's damage numbers [ZZZ-2].
- Chunky round buttons with heavy rings [ZZZ-5].
- **Off-theme** (urban, comic). The transferable idea: **one strong typographic voice for big
  numbers.**

### 2.13 Wuthering Waves

Images: [WW-2], [WW-3], [WW-4].

- **The most minimal HUD in the study:** thin line icons in the corners and a translucent compass
  circle, so the 3D art does all the work [WW-2], [WW-3].
- The marketing frame uses small diamond end marks on caption rules [WW-4] (marketing only).
- **Transferable idea:** hide or shrink chrome when the scene is the point. For Dragon Gold that
  means letting the battlefield art breathe once it exists.

### 2.14 Blue Archive

Images: [BA-2], [BA-5], [BA-6], [BA-7].

- **Skewed white parallelogram panels** with cyan accents [BA-6]. Story chapters slope like
  stacked cards.
- **The boss bar shows a layer count** ("x5"), with the boss name in italic above [BA-7]. Same
  idea as Dicero's "x13".
- **Damage numbers** are yellow with an orange outline, plus a "Weak" tag stacked over them
  [BA-7].
- **Story texting as a chat app** (MomoTalk) with unread badges [BA-5]. A neat way to deliver
  side story; possibly relevant to the Elder's messages.
- **Off-theme** (bright school sci-fi). Transferable ideas: the layer count and the skewed panel.

### 2.15 Epic Seven

Images: [E7-3], [E7-4], [E7-5], [E7-7].

- **Thin coloured frames with small corner ornaments** around full-bleed art [E7-3]. The ornament
  is concentrated at the corners, leaving the edges clean.
- **A speaker name plate with a portrait** at top-left during skill cut-ins [E7-3]. The story
  shows the speaker's name centred over a dim scene [E7-5].
- **Team colour coding:** blue cards for your side, red for the enemy's. The cards are slanted,
  with level and star rows [E7-7].

### 2.16 RAID: Shadow Legends: the medieval benchmark

Images: [RAID-1], [RAID-3], [RAID-4], [RAID-5].

- **Segmented HP bars:** green blocks with a level square at the left and buff icons above
  [RAID-1], [RAID-3]. You can count the segments at a glance.
- **Campaign stages are heraldic shield banners with stars,** on a parchment map. A locked stage
  shows a padlock in its shield [RAID-5]. This is the **most directly reusable medieval motif** in
  the study.
- Stone-edged panels hold the gear sockets [RAID-4]. The arena floor carries a glowing sigil
  [RAID-3].

**Premium techniques:** heraldry as UI (shields, banners); stone and metal materials; a
dark-fantasy palette with warm torchlight. This is the closest tonal match to Ember & Stone.

---

## 3. Pattern catalogue

Each technique below has a name, a description, the games that use it, and image evidence. **A11y**
and **Perf** flag conflicts with the project's accessibility and Galaxy A16 constraints.

| # | Technique | What it looks like | Used by | Evidence |
|---|---|---|---|---|
| 1 | **Scene as backdrop** | A painted or lit scene fills the screen; the UI sits at the edges and the centre stays open | Dicero, Cookie Clicker, Grow Castle, HSR, WuWa | [OWN-HOME], [CC-1], [GC-P2], [HSR-CD], [WW-2] |
| 2 | **Spotlit stage** | A radial light or lit platform behind the hero object or character; edges vignetted | Cookie Clicker, Archero, HSR, Raid | [CC-1], [ARC-7], [HSR-CD], [RAID-3] |
| 3 | **Layered shaped primary button** | Diamond, hexagon or notched plate built as rim + bevel highlight + saturated face + drop shadow, with outlined label and a cost line | Dicero, Tap Titans 2, Survivor!.io | [OWN-HOME], [DIC-P1], [TT-P16], [SUR-2] |
| 4 | **Halo ring on the call to action** | A soft circular glow or ring behind the main button *(unverified: whether it pulses)* | Dicero | [DIC-P1] |
| 5 | **Pill with icon socket** | A cream or gold pill whose left end is a dark circle holding an icon | Genshin, HSR (check icon) | [GI-AR], [GI-BUY], [HSR-TIP] |
| 6 | **Container-breaking icon** | An icon larger than its chip or pill, overlapping the edge | Dicero, Capybara Go!, Grow Castle | [OWN-HOME], [CAP-1], [GC-P4] |
| 7 | **Outlined display numerals** | A chunky display face with a 2-4px dark outline or hard shadow, for any number over art | All mobile games in the set | [IS-2], [TT-P16], [CC-1], [DIC-A3] |
| 8 | **Elemental damage numbers with echoes** | Italic numerals coloured by damage source; size scales with damage; older hits stack and fade | Dicero, Capybara Go!, Blue Archive | [DIC-A3], [DIC-P1], [CAP-5], [BA-7] |
| 9 | **HP bar with end caps** | A level or tier badge on the left; a reward icon or emblem on the right or on top | Dicero, Capybara Go!, Archero, Raid | [DIC-A3], [CAP-5], [ARC-6], [RAID-1] |
| 10 | **Trailing damage chunk** | A white segment shows the HP just lost, then drains | Dicero (Dragon Gold has this already) | [DIC-A3], [DG-HIT] |
| 11 | **Boss layer counter** | "x13" / "x5" beside the bar for remaining bar layers | Dicero, Blue Archive | [DIC-A4], [BA-7] |
| 12 | **Segmented bar** | The bar is split into countable blocks | Raid | [RAID-1] |
| 13 | **Ribbon or plate title** | Section titles on a gold ribbon with folded ends, or a hex-ended plate | Capybara Go!, Survivor!.io, Archero, AFK Journey | [CAP-2], [SUR-2], [ARC-5], [AFKJ-P3] |
| 14 | **Heraldic stage marker** | Stages as shield banners with stars; a padlock in the shield when locked | Raid, HSR (shield level badges) | [RAID-5], [HSR-LV] |
| 15 | **Rarity colour plus a second cue** | Gold/purple/blue card backs or tiles, always paired with star rows or labels | HSR, Genshin, AFK Journey, Epic Seven | [HSR-CL], [GI-AR], [AFKJ-P3], [E7-7] |
| 16 | **Light burst on the chosen or earned item** | Radial rays or a halo behind the picked card or newest reward; the rest stay flat or dim | Dicero, Genshin, Survivor!.io | [DIC-A2], [DIC-A5], [GI-REW], [SUR-5] |
| 17 | **Hairline ornament** | 1px dividers with tiny diamond or dot end marks; thin orbit circles | HSR, AFK Journey, Dicero title | [HSR-TIP], [HSR-TUT], [AFKJ-P3], [OWN-TITLE] |
| 18 | **Corner-ornament frame** | A thin border with small ornaments only at the corners or finials | Epic Seven, Dicero pop-up, AFK Arena | [E7-3], [OWN-OFFER], [AFKA-P3] |
| 19 | **Parchment card** | A cream card with a dark border for story, logs and offline rewards | Capybara Go!, Idle Slayer, AFK Journey | [CAP-1], [IS-4], [AFKJ-P7] |
| 20 | **Rising selected tab** | The selected tab is a taller notched plate with a label; the others are icon tiles | Dicero | [OWN-HOME] |
| 21 | **Saturation hierarchy for icons** | Offers and events get saturated painted icons; utilities get muted monochrome ones | Dicero | [OWN-HOME] |
| 22 | **World that changes with progress** | The tap target's surroundings or the base visibly upgrade | Grow Castle, Cookie Clicker | [GC-P2], [GC-P5], [GC-P1], [CC-1], [CC-5] |
| 23 | **Gain log under the total** | A short stack of "+X" lines under the main currency | Idle Slayer | [IS-2] |
| 24 | **Stage bubbles** | Previous / current / next stage as three linked circles, the current one larger | Tap Titans 2, Genshin node track | [TT-P16], [GI-AR] |
| 25 | **Speaker name tag** | The speaker's name on a coloured tag or in an accent colour; key words highlighted | HSR, Genshin, Idle Slayer, Epic Seven | [HSR-EV], [GI-LOOT], [IS-7], [E7-3] |
| 26 | **Perspective-tilted panels** | Flat menu tiles skewed in 3D toward the art | Arknights | [ARK-1] |

**Flags:**
- **A11y:**
  - #7 helps contrast; adopt it.
  - #15 and #21 must keep their second cue (stars, labels, glyphs). Never rely on colour alone.
  - #20 hides labels on unselected tabs. **Keep visible labels** in Dragon Gold, or at least
    keep `accessibilityLabel` and a clear icon; the locked tabs especially need the word "Locked".
  - #26 skews text, which hurts legibility. Skew the panel, not the text.
  - Red "!" badges use a glyph, so they are fine. Overuse is a clutter problem, not an a11y one.
- **Perf (Galaxy A16):**
  - #1, #2 and #16 are cheap as **pre-rendered images or gradients**. They become expensive as
    live shaders or full-screen blur.
  - Egg, Inc.'s blurred modal backdrop (and HSR's glass) means a full-screen blur. **Prefer a dark
    dim plus a vignette image.**
  - #8 with many simultaneous numbers: cap active numbers at about 8 and recycle the views.
  - Particles (Cookie Clicker's falling cookies, Dicero's sparkles): keep to about 6-12 sprites
    per hit on the Reanimated UI thread.

---

## 4. For Dragon Gold

Effort tags:
- `token`: only colours, sizes or fonts change in `src/theme/index.ts`.
- `component`: a reusable component changes.
- `art`: new art is needed.

Notes on the codebase as it stands:
- There is **no custom font** (system font only) and **no `react-native-svg`**.
  `expo-linear-gradient`, `react-native-reanimated` and `expo-haptics` are present.
- `assets/fx/` already holds ember, slash and spark sprites.

### 4.0 Foundations (apply everywhere)

- **Add one display typeface** for titles and all numbers, and keep the system sans for body
  text. `token` (plus adding `expo-font` and a font file).
  - Candidates under the SIL Open Font License: a carved-serif face for titles (Cinzel style) and
    a chunky face for numbers.
  - The owner should pick; see the questions at the end.
  - Evidence: [CC-1], [IS-2], [DIC-A3].
- **Add a text-outline token** (`textShadow` with a dark colour, zero blur, 0-2px offset; or a
  stroke via stacked shadows) for any text drawn over art. `token`. Evidence: catalogue #7.
- **Fix the colour roles:** gold = renown and rewards; red = HP, danger and alerts only; one
  primary action colour; purple = rare, reserved for later. `token`. Evidence: section 1, point 5.
- **Replace the flat `#0f0d0b` field** with a vertical gradient (warm umber at the bottom fading to
  near-black at the top) and a vignette image. `token` + `component` (a `SceneBackdrop` that takes
  a skin prop). Evidence: [OWN-HOME], [CC-1].
- **Build a small frame kit:** `Plate` (notched or cut-corner container), `Ribbon` (title with
  folded ends), `OrnamentDivider` (hairline with diamond end marks) and `IconSocket`.
  `component`. The corner shapes need `react-native-svg` or 9-slice images. Evidence: #13, #17,
  #5. This kit fits the project's "reusable first" and "cosmetic swappability" rules.

### 4.1 Battlefield (`src/components/Battlefield.tsx`)

1. **Turn the circle into a spotlit stage.** Replace the gold ring and flat disc with a ground
   pool of light (radial gradient image) and a soft ellipse shadow under the monster, with the
   gate scene painted behind. `art` (backdrop) + `component` (spotlight and shadow layers).
   Evidence: [CC-1], [ARC-7], [RAID-3].
2. **Damage numbers with a voice.**
   - Display font, italic, dark outline, size scaled to the hit.
   - Colour by source: tap = gold-white, fighters = steel blue with a navy outline (today's
     "-0.50" is small, unoutlined and lost against the glyph [DG-HIT]), crit = ember orange and
     larger.
   - Stack and fade older numbers upward.
   - `component` + `token`. Evidence: [DIC-A3], [DIC-P1], [CAP-5].
3. **Hit juice on the existing sprites.**
   - On tap: a squash of about 0.94 then back to 1.0, a short white flash tint, and 4-8 ember and
     spark particles from `assets/fx/`.
   - Add a 2-3px shake only on crits or kills.
   - `component`. Keep it on the UI thread with Reanimated. *(Motion values are suggestions, not
     measured from the references.)*
4. **Painted monsters instead of glyphs.** The skull and beetle read as Ionicons [DG-RALLY],
   [DG-HIT]. Give each monster a drawn silhouette with inner shading and a warm rim light from
   the torches; the kobold [DG-EARLY] is the template. `art`.

### 4.2 EnemyHp (`src/components/EnemyHp.tsx`)

1. **End caps.** Put a tier or level badge (shield or hexagon) on the left and a renown star cap
   on the right ("killing this pays renown"). `component`. Evidence: [DIC-A3], [CAP-5].
2. **Material for the bar.**
   - A darker inset track with a 1px top highlight.
   - Rounded caps.
   - Fill as a red-to-ember gradient.
   - Keep the white trailing chunk; it is already right [DG-HIT].
   - `token` + `component`. Evidence: [DIC-A3].
3. **A name plate and numbers that read.** Put the monster's name on a small plate above the bar,
   and "5 / 8" in outlined numerals at the bar's right end. `component`. Evidence: [TT-P16].
4. **Boss variant.** Add segments (one per X HP) or a layer counter ("x3"). `component`.
   Evidence: [RAID-1], [DIC-A4], [BA-7].

### 4.3 HarvestOrb: RALLY, FORAGE, TRAIN (`src/components/HarvestOrb.tsx`)

1. **One dominant, layered, shaped button.** Make RALLY a shield- or diamond-shaped plate:
   - dark iron rim
   - gold bevel lit from the top
   - saturated face
   - outlined label, with the cost or yield on a second line
   - drop shadow
   It must stay at least 48dp; it is far larger today, and should stay large. `component` (+
   `art` if the bevel is a texture). Evidence: [DIC-P1], [OWN-HOME], [EGG-2].
2. **A halo when ready.** A soft ring behind the button, with a slow breathing pulse only while
   the action is available. Stop the pulse when the button is disabled, and respect
   reduce-motion. `component`. Evidence: [DIC-P1]. *(unverified: motion)*
3. **Pressed and disabled states.**
   - Pressed: scale to about 0.95, the face darkens one step, the shadow shrinks.
   - Disabled: desaturate, add a lock or "need X" line in text (never colour alone).
   - `component`. *(Not observable in the references; this is standard practice.)*
4. **Rethink red.** Red RALLY competes with red HP and with alerts. Either:
   - (a) make the primary a molten ember-gold, warm and on-theme, or
   - (b) take Dicero's route and use a contrasting cool "dragon-steel" blue against the warm
     scene.
   `token`. This is a question for the owner.

### 4.4 ResourceBar (`src/components/ResourceBar.tsx`)

1. **Currency chips.** Dark chips with an oversized painted icon (renown star, food) overlapping
   the left edge, and bold outlined numerals. `component` + `art` (icons). Evidence: [OWN-HOME],
   [CAP-1].
2. **Counters that tick up.**
   - On gain, roll the number up over about 300ms and flash the icon gold once.
   - Use tabular figures (`fontVariant: ['tabular-nums']`) so the bar does not jitter.
   - `component` + `token`. Evidence: [IS-2] (static; *roll-up unverified: motion*).
3. **A gain log** under renown on the Warfront: the last 2-3 "+0.25" lines, fading. `component`.
   Evidence: [IS-2].
4. **Readable big numbers.** When values grow, write suffixes as small caps after the figure
   ("1.29 thousand" style or "1.29K"). `token`. Evidence: [EGG-2].

### 4.5 ObjectiveStrip (`src/components/ObjectiveStrip.tsx`)

1. **A quest ribbon.** Put the objective on a ribbon plate with notched ends and the flag icon in a
   round socket. `component`. Evidence: [CAP-2], [GI-AR].
2. **Pips for small counts.** "Rally 5 fighters 2/5" becomes five pips, two lit, with the number
   kept in text for screen readers. `component`. Evidence: [DIC-P1] (pip row), [GI-AR] (node
   track).
3. **A completion moment.** When done, a shine sweeps across the ribbon and a gold "Claim" pill
   appears, the one gold button on screen. `component`. Evidence: [HSR-LV], [GI-AR].

### 4.6 NpcDialog (`src/components/NpcDialog.tsx`)

1. **A painted portrait that breaks the frame.** Replace the person glyph with a bust of Elder
   Pyreth that overlaps the panel's top edge. `art` + `component`. Evidence: [GC-P4] (emblem
   breaking the frame), [HSR-EV].
2. **A name tag.** "ELDER PYRETH" on a gold-edged tab attached to the panel, instead of a centred
   caption. `component`. Evidence: [HSR-EV], [E7-3], [GI-LOOT].
3. **The panel as material.**
   - A dark stone or vellum texture.
   - Ornaments at the corners only.
   - A hairline divider with diamond ends above the Continue button.
   - Keep the gold highlight on key words (the renown box in [DG-DIALOG] is a good start; tint
     the words as well).
   - `component` + `art` (texture). Evidence: [E7-3], [HSR-TIP], [HSR-EV].
4. **The dim.** Darken plus a vignette image, never a live blur. `token`. Perf, see section 3.

### 4.7 Gate (`src/screens/warfront/Gate.tsx`)

1. **Make the gate a picture that changes.** A painted gate whose look upgrades with investment
   (timber, stone, iron-bound) and shows damage (cracks at 66% and 33%). This is the Grow Castle
   lesson and fits our siege premise best of anything in the study. `art` + `component`.
   Evidence: [GC-P2], [GC-P5], [GC-P1].
2. **Gate HP as stone blocks,** a segmented bar. `component`. Evidence: [RAID-1].
3. **A carved plaque.** "GATE" on a small stone or iron plaque with the icon in a socket, instead
   of a thin strip with letter-spaced text. `component`. Evidence: [GC-P4], [ARC-5].

### 4.8 Tab bar (`src/navigation/index.tsx`)

1. **A rising selected tab.** The selected tab becomes a taller notched plate lifting above the
   bar, with icon and label. **Keep labels visible on all tabs** (a11y). `component`. Evidence:
   [OWN-HOME].
2. **Icon sockets.** Put each icon in a shield- or diamond-shaped socket. Locked tabs show a
   padlock inside the socket in dimmed stone, with "Locked" as text. `component` (+ `art` for
   painted icons later). Evidence: [OWN-HOME], [RAID-5].
3. **Attention badges.** A small red square with "!" for new content, at most one or two at once.
   `component`. Evidence: [OWN-HOME] (and its overuse).

---

## 5. Avoid

- **Copying Dicero's pixel-art direction,** or any game's frames, icons or layouts one-to-one. Take
  the principles; Ember & Stone stays painted and torchlit.
- **Badge spam.** Dicero shows nine red "!" on one screen [OWN-HOME]. Past two or three, nothing
  reads as urgent.
- **Glow on everything.** Glow works because it is rare (one halo on the call to action, one burst
  on the reward). If every panel glows, nothing does.
- **Full-screen blur and frosted glass** (Egg, Inc. modals, HSR panels). Costly on the A16, and
  off-theme for stone and iron.
- **Neon cyan sci-fi** (Blue Archive, ZZZ, Arknights accents). Off-theme for a torchlit siege.
- **Rarity colour as the only signal.** Always pair it with stars, labels or shapes.
- **Thin light-grey small text over art** (HSR secondary text). It fails AA contrast.
- **Monetisation-style "juice" for ordinary information.** Reserve 3D display text, chests and
  bursts for real rewards, or they stop meaning anything [OWN-OFFER].
- **Mixing icon styles.** Ionicons line glyphs next to painted icons looks unfinished. Move a
  whole set at once.
- **Skewed body text.** Tilt panels, never paragraphs.
- **Particle storms.** More than about 12 sprites per hit, or long-lived particles, will cost frame
  rate and readability.

---

## 6. Gaps and limits

- **Game UI Database was not used** because its terms forbid AI use. Its galleries would fill most
  of the gaps below; the owner can browse them directly.
- **Dicero:** no shop, Codex, bag or results screens are available online beyond the owner's
  three. The store listings show battle, skill choice and talents only.
- **AFK Journey and AFK Arena:** only marketing composites with small in-game insets. I have no
  full in-game screen.
- **Zenless Zone Zero, Wuthering Waves, Arknights, Blue Archive, Epic Seven:** in-game UI only as
  insets inside marketing frames. No menus or shop screens at full size.
- **HSR:** no battle HUD in the Interface In Game set (field HUD only).
- **Cookie Clicker:** the mobile build was examined; the web version was not.
- **Group B coverage:** Tap Titans 2, Grow Castle, Idle Slayer, Egg, Inc. and AFK Journey/Arena (5
  titles). Clicker Heroes, AdVenture Capitalist, Cell to Singularity, Melvor Idle, Realm Grinder
  and Legends of Idleon were not covered.
- **Motion and button states** cannot be verified from stills. They are marked where used.
- **Moodboard:** not created. The store screenshots are copyrighted marketing material with no
  stated reference licence, and none of the titles offered a press kit in the sources found. The
  URLs in `sources.md` serve the same purpose.

---

<!-- Image links: generated from sources.md -->
[AFKA-P3]: https://play-lh.googleusercontent.com/ubw88E3NTApGQgd2mToC-VGXaA5XM3D0T79rlBKnVyGoGDNgi48UxihO0l8Ok29-kF9fmkbe5i3r4ERqfmFvb0I=w1400
[AFKA-P5]: https://play-lh.googleusercontent.com/JUZn8gn55GuYBDyHB5L-059QCB6Kn1sPayZKeeUKM6KKt8iM5oYLNyV5ZSmOMxERQcy-OHRdtdozM48ZU0WyFMY=w1400
[AFKJ-P3]: https://play-lh.googleusercontent.com/isFfJH7faXusqtc389oDQGPrrzuJxSC8DpOa9EjsRLE_HjuwblY8tROkUAndfAJn8Ok4aWTzlPkezENp_nnRt8U=w1400
[AFKJ-P7]: https://play-lh.googleusercontent.com/lSrznRj_r_Sf_Zho4cYfdAh-yuu34oxN3_zfAsCFWxH6ezQPj5W7p2EzWeR1Jtg7UhLHmhc_kt1GtKeHijQc9pQ=w1400
[ARC-3]: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/85/dc/54/85dc5492-ba66-a31b-1d0d-a57965dde2bb/pr_source.png/600x0w.jpg
[ARC-5]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/bf/21/77/bf2177b3-a7ee-5ad0-eca3-b21cb6b8c51e/ef393b55-70da-45e7-aa1c-6adc947e9618_iphone_en3.jpg/600x0w.jpg
[ARC-6]: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ec/7a/52/ec7a5285-81b1-58c1-33ae-9fd814b36f07/pr_source.png/600x0w.jpg
[ARC-7]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/ab/f7/ba/abf7ba24-682c-ac67-cd17-942e7b335779/6b1a11b3-4501-481c-b98e-098b017a1e20__U5546_U5e97_U56fe_iphone_en.png/600x0w.jpg
[ARK-1]: https://play-lh.googleusercontent.com/M7a4R60i1TrMxgqY3FvU-eZifRrSPFeQFC_pbEnjktbzwKUz_G72uxBHBqnAtbP6tycxhrLBs_Ht2UIlWKX-=w2000
[ARK-3]: https://play-lh.googleusercontent.com/dIRo98UsCs97OACxqBZTC1a3BlyY_aut0d023r1ciWxt4QqiUG94zjxR5WBLTqO6rk21osLGmvCeq1QrqHKOWg=w2000
[ARK-5]: https://play-lh.googleusercontent.com/HChTTXNO6GlyH7URY06fYDsT0KYTI7O0aRHrUcTtxBfoNT0xK4LprPUWRMfNn0jG3OQVwhFeNVSwYujnh5Gk4w=w2000
[BA-2]: https://play-lh.googleusercontent.com/GQOHwrEP7RN9vQE9q2FC_kw5JRU57kvfYVSF99p0HUiBHvJ0ZAASROeDCBHqTJvE2UgBSPb_kfciq6pBjxVfaA0=w2000
[BA-5]: https://play-lh.googleusercontent.com/mXKEht-25MHb33c59pBrWvk9wTXtez1ax-N1GxR2DJWv45-PCGMuCLoIfLhMpeHGGHWPKM-f_V3n-C3PYjWGsg=w2000
[BA-6]: https://play-lh.googleusercontent.com/Mu_km_BH2cvPacXsPuyMK1UOs55dhsgRvBJva8RbNqlIWGx5s0TrdSrGHU8vDx0YYK4MrIYKiwMhqGwE7oBhCg=w2000
[BA-7]: https://play-lh.googleusercontent.com/sla1O_MwOYTa5L7sMpjKx8jddCkhs-ZEkEMHtEURIqzHd6gq7dEIYZNC3_NiKWYgYs0BPHxEiWV3HTolxfa6=w2000
[CAP-1]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/63/63/e5/6363e512-eb36-d521-f1f7-4a8ed3cc9412/_U56fe1.jpg/600x0w.jpg
[CAP-2]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/bf/aa/ea/bfaaeacd-0cec-d982-33c1-34653e820b53/_U56fe2.jpg/600x0w.jpg
[CAP-5]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/8f/34/d6/8f34d6ed-d32c-aa3e-27b5-24469ddaac94/_U56fe5.jpg/600x0w.jpg
[CC-1]: https://play-lh.googleusercontent.com/UIOGi_Z5U-vw7PCZ8F8GdSfcmC3WJUcc9VDHvvPVxMLi_kQEw4CR46O7Vx3Zl6vPteqK99QgU8yffCJ1_IzaKe0=w1400
[CC-2]: https://play-lh.googleusercontent.com/1yss6yMh_u0uMsnUWmlBazXZSQi3_JCrpuSgyKOWYraVHz_qgVvH1DnCiyoUzOMRyoAHd97j3CYcaS5PqTV0Vw=w1400
[CC-4]: https://play-lh.googleusercontent.com/a3KPRUcna7wGSbNswjXqdls8FU_0y781VzB2zERCxAMgRPIkvwP4J4AzrBNkWggmweTq-G6T72H6wmfSNi1pLoE=w1400
[CC-5]: https://play-lh.googleusercontent.com/ZQfTeHpgj3kzrW9Er8cBFOIbRiurWg7dloaWmAot2Xe0r8QcBkBMHcVo_lPYfTib8ty9HmfxplKgv0MWAlzu=w1400
[CC-6]: https://play-lh.googleusercontent.com/tM3tBPrJSBFctjA9yHw_gslpteS_8mfUu3QRayYWbgQWgoZRMHeS-Nbl2O5xrmDXOhHUzZqtnhI8EyJgAVb4fA=w1400
[DG-DIALOG]: current-app/scene-dialog-highlight.png
[DG-EARLY]: current-app/warfront-early.png
[DG-HIT]: current-app/warfront-fighter-hit.png
[DG-RALLY]: current-app/warfront-rally.png
[DIC-A1]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/cd/00/63/cd006312-1253-2545-2315-871ec3a0a9d4/1-1320x2868-en.jpg/600x0w.jpg
[DIC-A2]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/bc/7a/a4/bc7aa476-4b88-0277-e388-6816741b88e3/2-1320x2868-en.jpg/600x0w.jpg
[DIC-A3]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/5d/46/92/5d469299-a317-e05b-4780-f1fc51b14bab/3-1320x2868-en.jpg/600x0w.jpg
[DIC-A4]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/b6/e4/dd/b6e4dd6d-69ea-aa5d-d074-e01e132a27aa/4-1320x2868-en.jpg/600x0w.jpg
[DIC-A5]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/05/51/f1/0551f186-893e-b7cc-08f9-1b44aa2b82ec/5-1320x2868-en.jpg/600x0w.jpg
[DIC-P1]: https://play-lh.googleusercontent.com/DOBnwE4UEAu9uV5sAO7FI2-W1U9pMnsqI7aR61wsPb8dqEQrOcpHK7CGguAb34WLDgwWE6swKbv7OD_xHo0VUg=w1400
[DIC-P5]: https://play-lh.googleusercontent.com/j0O5rAi0HhdXbb60DXNrbkekulWvej8N9VQE7T-_o_KGfDDSh5OdJvqC8aTol90B9lj7h8ZLqvbiO_z0EdLK=w1400
[E7-3]: https://play-lh.googleusercontent.com/BM6fjcTFsJ7DUKKO7iG0WF8U7SzBz1DTg0_rXH8A64wttX0utaXUcTOmrpLB2E5U0j2JJoC9wkZguORSbSY2mA=w2000
[E7-4]: https://play-lh.googleusercontent.com/muPACNtI19ixFk4iUsXJvaz9FQsKPouDPtqHVm9WtbOXWLMycIPA2LEYJb2FzOJYksKUkhVSc1zdC_ZOS3uNGg=w2000
[E7-5]: https://play-lh.googleusercontent.com/HqtRcOI9HrVB8kKHRwwshLxvy6cgknG8feiLiSRRNgT3ywykuz1CKO0buNErpCJF_6djzTQk01FnqVBOKuyWww=w2000
[E7-7]: https://play-lh.googleusercontent.com/VsslLKRPgIIJchM8u7vjsY0IxqS0QoqdKljz4-W7UfakpukFN_JRieVhgO6UsBeI2h7UDfwbCfix8-OhaCx4mA=w2000
[EGG-2]: https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5a/17/5e/5a175e3b-08e2-4642-1fae-bb4f6878af70/mzl.wauatgtv.png/600x0w.jpg
[EGG-3]: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/56/39/5b/56395bf2-1290-49af-1385-f3bc53617cb8/4789d03c-f4e4-4cc1-8a42-5d22e0fbddee_IMG_0059.PNG/600x0w.jpg
[EGG-8]: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e7/3b/a6/e73ba6b6-8660-5bef-0589-631bbef95168/ca099acf-2975-48f1-af51-73a9f1f26c10_IMG_0064.PNG/600x0w.jpg
[GC-P1]: https://play-lh.googleusercontent.com/MxFsVxrn8FN_6vwY2Hvs_0RWoWDWmHbPjTNORVdd-GtjwSXMHLpBjU6JO5Ilgax4A1KKYWJUbqgfwf38aw7pVpg=w1400
[GC-P2]: https://play-lh.googleusercontent.com/zm6x4tNA3gn5fhUVwLULEkJpcRS8wVC6kCxor9xPfvapj_g7ELxbHplgmtlmZ8HDm2wE0hXNxifZ_CBdPY6c=w1400
[GC-P4]: https://play-lh.googleusercontent.com/s2yEOKxFe63-e9xTNNw2j9OihvsJAF-z4Can_GYD4gF0sARPJ0N_wPo9ulpTV3VG7KQH1z_eQtwUkqZUfe3AUQ=w1400
[GC-P5]: https://play-lh.googleusercontent.com/7Yp-suErQ0za3ry9qeAG63QouOiCnMbcJBhYaFhQwm2yP4yM7If7OH6lldYJkoyYLlf0tf_DvrPvJ5pjX-uo8lM=w1400
[GI-AR]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-adventure-rank-rewards.png
[GI-AT]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-attributes.png
[GI-BUY]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-purchase-sword.png
[GI-ING]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-new-ingredient.png
[GI-LOOT]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-loot.png
[GI-REW]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-rewards.png
[GI-SHOP]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-paimons-bargains.png
[GI-WISH]: https://interfaceingame.com/wp-content/uploads/genshin-impact-mobile/genshin-impact-mobile-wish.png
[HSR-BP]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-battle-pass.png
[HSR-CD]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-character-details.png
[HSR-CL]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-characters-list.png
[HSR-EV]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-dialogue-2.png
[HSR-HUD]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-hud-5.png
[HSR-LV]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-level-up-2.png
[HSR-TIP]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-confirmation.png
[HSR-TUT]: https://interfaceingame.com/wp-content/uploads/honkai-star-rail/honkai-star-rail-celebration.png
[IS-2]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/51/17/9e/51179ec9-3d70-fc46-0790-b2700e3b0d9d/AB_Mayo2026_Billions_IPHONE.png/600x0w.jpg
[IS-3]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/6e/70/84/6e708423-3039-d5b4-147c-a4ca91dd9563/AB_Mayo2026_Upgrades_IPHONE.png/600x0w.jpg
[IS-4]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/ca/41/73/ca4173d5-f2ba-27e7-71cd-fb8cc4a5d2dd/AB_Mayo2026_Offline_IPHONE.png/600x0w.jpg
[IS-7]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/2b/66/8a/2b668ad2-bd90-6e64-b95f-98d8ee52537f/AB_Mayo2026_Village_IPHONE.png/600x0w.jpg
[OWN-HOME]: owner-screenshots/dicero-home.png
[OWN-OFFER]: owner-screenshots/dicero-offer-popup.png
[OWN-TITLE]: owner-screenshots/dicero-title.png
[RAID-1]: https://play-lh.googleusercontent.com/IX-JnMS84GYbUzx83DJLUX__uRIB5iSx63uAd712n8VCl_8N9KAJovnC3gOQoXGlARtttmjWYhwODKkzOgKXhh0=w2000
[RAID-3]: https://play-lh.googleusercontent.com/pKG_cBw1aOkShwUP_0621-ThZzED50H7gN8XhlgFtLmeyVsSI3PXR9tiKD-2kv6z6ThIoTk6ISVXVTI-h2YCLPA=w2000
[RAID-4]: https://play-lh.googleusercontent.com/nY3KwEgPGRaMMu40JaveCHD_zlPYQLnITefcxbI1GaEjF0W5UvLWbxvRWu6VNq6Q6-yPnJ6QHGtpWoKxSwOVe00=w2000
[RAID-5]: https://play-lh.googleusercontent.com/epzDd2Gie8-WBhp7v7imdTD3kS6ypWbPtl8cnafLoa0q36mnTF-CokxSqF-jwlX0--VSlIr1UHljXdSjCeQBOBM=w2000
[SUR-2]: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2c/34/73/2c3473f0-1bd1-8432-71bd-afe8cc8c900f/602e5ccc-02b1-475f-a519-9cd4eb0152a0_2.png/600x0w.jpg
[SUR-5]: https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/32/37/a1/3237a1f8-7f6b-27e6-9252-e59246336f70/a23b51f1-b1b3-408d-aac2-4f68046a43f2_5.png/600x0w.jpg
[TT-A2]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/70/94/d1/7094d1ad-a553-e271-7a55-90535d754933/TT2_TT2_ASO_S4-en_Portrait_1242x2208.png/600x0w.jpg
[TT-A3]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/b3/75/6f/b3756f40-2281-b537-0047-588c126c59ff/TT2_TT2_ASO_S5-en_Portrait_1242x2208.png/600x0w.jpg
[TT-A4]: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/49/a7/97/49a797c0-db3e-5747-0509-a5a7c078aa9a/TT2_TT2_ASO_S6-en_Portrait_1242x2208.png/600x0w.jpg
[TT-P16]: https://play-lh.googleusercontent.com/pncyyq8gSk-amBJyDW3P1FRAg6GdhHpSe8ntWJIVk2sO2UkfY_A4LRWm4lTK-RctPSWIQYwPy-oUgWKz4xFCUgU=w1400
[WW-2]: https://play-lh.googleusercontent.com/z_QCm49Ob94HEFjRkkD29gliXf-WD5lUnD9GNE5_WWNRq1Fsp-Yt0qL-qCa7FY9uYn6bn5bz1jZ6ATBCjG5Q0Q=w2000
[WW-3]: https://play-lh.googleusercontent.com/YWGmkTrcGFR8TTnq_K9ExQO-UyJuWx5TaFVxl4VZ0_nJJt_RzQYyDxdHyLAGzAl9A11o5S1HNBxxF-IqAShdsw=w2000
[WW-4]: https://play-lh.googleusercontent.com/s2TLBVPHhNXEufUOIPDl1KIdP-IPHZWG4bmvgO8lZjKBi9577O7veTRXSFqW6-NJ6i0K-0Gr9B1kjk1Kxo7LGA=w2000
[ZZZ-2]: https://play-lh.googleusercontent.com/G2JiN8wko8nrRYKksiTYjt1LIVzaFz60m4uwhs4x21t-fMzwpP92fsMJqclR3SU2wlHJXl0rfk95z7kMr8TFmQ=w2000
[ZZZ-4]: https://play-lh.googleusercontent.com/qNaSJJXjaMb5zwlOz11ksju6Co-Z5OG7AK-ap_KE84SXr1bIJKZYU4iiKOXJVVH5Qn5oXGtaAffUPTK7uHo=w2000
[ZZZ-5]: https://play-lh.googleusercontent.com/OSIeh0lIG7OY3ai91LwWtQTir6g6vcgqtqLZH0jSaLpcjpJm2pkj278mkAGhgaR9xh7ZhhN9rD3tyZt_iDd5gQ=w2000
