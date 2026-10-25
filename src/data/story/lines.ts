import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import type { BeatId } from '../../types/story'

// =============================================================================
// SCENE TEXT (prose only; triggers and unlocks live in types/story.ts)
// =============================================================================

type IconName = ComponentProps<typeof Ionicons>['name']

/** Tab a scene sends the player to when it is dismissed (not when skipped) */
export type SceneTab = 'GameTab' | 'ForageTab' | 'DraconiaTab'

export interface SceneDef {
  speaker: string
  icon: IconName
  title: string
  lines: string[]
  dismissLabel?: string
  navigateTo?: SceneTab
}

const PYRETH = { speaker: 'Elder Pyreth', icon: 'person' } as const
const RODAIN = { speaker: 'Captain Rodain', icon: 'shield' } as const
const MIRAEL = { speaker: 'Scout Mirael', icon: 'compass' } as const
const KAEL = { speaker: 'Kael Ironwright', icon: 'hammer' } as const
const LIRAE = { speaker: 'Lirae the Ink-Wing', icon: 'book' } as const

const placeholder = (id: BeatId): string[] => [`[placeholder] ${id}`]

/** Silent beats (mend_the_walls, the_keep_stands) have no scene and no entry here */
export const SCENES: Partial<Record<BeatId, SceneDef>> = {
  prologue: { ...PYRETH, title: 'The Walls of Draconia', lines: placeholder('prologue') },
  call_to_arms: { ...PYRETH, title: 'A Call to Arms', lines: placeholder('call_to_arms') },
  the_breach: { ...RODAIN, title: 'The Breach', lines: placeholder('the_breach') },
  empty_stores: {
    ...PYRETH,
    title: 'Our Stores Run Low',
    lines: [
      'My lord, I bring troubling news. Our food stores in Draconia are dwindling.',
      'Every soul in the city must eat. Villagers consume a modest share, but soldiers require far more -- and the higher their rank, the greater their appetite.',
      'If our food runs out entirely, our people will begin to starve. And without food, the soldiers will refuse to fight.',
      'We have no farms yet, but the wilderness around Draconia is rich with wild plants and game. I have opened a foraging path for you.',
      'Go to the Forage tab and gather what you can. It is humble work, but it will keep our people alive.',
    ],
    dismissLabel: 'Begin foraging',
    navigateTo: 'ForageTab',
  },
  strangers_at_gate: { ...MIRAEL, title: 'Strangers at the Gate', lines: placeholder('strangers_at_gate') },
  a_city_to_build: { ...PYRETH, title: 'A City to Build', lines: placeholder('a_city_to_build') },
  the_smith: { ...KAEL, title: 'The Smith', lines: placeholder('the_smith') },
  word_spreads: { ...PYRETH, title: 'Word Spreads', lines: placeholder('word_spreads') },
  lean_times: { ...PYRETH, title: 'Lean Times', lines: placeholder('lean_times') },
  beyond_the_walls: {
    ...MIRAEL,
    title: 'Beyond the Walls',
    lines: [
      'My lord, our scouts have spotted something troubling. The wilderness beyond Draconia grows wilder by the day -- and our villagers are stretched thin.',
      'But there is opportunity in the danger. We have located a ruined outpost on the frontier that could serve as a staging ground for expeditions into the wasteland.',
      'Wayfinders trained there can venture out and rescue lost souls -- villagers stranded beyond our borders. More people means a stronger Draconia.',
      'The outpost will not come cheap, but the investment will pay for itself many times over. I urge you to save up and build it when you can.',
    ],
    dismissLabel: 'View the outpost',
    navigateTo: 'DraconiaTab',
  },
  the_keep: { ...PYRETH, title: 'The Keep', lines: placeholder('the_keep') },
  the_scholar: { ...LIRAE, title: 'The Scholar', lines: placeholder('the_scholar') },
  the_horde_grows: { ...RODAIN, title: 'The Horde Grows', lines: placeholder('the_horde_grows') },
}

export function getScene(id: string): SceneDef | undefined {
  return SCENES[id as BeatId]
}
