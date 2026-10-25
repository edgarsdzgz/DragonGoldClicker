// Where each coach target is on screen. Plain TypeScript (no React) so it can be tested.

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface CoachTargetEntry {
  /** Reports the target's rectangle in window coordinates, or null if it cannot be measured */
  measure: (cb: (rect: Rect | null) => void) => void
  /** Optional: bring the target on screen (e.g. scroll a list) */
  scrollIntoView?: (rect: Rect) => void
}

export class CoachRegistry {
  private entries = new Map<string, CoachTargetEntry>()
  private listeners = new Set<() => void>()

  register(id: string, entry: CoachTargetEntry): () => void {
    this.entries.set(id, entry)
    this.notify()
    return () => {
      if (this.entries.get(id) === entry) this.entries.delete(id)
      this.notify()
    }
  }

  get(id: string): CoachTargetEntry | undefined {
    return this.entries.get(id)
  }

  /** Called when any target registers, unregisters or lays out again */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  notify() {
    this.listeners.forEach((fn) => fn())
  }

  /** The target's rectangle, or null while it is not registered / not measurable */
  measure(id: string, cb: (rect: Rect | null) => void) {
    const entry = this.entries.get(id)
    if (!entry) return cb(null)
    entry.measure(cb)
  }
}

/** A rectangle counts as visible when it has size and lies inside the window */
export function isRectVisible(r: Rect | null, win: { width: number; height: number }): r is Rect {
  if (!r || r.w <= 0 || r.h <= 0) return false
  return r.x >= -1 && r.y >= -1 && r.x + r.w <= win.width + 1 && r.y + r.h <= win.height + 1
}

/** Which side of the target the hint bubble goes on, so it stays on screen */
export function hintSide(r: Rect, windowHeight: number): 'above' | 'below' {
  return r.y + r.h / 2 < windowHeight * 0.55 ? 'below' : 'above'
}
