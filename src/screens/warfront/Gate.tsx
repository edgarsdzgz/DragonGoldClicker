import React from 'react'
import { View, StyleSheet } from 'react-native'
import { CityHpMeter } from '../../components/CityHpMeter'
import { useGame } from '../../context/GameContext'
import { MAX_CITY_HP, isSystemOn, hordeLevel } from '../../types/game'
import { wardLeft } from '../../types/breach'
import { gateState } from '../../art'
import { spacing } from '../../theme'

/**
 * The gate row, at the bottom of the battlefield: the wall's HP once the siege has begun. The gate
 * itself is drawn by the Warfront scene, with its wall's top edge at this row's bottom.
 */
export function Gate() {
  const { state } = useGame()
  const siege = isSystemOn(state, 'siege')
  const look = siege ? gateState(state.cityHp, MAX_CITY_HP) : 'sound'

  return (
    <View style={styles.root}>
      {siege && <CityHpMeter hp={state.cityHp} max={MAX_CITY_HP} hordeLevel={hordeLevel(state.hordeKills)} wardSec={wardLeft(state)} />}
      <View style={styles.wallLine} accessible accessibilityLabel={`Gate, ${look}`} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingTop: spacing[1],
  },
  wallLine: {
    height: spacing[1],
  },
})
