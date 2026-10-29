import { countOf, formatCount } from '../state'

describe('counts read as words', () => {
  it('exactly one is singular; none and many are plural ("1 swords" in the playtest)', () => {
    expect(countOf(1, 'sword', 'swords')).toBe('1 sword')
    expect(countOf(0, 'sword', 'swords')).toBe('0 swords')
    expect(countOf(2, 'shield', 'shields')).toBe('2 shields')
  })

  it('people and food are whole numbers ("17.00 idle" in the playtest)', () => {
    expect(formatCount(17)).toBe('17')
    expect(formatCount(339.4)).toBe('339')
  })
})
