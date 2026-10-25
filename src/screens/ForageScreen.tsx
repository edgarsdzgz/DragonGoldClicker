import React, { useRef, useEffect, useCallback } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, MealCountdown, StoryObjective, CoachTarget } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useFlavorText } from '../hooks/useFlavorText'
import { useRandomSfx } from '../hooks/useRandomSfx'
import { SFX_HARVEST_POOL } from '../data/sfx'
import { FORAGE_LINES } from '../data/flavorText'
import { colors, spacing, gold } from '../theme'
import { formatNumber, getForageYield, getTotalForagers, getForagerCost, getForagerCount, getForagerCap, FORAGER_TIERS, EXPLORER_COST, getExplorerCap, isSystemOn } from '../types/game'

// Earthy green palette for foraging
const forage = {
  900: '#052e16',
  700: '#15803d',
  600: '#16a34a',
  500: '#22c55e',
  400: '#4ade80',
  300: '#86efac',
} as const

// Blue-tinted palette for explorers
const explorer = {
  accent: colors.building.explorer,
  glow: '#3b82f6',
} as const

const FORAGE_PALETTE = { accent: forage[400], glow: forage[500] }
const TRAIN_PALETTE = { accent: forage[300], glow: forage[400] }
const RECRUIT_PALETTE = { accent: explorer.accent, glow: explorer.glow }

export function ForageScreen() {
  const { state, forage: doForage, trainForager, trainExplorer, effectiveAutoRate, autoFoodRate } = useGame()
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

  const handleTrainGatherer = useCallback(() => {
    trainForager('gatherer')
  }, [trainForager])

  const handleRecruitExplorer = useCallback(() => {
    trainExplorer()
  }, [trainExplorer])

  const yield_ = getForageYield(state.foragePower, state.forageBonus)
  const hasBonusPercent = state.forageBonus > 0
  const gathererTier = FORAGER_TIERS[0]
  const gathererCount = getForagerCount(state.foragers, 'gatherer')
  const gathererCost = getForagerCost(gathererTier, getForagerCount(state.foragersTrained, 'gatherer'))
  const gathererCap = getForagerCap(state.lodgeLevel)
  const totalForagers = getTotalForagers(state.foragers)
  const canTrainGatherer = state.villagers > 0 && state.inspiration >= gathererCost && totalForagers < gathererCap

  const explorerCap = getExplorerCap(state.postLevel)
  const canRecruitExplorer = state.postLevel > 0 && state.villagers > 0 && state.inspiration >= EXPLORER_COST && state.explorers < explorerCap

  return (
    <View style={styles.container}>
      <ResourceBar inspiration={state.inspiration} food={state.food} foodSystemActive={isSystemOn(state, 'hunger')} autoInspPerSec={effectiveAutoRate} />
      <StoryObjective />

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

      {/* Battle area: FORAGE dominates center */}
      <View style={styles.battleArea}>
        <FlavorText text={flavor.text} opacity={flavor.opacity} color={forage[300]} />
        <HarvestOrb
          onAction={handleForage}
          icon="leaf"
          label="FORAGE"
          coachId="forage"
          palette={FORAGE_PALETTE}
        />
      </View>

      {/* Command row: Train Gatherer + Recruit Explorer */}
      <View style={styles.commandRow}>
        <CoachTarget id="train" style={styles.commandSlot}>
          <HarvestOrb
            onAction={handleTrainGatherer}
            icon="person-add"
            label="TRAIN"
            palette={TRAIN_PALETTE}
            size="md"
            disabled={!canTrainGatherer}
          />
          <Text variant="bodySmall" center style={{ color: gold[400], fontWeight: '600' }}>
            {formatNumber(gathererCost)} insp
          </Text>
          <Text variant="caption" color="muted" center>
            {gathererCount}/{gathererCap}
          </Text>
        </CoachTarget>

        <View style={styles.commandSlot}>
          {state.postLevel > 0 ? (
            <>
              <HarvestOrb
                onAction={handleRecruitExplorer}
                icon="compass"
                label="RECRUIT"
                palette={RECRUIT_PALETTE}
                size="md"
                disabled={!canRecruitExplorer}
              />
              <Text variant="bodySmall" center style={{ color: gold[400], fontWeight: '600' }}>
                {EXPLORER_COST} insp
              </Text>
              <Text variant="caption" color="muted" center>
                {state.explorers}/{explorerCap}
              </Text>
            </>
          ) : (
            <View style={styles.lockedOrb}>
              <Ionicons name="lock-closed" size={16} color={colors.text.muted} />
              <Text variant="caption" color="muted" center>
                Build Outpost
              </Text>
            </View>
          )}
        </View>
      </View>

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
    paddingTop: spacing[4],
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
  battleArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  commandSlot: {
    alignItems: 'center',
    gap: spacing[1],
  },
  lockedOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
})
