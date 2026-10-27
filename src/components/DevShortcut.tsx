import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { GameIcon } from './GameIcon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from './Text'
import { DEV_TOOLS_ENABLED } from '../config/devTools'
import type { RootStackNavProp } from '../navigation/types'
import { colors, spacing, radius, gold } from '../theme'

interface DevShortcutProps {
  /** Extra distance from the top, when something sits above (the top bar) */
  offsetTop?: number
}

/**
 * A small labeled button in the top-right corner that opens Settings > Dev, for playtest builds
 * while the opening hides the rest of the UI. Player builds render nothing.
 */
export function DevShortcut({ offsetTop = 0 }: DevShortcutProps) {
  const navigation = useNavigation<RootStackNavProp>()
  const insets = useSafeAreaInsets()
  if (!DEV_TOOLS_ENABLED) return null
  return (
    <Pressable
      onPress={() => navigation.navigate('Main', { screen: 'SettingsTab', params: { section: 'dev' } })}
      style={[styles.button, { top: insets.top + spacing[2] + offsetTop }]}
      accessibilityRole="button"
      accessibilityLabel="Open developer tools"
    >
      <GameIcon name="construct-outline" size={16} color={gold[400]} />
      <Text variant="caption" style={styles.label}>Dev</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing[2],
    zIndex: 20,
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.surface1,
    opacity: 0.85,
  },
  label: {
    color: colors.text.secondary,
  },
})
