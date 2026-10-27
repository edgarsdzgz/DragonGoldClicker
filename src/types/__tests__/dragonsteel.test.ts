import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import {
  MAX_CLAW_LEVEL, REFORGE_DAMAGE, REFORGE_BASE_COST, REFORGE_COST_GROWTH,
  clawDef, nextClaw, canSharpen, canReforge, sharpenClaws, tapDamageNow,
} from '../claws'
import { getBeat, STORY_BEATS } from '../story'
import { activeQuests, QUESTS } from '../quests'
import { getScene } from '../../data/story/lines'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const ANCIENT = { clawLevel: MAX_CLAW_LEVEL, tapDamage: 20 }
const KAEL_SEEN = { beatsSeen: ['beyond_the_walls', 'dragonsteel'] }

describe('Dragonsteel: the claws past Ancient', () => {
  it('each reforge adds 5 damage; the price starts at 1,000 and grows 40%', () => {
    expect([REFORGE_DAMAGE, REFORGE_BASE_COST, REFORGE_COST_GROWTH]).toEqual([5, 1000, 1.4])
    expect([1, 2, 3, 5, 10].map((n) => [clawDef(MAX_CLAW_LEVEL + n).damage, clawDef(MAX_CLAW_LEVEL + n).cost])).toEqual([
      [25, 1000], [30, 1400], [35, 1960], [45, 3842], [70, 20661],
    ])
  })

  it('reads "Ancient Claws +n" and keeps counting the level (9 is +1), so saves need no migration', () => {
    expect(clawDef(MAX_CLAW_LEVEL + 3)).toMatchObject({ level: 11, name: 'Ancient Claws +3' })
    expect(clawDef(MAX_CLAW_LEVEL).name).toBe('Ancient Claws')
  })

  it('only after Kael\'s scene', () => {
    const rich = make({ ...ANCIENT, inspiration: 5000 })
    expect(canReforge(rich)).toBe(false)
    expect(canSharpen(rich)).toBe(false)
    expect(sharpenClaws(rich)).toBe(rich)
    expect(nextClaw(MAX_CLAW_LEVEL, canReforge({ ...rich, ...KAEL_SEEN }))?.level).toBe(MAX_CLAW_LEVEL + 1)
  })

  it('a reforge pays its price and sets the tap damage; studies still multiply it', () => {
    const s = sharpenClaws(make({ ...ANCIENT, ...KAEL_SEEN, inspiration: 1500 }))
    expect(s).toMatchObject({ clawLevel: 9, tapDamage: 25, inspiration: 500 })
    expect(canSharpen(s)).toBe(false)
    expect(tapDamageNow({ ...s, completedResearch: ['dragon_anatomy'] })).toBe(27.5)
    const again = sharpenClaws({ ...s, inspiration: 1400 })
    expect(again).toMatchObject({ clawLevel: 10, tapDamage: 30, inspiration: 0 })
  })
})

describe('the story: Dragonsteel', () => {
  it('Kael comes a minute after the claws reach Ancient, once Mirael has spoken', () => {
    const b = getBeat('dragonsteel')!
    expect(b.trigger(make({ clawLevel: MAX_CLAW_LEVEL }))).toBe(false)
    expect(b.trigger(make({ beatsSeen: ['beyond_the_walls'], clawLevel: MAX_CLAW_LEVEL - 1 }))).toBe(false)
    expect(b.trigger(make({ beatsSeen: ['beyond_the_walls'], clawLevel: MAX_CLAW_LEVEL }))).toBe(true)
    expect(b.dwellSec).toBe(60)
    expect(STORY_BEATS[STORY_BEATS.length - 1].id).toBe('dragonsteel')
    expect(getScene('dragonsteel')?.speaker).toMatch(/Kael/)
  })

  it('Reforge the Claws: one reforge', () => {
    const seen = make({ ...ANCIENT, ...KAEL_SEEN })
    expect(activeQuests(seen).map((q) => q.id)).toContain('reforge_the_claws')
    const goal = QUESTS.find((q) => q.id === 'reforge_the_claws')!.goals[0]
    expect(goal.progress(seen)).toBe(0)
    expect(goal.progress({ ...seen, clawLevel: MAX_CLAW_LEVEL + 1 })).toBe(1)
  })
})
