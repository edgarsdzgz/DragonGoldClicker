import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'

// =============================================================================
// PIXEL ART RULES: whole-number scale, nearest-neighbor, never smoothing
// =============================================================================

/**
 * Display points per art pixel. Snapped so one art pixel covers a whole number of screen
 * pixels (the A16's 2.625 ratio would otherwise draw columns 10 and 11 pixels wide). Never
 * less than one screen pixel.
 */
export function snapScale(scale: number, pixelRatio: number): number {
  return Math.max(1, Math.round(scale * pixelRatio)) / pixelRatio
}

/** The box a sprite's frame fills, in display points */
export function spriteBox(id: SpriteId, scale: number, pixelRatio: number): { width: number; height: number } {
  const def = SPRITES[id]
  const s = snapScale(scale, pixelRatio)
  return { width: def.w * s, height: def.h * s }
}

/** The frame a strip shows after `ticks` steps; a strip that does not loop holds its last frame */
export function stripFrame(ticks: number, frames: number, loop: boolean): number {
  if (frames <= 1) return 0
  return loop ? ticks % frames : Math.min(ticks, frames - 1)
}

/** How far an icon may spill past its box when rounding up keeps small icons legible */
export const ICON_OVERFLOW = 1.25

/**
 * The snapped scale for `artPx` art pixels in a box of `boxPts` points (icons): the nearest whole
 * number of screen pixels per art pixel, rounded down only if rounding up would spill more than
 * ICON_OVERFLOW past the box.
 */
export function fitScale(boxPts: number, artPx: number, pixelRatio: number): number {
  const exact = (boxPts / artPx) * pixelRatio
  let px = Math.round(exact)
  if ((px * artPx) / pixelRatio > boxPts * ICON_OVERFLOW) px = Math.floor(exact)
  return Math.max(1, px) / pixelRatio
}
