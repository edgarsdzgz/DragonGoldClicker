import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { colors, spacing, radius, gold, dark } from '../theme'

export interface PillTab {
  key: string
  label: string
  icon?: GameIconName
}

interface PillTabsProps {
  tabs: PillTab[]
  activeKey: string
  onSelect: (key: string) => void
  /** Many tabs: wrap onto more lines instead of running off the edge */
  wrap?: boolean
}

export function PillTabs({ tabs, activeKey, onSelect, wrap = false }: PillTabsProps) {
  return (
    <View style={[styles.row, wrap && styles.wrap]}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={[styles.pill, active && styles.pillActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
          >
            {tab.icon && (
              <GameIcon
                name={tab.icon}
                size={14}
                color={active ? gold[500] : colors.text.muted}
                dim={!active}
              />
            )}
            <Text
              variant="label"
              style={{ color: active ? gold[500] : colors.text.muted }}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  wrap: {
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: `${gold[500]}15`,
    borderColor: `${gold[500]}40`,
  },
})
