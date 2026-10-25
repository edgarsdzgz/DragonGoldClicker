import type { GameState } from './state'
import { HP_FLOOR, isSystemOn } from './systems'

/**
 * Apply damage to the city. Until `threatUnfloored` (the_horde_grows), HP cannot drop
 * below HP_FLOOR on any damage path, so game over is impossible. The floor never
 * raises HP: a city already below it simply takes no further damage.
 */
export function applyCityDamage(s: GameState, damage: number): GameState {
  if (damage <= 0) return s
  const floor = isSystemOn(s, 'threatUnfloored') ? 0 : HP_FLOOR
  const next = Math.max(Math.min(s.cityHp, floor), s.cityHp - damage)
  return next === s.cityHp ? s : { ...s, cityHp: next }
}
