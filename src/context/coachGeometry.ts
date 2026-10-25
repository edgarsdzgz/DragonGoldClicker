import type { Rect } from './coachRegistry'

// Pure geometry for the coach overlay (no React, so it can be tested)

/** Visual-only padding around a target inside the dim layer's hole */
export const HOLE_PAD = 6

/** Corner radius of the hole: a circle for round (near-square) targets, else rounded */
export function holeRadius(h: Rect, rounded: number): number {
  return Math.abs(h.w - h.h) < 12 ? h.h / 2 : rounded
}

/** The rectangle grown by `pad` on every side */
export function padRect(r: Rect, pad: number): Rect {
  return { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 }
}

/**
 * Rectangles that cover the whole window except the holes. Used as transparent
 * touch blockers, so a hole passes taps through exactly where the target is.
 */
export function blockerCells(width: number, height: number, holes: Rect[]): Rect[] {
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v))
  const xs = new Set<number>([0, width])
  const ys = new Set<number>([0, height])
  for (const h of holes) {
    xs.add(clamp(h.x, width)); xs.add(clamp(h.x + h.w, width))
    ys.add(clamp(h.y, height)); ys.add(clamp(h.y + h.h, height))
  }
  const xl = [...xs].sort((a, b) => a - b)
  const yl = [...ys].sort((a, b) => a - b)
  const cells: Rect[] = []
  for (let i = 0; i < xl.length - 1; i++) {
    for (let j = 0; j < yl.length - 1; j++) {
      const cell = { x: xl[i], y: yl[j], w: xl[i + 1] - xl[i], h: yl[j + 1] - yl[j] }
      if (cell.w <= 0 || cell.h <= 0) continue
      const cx = cell.x + cell.w / 2
      const cy = cell.y + cell.h / 2
      const inHole = holes.some((h) => cx > h.x && cx < h.x + h.w && cy > h.y && cy < h.y + h.h)
      if (!inHole) cells.push(cell)
    }
  }
  return cells
}
