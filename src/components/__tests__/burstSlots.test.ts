import { placeBurst, clearBurst } from '../burstSlots'
import type { BurstSlot } from '../burstSlots'

type Pool = (BurstSlot<string> | null)[]

// The pool as PixelBurst runs it: each strike takes the next slot in turn, and its cleanup timer
// later clears that slot by key
function strikeAll(count: number, max = 3) {
  let pool: Pool = Array(max).fill(null)
  const cleanups: { i: number; key: number }[] = []
  for (let key = 1; key <= count; key++) {
    const i = (key - 1) % max
    pool = placeBurst(pool, i, { key, value: `strike ${key}` })
    cleanups.push({ i, key })
  }
  return { pool, cleanups }
}

describe('PixelBurst slots: a burst of strikes after a stall', () => {
  it('keeps the newest strikes in the pool', () => {
    const { pool } = strikeAll(60)
    expect(pool.map((s) => s?.key)).toEqual([58, 59, 60])
  })

  it("a replaced strike's cleanup returns the very same pool, so React skips the render", () => {
    const { pool, cleanups } = strikeAll(60)
    // All 60 cleanup timers fire at once; only the last three still own their slots
    let after = pool
    let changes = 0
    for (const { i, key } of cleanups) {
      const next = clearBurst(after, i, key)
      if (next !== after) changes++
      after = next
    }
    expect(changes).toBe(3)
    expect(after).toEqual([null, null, null])
  })

  it("an old strike's cleanup never cuts short the newer strike in its slot", () => {
    const { pool } = strikeAll(60)
    // Strike 1's timer fires late, after strike 58 took slot 0
    const after = clearBurst(pool, 0, 1)
    expect(after).toBe(pool)
    expect(after[0]?.key).toBe(58)
  })

  it('clears only its own slot', () => {
    const { pool } = strikeAll(3)
    expect(clearBurst(pool, 1, 2).map((s) => s?.key ?? null)).toEqual([1, null, 3])
  })
})
