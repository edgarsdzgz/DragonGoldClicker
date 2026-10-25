import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import type { GameState } from './state'
import { roundInsp } from './utils'
import { progressWave, waveFromKills, waveBonus, WAVE_SIZE } from './waves'

// =============================================================================
// THE MONSTER (layer 2): the thing the SLAY circle shows and the tap hits
// =============================================================================

export interface MonsterDef {
  id: string
  name: string
  /** For "4 kobolds left" */
  plural: string
  glyph: ComponentProps<typeof Ionicons>['name']
  hp: number
  /** Inspiration paid when it dies */
  bounty: number
  /** First kill count at which this monster appears */
  fromKills: number
}

/** Provisional numbers; balance comes with the simulator. About 0.05 inspiration per tap at the start. */
export const MONSTERS: MonsterDef[] = [
  { id: 'kobold', name: 'Kobold', plural: 'kobolds', glyph: 'paw', hp: 5, bounty: 0.25, fromKills: 0 },
  { id: 'goblin', name: 'Goblin', plural: 'goblins', glyph: 'skull', hp: 8, bounty: 0.4, fromKills: 10 },
  { id: 'shadow_crawler', name: 'Shadow Crawler', plural: 'shadow crawlers', glyph: 'bug', hp: 12, bounty: 0.6, fromKills: 25 },
  { id: 'orc', name: 'Orc', plural: 'orcs', glyph: 'flame', hp: 20, bounty: 1.0, fromKills: 50 },
]

/** Damage per tap at the start */
export const STARTING_TAP_DAMAGE = 1
export const FIRST_MONSTER_HP = MONSTERS[0].hp

/** Pause before the next monster is shown after a kill (the UI uses it; taps in it hit the next one) */
export const SPAWN_DELAY_MS = 250

/** Which monster the player faces after this many kills */
export function monsterIndexForKills(kills: number): number {
  let index = 0
  MONSTERS.forEach((m, i) => {
    if (kills >= m.fromKills) index = i
  })
  return index
}

export function currentMonster(s: Pick<GameState, 'monsterIndex'>): MonsterDef {
  return MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, s.monsterIndex))]
}

/** A fresh monster of the tier the kill count calls for (used by the save migration) */
export function spawnMonster(s: GameState): GameState {
  const monsterIndex = monsterIndexForKills(Math.floor(s.monstersDefeated))
  return { ...s, monsterIndex, monsterHp: MONSTERS[monsterIndex].hp, ...waveFromKills(s.monstersDefeated) }
}

export interface StrikeResult {
  state: GameState
  /** The monster that was struck (before any kill moved on to the next) */
  monster: MonsterDef
  dealt: number
  killed: boolean
  bounty: number
  /** The kill finished a wave */
  waveCleared: boolean
  /** Wave bonus paid on top of the bounty (0 unless the wave was cleared) */
  waveBonus: number
  /** The tap was ignored (the horde is still in camp) */
  ignored: boolean
}

/**
 * One tap. Deals damage; on a kill pays the bounty, counts the kill and brings in the next
 * monster at once, so a tap that lands during the visual spawn pause hits the new monster.
 */
export function strike(s: GameState, damage: number = s.tapDamage): StrikeResult {
  const monster = currentMonster(s)
  // In camp there is nothing to strike: no damage, no click counted
  if (!s.waveActive) {
    return { state: s, monster, dealt: 0, killed: false, bounty: 0, waveCleared: false, waveBonus: 0, ignored: true }
  }
  const hp = s.monsterHp > 0 ? s.monsterHp : monster.hp
  const dealt = Math.min(damage, hp)
  const left = hp - damage
  const tapped = { ...s, totalClicks: s.totalClicks + 1 }

  if (left > 0) {
    return { state: { ...tapped, monsterHp: left }, monster, dealt, killed: false, bounty: 0, waveCleared: false, waveBonus: 0, ignored: false }
  }

  const kills = Math.floor(s.monstersDefeated) + 1
  const monsterIndex = monsterIndexForKills(kills)
  const wave = progressWave(s, monster.bounty)
  const paid = monster.bounty + wave.bonus
  return {
    state: {
      ...tapped,
      inspiration: roundInsp(s.inspiration + paid),
      totalInspirationEarned: roundInsp(s.totalInspirationEarned + paid),
      monstersDefeated: kills,
      monsterIndex,
      monsterHp: MONSTERS[monsterIndex].hp,
      waveNumber: wave.waveNumber,
      waveKills: wave.waveKills,
    },
    monster,
    dealt,
    killed: true,
    bounty: monster.bounty,
    waveCleared: wave.cleared,
    waveBonus: wave.bonus,
    ignored: false,
  }
}

/** Send the next wave in: the first monster enters. Does nothing if a wave is already on. */
export function beginWave(s: GameState): GameState {
  if (s.waveActive) return s
  const monsterIndex = monsterIndexForKills(Math.floor(s.monstersDefeated))
  return { ...s, waveActive: true, monsterIndex, monsterHp: MONSTERS[monsterIndex].hp }
}

/**
 * The wave is over and its banner is done: back to camp. The bonus was already paid at the
 * kill, so this only flips the view. Only a cleared wave (waveKills back at 0) can end.
 */
export function endWave(s: GameState): GameState {
  if (!s.waveActive || s.waveKills !== 0 || s.monstersDefeated === 0) return s
  return { ...s, waveActive: false }
}

export interface CampView {
  waveNumber: number
  monster: MonsterDef
  count: number
  /** "Wave 3: 5 goblins" */
  previewText: string
  /** "+0.80 when cleared" */
  bonusText: string
  /** Screen-reader label of the Begin wave button */
  buttonLabel: string
}

/** What the camp shows about the next wave */
export function campView(s: Pick<GameState, 'waveNumber' | 'monsterIndex'>): CampView {
  const monster = currentMonster(s)
  const bonus = waveBonus(monster.bounty)
  return {
    waveNumber: s.waveNumber,
    monster,
    count: WAVE_SIZE,
    previewText: `Wave ${s.waveNumber}: ${WAVE_SIZE} ${monster.plural}`,
    bonusText: `+${bonus.toFixed(2)} when cleared`,
    buttonLabel: `Begin wave ${s.waveNumber}, ${WAVE_SIZE} ${monster.plural}`,
  }
}

/** The text a screen reader gets for the circle */
export function monsterLabel(s: Pick<GameState, 'monsterIndex' | 'monsterHp'>): string {
  const m = currentMonster(s)
  return `${m.name}, ${s.monsterHp} of ${m.hp} HP. Tap to strike`
}

export interface WaveView {
  waveNumber: number
  /** "4 kobolds left" */
  leftText: string
  left: number
  /** The monsters still to come after the current one, at most 4 (the dim queue) */
  queue: MonsterDef[]
}

export const MAX_QUEUE = 4

/** What the wave row and the queue show */
export function waveView(s: Pick<GameState, 'waveNumber' | 'waveKills' | 'monsterIndex'>): WaveView {
  const monster = currentMonster(s)
  const left = Math.max(1, WAVE_SIZE - s.waveKills)
  const noun = left === 1 ? monster.name.toLowerCase() : monster.plural
  return {
    waveNumber: s.waveNumber,
    left,
    leftText: `${left} ${noun} left`,
    queue: Array.from({ length: Math.min(MAX_QUEUE, left - 1) }, () => monster),
  }
}
