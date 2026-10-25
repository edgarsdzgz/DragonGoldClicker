import React from 'react'
import { ObjectiveStrip } from '../../components/ObjectiveStrip'
import { CityHpMeter } from '../../components/CityHpMeter'
import { useGame } from '../../context/GameContext'
import { getCurrentObjective } from '../../types/objectives'
import { MAX_CITY_HP, isSystemOn } from '../../types/game'

/**
 * The line(s) under the top bar: the objective and, once the siege begins, the city's HP.
 * When both show they share one compact row instead of stacking.
 */
export function WarfrontStatus() {
  const { state, threatLevel, defenseLevel } = useGame()
  const objective = getCurrentObjective(state)
  const siege = isSystemOn(state, 'siege')

  const hp = (compact: boolean) => (
    <CityHpMeter hp={state.cityHp} max={MAX_CITY_HP} threat={threatLevel} defense={defenseLevel} compact={compact} />
  )

  if (objective && siege) return <ObjectiveStrip {...objective} right={hp(true)} />
  if (objective) return <ObjectiveStrip {...objective} />
  if (siege) return hp(false)
  return null
}
