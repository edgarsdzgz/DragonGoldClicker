/** One effect in PixelBurst's small pool; `key` tells a replaced effect from the one now in its slot */
export interface BurstSlot<T> {
  key: number
  value: T
}

/** The pool with slot `i` now playing `slot` */
export function placeBurst<T>(slots: (BurstSlot<T> | null)[], i: number, slot: BurstSlot<T>): (BurstSlot<T> | null)[] {
  return slots.map((s, j) => (j === i ? slot : s))
}

/**
 * The pool with slot `i` cleared, if it still holds effect `key`. When a newer effect has taken the
 * slot, the same array comes back, so React skips the render: a stall that fires a pile of cleanup
 * timers at once then costs nothing.
 */
export function clearBurst<T>(slots: (BurstSlot<T> | null)[], i: number, key: number): (BurstSlot<T> | null)[] {
  if (slots[i]?.key !== key) return slots
  return slots.map((s, j) => (j === i ? null : s))
}
