import { acceptTap, MIN_TAP_GAP_MS } from '../tapBacklog'

// React 19 throws "Maximum update depth exceeded" once more than 50 urgent updates chain together
const REACT_NESTED_LIMIT = 50

/** How many of these tap times act */
function accepted(times: number[]): number {
  let last: number | null = null
  let count = 0
  for (const t of times) {
    if (acceptTap(t, last)) {
      last = t
      count++
    }
  }
  return count
}

describe('Tap backlog: queued touches after a stall', () => {
  it('lets every tap through at a fast human pace (12 a second)', () => {
    const times = Array.from({ length: 100 }, (_, n) => 1000 + n * 83)
    expect(accepted(times)).toBe(100)
  })

  it('a backlog of 100 touches handed over within a few ms acts once, far below the React limit', () => {
    // A 20-second freeze while the player taps 5 times a second: 100 touches, about 0.1 ms apart
    const times = Array.from({ length: 100 }, (_, n) => 5000 + n * 0.1)
    expect(accepted(times)).toBe(1)
    expect(accepted(times)).toBeLessThan(REACT_NESTED_LIMIT)
  })

  it('takes the first tap, and one exactly the minimum gap later', () => {
    expect(acceptTap(0, null)).toBe(true)
    expect(acceptTap(MIN_TAP_GAP_MS, 0)).toBe(true)
    expect(acceptTap(MIN_TAP_GAP_MS - 1, 0)).toBe(false)
  })

  it('a clock that went backward never locks taps out', () => {
    expect(acceptTap(100, 5000)).toBe(true)
  })
})
