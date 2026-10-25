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
  /** Lines used instead when the beat's `altScene` says so */
  altLines?: string[]
  dismissLabel?: string
  navigateTo?: SceneTab
  /** A cutscene can be skipped; ordinary scenes never show Skip. No scene is a cutscene yet. */
  cutscene?: boolean
}

const PYRETH = { speaker: 'Elder Pyreth', icon: 'person' } as const
const RODAIN = { speaker: 'Captain Rodain', icon: 'shield' } as const
const MIRAEL = { speaker: 'Scout Mirael', icon: 'compass' } as const
const KAEL = { speaker: 'Kael Ironwright', icon: 'hammer' } as const
const LIRAE = { speaker: 'Lirae the Ink-Wing', icon: 'book' } as const

/** Silent beats (mend_the_walls, the_keep_stands) have no scene and no entry here */
export const SCENES: Partial<Record<BeatId, SceneDef>> = {
  // prologue is silent: a fresh install shows only the Begin Wave 0 button
  first_renown: {
    ...PYRETH,
    title: 'Renown',
    lines: [
      'Your victory echoes through Draconia, my lord. Defeating our enemies in battle earns you renown.',
      'The more foes you defeat, the more renown you gain, and the more the people and the elders of Draconia will listen to you.',
    ],
  },
  call_to_arms: {
    ...PYRETH,
    title: 'A Spark of Courage',
    lines: [
      'You have given them hope. Some of our villagers are ready to take up arms.',
      'Rally them, and they will fight beside you, even while you rest.',
    ],
  },
  the_breach: {
    ...RODAIN,
    title: 'The Wall Breaks',
    lines: [
      'The east wall is breached! Hold fast, Steward. We are here.',
      'Captain Rodain, and fifty swords behind me. Where do you want us?',
      'My company will hold the line. The wall will not fall while we stand, but it must be mended.',
    ],
  },
  empty_stores: {
    ...PYRETH,
    title: 'Our Stores Run Low',
    lines: [
      'My lord, I bring troubling news. Our food stores in Draconia are dwindling.',
      'We have no farms yet, but the wilderness around Draconia is rich with wild plants and game. I have opened a foraging path for you.',
      'Go to the Forage tab and gather what you can. It is humble work, but it will keep our people alive.',
    ],
    dismissLabel: 'Begin foraging',
    navigateTo: 'ForageTab',
  },
  strangers_at_gate: {
    ...MIRAEL,
    title: 'A Stranger on the Road',
    lines: [
      'A traveler on the east road, alone and half-starved.',
      'Every soul we take in is another mouth to feed, and another pair of hands. The choice is yours.',
    ],
  },
  a_city_to_build: {
    ...PYRETH,
    title: 'A City, Not a Wall',
    lines: [
      'Draconia was a city once, my lord, not only a wall. Let us begin to rebuild it.',
      "Captain Rodain's soldiers need a garrison. Start there.",
    ],
  },
  the_smith: {
    ...KAEL,
    title: 'The Forge Is Cold',
    lines: [
      'Kael Ironwright. My father kept the forge here.',
      "Look, I can hit metal with a hammer. That's about where we're at.",
      'Give me a roof and some coal, and your fighters will have something better than sticks.',
    ],
  },
  word_spreads: {
    ...PYRETH,
    title: 'Word Spreads',
    lines: ["Word of Draconia's stand has reached the villages beyond the hills. People are coming."],
  },
  lean_times: {
    ...PYRETH,
    title: 'Lean Times',
    lines: [
      'The stores ran dry last night. We buried no one, but only by luck.',
      'If it happens again, people will die. Keep the foragers working.',
    ],
    // Fired through the the_keep fallback, without the stores having run dry
    altLines: [
      'Our stores have held so far, but it will not always be so.',
      'If they ever run dry, people will die. Keep the foragers working.',
    ],
  },
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
  the_keep: {
    ...PYRETH,
    title: 'The Keep Restored',
    lines: ['With the Keep restored, the city can tend itself while you rest. I will keep the ledgers.'],
  },
  the_scholar: {
    ...LIRAE,
    title: 'The Ink-Wing',
    lines: [
      "Oh! Sorry, I didn't mean to... is this Draconia? I'm Lirae. I keep records. Kept. Keep.",
      "I don't fight. I remember. And there is so much here worth remembering.",
      'If you give me a library, I can give you everything the old world knew.',
    ],
  },
  the_horde_grows: {
    ...RODAIN,
    title: 'Fifty Became Thirty',
    lines: [
      'My company is spent, Steward. Fifty became thirty.',
      'From here, the wall is yours to keep. Do not let it fall.',
    ],
  },
}

export function getScene(id: string): SceneDef | undefined {
  return SCENES[id as BeatId]
}

/** What Pyreth says over the first offline report once the Keep stands */
export const OFFLINE_FRAMING = {
  speaker: 'Elder Pyreth',
  text: 'While you slept, the Keep kept the ledgers. Here is what the city earned.',
}
