import React, { useRef, useEffect, useCallback } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, MealCountdown } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useFlavorText } from '../hooks/useFlavorText'
import { useRandomSfx } from '../hooks/useRandomSfx'
import { SFX_HARVEST_POOL } from '../data/sfx'
import { FORAGE_LINES } from '../data/flavorText'
import { colors, spacing } from '../theme'
import { formatNumber, getForageYield, getTotalForagers } from '../types/game'

// Earthy green palette for foraging
const forage = {
  900: '#052e16',
  700: '#15803d',
  600: '#16a34a',
  500: '#22c55e',
  400: '#4ade80',
  300: '#86efac',
} as const

const FORAGE_PALETTE = { accent: forage[400], glow: forage[500] }

export function ForageScreen() {
  const { state, forage: doForage, effectiveAutoRate, autoFoodRate } = useGame()
  const incomeFlash = useRef(new Animated.Value(1)).current
  const flavor = useFlavorText(FORAGE_LINES)
  const playHarvest = useRandomSfx(SFX_HARVEST_POOL, { cooldownMs: 2000 })

  const handleForage = useCallback(() => {
    doForage()
    playHarvest()
    flavor.onTick()
  }, [doForage, playHarvest, flavor.onTick])

  useEffect(() => {
    if (autoFoodRate <= 0) return
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(incomeFlash, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(incomeFlash, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [autoFoodRate, incomeFlash])

  const yield_ = getForageYield(state.foragePower, state.forageBonus)
  const hasBonusPercent = state.forageBonus > 0

  return (
    <View style={styles.container}>
      <ResourceBar inspiration={state.inspiration} food={state.food} foodSystemActive={state.foodSystemActive} autoInspPerSec={effectiveAutoRate} />

      {/* HERO: Food is the primary number */}
      <View style={styles.heroSection}>
        <View style={styles.foodRow}>
          <Ionicons name="nutrition" size={28} color={forage[400]} />
          <Text variant="display" style={{ color: forage[400] }}>
            {formatNumber(state.food)}
          </Text>
        </View>
        <Text variant="bodySmall" color="muted" center>food stores</Text>

        {autoFoodRate > 0 && (
          <Animated.View style={{ opacity: incomeFlash, marginTop: spacing[1] }}>
            <Badge icon="trending-up" color={forage[400]}>
              <Text variant="caption" style={{ color: forage[300] }}>
                +{autoFoodRate.toFixed(2)} food/s
              </Text>
            </Badge>
          </Animated.View>
        )}

        {hasBonusPercent && (
          <Badge icon="arrow-up" color={forage[400]} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: forage[300] }}>
              +{Math.round(state.forageBonus * 100)}% forage bonus
            </Text>
          </Badge>
        )}
      </View>

      {/* Foraging stats */}
      <View style={styles.statsRow}>
        <View style={styles.statPillRow}>
          <Badge icon="leaf" color={forage[500]}>
            <Text variant="caption" style={{ color: forage[400] }}>
              {formatNumber(state.totalFoodForaged)} gathered
            </Text>
          </Badge>
          {getTotalForagers(state.foragers) > 0 && (
            <Badge icon="people" color={forage[500]}>
              <Text variant="caption" style={{ color: forage[400] }}>
                {getTotalForagers(state.foragers)} forager{getTotalForagers(state.foragers) !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
        </View>
      </View>

      {/* Meal consumption info */}
      <MealCountdown variant="full" />

      {/* Flavor text */}
      <FlavorText text={flavor.text} opacity={flavor.opacity} color={forage[300]} />

      {/* FORAGE button */}
      <HarvestOrb
        onAction={handleForage}
        icon="leaf"
        label="FORAGE"
        palette={FORAGE_PALETTE}
      />

      {/* Footer: forage yield hint */}
      <View style={styles.footer}>
        <Text variant="caption" color="muted" center>
          {formatNumber(state.forageClicks)} foraging trips
        </Text>
        <Badge icon="nutrition" iconSize={10} color={forage[400]} variant="ghost">
          <Text variant="caption" style={{ color: forage[400] }}>
            +{yield_} per click
          </Text>
        </Badge>
        {getTotalForagers(state.foragers) > 0 && (
          <Badge icon="footsteps" iconSize={10} color={colors.text.muted} variant="ghost">
            <Text variant="caption" color="muted">
              Foragers attract wandering survivors
            </Text>
          </Badge>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing[6],
    gap: spacing[1],
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statsRow: {
    alignItems: 'center',
    paddingTop: spacing[2],
  },
  statPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
    gap: spacing[1],
  },
})
