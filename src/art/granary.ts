import type { SpriteId } from './manifest'

/**
 * The granary for the food stores: empty only when the food is out (the same moment the readout
 * turns red), otherwise how full it is, rounded up to the next quarter (any food at all shows some).
 */
export function granarySprite(food: number, cap: number): SpriteId {
  if (food <= 0) return 'evt_granary_0'
  if (food * 4 <= cap) return 'evt_granary_25'
  if (food * 2 <= cap) return 'evt_granary_50'
  if (food * 4 <= cap * 3) return 'evt_granary_75'
  return 'evt_granary_100'
}
