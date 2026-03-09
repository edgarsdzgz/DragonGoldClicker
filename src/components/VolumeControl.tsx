import React, { useCallback } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import Slider from '@react-native-community/slider'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { colors, spacing, gold, dark } from '../theme'

interface VolumeControlProps {
  label: string
  value: number
  muted: boolean
  onValueChange: (v: number) => void
  onToggleMute: () => void
  /** Accent color for the slider fill (default: gold[500]) */
  accentColor?: string
}

export function VolumeControl({
  label,
  value,
  muted,
  onValueChange,
  onToggleMute,
  accentColor = gold[500],
}: VolumeControlProps) {
  const iconName = muted || value === 0
    ? 'volume-mute'
    : value < 0.5
      ? 'volume-low'
      : 'volume-high'

  const displayPercent = muted ? 0 : Math.round(value * 100)

  const handleValueChange = useCallback((v: number) => {
    onValueChange(Math.round(v * 100) / 100)
  }, [onValueChange])

  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <Text variant="label" color={muted ? 'muted' : 'primary'}>{label}</Text>
        <Text variant="caption" color="muted">{displayPercent}%</Text>
      </View>
      <View style={styles.sliderRow}>
        <Pressable
          onPress={onToggleMute}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={muted ? `Unmute ${label}` : `Mute ${label}`}
          hitSlop={8}
        >
          <Ionicons
            name={iconName}
            size={20}
            color={muted ? colors.text.muted : accentColor}
          />
        </Pressable>
        <Slider
          style={styles.slider}
          value={value}
          onValueChange={handleValueChange}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          minimumTrackTintColor={muted ? dark[500] : accentColor}
          maximumTrackTintColor={dark[600]}
          thumbTintColor={muted ? dark[400] : accentColor}
          disabled={muted}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[1],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[1],
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg.surface3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 36,
  },
})
