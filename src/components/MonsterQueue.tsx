import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MonsterDef } from '../types/monsters'
import { QUEUE_H } from '../types/warfrontLayout'
import { colors, spacing } from '../theme'

/** The next monsters as dim silhouettes (the caller passes at most four). Decorative only. */
export function MonsterQueue({ monsters }: { monsters: MonsterDef[] }) {
  return (
    <View
      style={styles.row}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {monsters.map((m, i) => (
        <Ionicons key={i} name={m.glyph} size={18} color={colors.text.muted} style={{ opacity: 0.35 - i * 0.05 }} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    height: QUEUE_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
})
