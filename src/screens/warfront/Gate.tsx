import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../components/Text'
import { CityHpMeter } from '../../components/CityHpMeter'
import { useGame } from '../../context/GameContext'
import { MAX_CITY_HP, isSystemOn } from '../../types/game'
import { colors, spacing, gold, dark } from '../../theme'

/** The gate at the bottom of the battlefield. Its HP shows only once the siege has begun. */
export function Gate() {
  const { state, threatLevel, defenseLevel } = useGame()
  const siege = isSystemOn(state, 'siege')

  return (
    <View style={styles.root}>
      {siege && <CityHpMeter hp={state.cityHp} max={MAX_CITY_HP} threat={threatLevel} defense={defenseLevel} />}
      <View style={styles.gate} accessible accessibilityLabel={siege ? `Gate, ${Math.round(state.cityHp)} of ${MAX_CITY_HP} health` : 'Gate'}>
        <Ionicons name="log-in" size={14} color={gold[400]} />
        <Text variant="caption" style={styles.label}>GATE</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingTop: spacing[1],
  },
  gate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: 24,
    marginHorizontal: spacing[4],
    marginTop: spacing[1],
    borderTopWidth: 3,
    borderTopColor: gold[600],
    backgroundColor: dark[800],
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: {
    color: colors.text.secondary,
    letterSpacing: 4,
  },
})
