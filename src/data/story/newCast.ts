import type { BeatId } from '../../types/story'
import type { SceneDef } from './lines'
import { PYRETH, MIRAEL, LIRAE, VARN, SERA, THORNWICK, ASHARA, HOLLOW_KNIGHT } from './speakers'

/** Chapters 9 to 13 (approved 2026-10-27, "Lock them in"): every line and face as the owner approved them */
export const NEW_CAST_SCENES: Partial<Record<BeatId, SceneDef>> = {
  small_wings: {
    ...LIRAE,
    title: 'A Small Pair of Wings',
    picture: 'story_small-wings',
    stage: ['lirae', 'varn'],
    lineMoods: { 0: 'alarmed', 1: 'happy' },
    lines: [
      'My lord, someone is circling the Keep. Oh! Oh. Varn? Varn, is that you?',
      'He was a first-year at the Academy. I thought no one else got out.',
    ],
    then: {
      ...VARN,
      title: 'A Small Pair of Wings',
      picture: 'story_small-wings',
      stage: ['lirae', 'varn'],
      lineMoods: { 0: 'happy', 1: 'grieving', 2: 'determined' },
      lines: [
        "Lirae! And you're the dragon on the gate. You're even bigger than the stories.",
        "I hid in the bell tower when the Rift opened. I've been hiding ever since. I'm done hiding.",
        'I want to fight like you. Let me stand on the wall. I can breathe fire. A little.',
      ],
      dismissLabel: 'Welcome him',
    },
  },
  she_did_not_ask: {
    ...SERA,
    title: 'She Did Not Ask',
    picture: 'story_she-did-not-ask',
    lineMoods: { 0: 'determined', 1: 'happy', 2: 'grieving' },
    lines: [
      'Shields up, little ones! Hold that line!',
      "Hah! That's better. So you're the gate-dragon. Sera, of the northern clans.",
      'My clan held the high pass until there was no pass left to hold. I walked south, toward the sound of a fight.',
      "Don't thank me. Give me the front of the wall and a shield that won't split.",
    ],
    dismissLabel: 'To the wall',
  },
  the_exile: {
    ...MIRAEL,
    title: 'The Exile',
    picture: 'story_the-exile',
    stage: ['mirael', 'thornwick'],
    lineMoods: { 0: 'worried' },
    lines: [
      'My lord, the expedition found someone in the eastern ruins. He was setting a monster on fire at the time.',
      'He says he is a mage. He also says the fire was on purpose.',
    ],
    then: {
      ...THORNWICK,
      title: 'The Exile',
      picture: 'story_the-exile',
      stage: ['mirael', 'thornwick'],
      lineMoods: { 0: 'happy', 1: 'alarmed', 2: 'determined' },
      lines: [
        'Thornwick, at your service. Formerly of the eastern towers. They asked me to leave after the third fire.',
        'The first two were not my fault! The third was... a learning experience.',
        'Give me a tower, high up and well away from anything that burns, and I will show that horde what a real fire looks like.',
      ],
      dismissLabel: 'Build the tower',
    },
  },
  the_eldest: {
    ...PYRETH,
    title: 'The Eldest',
    picture: 'story_the-eldest',
    stage: ['pyreth', 'ashara'],
    lineMoods: { 0: 'alarmed', 1: 'happy' },
    lines: [
      'My lord, something vast is coming down from the mountain. No, hold your fire!',
      'Ashara. I thought we had lost you. She is the eldest of us, my lord, older than these walls.',
    ],
    then: {
      ...ASHARA,
      title: 'The Eldest',
      picture: 'story_the-eldest',
      stage: ['pyreth', 'ashara'],
      lineMoods: { 1: 'grieving', 2: 'angry', 3: 'determined' },
      lines: [
        'Pyreth. You got old. And this is the one who holds the gate? Smaller than I pictured.',
        'I slept beneath the mountain while the world came apart. I woke to silence where my kin should be.',
        'I am old. I am tired. And I am very, very angry.',
        'Let them come to the wall. They will learn why the old ones were feared.',
      ],
    },
  },
  hollow_knight: {
    ...HOLLOW_KNIGHT,
    title: 'The Hollow Knight',
    picture: 'story_hollow-knight',
    lineMoods: { 2: 'grieving', 3: 'determined' },
    lines: [
      '...',
      'I have come to stand at your gate.',
      'Do not ask my name. I have none left to give.',
      'Point me at the dark. I will walk into it.',
    ],
  },
}
