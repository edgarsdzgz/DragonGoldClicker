import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Badge } from '../../components'
import { useGame } from '../../context/GameContext'
import { getTotalSoldiers, getTotalForagers, isSystemOn } from '../../types/game'
import { colors, spacing, gold } from '../../theme'

const plural = (n: number, word: string) => `${n} ${word}${n !== 1 ? 's' : ''}`

/** Icon and number only, so the whole row stays on one line; the label says it in words */
function Chip({ icon, color, count, noun, suffix = '', textColor }: {
  icon: React.ComponentProps<typeof Badge>['icon']
  color: string
  count: number
  noun: string
  suffix?: string
  textColor?: string
}) {
  if (count <= 0) return null
  return (
    <View accessible accessibilityLabel={`${plural(count, noun)}${suffix}`}>
      <Badge icon={icon} color={color}>
        <Text variant="caption" style={{ color: textColor ?? color }}>{count}</Text>
      </Badge>
    </View>
  )
}

/** Who lives in Draconia, plus at most one food warning (the most serious). */
export function PopulationChips() {
  const { state } = useGame()
  const hungerOn = isSystemOn(state, 'hunger')
  const soldiers = getTotalSoldiers(state.soldiers)
  const foragers = getTotalForagers(state.foragers)
  const foodOut = hungerOn && state.food === 0

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <Chip icon="home" color={gold[500]} count={state.villagers} noun="villager" textColor={colors.text.secondary} />
        <Chip icon="shield" color={colors.warfront.rally} count={state.fighters} noun="fighter" />
        <Chip icon="construct" color={colors.warfront.repair} count={state.repairers} noun="repairer" />
        <Chip icon="people" color={gold[300]} count={soldiers} noun="soldier" suffix={foodOut ? ' (idle)' : ' fighting'} />
        <Chip icon="leaf" color={colors.status.success} count={foragers} noun="forager" />
      </View>
      {foodOut && (state.fighters > 0 || soldiers > 0) ? (
        <Badge icon="warning" color={colors.status.error} style={styles.warning}>
          <Text variant="caption" style={{ color: colors.status.error }}>No food! Fighters refuse to fight.</Text>
        </Badge>
      ) : foodOut && state.villagers > 0 ? (
        <Badge icon="warning" color={colors.status.warning} style={styles.warning}>
          <Text variant="caption" style={{ color: colors.status.warning }}>Villagers are starving!</Text>
        </Badge>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    paddingTop: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  warning: {
    marginTop: spacing[1],
  },
})
