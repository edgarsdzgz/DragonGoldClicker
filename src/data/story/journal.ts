import type { GameState } from '../../types/state'
import type { SystemId } from '../../types/systems'
import { isSystemOn } from '../../types/systems'
import { STORY_BEATS } from '../../types/story'
import { SCENES } from './lines'
import type { SceneDef } from './lines'

// =============================================================================
// JOURNAL CONTENT (only what the player has discovered)
// =============================================================================

export interface JournalStoryEntry {
  id: string
  scene: SceneDef
}

/** Every seen scene, in story order, re-readable in full (caught-up beats included) */
export function getStoryEntries(s: GameState): JournalStoryEntry[] {
  return STORY_BEATS
    .filter((b) => s.beatsSeen.includes(b.id) && SCENES[b.id])
    .map((b) => ({ id: b.id, scene: SCENES[b.id]! }))
}

export interface HowItWorksCard {
  system: SystemId
  title: string
  text: string
}

/** One short card per system, in plain player language, 1-2 sentences each */
const HOW_IT_WORKS: HowItWorksCard[] = [
  { system: 'slay', title: 'Slay', text: 'Tap SLAY to strike monsters. Every kill earns renown, the currency that pays for everything.' },
  { system: 'rally', title: 'Rally', text: 'Rally turns an idle villager into a fighter, who strikes the enemy at the gate beside you. Every enemy fighters defeat adds its full renown to yours, even while you rest.' },
  { system: 'siege', title: 'The Siege', text: 'Monsters batter the wall and wear down the city’s health. Strong fighters keep the damage away.' },
  { system: 'repair', title: 'Repair', text: 'Repairers mend the wall a little every second. Send villagers to fix it faster than it breaks.' },
  { system: 'hunger', title: 'Food', text: 'Only the army eats from the stores, at every meal bell; villagers fend for themselves. Gatherers bring food in, and one feeds about two fighters.' },
  { system: 'forageTab', title: 'Foraging', text: 'Tap FORAGE to gather food in the valley behind Draconia. While you forage, you are not defending the Gate.' },
  { system: 'wanderers', title: 'Wanderers', text: 'Every few minutes someone reaches the gates. Take them in for more hands; each eats 10 food from the stores on arrival.' },
  { system: 'draconiaTab', title: 'Draconia', text: 'The city map. Build and restore places here, then open them to train people and buy upgrades.' },
  { system: 'expeditions', title: 'Expeditions', text: 'Wayfinders travel beyond the walls to rescue lost villagers. An expedition costs food and takes time; the first always finds someone.' },
  { system: 'offline', title: 'While You Are Away', text: 'The Keep gathers renown while you are gone, for a few hours. Upgrade it to extend how long.' },
  { system: 'reassignment', title: 'Changing Roles', text: 'The Keep lets you send people back to being idle villagers or move them to new work. You get part of their training cost back.' },
  { system: 'threatUnfloored', title: 'The Wall Can Fall', text: 'Captain Rodain’s company no longer holds the line for you. If the wall falls, people die, the stores burn and your renown pays for the ancient magic that drives the horde back weaker.' },
]

export function getHowItWorks(s: GameState): HowItWorksCard[] {
  return HOW_IT_WORKS.filter((c) => isSystemOn(s, c.system))
}

/** The Lore tab appears once Lirae has arrived */
export function isLoreUnlocked(s: GameState): boolean {
  return s.beatsSeen.includes('the_scholar')
}

export function getLoreLines(): string[] {
  return SCENES.the_scholar?.lines ?? []
}
