import type { SpriteId } from './manifest'

/**
 * The granary for the food stores: empty only when the food is out (the same moment the readout
 * turns red), full from two thirds of what it holds, half in between.
 */
export function granarySprite(food: number, cap: number): SpriteId {
  if (food <= 0) return 'evt_granary_0'
  if (food * 3 >= cap * 2) return 'evt_granary_100'
  return 'evt_granary_50'
}
