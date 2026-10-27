import React, { useCallback, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, MealCountdown, StoryObjective, CoachTarget, RationSelector, FighterStatusBadge, FoodEventBadge } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useFlavorText } from '../hooks/useFlavorText'
import { useRandomSfx } from '../hooks/useRandomSfx'
import { SFX_HARVEST_POOL } from '../data/sfx'
import { FORAGE_LINES } from '../data/flavorText'
import { forageReveal } from '../types/opening'
import { forageOrbDiameter, FLAVOR_H } from '../types/warfrontLayout'
import { colors, spacing, gold } from '../theme'
import { formatNumber, formatCount, GRANARY_CAP, getForageYield, getTotalForagers, getForagerCost, getForagerCount, getForagerCap, FORAGER_TIERS, getExplorerCap, isSystemOn } from '../types/game'
import { explorerBlock, explorerCost } from '../types/outpost'

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
  const { state, forage: doForage, trainForager, trainExplorer } = useGame()
  const flavor = useFlavorText(FORAGE_LINES)
  const playHarvest = useRandomSfx(SFX_HARVEST_POOL, { cooldownMs: 2000 })

  const handleForage = useCallback(() => {
    doForage()
    playHarvest()
    flavor.onTick()
  }, [doForage, playHarvest, flavor.onTick])


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

  // Only gathering while the player learns to forage (types/opening.ts)
  const reveal = forageReveal(state)

  // A full granary takes no more food (layer 3)
  const granaryFull = state.food >= GRANARY_CAP

  // The FORAGE orb is sized to the room it has, so its glow never covers the TRAIN row
  const [areaHeight, setAreaHeight] = useState(0)
  const orbDiameter = forageOrbDiameter(areaHeight)

  const explorerCap = getExplorerCap(state.postLevel)
  const canRecruitExplorer = explorerBlock(state) === null

  return (
    <View style={styles.container}>
      {/* The big figure below shows the food, so the top bar does not repeat it */}
      <ResourceBar inspiration={state.inspiration} food={state.food} foodSystemActive={isSystemOn(state, 'hunger')} hideFood />
      <StoryObjective />

      {/* HERO: Food is the primary number */}
      <View style={styles.heroSection}>
        <View style={styles.foodRow}>
          <Ionicons name="nutrition" size={28} color={forage[400]} />
          <Text variant="display" style={{ color: forage[400] }}>
            {formatCount(state.food)}
          </Text>
        </View>
        <Text variant="bodySmall" color="muted" center>{`food stores (granary holds ${GRANARY_CAP})`}</Text>


        {hasBonusPercent && (
          <Badge icon="arrow-up" color={forage[400]} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: forage[300] }}>
              +{Math.round(state.forageBonus * 100)}% forage bonus
            </Text>
          </Badge>
        )}
      </View>

      {/* Meal consumption info */}
      <MealCountdown variant="full" />
      <FoodEventBadge style={styles.status} />

      {/* The fighters' rations and how fed they are (layer 3), once there is an army to feed */}
      {isSystemOn(state, 'hunger') && state.fighters > 0 && (
        <View style={styles.rations}>
          <FighterStatusBadge style={styles.status} />
          <RationSelector />
        </View>
      )}

      {/* Battle area: FORAGE dominates center */}
      <View style={styles.battleArea} onLayout={(e) => setAreaHeight(Math.floor(e.nativeEvent.layout.height))}>
        <FlavorText text={flavor.text} opacity={flavor.opacity} color={forage[300]} reserveHeight={FLAVOR_H} />
        <HarvestOrb
          onAction={handleForage}
          repeatOnHold
          diameter={orbDiameter}
          disabled={granaryFull}
          icon="leaf"
          label="FORAGE"
          coachId="forage"
          palette={FORAGE_PALETTE}
        />
      </View>

      {/* Command row: Train Gatherer + Recruit Explorer, each once it has been introduced */}
      {(reveal.training || reveal.explorers) && (
        <View style={styles.commandRow}>
          {reveal.training && (
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
                {formatNumber(gathererCost)} renown
              </Text>
              <Text variant="caption" color="muted" center>
                {`${gathererCount}/${gathererCap} gatherers`}
              </Text>
            </CoachTarget>
          )}

          {reveal.explorers && (
            <View style={styles.commandSlot}>
              <HarvestOrb
                onAction={handleRecruitExplorer}
                icon="compass"
                label="RECRUIT"
                palette={RECRUIT_PALETTE}
                size="md"
                disabled={!canRecruitExplorer}
              />
              <Text variant="bodySmall" center style={{ color: gold[400], fontWeight: '600' }}>
                {formatNumber(explorerCost(state))} renown
              </Text>
              <Text variant="caption" color="muted" center>
                {state.explorers}/{explorerCap}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer: forage yield hint */}
      <View style={styles.footer}>
        <Text variant="caption" color="muted" center>
          {`${formatCount(state.forageClicks)} foraging trips, ${formatCount(state.totalFoodForaged)} food gathered in all`}
        </Text>
        <Badge icon="nutrition" iconSize={10} color={forage[400]} variant="ghost">
          <Text variant="caption" style={{ color: forage[400] }}>
            {granaryFull ? 'Granary full' : `+${yield_} per tap`}
          </Text>
        </Badge>
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
  rations: {
    gap: spacing[1],
    paddingTop: spacing[2],
  },
  status: {
    alignSelf: 'center',
  },
  commandSlot: {
    alignItems: 'center',
    gap: spacing[1],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
})
