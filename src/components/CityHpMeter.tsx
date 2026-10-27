import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { ProgressBar } from './ProgressBar'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { wallTone } from '../types/wall'
import { colors, spacing } from '../theme'

interface CityHpMeterProps {
  hp: number
  max: number
  /** The horde's level, shown beside the wall's HP (omit to hide) */
  hordeLevel?: number
  /** Seconds the ward from a Breach still holds (no strikes); 0 or omitted when there is none */
  wardSec?: number
  /** One tight block (HP + thin bar) for sharing a row with the objective */
  compact?: boolean
}

const TONES = {
  sound: { tint: colors.status.success, bar: ['#4ade80', '#22c55e'] as [string, string], word: 'holding' },
  cracking: { tint: colors.status.warning, bar: ['#fbbf24', '#f59e0b'] as [string, string], word: 'cracking' },
  failing: { tint: colors.status.error, bar: ['#ff6b6b', '#ef4444'] as [string, string], word: 'failing' },
}

/** The wall's health: green while sound, amber at half, red and pulsing at a quarter (layer 6). */
export function CityHpMeter({ hp, max, hordeLevel, wardSec = 0, compact = false }: CityHpMeterProps) {
  const tone = wallTone(hp)
  const { tint, bar, word } = TONES[tone]
  const reduceMotion = useReduceMotion()
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (tone !== 'failing' || reduceMotion) {
      pulse.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [tone, reduceMotion, pulse])

  // The word carries the state too, so it never rests on color alone
  const ward = wardSec > 0 ? `warded ${Math.ceil(wardSec)}s` : null
  const label = `Wall ${hp.toFixed(0)} of ${max} health, ${word}${ward ? `, ${ward}` : ''}`

  if (compact) {
    return (
      <View style={styles.compact} accessible accessibilityLabel={label}>
        <View style={styles.label}>
          <GameIcon name="shield-checkmark" size={12} color={tint} />
          <Text variant="caption" style={{ color: tint }}>{`${hp.toFixed(0)}/${max}`}</Text>
        </View>
        <Animated.View style={{ opacity: pulse }}>
          <ProgressBar progress={hp / max} height={4} gradientColors={bar} />
        </Animated.View>
      </View>
    )
  }

  return (
    <View
      style={styles.full}
      accessible
      accessibilityLabel={hordeLevel ? `${label}. Horde level ${hordeLevel}` : label}
    >
      <View style={styles.header}>
        <View style={styles.label}>
          <GameIcon name="shield-checkmark" size={14} color={tint} />
          <Text variant="caption" style={{ color: tint }}>{`Wall ${hp.toFixed(0)}/${max}`}</Text>
          {ward ? (
            <Text variant="caption" style={styles.ward}>{ward}</Text>
          ) : (
            tone !== 'sound' && <Text variant="caption" style={{ color: tint }}>{word}</Text>
          )}
        </View>
        {hordeLevel !== undefined && (
          <Text variant="caption" style={styles.horde}>{`Horde level ${hordeLevel}`}</Text>
        )}
      </View>
      <Animated.View style={{ opacity: pulse }}>
        <ProgressBar progress={hp / max} height={6} gradientColors={bar} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  full: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
  compact: {
    width: 96,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  horde: {
    color: colors.text.secondary,
  },
  ward: {
    color: colors.status.info,
  },
})
