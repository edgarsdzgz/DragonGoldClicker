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
  /** Coach target the scene talks about: it shows through the dim with a box around it */
  highlight?: string
}

const PYRETH = { speaker: 'Elder Pyreth', icon: 'person' } as const
const RODAIN = { speaker: 'Captain Rodain', icon: 'shield' } as const
const MIRAEL = { speaker: 'Scout Mirael', icon: 'compass' } as const
const KAEL = { speaker: 'Kael Ironwright', icon: 'hammer' } as const
const LIRAE = { speaker: 'Lirae the Ink-Wing', icon: 'book' } as const

/** Silent beats (mend_the_walls, the_keep_stands) have no scene and no entry here */
export const SCENES: Partial<Record<BeatId, SceneDef>> = {
  // The owner's opening: narration at the gate, then the elder. The Begin Wave 0 hint carries
  // the last line ("The first wave is coming...").
  prologue: {
    speaker: 'The Gate of Draconia',
    icon: 'flame',
    title: 'The Last Bastion',
    lines: [
      'You are one of the last lines of defense in Draconia.',
      'The lone dragon standing upon its gate. Beyond the walls, the masses of the apocalypse lie camped, seeking to snuff out the last bastion of light.',
    ],
  },
  elder_approaches: {
    ...PYRETH,
    title: 'The Elder Approaches',
    lines: [
      'I have known you your whole life. I believe you have the strength to defend Draconia, but you cannot hold the gate alone.',
      'You must stand up and fight. The renown you earn defending our people may inspire the remaining villagers to stand beside you.',
    ],
  },
  first_renown: {
    ...PYRETH,
    title: 'Renown',
    // Point at the renown figure in the top bar while the elder explains it
    highlight: 'renown',
    lines: [
      'Your victory echoes through Draconia, my lord. Defeating our enemies in battle earns you renown.',
      'The more foes you defeat, the more renown you gain, and the more the people and the elders of Draconia will listen to you.',
    ],
  },
  call_to_arms: {
    ...PYRETH,
    title: 'The Wall Holds',
    lines: [
      'The wall holds, my lord. Four of them lie before the gate, and all of Draconia saw who stood against them.',
      'The people have noticed your bravery. Your renown is now enough to convince a villager to take up arms as a Fighter.',
      'Fighters stand with you at the gate. They strike the same foe you do, slower than you, but they never tire, even while you rest.',
      'You called them to arms, so their victories are yours: every enemy they defeat adds to your renown.',
    ],
  },
  the_breach: {
    ...RODAIN,
    title: 'The Wall Shakes',
    lines: [
      'The stores are full, Steward, and none too soon. The horde has stopped waiting at the Gate.',
      'Captain Rodain, and fifty swords behind me. Where do you want us?',
      'Every monster left standing at the Gate strikes the wall. Kill them fast and they never touch the stone.',
      'Its strength shows above the Gate. My company will hold it for now, but the wall must be mended.',
    ],
    dismissLabel: 'To the Gate',
    navigateTo: 'GameTab',
  },
  sharpen_claws: {
    ...PYRETH,
    title: 'Young Claws',
    lines: [
      'The wall is yours now, my lord, and so is the fight at the Gate.',
      'Forgive an old dragon for saying it: your claws are young. Against orcs, they will not be enough.',
      'Renown buys more than soldiers. Spend it on your claws, and every strike lands harder and earns you more.',
    ],
  },
  the_wall_is_yours: {
    ...RODAIN,
    title: 'The Wall Is Yours',
    lines: [
      'The wall stands mended, Steward. You learn quickly.',
      'My company is spent. We held the stone while you learned to mend it. From here, the wall is yours to keep.',
      'Hear me. If it falls, the horde pours into the streets. Our people will fight, and many will die. The stores will burn.',
      'Draconia will not end. The elders keep an ancient magic for that day, but it is paid for dearly, your renown most of all. Do not let it fall.',
    ],
  },
  empty_stores: {
    ...PYRETH,
    title: 'Our Stores Run Low',
    lines: [
      'The line holds, my lord, but your fighters spend themselves at the gate, and they eat from our stores. The villagers fend for themselves.',
      'Our stores will not last forever. Every time the meal bell rings, the fighters eat, and the stores grow thinner.',
      'The horde is camped before the Gate, but our back is to the valley. A small gate opens onto forest and river the monsters have not found.',
      'Forage there with your own hands. But know the cost: every moment you spend in the valley is a moment you are not defending the Gate.',
      'Bring back 200 food, my lord, and our stores will hold a while longer.',
    ],
    dismissLabel: 'Go to the valley',
    navigateTo: 'ForageTab',
  },
  strangers_at_gate: {
    ...MIRAEL,
    title: 'A Stranger on the Road',
    lines: [
      'A traveler on the east road, alone and half-starved.',
      'Every soul we take in must be fed the day they arrive, and every one is another pair of hands. The choice is yours.',
      'This one I will feed from my own rations. After this, the stores pay.'
    ],
  },
  a_city_to_build: {
    ...PYRETH,
    title: 'A City, Not a Wall',
    lines: [
      'Draconia was a city once, my lord, not only a wall. Let us begin to rebuild it.',
      'Your fighters need a garrison, a place to train into soldiers who strike harder. Start there.',
      'A strong enough army holds the Gate on its own, even while you are in the valley.',
    ],
  },
  the_smith: {
    ...KAEL,
    title: 'The Forge Is Cold',
    lines: [
      'Kael Ironwright. My father kept the forge here.',
      "Look, I can hit metal with a hammer. That's about where we're at.",
      'Give me a roof and some coal, and your soldiers will have something better than sticks.',
      'A sword makes a soldier hit harder. A shield keeps one standing when the wall comes down.',
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
    lines: [
      'With the Keep restored, the city can tend itself while you rest. I will keep the ledgers.',
      'Your army holds the Gate while you are away, if it is strong enough. If it is not, the wall will wear, but the people will not let it fall.',
      'And from the Keep you can move our people to whatever work needs them most.',
    ],
  },
  the_lodge: {
    ...MIRAEL,
    title: "The Ranger's Lodge",
    lines: [
      'Gathering berries will not feed an army, my lord. Your soldiers eat more than your fighters ever did.',
      'Give me a lodge, and I will teach your gatherers to set traps, and the best of them to range the deep valley.',
      'A trapper brings home what two gatherers do and more. A ranger, twice that again.',
    ],
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

/**
 * The Breach (core-tap layer 6, phase B): played when the wall falls, in order, before the loss
 * report. The first Breach gets the full scene; later ones a short one.
 */
export const BREACH_SCENES: { first: SceneDef[]; again: SceneDef[] } = {
  first: [
    {
      ...RODAIN,
      title: 'The Wall Falls',
      lines: [
        'The wall is down! They are in the streets!',
        'Every hand that can hold a blade is fighting: villagers, fighters, menders. We are losing them, Steward.',
      ],
    },
    {
      ...PYRETH,
      title: 'The Ancient Magic',
      lines: [
        'My lord, there is one thing left. The elders keep the ancient magic of Draconia for this hour, and this hour only.',
        'It is woken with what we hold dear: our stores, our standing, and your renown.',
        'The horde breaks before it and flees far down the valley road. They will come again, but weaker, and the people have time to patch the wall.',
      ],
      dismissLabel: 'Count the cost',
    },
  ],
  again: [
    {
      ...RODAIN,
      title: 'The Wall Falls',
      lines: ['The wall is down again! They are in the streets!'],
    },
    {
      ...PYRETH,
      title: 'The Ancient Magic',
      lines: ['Once more the ancient magic answers, my lord, and once more Draconia pays for it.'],
      dismissLabel: 'Count the cost',
    },
  ],
}
