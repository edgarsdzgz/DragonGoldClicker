import { DEFAULT_GAME_STATE } from '../state'
import { setStoryPauseForTests } from '../story'
import type { GameState } from '../state'
import { findNextBeat, effectiveDwell } from '../storyDirector'
import { getBeat } from '../story'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

// These suites exercise the whole story, so lift the pause for them
beforeAll(() => setStoryPauseForTests('the_horde_grows'))
afterAll(() => setStoryPauseForTests())

// Everything up to sharpen_claws seen and its quest done: strangers_at_gate (dwell 60) is next
const MAIN_TO_MEND = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach', 'mend_the_walls', 'the_wall_is_yours', 'sharpen_claws']
const DWELL_BASE = {
  beatsSeen: MAIN_TO_MEND,
  questsDone: ['sharpen_your_claws'],
  lastBeatAtPlaySec: 0,
}

describe('effectiveDwell', () => {
  it('caps dwell at 5 seconds in test pacing and keeps it in live', () => {
    const strangers = getBeat('strangers_at_gate')!
    expect(effectiveDwell(strangers, 'test')).toBe(5)
    expect(effectiveDwell(strangers, 'live')).toBe(60)
    expect(effectiveDwell(getBeat('the_breach')!, 'live')).toBe(0)
    expect(effectiveDwell(getBeat('empty_stores')!, 'live')).toBe(0)
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
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 59 }), 'live')).toBeNull()
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 60 }), 'live')?.id).toBe('strangers_at_gate')
  })

  it('uses the capped dwell in test pacing', () => {
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 4 }), 'test')).toBeNull()
    expect(findNextBeat(make({ ...DWELL_BASE, playSeconds: 5 }), 'test')?.id).toBe('strangers_at_gate')
  })

  it('measures dwell from the last beat, not from zero', () => {
    const s = make({ ...DWELL_BASE, playSeconds: 150, lastBeatAtPlaySec: 100 })
    expect(findNextBeat(s, 'live')).toBeNull()
  })

  it('never skips an unseen earlier beat', () => {
    // Trigger of the_breach passes, but call_to_arms is unseen: it must come first
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], questsDone: ['defend_the_wall'], fighters: 5, playSeconds: 1000 })
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
    const s = make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'],
      questsDone: ['fill_the_stores'], foragersTrained: { gatherers: 1, trappers: 0, rangers: 0 },
      playSeconds: 200, lastBeatAtPlaySec: 0,
    })
    expect(findNextBeat(s, 'live')?.id).toBe('the_breach')
  })

  it('the_breach waits for the stores to be filled and the first gatherer trained', () => {
    const base = { beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'], playSeconds: 200 }
    const trained = { gatherers: 1, trappers: 0, rangers: 0 }
    expect(findNextBeat(make({ ...base, foragersTrained: trained }), 'live')).toBeNull()
    expect(findNextBeat(make({ ...base, questsDone: ['fill_the_stores'] }), 'live')).toBeNull()
    expect(findNextBeat(make({ ...base, questsDone: ['fill_the_stores'], foragersTrained: trained }), 'live')?.id).toBe('the_breach')
  })

  it('fires lean_times only when hunger is on and food is empty', () => {
    const base = { beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls'], playSeconds: 1000 }
    expect(findNextBeat(make({ ...base, food: 0 }), 'live')).toBeNull()
    const hungry = make({ ...base, beatsSeen: [...base.beatsSeen, 'empty_stores'], food: 0, foragers: { gatherers: 0, trappers: 0, rangers: 0 } })
    expect(findNextBeat(hungry, 'live')?.id).toBe('lean_times')
    expect(findNextBeat({ ...hungry, food: 10 }, 'live')).toBeNull()
  })

  it('the_keep follows Restore the Keep, then the_lodge and the_scholar, before beyond_the_walls (a side beat)', () => {
    const main = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'the_wall_is_yours', 'sharpen_claws', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'the_smith', 'the_keep_stands']
    const base = { playSeconds: 99999, draconiaHallBuilt: true, totalInspirationEarned: 0 }
    expect(findNextBeat(make({ ...base, beatsSeen: main }), 'live')?.id).not.toBe('the_keep')
    expect(findNextBeat(make({ ...base, beatsSeen: main, questsDone: ['restore_the_keep'] }), 'live')?.id).toBe('the_keep')
    expect(findNextBeat(make({ ...base, beatsSeen: [...main, 'the_keep'] }), 'live')?.id).toBe('the_lodge')
    expect(findNextBeat(make({ ...base, beatsSeen: [...main, 'the_keep', 'the_lodge'] }), 'live')?.id).toBe('the_scholar')
  })

  it('fires beyond_the_walls whenever the explorer post is revealed', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], postLevel: 1, playSeconds: 300 })
    expect(findNextBeat(s, 'live')?.id).toBe('beyond_the_walls')
  })

  it('returns null when everything is seen', () => {
    const all = [
      'prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'the_smith', 'the_keep_stands', 'the_keep', 'the_lodge', 'word_spreads', 'lean_times',
      'beyond_the_walls', 'the_scholar', 'the_horde_grows',
    ]
    expect(findNextBeat(make({ beatsSeen: all, playSeconds: 99999 }), 'live')).toBeNull()
  })
})

describe('first_renown', () => {
  it('fires after the first kill, and call_to_arms still follows it', () => {
    expect(findNextBeat(make({ beatsSeen: ['prologue', 'elder_approaches'], playSeconds: 99 }), 'live')).toBeNull()
    const killed = make({ beatsSeen: ['prologue', 'elder_approaches'], monstersDefeated: 1, playSeconds: 99 })
    expect(findNextBeat(killed, 'live')?.id).toBe('first_renown')
    const three = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], monstersDefeated: 3, playSeconds: 99 })
    expect(findNextBeat(three, 'live')).toBeNull()
  })

  it('call_to_arms plays at once when the Defend the Wall quest is done, not before', () => {
    const seen = ['prologue', 'elder_approaches', 'first_renown']
    const done = make({ beatsSeen: seen, monstersDefeated: 4, questsDone: ['defend_the_wall'], playSeconds: 0 })
    expect(findNextBeat(done, 'live')?.id).toBe('call_to_arms')
    // Kills alone do not trigger it: the quest completing does
    expect(findNextBeat({ ...done, questsDone: [] }, 'live')).toBeNull()
  })

  it('a fresh game tapping alone reaches call_to_arms after four kobolds, with exactly the first Rally', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { strike } = require('../monsters')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getFighterCost } = require('../fighters')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { completeQuests } = require('../quests')
    let s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], playSeconds: 999 })
    let taps = 0
    while (!findNextBeat(s, 'live')) {
      // The game completes quests as soon as their goal is met
      s = completeQuests(strike(s).state).state
      taps++
    }
    expect(findNextBeat(s, 'live')?.id).toBe('call_to_arms')
    expect(s.monstersDefeated).toBe(4)
    expect(taps).toBe(20)
    expect(s.inspiration).toBe(1)
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

describe('food before the Breach', () => {
  it('empty_stores plays at once when Hold the Line is done, and not before', () => {
    const seen = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms']
    const ready = make({ beatsSeen: seen, questsDone: ['defend_the_wall', 'raise_the_guard', 'hold_the_line'], fighters: 5, playSeconds: 0 })
    expect(findNextBeat(ready, 'live')?.id).toBe('empty_stores')
    expect(findNextBeat({ ...ready, questsDone: ['defend_the_wall', 'raise_the_guard'] }, 'live')).toBeNull()
  })

  it('the Breach never comes before the food scene', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'], fighters: 5, playSeconds: 9999 })
    expect(findNextBeat(s, 'live')).toBeNull()
  })
})
