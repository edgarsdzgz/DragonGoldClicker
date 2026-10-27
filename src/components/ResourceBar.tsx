import React from 'react'
import { View, StyleSheet, Pressable, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { InspirationIcon } from './InspirationIcon'
import { CoachTarget } from './CoachTarget'
import { useJournal } from '../context/JournalContext'
import { useCoinTarget } from '../context/CoinFlightContext'
import { colors, spacing, gold } from '../theme'
import { formatNumber, formatCount } from '../types/game'

interface ResourceBarProps {
  inspiration: number
  food: number
  foodSystemActive: boolean
  /** Hide the inspiration figure where a bigger one is already on screen (the Warfront) */
  hideInspiration?: boolean
  /** Hide the food figure where a bigger one is already on screen (the Forage tab) */
  hideFood?: boolean
}

export function ResourceBar({ inspiration, food: foodAmount, foodSystemActive, hideInspiration = false, hideFood = false }: ResourceBarProps) {
  const insets = useSafeAreaInsets()
  const journal = useJournal()
  const coin = useCoinTarget()
  const foodLow = foodAmount <= 10 && foodAmount > 0
  const foodEmpty = foodAmount === 0

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing[2] }]}>
      {!hideInspiration && (
        // 'renown' lets a scene point at this figure (the first_renown scene boxes it)
        <CoachTarget id="renown">
          <Animated.View
            ref={coin.ref}
            collapsable={false}
            accessible
            accessibilityLabel={`${formatNumber(inspiration)} renown`}
            style={[styles.resource, coin.style]}
          >
            <InspirationIcon size={12} />
            {/* A Breach can leave renown in debt: shown in red, with its minus sign */}
            <Text variant="label" color="link" style={inspiration < 0 ? { color: colors.status.error } : undefined}>
              {formatNumber(inspiration)}
            </Text>
          </Animated.View>
        </CoachTarget>
      )}
      {foodSystemActive && !hideFood && (
        <View style={styles.resource}>
          <GameIcon
            name="nutrition"
            size={14}
            color={foodEmpty ? colors.status.error : foodLow ? colors.status.warning : colors.text.secondary}
          />
          <Text
            variant="label"
            style={{ color: foodEmpty ? colors.status.error : foodLow ? colors.status.warning : colors.text.secondary }}
          >
            {formatCount(foodAmount)}
          </Text>
        </View>
      )}
      {journal.available && (
        <Pressable
          onPress={journal.open}
          style={styles.journalBtn}
          accessibilityRole="button"
          accessibilityLabel="Open journal"
        >
          <GameIcon name="icon_scroll" size={20} color={gold[400]} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: colors.bg.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  journalBtn: {
    width: 48,
    height: 48,
    marginRight: -spacing[3],
    marginVertical: -spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
})
