import { SPRITES } from '../manifest'
import { portraitSprite, sigilSprite } from '../cast'
import { lineMood } from '../../types/cast'
import type { CastId, Mood } from '../../types/cast'
import { SCENES, BREACH_SCENES } from '../../data/story/lines'
import type { SceneDef } from '../../data/story/lines'

const CAST: CastId[] = ['pyreth', 'rodain', 'mirael', 'kael', 'lirae', 'varn', 'ashara', 'thornwick', 'sera', 'hollow-knight', 'gate']
const MOODS: Mood[] = ['grieving', 'alarmed', 'angry', 'fierce', 'startled', 'roaring']

describe('the cast art', () => {
  it('has a portrait for everyone, in every mood (the neutral bust when a face is missing)', () => {
    for (const who of CAST) {
      expect(SPRITES[portraitSprite(who)]).toBeDefined()
      for (const mood of MOODS) expect(SPRITES[portraitSprite(who, mood)]).toBeDefined()
    }
  })

  it('shows the face asked for when the character has it', () => {
    expect(portraitSprite('rodain', 'grieving')).toBe('bust_rodain_grieving')
    expect(portraitSprite('mirael', 'alarmed')).toBe('bust_mirael_alarmed')
    // Mirael has no grieving face: the neutral bust
    expect(portraitSprite('mirael', 'grieving')).toBe('bust_mirael')
    expect(portraitSprite('gate', 'grieving')).toBe('cast_emblem-gate')
  })

  it('has a sigil for everyone but the Gate', () => {
    for (const who of CAST) {
      const sigil = sigilSprite(who)
      if (who === 'gate') expect(sigil).toBeNull()
      else expect(SPRITES[sigil!]).toBeDefined()
    }
  })
})

describe('the speakers in the story', () => {
  const scenes: SceneDef[] = [
    ...Object.values(SCENES).filter((s): s is SceneDef => !!s),
    ...BREACH_SCENES.first,
    ...BREACH_SCENES.again,
  ]

  it('names a cast member for every scene, and only faces that exist', () => {
    for (const scene of scenes) {
      expect(CAST).toContain(scene.who)
      scene.lines.forEach((_, page) => {
        const mood = lineMood(page, scene.mood, scene.lineMoods)
        if (mood) expect(portraitSprite(scene.who, mood)).toMatch(new RegExp(`_${mood}$`))
      })
    }
  })

  it('puts the speaker of a conversation on its stage', () => {
    for (const scene of scenes) {
      if (scene.stage) {
        expect(scene.stage).toContain(scene.who)
        expect(scene.stage[0]).not.toBe(scene.stage[1])
      }
    }
  })

  it('takes a line\'s own mood over the scene\'s', () => {
    expect(lineMood(0, 'grieving', { 0: 'alarmed' })).toBe('alarmed')
    expect(lineMood(1, 'grieving', { 0: 'alarmed' })).toBe('grieving')
    expect(lineMood(1, undefined, { 0: 'alarmed' })).toBeUndefined()
  })
})
