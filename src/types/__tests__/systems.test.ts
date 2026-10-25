import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { isSystemOn, isBuildingRevealed } from '../systems'
import { STORY_BEATS } from '../story'

const withSeen = (...ids: string[]): GameState => ({ ...DEFAULT_GAME_STATE, beatsSeen: ids })

describe('isSystemOn', () => {
  it('keeps slay on even with nothing seen', () => {
    expect(isSystemOn(withSeen(), 'slay')).toBe(true)
  })

  it('keeps every other system off on a fresh state', () => {
    expect(isSystemOn(withSeen(), 'rally')).toBe(false)
    expect(isSystemOn(withSeen(), 'siege')).toBe(false)
    expect(isSystemOn(withSeen(), 'hunger')).toBe(false)
  })

  it('turns a system on only once its beat is seen', () => {
    expect(isSystemOn(withSeen('prologue'), 'rally')).toBe(false)
    expect(isSystemOn(withSeen('prologue', 'call_to_arms'), 'rally')).toBe(true)
  })

  it('lets one beat unlock several systems', () => {
    const s = withSeen('empty_stores')
    expect(isSystemOn(s, 'hunger')).toBe(true)
    expect(isSystemOn(s, 'forageTab')).toBe(true)
    expect(isSystemOn(s, 'starvation')).toBe(false)
  })

  it('tolerates a state with no beatsSeen (old checkpoint)', () => {
    const s = { ...DEFAULT_GAME_STATE } as Partial<GameState> as GameState
    delete (s as Partial<GameState>).beatsSeen
    expect(isSystemOn(s, 'rally')).toBe(false)
  })

  it('every system id unlocked in the table is reachable by some beat', () => {
    const all = STORY_BEATS.map((b) => b.id)
    const s = withSeen(...all)
    for (const b of STORY_BEATS) for (const id of b.unlocks) expect(isSystemOn(s, id)).toBe(true)
  })
})

describe('isBuildingRevealed', () => {
  it('hides every building until its beat is seen', () => {
    expect(isBuildingRevealed(withSeen(), 'forge')).toBe(false)
    expect(isBuildingRevealed(withSeen('the_smith'), 'forge')).toBe(true)
    expect(isBuildingRevealed(withSeen('the_smith'), 'keep')).toBe(false)
  })

  it('reveals several buildings from one beat', () => {
    const s = withSeen('the_keep_stands')
    expect(isBuildingRevealed(s, 'keep')).toBe(true)
    expect(isBuildingRevealed(s, 'lodge')).toBe(true)
    expect(isBuildingRevealed(s, 'outpost')).toBe(false)
  })

  it('reveals the Librarium from the_scholar, not from inspiration earned', () => {
    const rich = { ...withSeen('the_keep'), totalInspirationEarned: 99999 }
    expect(isBuildingRevealed(rich, 'librarium')).toBe(false)
    expect(isBuildingRevealed(withSeen('the_scholar'), 'librarium')).toBe(true)
  })
})
