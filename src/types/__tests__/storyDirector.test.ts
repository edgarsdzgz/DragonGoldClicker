import { DEFAULT_GAME_STATE } from '../state'
import { setStoryPauseForTests } from '../story'
import type { GameState } from '../state'
import { findNextBeat, effectiveDwell } from '../storyDirector'
import { getBeat } from '../story'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

// These suites exercise the whole story, so lift the pause for them
beforeAll(() => setStoryPauseForTests('the_horde_grows'))
afterAll(() => setStoryPauseForTests())

// Everything up to mend_the_walls seen and the repairers in place: empty_stores (dwell 180) is next
const DWELL_BASE = {
  beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls'],
  repairers: 3,
  lastBeatAtPlaySec: 0,
}

describe('effectiveDwell', () => {
  it('caps dwell at 5 seconds in test pacing and keeps it in live', () => {
    const stores = getBeat('empty_stores')!
    expect(effectiveDwell(stores, 'test')).toBe(5)
    expect(effectiveDwell(stores, 'live')).toBe(180)
    expect(effectiveDwell(getBeat('call_to_arms')!, 'live')).toBe(0)
    expect(effectiveDwell(getBeat('prologue')!, 'test')).toBe(0)
  })
})

describe('findNextBeat', () => {
  it('fires the prologue immediately on a fresh state', () => {
    expect(findNextBeat(make({}), 'live')?.id).toBe('prologue')
  })

  it('returns null when the trigger has not passed', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], playSeconds: 100, inspiration: 0 })
    expect(findNextBeat(s, 'live')).toBeNull()
  })

  it('waits for the live dwell, then fires', () => {
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 179 }), 'live')).toBeNull()
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 180 }), 'live')?.id).toBe('empty_stores')
  })

  it('uses the capped dwell in test pacing', () => {
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 4 }), 'test')).toBeNull()
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 5 }), 'test')?.id).toBe('empty_stores')
  })

  it('measures dwell from the last beat, not from zero', () => {
    const s = make({ ...DWELL_BASE, playSeconds: 110, lastBeatAtPlaySec: 100 })
    expect(findNextBeat(s, 'live')).toBeNull()
  })

  it('never skips an unseen earlier beat', () => {
    // Trigger of the_breach passes, but call_to_arms is unseen: it must come first
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], monstersDefeated: 13, fighters: 5, playSeconds: 1000 })
    expect(findNextBeat(s, 'live')?.id).toBe('call_to_arms')
  })

  it('never jumps ahead when the next beat trigger fails', () => {
    // empty_stores would pass (repairers >= 3), but the_breach is next and its trigger fails
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'], fighters: 0, repairers: 3, playSeconds: 1000 })
    expect(findNextBeat(s, 'live')).toBeNull()
  })

  it('fires a side beat out of order when its own trigger passes', () => {
    const s = make({
      beatsSeen: ['prologue', 'elder_approaches'],
      totalInspirationEarned: 30,
      inspiration: 0,
      playSeconds: 0,
      lastBeatAtPlaySec: 0,
    })
    expect(findNextBeat(s, 'live')?.id).toBe('word_spreads')
  })

  it('prefers the next main beat over a side beat when both are ready', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], monstersDefeated: 1, totalInspirationEarned: 30, inspiration: 5, playSeconds: 100 })
    expect(findNextBeat(s, 'live')?.id).toBe('first_renown')
  })

  it('does not wait for a side beat that has not triggered', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'], fighters: 2, playSeconds: 200, lastBeatAtPlaySec: 0 })
    expect(findNextBeat(s, 'live')?.id).toBe('the_breach')
  })

  it('fires lean_times only when hunger is on and food is empty', () => {
    const base = { beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls'], playSeconds: 1000 }
    expect(findNextBeat(make({ ...base, food: 0 }), 'live')).toBeNull()
    const hungry = make({ ...base, beatsSeen: [...base.beatsSeen, 'empty_stores'], food: 0, foragers: { gatherers: 0, trappers: 0, rangers: 0 } })
    expect(findNextBeat(hungry, 'live')?.id).toBe('lean_times')
    expect(findNextBeat({ ...hungry, food: 10 }, 'live')).toBeNull()
  })

  it('lets the_keep and the_scholar fire before beyond_the_walls (it is a side beat)', () => {
    const main = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'the_smith', 'the_keep_stands']
    const base = { playSeconds: 99999, draconiaHallBuilt: true, totalInspirationEarned: 0 }
    expect(findNextBeat(make({ ...base, beatsSeen: main }), 'live')?.id).toBe('the_keep')
    expect(findNextBeat(make({ ...base, beatsSeen: [...main, 'the_keep'] }), 'live')?.id).toBe('the_scholar')
  })

  it('fires beyond_the_walls whenever the explorer post is revealed', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], postLevel: 1, playSeconds: 300 })
    expect(findNextBeat(s, 'live')?.id).toBe('beyond_the_walls')
  })

  it('returns null when everything is seen', () => {
    const all = [
      'prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'the_smith', 'the_keep_stands', 'word_spreads', 'lean_times',
      'beyond_the_walls', 'the_keep', 'the_scholar', 'the_horde_grows',
    ]
    expect(findNextBeat(make({ beatsSeen: all, playSeconds: 99999 }), 'live')).toBeNull()
  })
})

describe('first_renown', () => {
  it('fires after the first kill, and call_to_arms still follows it', () => {
    expect(findNextBeat(make({ beatsSeen: ['prologue', 'elder_approaches'], playSeconds: 99 }), 'live')).toBeNull()
    const killed = make({ beatsSeen: ['prologue', 'elder_approaches'], monstersDefeated: 1, playSeconds: 99 })
    expect(findNextBeat(killed, 'live')?.id).toBe('first_renown')
    const twelve = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], monstersDefeated: 12, playSeconds: 99 })
    expect(findNextBeat(twelve, 'live')).toBeNull()
  })

  it('call_to_arms plays at once at the 13th kill, the one that brings the first goblin', () => {
    const seen = ['prologue', 'elder_approaches', 'first_renown']
    const thirteen = make({ beatsSeen: seen, monstersDefeated: 13, playSeconds: 0 })
    expect(findNextBeat(thirteen, 'live')?.id).toBe('call_to_arms')
    expect(findNextBeat({ ...thirteen, monstersDefeated: 12 }, 'live')).toBeNull()
    // The old wave fields play no part any more
    expect(findNextBeat({ ...thirteen, waveActive: true, waveNumber: 0 }, 'live')?.id).toBe('call_to_arms')
  })

  it('a fresh game tapping alone reaches call_to_arms with 3.25 renown, enough for the first Rally', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { strike } = require('../monsters')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getFighterCost } = require('../fighters')
    let s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], playSeconds: 999 })
    let taps = 0
    while (!findNextBeat(s, 'live')) {
      s = strike(s).state
      taps++
    }
    expect(findNextBeat(s, 'live')?.id).toBe('call_to_arms')
    expect(s.monstersDefeated).toBe(13)
    expect(taps).toBe(65)
    expect(s.inspiration).toBeCloseTo(3.25, 2)
    expect(s.inspiration).toBeGreaterThanOrEqual(getFighterCost(0))
  })

  it('the opening is two scenes: prologue, then elder_approaches, then nothing until the player acts', () => {
    expect(getBeat('prologue')?.silent).toBeFalsy()
    expect(getBeat('elder_approaches')?.silent).toBeFalsy()
    expect(findNextBeat(make({}), 'live')?.id).toBe('prologue')
    expect(findNextBeat(make({ beatsSeen: ['prologue'] }), 'live')?.id).toBe('elder_approaches')
    expect(findNextBeat(make({ beatsSeen: ['prologue', 'elder_approaches'], playSeconds: 99 }), 'live')).toBeNull()
  })
})
