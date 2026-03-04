import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Surface, Button } from '../components'
import { useGame } from '../context/GameContext'
import { colors, spacing } from '../theme'
import { formatNumber } from '../types/game'

export function StatsScreen() {
  const { state, idleIncome, resetGame } = useGame()

  const timePlayed = Math.floor((Date.now() - state.startedAt) / 1000)
  const hours = Math.floor(timePlayed / 3600)
  const minutes = Math.floor((timePlayed % 3600) / 60)

  const stats = [
    { label: 'Current Gold', value: formatNumber(state.gold) },
    { label: 'Total Gold Earned', value: formatNumber(state.totalGoldEarned) },
    { label: 'Total Clicks', value: formatNumber(state.totalClicks) },
    { label: 'Click Power', value: formatNumber(state.clickPower) },
    { label: 'Gold per Second', value: formatNumber(idleIncome) },
    { label: 'Time Played', value: `${hours}h ${minutes}m` },
  ]

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" center style={styles.title}>
        Player Stats
      </Text>

      {stats.map((stat) => (
        <Surface key={stat.label} style={styles.statRow}>
          <Text variant="body" color="secondary">
            {stat.label}
          </Text>
          <Text variant="h3" color="link">
            {stat.value}
          </Text>
        </Surface>
      ))}

      <View style={styles.resetSection}>
        <Button variant="ghost" onPress={resetGame} size="sm">
          Reset Game
        </Button>
        <Text variant="caption" color="muted" center>
          This will erase all progress
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  content: {
    padding: spacing[4],
    gap: spacing[3],
  },
  title: {
    paddingVertical: spacing[3],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetSection: {
    alignItems: 'center',
    paddingTop: spacing[8],
    gap: spacing[2],
  },
})
