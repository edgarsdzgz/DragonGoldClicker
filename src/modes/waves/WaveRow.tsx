import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../components/Text'
import { useGame } from '../../context/GameContext'
import { waveView } from './waveStrike'
import { colors, spacing, gold } from '../../theme'

/** "WAVE 3" on the left, "4 kobolds left" on the right. One line. */
export function WaveRow() {
  const { state } = useGame()
  const wave = waveView(state)
  // Between waves the row says the horde is ready instead of counting monsters
  const status = state.waveActive ? wave.leftText : 'Ready'
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Wave ${wave.waveNumber}, ${status}`}
    >
      <View style={styles.title}>
        <Ionicons name="flag" size={12} color={gold[400]} />
        <Text variant="caption" style={styles.wave}>{`WAVE ${wave.waveNumber}`}</Text>
      </View>
      <Text variant="caption" style={styles.left}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    paddingHorizontal: spacing[4],
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  wave: {
    color: gold[400],
    letterSpacing: 1,
    fontWeight: '700',
  },
  left: {
    color: colors.text.secondary,
  },
})
