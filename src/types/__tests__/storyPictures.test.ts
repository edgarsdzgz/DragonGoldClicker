import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { SPRITES, SEAL_BUILD_TIMING } from '../../art/manifest'
import { SCENES, BREACH_SCENES, sceneParts } from '../../data/story/lines'
import type { SceneDef } from '../../data/story/lines'
import { firstAppearances, sceneSting } from '../../data/story/stings'
import { STORY_BEATS } from '../story'
import type { BeatId } from '../story'
import { SPLASH_BEAT_SOUNDS, AMBIENT_MIX, CAST_STINGS, SOUND, beatFrameSounds, arrivalSound, deathSound, clawSound } from '../../data/sounds'
import { MONSTERS } from '../monsterRoster'

const ROOT = join(__dirname, '..', '..', '..')

describe('story pictures', () => {
  // Every speaker's scene, a conversation's later ones included
  const all = [...Object.entries(SCENES).flatMap(([id, s]) => sceneParts(s!).map((p, i) => [`${id} ${i}`, p] as const)), ...BREACH_SCENES.first.map((s, i) => [`breach first ${i}`, s] as const),
    ...BREACH_SCENES.again.map((s, i) => [`breach again ${i}`, s] as const)]

  it("every scene has a picture, and every picture is drawn (130x96)", () => {
    for (const [id, scene] of all) {
      expect([id, scene!.picture !== undefined]).toEqual([id, true])
      expect([id, Object.keys(SPRITES).includes(scene!.picture!)]).toEqual([id, true])
      expect([SPRITES[scene!.picture!].w, SPRITES[scene!.picture!].h]).toEqual([130, 96])
    }
  })

  it("the art brief's pairs", () => {
    expect(SCENES.call_to_arms?.picture).toBe('story_wall-holds')
    expect(SCENES.the_breach?.picture).toBe('story_wall-shakes')
    expect(SCENES.the_scholar?.picture).toBe('story_ink-wing')
    expect(BREACH_SCENES.first.map((s) => s.picture)).toEqual(['story_breach', 'story_ancient-magic'])
    expect(BREACH_SCENES.again.map((s) => s.picture)).toEqual(['story_breach', 'story_ancient-magic'])
  })

  it('all twenty-four pictures are used', () => {
    const used = new Set(all.map(([, s]) => s!.picture))
    const drawn = Object.keys(SPRITES).filter((k) => k.startsWith('story_'))
    expect([...used].sort()).toEqual(drawn.sort())
    expect(drawn).toHaveLength(24)
  })
})

describe('character stings', () => {
  const scene = (who: SceneDef['who'], stage?: SceneDef['stage']): SceneDef => ({ speaker: who, who, icon: 'person', title: who, lines: ['.'], stage })
  const order: BeatId[] = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms']

  it('a character first appears in the first scene, in story order, that has them on stage', () => {
    const scenes = { prologue: scene('pyreth'), elder_approaches: scene('sera', ['sera', 'pyreth']), first_renown: scene('sera'), call_to_arms: scene('pyreth', ['pyreth', 'thornwick']) }
    expect(firstAppearances('prologue', order, scenes)).toEqual(['pyreth'])
    expect(firstAppearances('elder_approaches', order, scenes)).toEqual(['sera'])
    expect(firstAppearances('first_renown', order, scenes)).toEqual([])
    expect(firstAppearances('call_to_arms', order, scenes)).toEqual(['thornwick'])
    expect(sceneSting('elder_approaches', order, scenes)).toBe(CAST_STINGS.sera)
    expect(sceneSting('first_renown', order, scenes)).toBeUndefined()
    expect(sceneSting('call_to_arms', order, scenes)).toBe(CAST_STINGS.thornwick)
    // Pyreth has no sting
    expect(sceneSting('prologue', order, scenes)).toBeUndefined()
  })

  it('Sera, Thornwick and the Hollow Knight have stings, each heard in their first chapter and no other', () => {
    expect(Object.keys(CAST_STINGS).sort()).toEqual(['hollow-knight', 'sera', 'thornwick'])
    const stung: Partial<Record<BeatId, unknown>> = {
      she_did_not_ask: CAST_STINGS.sera, the_exile: CAST_STINGS.thornwick, hollow_knight: CAST_STINGS['hollow-knight'],
    }
    for (const b of STORY_BEATS) expect([b.id, sceneSting(b.id)]).toEqual([b.id, stung[b.id]])
    expect(firstAppearances('elder_approaches')).toEqual(['pyreth'])
    // A conversation's later speaker counts as on stage
    expect(firstAppearances('small_wings')).toEqual(['varn'])
    expect(firstAppearances('the_eldest')).toEqual(['ashara'])
  })
})

describe('the sounds', () => {
  it('every splash beat sound is on a beat of the seal, in order', () => {
    const beats = SEAL_BUILD_TIMING.beats as Record<string, number>
    for (const name of Object.keys(SPLASH_BEAT_SOUNDS)) expect([name, beats[name] !== undefined]).toEqual([name, true])
    const frames = Object.keys(beatFrameSounds(beats)).map(Number)
    expect(frames).toHaveLength(Object.keys(SPLASH_BEAT_SOUNDS).length)
    expect(frames).toEqual([...frames].sort((a, b) => a - b))
    expect(beatFrameSounds(beats)[beats.smash]).toBe(SPLASH_BEAT_SOUNDS.smash)
  })

  it("a boss is announced by the war horn and falls to Draconia's horn; the rest walk up and die plainly", () => {
    expect(arrivalSound('boss')).toBe('bossArrives')
    expect(arrivalSound('miniboss')).toBe('minibossArrives')
    expect(arrivalSound('elite')).toBe('walkUp')
    expect(arrivalSound(undefined)).toBe('walkUp')
    expect(deathSound('boss')).toBe('bossFalls')
    expect(deathSound('miniboss')).toBe('bossFalls')
    expect(deathSound('elite')).toBe('monsterDeath')
    expect(deathSound(undefined)).toBe('monsterDeath')
    // Every boss and mini-boss in the roster gets them
    const bosses = MONSTERS.filter((m) => m.rank === 'boss' || m.rank === 'miniboss')
    expect(bosses.length).toBeGreaterThan(0)
    for (const m of bosses) expect([m.id, arrivalSound(m.rank) !== 'walkUp', deathSound(m.rank)]).toEqual([m.id, true, 'bossFalls'])
  })

  it('the claws: reforging has its own sound', () => {
    expect(clawSound(false)).toBe('clawSharpen')
    expect(clawSound(true)).toBe('clawReforge')
    for (const id of ['bossArrives', 'minibossArrives', 'bossFalls', 'varnBreath', 'clawSharpen', 'clawReforge'] as const) {
      expect(SOUND[id]).toBeDefined()
    }
  })

  it('the night wind sits well under the other loops (it is mastered loud)', () => {
    const others = Object.entries(AMBIENT_MIX).filter(([k]) => k !== 'nightWind').map(([, v]) => v)
    expect(AMBIENT_MIX.nightWind).toBeLessThan(Math.min(...others) / 2)
    for (const v of Object.values(AMBIENT_MIX)) expect(v).toBeLessThanOrEqual(1)
  })

  it('every locked sound is wired, except splash_full (the beats are used instead)', () => {
    const files = readdirSync(join(ROOT, 'assets', 'sound')).filter((f) => f.endsWith('.m4a'))
    expect(files).toHaveLength(47)
    const source = readFileSync(join(ROOT, 'src', 'data', 'sounds.ts'), 'utf8')
    const missing = files.filter((f) => !source.includes(`assets/sound/${f}`))
    expect(missing).toEqual(['splash_full.m4a'])
  })
})
