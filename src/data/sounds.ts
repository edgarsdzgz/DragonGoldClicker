import type { AudioSource } from 'expo-audio'
import type { CastId } from '../types/cast'
import type { MonsterRank } from '../types/monsterRoster'

// =============================================================================
// THE GAME'S OWN SOUNDS: the locked set in assets/sound (written by scripts/import-art.py).
// The stock pack in data/sfx.ts keeps only the interface ticks.
// =============================================================================

/** One-shot game sounds, by name. Monsters have no voices (owner rule): no yips or roars. */
export const SOUND = {
  // The Warfront
  monsterDeath: require('../../assets/sound/sfx_monster-death.m4a'),
  wallHit: require('../../assets/sound/sfx_wall-hit.m4a'),
  crit: require('../../assets/sound/sfx_crit.m4a'),
  slashEmber: require('../../assets/sound/sfx_slash-ember.m4a'),
  walkUp: require('../../assets/sound/sfx_walk-up.m4a'),
  gateCrack: require('../../assets/sound/sfx_gate-crack.m4a'),
  unmakingRise: require('../../assets/sound/sfx_unmaking-rise.m4a'),
  rally: require('../../assets/sound/sfx_rally.m4a'),
  mend: require('../../assets/sound/sfx_mend.m4a'),
  breach: require('../../assets/sound/sfx_breach.m4a'),
  bossArrives: require('../../assets/sound/sfx_boss-arrives.m4a'),
  minibossArrives: require('../../assets/sound/sfx_miniboss-arrives.m4a'),
  bossFalls: require('../../assets/sound/sfx_boss-falls.m4a'),
  varnBreath: require('../../assets/sound/sfx_varn-breath.m4a'),
  // The claws
  clawSharpen: require('../../assets/sound/sfx_claw-sharpen.m4a'),
  clawReforge: require('../../assets/sound/sfx_claw-reforge.m4a'),
  // The city
  buildStart: require('../../assets/sound/sfx_build-start.m4a'),
  buildComplete: require('../../assets/sound/sfx_build-complete.m4a'),
  cityBrightens: require('../../assets/sound/sfx_city-brightens.m4a'),
  researchDone: require('../../assets/sound/sfx_research-done.m4a'),
  expeditionOut: require('../../assets/sound/sfx_expedition-out.m4a'),
  expeditionBack: require('../../assets/sound/sfx_expedition-back.m4a'),
  find: require('../../assets/sound/sfx_find.m4a'),
  gateKnock: require('../../assets/sound/sfx_gate-knock.m4a'),
  heartstone: require('../../assets/sound/sfx_heartstone.m4a'),
  // Forage
  foodLow: require('../../assets/sound/sfx_food-low.m4a'),
  foodRaid: require('../../assets/sound/sfx_food-raid.m4a'),
  granaryFull: require('../../assets/sound/sfx_granary-full.m4a'),
  // The story
  sceneOpen: require('../../assets/sound/sfx_scene-open.m4a'),
  fanfare: require('../../assets/sound/sfx_fanfare.m4a'),
  welcomeBack: require('../../assets/sound/sfx_welcome-back.m4a'),
} as const satisfies Record<string, AudioSource>

export type SoundId = keyof typeof SOUND

/** A monster setting out for the gate: the horde's war horn for a boss, a shorter blast for a mini-boss, else its footfalls */
export function arrivalSound(rank?: MonsterRank): SoundId {
  if (rank === 'boss') return 'bossArrives'
  if (rank === 'miniboss') return 'minibossArrives'
  return 'walkUp'
}

/** A monster dying: a boss or mini-boss falls (and Draconia's horn answers); the rest, elites too, die plainly */
export function deathSound(rank?: MonsterRank): SoundId {
  return rank === 'boss' || rank === 'miniboss' ? 'bossFalls' : 'monsterDeath'
}

/** The claws' work: reforging once they are at their best, else sharpening */
export function clawSound(reforge: boolean): SoundId {
  return reforge ? 'clawReforge' : 'clawSharpen'
}

/** Played when a character first appears in a scene; the rest of the cast has none */
export const CAST_STINGS: Partial<Record<CastId, AudioSource>> = {
  sera: require('../../assets/sound/sfx_sting-sera.m4a'),
  thornwick: require('../../assets/sound/sfx_sting-thornwick.m4a'),
  'hollow-knight': require('../../assets/sound/sfx_sting-hollow-knight.m4a'),
}

/**
 * The RAXDEG splash's beats, by the name of the seal's frame each starts on (SEAL_BUILD_TIMING.beats).
 * The beats are used rather than splash_full: the short splash starts partway in, and a tap skips.
 */
export const SPLASH_BEAT_SOUNDS = {
  slam: require('../../assets/sound/splash_slam.m4a'),
  medallion_top: require('../../assets/sound/splash_medallion-top.m4a'),
  medallion_left: require('../../assets/sound/splash_medallion-left.m4a'),
  medallion_right: require('../../assets/sound/splash_medallion-right.m4a'),
  etch: require('../../assets/sound/splash_etch.m4a'),
  slash: require('../../assets/sound/splash_slash.m4a'),
  spread: require('../../assets/sound/splash_spread.m4a'),
  smash: require('../../assets/sound/splash_smash.m4a'),
} as const satisfies Record<string, AudioSource>

/** The splash's beat sounds by the frame each starts on, from its timing's named beats */
export function beatFrameSounds(beats: Readonly<Record<string, number>>): Record<number, AudioSource> {
  const out: Record<number, AudioSource> = {}
  for (const [name, source] of Object.entries(SPLASH_BEAT_SOUNDS)) {
    if (beats[name] !== undefined) out[beats[name]] = source
  }
  return out
}

/** The seamless 8-second ambient loops */
export const AMBIENT = {
  torches: require('../../assets/sound/amb_torches.m4a'),
  forge: require('../../assets/sound/amb_forge.m4a'),
  hordeDrums: require('../../assets/sound/amb_horde-drums.m4a'),
  nightWind: require('../../assets/sound/amb_night-wind.m4a'),
} as const satisfies Record<string, AudioSource>

export type AmbientId = keyof typeof AMBIENT

/**
 * Each loop's share of the sound-effects volume. The night wind is mastered loud, so it sits well
 * under the rest (the art brief); the drums are the siege far off.
 */
export const AMBIENT_MIX: Record<AmbientId, number> = {
  torches: 0.5,
  forge: 0.55,
  hordeDrums: 0.35,
  nightWind: 0.12,
}
