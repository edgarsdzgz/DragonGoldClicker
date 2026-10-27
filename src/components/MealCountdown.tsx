import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { ProgressBar } from './ProgressBar'
import { useGame } from '../context/GameContext'
import { colors, spacing, radius } from '../theme'
import { FOOD_CHECK_INTERVAL, isSystemOn, formatAmount } from '../types/game'
import { mealBalance, storesOutlook } from '../types/foodTick'
import type { StoresOutlook } from '../types/foodTick'

// Amber for consumption, from the theme (contrasts with green forage / red garrison)
const meal = colors.meal

/** What the stores are heading for, in words, and whether that is good news */
export function outlookText(o: StoresOutlook): { text: string; good: boolean } {
  switch (o.kind) {
    case 'full': return { text: 'Granary full', good: true }
    case 'growing': return { text: `Stores grow by ${formatAmount(o.perMeal)} each meal`, good: true }
    case 'steady': return { text: 'Stores hold steady', good: true }
    case 'shrinking': return { text: `Stores last about ${o.minutes} min`, good: false }
    case 'emptyNextMeal': return { text: 'Stores run out at the next meal', good: false }
  }
}

/** "1:23" */
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

interface MealCountdownProps {
  /** 'full' shows rate + countdown + bar; 'compact' is just countdown badge */
  variant?: 'full' | 'compact'
}

export function MealCountdown({ variant = 'full' }: MealCountdownProps) {
  const { state } = useGame()

  // The same cost the meal tick charges (the army), and what foragers add meanwhile
  const { eaten: consumption, gathered } = mealBalance(state)
  const outlook = outlookText(storesOutlook(state))

  // Nothing to show if nobody eats
  if (!isSystemOn(state, 'hunger') || consumption <= 0) return null

  const secondsLeft = FOOD_CHECK_INTERVAL - state.foodTimer
  const isUrgent = secondsLeft <= 5

  if (variant === 'compact') {
    return <CompactCountdown secondsLeft={secondsLeft} consumption={consumption} isUrgent={isUrgent} />
  }

  return (
    <View style={styles.container}>
      {/* The horizon (layer 3): where the stores are heading, not a bar that empties every meal */}
      <Text variant="label" center style={{ color: outlook.good ? colors.status.success : colors.status.error }}>
        {outlook.text}
      </Text>
      {/* Each meal: what the army eats and what foragers bring in meanwhile */}
      <View style={styles.rateRow}>
        <GameIcon name="restaurant" size={13} color={meal[400]} />
        <Text variant="caption" style={{ color: meal[300] }}>
          {`Each meal: -${formatAmount(consumption)} eaten${gathered > 0 ? `, +${formatAmount(gathered)} gathered` : ''}`}
        </Text>
      </View>
      {/* The meal bell, small */}
      <View style={styles.bell} accessible accessibilityLabel={`Next meal in ${secondsLeft} seconds`}>
        <GameIcon name="notifications-outline" size={12} color={isUrgent ? colors.status.error : meal[400]} />
        <Text variant="caption" style={{ color: isUrgent ? colors.status.error : meal[300] }}>next meal</Text>
        <CountdownDigits seconds={secondsLeft} isUrgent={isUrgent} />
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
      {clock(seconds)}
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
        <GameIcon name="restaurant" size={11} color={tint} />
        <Text variant="caption" style={{ color: isUrgent ? colors.status.error : meal[300], fontSize: 11 }}>
          -{consumption}
        </Text>
        <View style={styles.compactDivider} />
        <GameIcon name="timer-outline" size={11} color={tint} />
        <Text variant="caption" style={{ color: isUrgent ? colors.status.error : meal[300], fontSize: 11 }}>
          {clock(secondsLeft)}
        </Text>
      </View>
      <ProgressBar
        progress={secondsLeft / FOOD_CHECK_INTERVAL}
        height={2}
        gradientColors={isUrgent ? meal.urgent : [meal[600], meal[400]]}
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
  bell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
