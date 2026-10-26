import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import type { GameState } from './state'
import { roundInsp } from './utils'

// =============================================================================
// THE MONSTER (layer 2e): always one at the gate; taps and fighters both wear it down
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
  /** Lifetime kills at which this monster starts to appear */
  fromKills: number
}

/**
 * Provisional numbers; balance comes with the simulator. The kill thresholds are the old wave
 * boundaries (waves 0-2 kobold, 3-5 goblin, 6-10 crawler, 11+ orc) counted in kills, so the
 * pace is unchanged and no save changes monster type when waves were put away.
 */
export const MONSTERS: MonsterDef[] = [
  { id: 'kobold', name: 'Kobold', plural: 'kobolds', glyph: 'paw', hp: 5, bounty: 0.25, fromKills: 0 },
  { id: 'goblin', name: 'Goblin', plural: 'goblins', glyph: 'skull', hp: 8, bounty: 0.4, fromKills: 13 },
  { id: 'shadow_crawler', name: 'Shadow Crawler', plural: 'shadow crawlers', glyph: 'bug', hp: 12, bounty: 0.6, fromKills: 28 },
  { id: 'orc', name: 'Orc', plural: 'orcs', glyph: 'flame', hp: 20, bounty: 1.0, fromKills: 53 },
]

/** Damage per tap at the start */
export const STARTING_TAP_DAMAGE = 1
export const FIRST_MONSTER_HP = MONSTERS[0].hp

/** Pause before the next monster is shown after a kill (the UI uses it; taps in it hit the next one) */
export const SPAWN_DELAY_MS = 250

export function currentMonster(s: Pick<GameState, 'monsterIndex'>): MonsterDef {
  return MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, s.monsterIndex))]
}

/** Which MONSTERS entry comes after this many lifetime kills */
export function monsterIndexForKills(kills: number): number {
  let index = 0
  MONSTERS.forEach((m, i) => {
    if (kills >= m.fromKills) index = i
  })
  return index
}

/** A fresh monster of the tier the kills so far call for */
export function spawnMonster(s: GameState): GameState {
  const monsterIndex = monsterIndexForKills(Math.floor(s.monstersDefeated))
  return { ...s, monsterIndex, monsterHp: MONSTERS[monsterIndex].hp }
}

/** HP is fractional (fighters chip a quarter at a time); round away float drift */
export function roundHp(hp: number): number {
  return Math.round(hp * 100) / 100
}

/** HP as a whole number for text: rounded up, so a monster still standing never reads 0 */
export function shownHp(hp: number): number {
  return Math.ceil(roundHp(hp))
}

export interface StrikeResult {
  state: GameState
  /** The monster that was struck (before any kill moved on to the next) */
  monster: MonsterDef
  dealt: number
  killed: boolean
  bounty: number
}

/**
 * Damage the monster on the field. A kill pays the bounty (renown comes only from kills),
 * counts the kill and brings in the next monster at once, so a hit that lands during the
 * visual spawn pause hits the new one.
 */
export function applyDamage(s: GameState, damage: number): StrikeResult {
  const monster = currentMonster(s)
  const hp = s.monsterHp > 0 ? s.monsterHp : monster.hp
  const dealt = Math.min(damage, hp)
  const left = roundHp(hp - damage)

  if (left > 0) {
    return { state: { ...s, monsterHp: left }, monster, dealt, killed: false, bounty: 0 }
  }

  const kills = Math.floor(s.monstersDefeated) + 1
  const monsterIndex = monsterIndexForKills(kills)
  return {
    state: {
      ...s,
      inspiration: roundInsp(s.inspiration + monster.bounty),
      totalInspirationEarned: roundInsp(s.totalInspirationEarned + monster.bounty),
      monstersDefeated: kills,
      monsterIndex,
      monsterHp: MONSTERS[monsterIndex].hp,
    },
    monster,
    dealt,
    killed: true,
    bounty: monster.bounty,
  }
}

/** One tap: the player's strike, counted as a click */
export function strike(s: GameState, damage: number = s.tapDamage): StrikeResult {
  const r = applyDamage(s, damage)
  return { ...r, state: { ...r.state, totalClicks: s.totalClicks + 1 } }
}

/** The fighters' swings that landed this tick; a kill by them is counted as theirs */
export function fighterStrike(s: GameState, damage: number, swings: number): StrikeResult {
  const r = applyDamage(s, damage)
  return {
    ...r,
    state: {
      ...r.state,
      allyStrikes: s.allyStrikes + swings,
      allyKills: s.allyKills + (r.killed ? 1 : 0),
    },
  }
}

/** The text a screen reader gets for the battlefield */
export function monsterLabel(s: Pick<GameState, 'monsterIndex' | 'monsterHp'>): string {
  const m = currentMonster(s)
  return `${m.name}, ${shownHp(s.monsterHp)} of ${m.hp} HP. Tap to strike`
}
