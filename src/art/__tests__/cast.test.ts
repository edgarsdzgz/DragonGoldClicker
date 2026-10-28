import { SPRITES } from '../manifest'
import { portraitSprite, sigilSprite, talkSprite } from '../cast'
import { lineMood, MOODS } from '../../types/cast'
import type { CastId } from '../../types/cast'
import { SCENES, BREACH_SCENES } from '../../data/story/lines'
import type { SceneDef } from '../../data/story/lines'

const CAST: CastId[] = ['pyreth', 'rodain', 'mirael', 'kael', 'lirae', 'varn', 'ashara', 'thornwick', 'sera', 'hollow-knight', 'gate']
const PEOPLE = CAST.filter((who) => who !== 'gate')

describe('the cast art', () => {
  it('gives every character a face of their own for every mood (never the neutral bust as a stand-in)', () => {
    for (const who of PEOPLE) {
      expect(SPRITES[portraitSprite(who)]).toBeDefined()
      for (const mood of MOODS) {
        const id = portraitSprite(who, mood)
        expect(SPRITES[id]).toBeDefined()
        expect(id).not.toBe(`bust_${who}`)
      }
    }
  })

  it('finds the faces locked before the set under their own names', () => {
    expect(portraitSprite('rodain', 'grieving')).toBe('bust_rodain_grieving')
    expect(portraitSprite('varn', 'determined')).toBe('bust_varn_fierce')
    expect(portraitSprite('sera', 'determined')).toBe('bust_sera_roaring')
    expect(portraitSprite('thornwick', 'alarmed')).toBe('bust_thornwick_startled')
    expect(portraitSprite('mirael')).toBe('bust_mirael')
    expect(portraitSprite('gate', 'grieving')).toBe('cast_emblem-gate')
  })

  it('gives every face a talking frame of its own', () => {
    for (const who of PEOPLE) {
      for (const mood of [undefined, ...MOODS]) {
        const face = portraitSprite(who, mood)
        const talking = talkSprite(who, mood)
        expect(talking).toBe(`${face}_talk`)
        expect(SPRITES[talking]).toBeDefined()
      }
    }
    expect(talkSprite('varn', 'determined')).toBe('bust_varn_fierce_talk')
  })

  it('keeps the Gate still: its emblem has no mouth', () => {
    expect(talkSprite('gate', 'alarmed')).toBe('cast_emblem-gate')
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
        if (mood && scene.who !== 'gate') expect(portraitSprite(scene.who, mood)).not.toBe(`bust_${scene.who}`)
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
