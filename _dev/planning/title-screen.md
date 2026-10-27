# Title screen: Tap to Start, with a loading bar (plan, awaiting approval)

**Goal:** the game opens like a console or store game. The studio seal plays, then the Draconia
Chronicles gate, and the gate stays on screen as the title, with a loading bar that says what it is
doing. When everything is ready, "Tap to start" appears. The title is where the game waits for
anything it has to load, now and when content updates come later.

---

## 1. What happens at launch today

1. Android's own launch screen (a plain dark screen with a small image, under a second).
2. The intro (`src/screens/IntroScreen.tsx`, built 2026-10-27 by the art session): the RAXDEG
   STUDIOS seal, then the Draconia Chronicles gate. The full version plays on the first launch,
   the short one after that, and only the finished frames with Reduce Motion.
3. The game mounts under a fade. Only then does it read the save from the phone's storage, work
   out the time away, and start the music. The 175 sprites are decoded one by one, the first time
   each one is drawn.

So nothing loads during the splashes, and the loading that does happen is invisible.

## 2. What it becomes

1. Android's launch screen, unchanged.
2. **Loading starts at once, behind the splashes.** The seal and the gate play as now, while the
   loader works.
3. **The title:** the gate's finished frame holds (the gate under the ember moon with the
   wordmark). Below it is the loading bar, with the step it is on:
   - "Opening your save": reading it, upgrading an old save, and counting the time away.
   - "Readying the art (42 of 175)": decoding every sprite, so no screen pops in later.
   - "Tuning the music": loading the theme and the sound effects.
4. **"Tap to start"** replaces the step line when the bar is full, and pulses gently. A tap
   anywhere fades into the game. The time-away report and any story scene open after that, as now.
5. If a step fails (a broken save, a missing file), the title says so in plain words and offers
   Try again. It never opens the game on a half-loaded save.

On a normal phone the loading is done before the gate finishes, so the bar is usually already full
when the title appears. It still shows, so the screen always reads the same way.

## 3. How it is built

- **A loader with named steps** (`src/loading/`): each step has a label, a weight, and work that
  reports progress. The bar shows the weighted total. Later steps (an update check, downloading
  new content) are added to the list without touching the screen.
- **The save is loaded once.** The loader reads it, and the game starts from what the loader read,
  instead of reading it again after it mounts.
- **The art step** warms the existing sprite cache (`useSpriteImage`), so it uses the same decoded
  images the screens use.
- **The title** is a new screen built from reusable parts: the intro's last frame, the existing
  `ProgressBar`, and a small `TapToStart` prompt. The intro hands over to it instead of straight
  to the game.
- **Accessibility:** the bar is a progress bar with its value read out. The title is one button,
  "Start game", which is disabled until loading ends. With Reduce Motion on, the prompt does not
  pulse.
- **Tests:** the loader's progress math, step order, failure and retry; the save handed to the game
  matches what the old path loaded.

## 4. Open questions

1. **When loading starts:** at launch, behind the splashes (recommended)? Or only once the
   splashes end, so the bar always visibly fills?
2. **Skipping the splashes:** a tap during the seal or the gate jumps to the title (recommended)?
   Or they always play out?
3. **Music:** the theme starts on the title screen (recommended, the title feels like a game's)?
   Or after Tap to Start, as now?
4. **Content updates:** leave the update step out until updates are set up (recommended)? Checking
   for updates needs Expo's update service (EAS Update): an Expo account, a channel, and a rule
   for which updates may download over mobile data. That is its own plan. Until then the bar shows
   only real work, with no pretend update step.
5. **The intro session:** the art session wrote `IntroScreen` this morning. Is it done there, so I
   can build the title on top of it?

## Owner rulings (2026-10-27)

- **Updates:** when there is no update, the title goes straight to Tap to Start. The update step
  shows on the bar only when an update is actually downloading. Until the update service is set
  up there is never one, so the bar carries only the real loading steps.
