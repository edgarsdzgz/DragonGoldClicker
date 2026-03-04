import React from 'react'
import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Text, Surface } from '../components'
import { useGame } from '../context/GameContext'
import { useHaptics } from '../hooks'
import { colors, spacing, gold, radius } from '../theme'
import { UPGRADES, formatNumber } from '../types/game'
import type { UpgradeId } from '../types/game'

export function ShopScreen() {
  const { state, buyUpgrade, getUpgradePrice, canAfford } = useGame()
  const haptics = useHaptics()

  const handleBuy = (id: UpgradeId) => {
    const success = buyUpgrade(id)
    if (success) {
      haptics.medium()
    } else {
      haptics.warning()
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.goldHeader}>
        <Text variant="h3" color="link">
          {formatNumber(state.gold)} gold
        </Text>
      </View>

      {UPGRADES.map((upgrade) => {
        const level = state.upgrades[upgrade.id]
        const cost = getUpgradePrice(upgrade.id)
        const affordable = canAfford(upgrade.id)

        return (
          <Surface key={upgrade.id} style={styles.upgradeCard}>
            <View style={styles.upgradeInfo}>
              <View style={styles.upgradeHeader}>
                <Text variant="h3">{upgrade.name}</Text>
                <Text variant="caption" color="secondary">
                  Lv. {level}
                </Text>
              </View>
              <Text variant="bodySmall" color="secondary">
                {upgrade.description}
              </Text>
            </View>
            <Pressable
              onPress={() => handleBuy(upgrade.id)}
              disabled={!affordable}
              style={({ pressed }) => [
                styles.buyButton,
                affordable ? styles.buyButtonActive : styles.buyButtonDisabled,
                pressed && affordable && styles.buyButtonPressed,
              ]}
            >
              <Text
                variant="button"
                color={affordable ? 'inverse' : 'muted'}
                center
              >
                {formatNumber(cost)}
              </Text>
            </Pressable>
          </Surface>
        )
      })}
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
  goldHeader: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  upgradeInfo: {
    flex: 1,
    gap: spacing[1],
  },
  upgradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  buyButtonActive: {
    backgroundColor: gold[500],
  },
  buyButtonDisabled: {
    backgroundColor: colors.bg.surface2,
  },
  buyButtonPressed: {
    backgroundColor: gold[600],
  },
})
