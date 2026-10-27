import { SEAL_BUILD_TIMING, SPLASH_TIMING } from './manifest'
import type { SpriteId } from './manifest'
import type { SheetTiming } from './sequence'

// =============================================================================
// THE INTRO: RAXDEG STUDIOS, then Draconia Chronicles, then the game
// =============================================================================

export interface IntroSplashDef {
  id: SpriteId
  timing: SheetTiming
  /** Where the short version (every launch after the first) starts */
  shortFrom: number
  /** Read by screen readers */
  label: string
}

/** The gate splash's path of light: the short version starts here */
const GATE_SHORT_FROM = 17

export const INTRO: readonly IntroSplashDef[] = [
  // From the finished blue etching: the slash, the gold spreading from the cut, the smash
  { id: 'seal_build_sheet', timing: SEAL_BUILD_TIMING, shortFrom: SEAL_BUILD_TIMING.beats.etched, label: 'Raxdeg Studios' },
  { id: 'splash_frames_anim', timing: SPLASH_TIMING, shortFrom: GATE_SHORT_FROM, label: 'Draconia Chronicles' },
]

/** The short version holds its finished frame this long, not the full version's long hold */
export const SHORT_LAST_HOLD_MS = 900

/** With Reduce Motion on, each splash shows only its finished frame, this long */
export const STILL_HOLD_MS = 1400

/** Fades between the splashes and into the game */
export const INTRO_FADE_MS = 300

/** Set once the full intro has played; later launches get the short version */
export const INTRO_SEEN_KEY = '@dragongold/intro_seen'
