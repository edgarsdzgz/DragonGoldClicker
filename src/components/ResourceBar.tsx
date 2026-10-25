import React from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { InspirationIcon } from './InspirationIcon'
import { useJournal } from '../context/JournalContext'
import { colors, spacing, gold } from '../theme'
import { formatNumber } from '../types/game'

interface ResourceBarProps {
  inspiration: number
  food: number
  foodSystemActive: boolean
  autoInspPerSec: number
}

export function ResourceBar({ inspiration, food: foodAmount, foodSystemActive, autoInspPerSec }: ResourceBarProps) {
  const insets = useSafeAreaInsets()
  const journal = useJournal()
  const foodLow = foodAmount <= 10 && foodAmount > 0
  const foodEmpty = foodAmount === 0

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing[2] }]}>
      <View style={styles.resource}>
        <InspirationIcon size={12} />
        <Text variant="label" color="link">
          {formatNumber(inspiration)}
        </Text>
      </View>
      {foodSystemActive && (
        <View style={styles.resource}>
          <Ionicons
            name="nutrition"
            size={14}
            color={foodEmpty ? colors.status.error : foodLow ? colors.status.warning : colors.text.secondary}
          />
          <Text
            variant="label"
            style={{ color: foodEmpty ? colors.status.error : foodLow ? colors.status.warning : colors.text.secondary }}
          >
            {formatNumber(foodAmount)}
          </Text>
        </View>
      )}
      {autoInspPerSec > 0 && (
        <View style={styles.resource}>
          <Ionicons name="trending-up" size={12} color={colors.status.success} />
          <Text variant="caption" style={{ color: colors.status.success }}>
            +{autoInspPerSec.toFixed(2)}/s
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
          <Ionicons name="book" size={20} color={gold[400]} />
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
