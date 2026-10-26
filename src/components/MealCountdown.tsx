import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { ProgressBar } from './ProgressBar'
import { useGame } from '../context/GameContext'
import { colors, spacing, radius } from '../theme'
import { FOOD_CHECK_INTERVAL, isSystemOn, formatAmount } from '../types/game'
import { mealBalance } from '../types/foodTick'

// Warm amber palette for consumption (contrasts with green forage / red garrison)
const meal = {
  600: '#b45309',
  500: '#d97706',
  400: '#f59e0b',
  300: '#fbbf24',
  200: '#fde68a',
} as const

interface MealCountdownProps {
  /** 'full' shows rate + countdown + bar; 'compact' is just countdown badge */
  variant?: 'full' | 'compact'
}

export function MealCountdown({ variant = 'full' }: MealCountdownProps) {
  const { state } = useGame()

  // The same cost the meal tick charges (every mouth, fighters too), and what foragers add meanwhile
  const { eaten: consumption, gathered, net } = mealBalance(state)

  // Nothing to show if nobody eats
  if (!isSystemOn(state, 'hunger') || consumption <= 0) return null

  const secondsLeft = FOOD_CHECK_INTERVAL - state.foodTimer
  const progress = secondsLeft / FOOD_CHECK_INTERVAL
  const isUrgent = secondsLeft <= 5

  if (variant === 'compact') {
    return <CompactCountdown secondsLeft={secondsLeft} consumption={consumption} isUrgent={isUrgent} />
  }

  return (
    <View style={styles.container}>
      {/* Each meal: what is eaten, what foragers bring in, and whether the stores grow or shrink */}
      <View style={styles.rateRow}>
        <Ionicons name="restaurant" size={13} color={meal[400]} />
        <Text variant="caption" style={{ color: meal[300] }}>
          {`Each meal: -${formatAmount(consumption)} eaten${gathered > 0 ? `, +${formatAmount(gathered)} gathered` : ''}`}
        </Text>
      </View>
      <Text
        variant="label"
        center
        style={{ color: net < 0 ? colors.status.error : colors.status.success }}
      >
        {Math.abs(net) < 0.05
          ? 'Stores hold steady'
          : net < 0
            ? `Stores shrink by ${formatAmount(-net)} each meal`
            : `Stores grow by ${formatAmount(net)} each meal`}
      </Text>

      {/* Countdown bar */}
      <View style={styles.countdownSection}>
        <View style={styles.countdownHeader}>
          <View style={styles.countdownLabel}>
            <Ionicons name="timer-outline" size={12} color={isUrgent ? colors.status.error : meal[400]} />
            <Text
              variant="caption"
              style={{ color: isUrgent ? colors.status.error : meal[300] }}
            >
              next meal
            </Text>
          </View>
          <CountdownDigits seconds={secondsLeft} isUrgent={isUrgent} />
        </View>
        <ProgressBar
          progress={progress}
          height={3}
          gradientColors={isUrgent ? ['#ef4444', '#f87171'] : [meal[600], meal[400]]}
        />
      </View>
    </View>
  )
}

/** Animated countdown number that pulses when urgent */
function CountdownDigits({ seconds, isUrgent }: { seconds: number; isUrgent: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!isUrgent) {
      pulse.setValue(1)
      return
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [isUrgent, pulse])

  return (
    <Animated.Text
      style={[
        styles.digits,
        {
          color: isUrgent ? colors.status.error : meal[300],
          transform: [{ scale: pulse }],
        },
      ]}
    >
      {seconds}s
    </Animated.Text>
  )
}

/** Badge-sized countdown for tight spaces (lodge interior) */
function CompactCountdown({
  secondsLeft,
  consumption,
  isUrgent,
}: {
  secondsLeft: number
  consumption: number
  isUrgent: boolean
}) {
  const tint = isUrgent ? colors.status.error : meal[400]

  return (
    <View style={styles.compactContainer}>
      <View style={[styles.compactBadge, { borderColor: `${tint}20`, backgroundColor: `${tint}0a` }]}>
        <Ionicons name="restaurant" size={11} color={tint} />
        <Text variant="caption" style={{ color: isUrgent ? colors.status.error : meal[300], fontSize: 11 }}>
          -{consumption}
        </Text>
        <View style={styles.compactDivider} />
        <Ionicons name="timer-outline" size={11} color={tint} />
        <Text variant="caption" style={{ color: isUrgent ? colors.status.error : meal[300], fontSize: 11 }}>
          {secondsLeft}s
        </Text>
      </View>
      <ProgressBar
        progress={secondsLeft / FOOD_CHECK_INTERVAL}
        height={2}
        gradientColors={isUrgent ? ['#ef4444', '#f87171'] : [meal[600], meal[400]]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
    paddingHorizontal: spacing[4],
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  countdownSection: {
    gap: 3,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  digits: {
    fontSize: 12,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  compactContainer: {
    gap: 3,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'center',
  },
  compactDivider: {
    width: 1,
    height: 10,
    backgroundColor: `${meal[400]}30`,
    marginHorizontal: 2,
  },
})
