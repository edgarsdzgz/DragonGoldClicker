import { DEFAULT_GAME_STATE } from '../../types/state'
import type { GameState } from '../../types/state'
import { stateSoundCue, ARRIVAL_WINDOW_MS } from '../soundCues'
import { GRANARY_CAP } from '../../types/food'
import { HORDE_LEVEL_KILLS } from '../../types/horde'

const SIEGE = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach']
const make = (over: Partial<GameState> = {}): GameState => ({ ...DEFAULT_GAME_STATE, beatsSeen: SIEGE, cityHp: 100, ...over })
const cue = (prev: Partial<GameState>, next: Partial<GameState>) => {
  const p = make(prev)
  return stateSoundCue(p, { ...p, ...next })
}

describe('the sound a change in the game earns', () => {
  it('nothing changed, nothing plays', () => {
    const s = make()
    expect(stateSoundCue(s, s)).toBeNull()
    expect(cue({}, { food: 12 })).toBeNull()
  })

  it('a new game or a loaded save earns nothing, whatever it holds', () => {
    expect(cue({ breaches: 0 }, { breaches: 3, startedAt: 99 })).toBeNull()
  })

  it('the Warfront: a Breach, the Unmaking rising, the gate cracking', () => {
    expect(cue({}, { breaches: 1, cityHp: 0 })).toBe('breach')
    expect(cue({ cityHp: 20 }, { breaches: 1, cityHp: 0 })).toBe('breach')
    expect(cue({ hordeKills: 4 * HORDE_LEVEL_KILLS - 1 }, { hordeKills: 4 * HORDE_LEVEL_KILLS })).toBe('unmakingRise')
    expect(cue({ hordeKills: 9 * HORDE_LEVEL_KILLS - 1 }, { hordeKills: 9 * HORDE_LEVEL_KILLS })).toBe('unmakingRise')
    expect(cue({ cityHp: 70 }, { cityHp: 60 })).toBe('gateCrack')
    expect(cue({ cityHp: 40 }, { cityHp: 30 })).toBe('gateCrack')
  })

  it('the gate cracks only when it gets worse, and only once the siege is on', () => {
    expect(cue({ cityHp: 60 }, { cityHp: 50 })).toBeNull()
    expect(cue({ cityHp: 30 }, { cityHp: 70 })).toBeNull()
    expect(cue({ cityHp: 70, beatsSeen: [] }, { cityHp: 60 })).toBeNull()
  })

  it('a Breach pushing the horde back is not the Unmaking rising', () => {
    expect(cue({ hordeKills: 10 * HORDE_LEVEL_KILLS }, { hordeKills: 2 * HORDE_LEVEL_KILLS })).toBeNull()
  })

  it('the city: a building, a study, an expedition out, and brought home with a find', () => {
    expect(cue({}, { barracksLevel: 1 })).toBe('buildComplete')
    expect(cue({}, { draconiaHallBuilt: true })).toBe('buildComplete')
    expect(cue({}, { offlineLevel: 1 })).toBe('buildComplete')
    expect(cue({}, { completedResearch: ['mortar_craft'] })).toBe('researchDone')
    const out = { id: 1, startedAt: 0, duration: 60 } as GameState['activeExpeditions'][number]
    expect(cue({}, { activeExpeditions: [out] })).toBe('expeditionOut')
    expect(cue({}, { expeditionReport: { expeditionId: 1, villagersFound: 2 } })).toBe('find')
    // Bringing home a trip that found nobody: it was heard getting home
    expect(cue({}, { expeditionReport: { expeditionId: 1, villagersFound: 0 } })).toBeNull()
    // The report being read and closed is not another return, nor is it while it waits to be read
    const waiting = { expeditionId: 1, villagersFound: 0 }
    expect(cue({ expeditionReport: waiting }, { expeditionReport: null })).toBeNull()
    expect(cue({ expeditionReport: waiting }, { food: 30 })).toBeNull()
    expect(cue({ expeditionReport: { expeditionId: 1, villagersFound: 2 } }, { food: 30 })).toBeNull()
  })

  it('a trip is heard the moment it gets home, while the game is open, once', () => {
    // Sent at 0 for 60 seconds: home at 60 000 ms
    const trip = { id: 1, startedAt: 0, duration: 60 } as GameState['activeExpeditions'][number]
    const s = make({ activeExpeditions: [trip] })
    const tick = { ...s, playSeconds: s.playSeconds + 1 }
    expect(stateSoundCue(s, tick, { since: 59_500, now: 60_500 })).toBe('expeditionBack')
    expect(stateSoundCue(s, tick, { since: 59_000, now: 60_000 })).toBe('expeditionBack')
    // Still on the road, or home and waiting to be brought in
    expect(stateSoundCue(s, tick, { since: 58_000, now: 59_000 })).toBeNull()
    expect(stateSoundCue(s, tick, { since: 60_500, now: 61_500 })).toBeNull()
    // Home while the game was closed: the Outpost's badge tells it, not a sound
    expect(stateSoundCue(s, tick, { since: 60_000 - ARRIVAL_WINDOW_MS - 1000, now: 60_500 })).toBeNull()
    expect(stateSoundCue(s, tick, { since: 60_000 - ARRIVAL_WINDOW_MS, now: 60_000 })).toBe('expeditionBack')
    // No clock, no trip heard
    expect(stateSoundCue(s, tick)).toBeNull()
  })

  it('the city brightens at the Keep and again at the Librarium', () => {
    expect(cue({ beatsSeen: SIEGE }, { beatsSeen: [...SIEGE, 'the_keep'] })).toBe('cityBrightens')
    expect(cue({ beatsSeen: [...SIEGE, 'the_keep'] }, { beatsSeen: [...SIEGE, 'the_keep', 'the_lodge'] })).toBeNull()
    expect(cue({ beatsSeen: [...SIEGE, 'the_keep'] }, { beatsSeen: [...SIEGE, 'the_keep', 'the_scholar'] })).toBe('cityBrightens')
  })

  it('forage: a raid at the gate, the granary filling', () => {
    expect(cue({ foodEvent: { id: 'raid', phase: 'warned', until: 10 } }, { foodEvent: { id: 'raid', phase: 'active', until: 40 } })).toBe('foodRaid')
    expect(cue({}, { foodEvent: { id: 'raid', phase: 'warned', until: 10 } })).toBeNull()
    expect(cue({ foodEvent: { id: 'lean_season', phase: 'warned', until: 10 } }, { foodEvent: { id: 'lean_season', phase: 'active', until: 40 } })).toBeNull()
    expect(cue({ food: GRANARY_CAP - 1 }, { food: GRANARY_CAP })).toBe('granaryFull')
    expect(cue({ food: GRANARY_CAP }, { food: GRANARY_CAP })).toBeNull()
  })

  it('a quest done is the fanfare; Rally and Repair have their own', () => {
    expect(cue({}, { questsDone: ['defend_the_wall'] })).toBe('fanfare')
    expect(cue({}, { fightersRallied: 1, fighters: 1 })).toBe('rally')
    expect(cue({}, { repairersDirected: 1, repairers: 1 })).toBe('mend')
  })

  it('one sound per change, the most important: a time-away catch-up does not pile them up', () => {
    expect(cue({}, { breaches: 1, questsDone: ['x'], barracksLevel: 1, completedResearch: ['y'] })).toBe('breach')
    expect(cue({ cityHp: 70 }, { cityHp: 60, questsDone: ['x'] })).toBe('gateCrack')
    expect(cue({}, { questsDone: ['x'], fightersRallied: 1 })).toBe('fanfare')
    expect(cue({}, { barracksLevel: 1, completedResearch: ['y'], food: GRANARY_CAP })).toBe('buildComplete')
  })
})
