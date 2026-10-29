import React, { useCallback, useRef, useState } from 'react'
import { View, StyleSheet, PixelRatio } from 'react-native'
import { PixelSprite } from '../components/PixelSprite'
import { SPRITES, fitScale, granarySprite, FORAGE_ORB_ART } from '../art'
import { Text, Badge, ValleyFind, MealCountdown, StoryObjective, CoachTarget, RationSelector, FighterStatusBadge, FoodEventBadge } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { FloatingNumbers } from '../components/FloatingNumbers'
import type { FloatingNumbersHandle } from '../components/FloatingNumbers'
import { useGame } from '../context/GameContext'
import { useFlavorText } from '../hooks/useFlavorText'
import { useValleyFinds } from '../hooks/useValleyFinds'
import { useRandomSfx } from '../hooks/useRandomSfx'
import { SFX_HARVEST_POOL } from '../data/sfx'
import { FORAGE_LINES } from '../data/flavorText'
import { forageReveal } from '../types/opening'
import { forageOrbDiameter, FLAVOR_H } from '../types/warfrontLayout'
import { colors, spacing, gold } from '../theme'
import { formatNumber, formatCount, GRANARY_CAP, getForageYield, getTotalForagers, getForagerCost, getForagerCount, getForagerCap, FORAGER_TIERS, getExplorerCap, isSystemOn } from '../types/game'
import { explorerBlock, explorerCost } from '../types/outpost'

/** The granary beside the food figure, in points (at a whole scale of its art) */
const GRANARY_PTS = 48

const FORAGE_PALETTE = { accent: colors.forage.accent, glow: colors.forage.glow }
const TRAIN_PALETTE = { accent: colors.forage.soft, glow: colors.forage.accent }
const RECRUIT_PALETTE = { accent: colors.explorer.accent, glow: colors.explorer.glow }

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
  const [area, setArea] = useState({ width: 0, height: 0 })
  const orbDiameter = forageOrbDiameter(area.height)

  // Valley Finds stir in the grass around the orb (types/valleyFinds.ts)
  const numbers = useRef<FloatingNumbersHandle>(null)
  const valley = useValleyFinds({ width: area.width, height: area.height, orbDiameter, granaryFull, showHint: flavor.show, numbers })

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
          {/* The granary fills with the stores; the figure beside it says how much */}
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <PixelSprite id={granarySprite(state.food, GRANARY_CAP)} scale={fitScale(GRANARY_PTS, SPRITES.evt_granary_0.w, PixelRatio.get())} />
          </View>
          <Text variant="display" style={{ color: colors.forage.accent }}>
            {formatCount(state.food)}
          </Text>
        </View>
        <Text variant="bodySmall" color="muted" center>{`food stores (granary holds ${GRANARY_CAP})`}</Text>


        {hasBonusPercent && (
          <Badge icon="arrow-up" color={colors.forage.accent} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: colors.forage.soft }}>
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
      <View style={styles.battleArea} onLayout={(e) => setArea({ width: Math.floor(e.nativeEvent.layout.width), height: Math.floor(e.nativeEvent.layout.height) })}>
        <FlavorText text={flavor.text} opacity={flavor.opacity} color={colors.forage.soft} reserveHeight={FLAVOR_H} />
        <HarvestOrb
          onAction={handleForage}
          repeatOnHold
          diameter={orbDiameter}
          disabled={granaryFull}
          icon={FORAGE_ORB_ART}
          label="FORAGE"
          coachId="forage"
          palette={FORAGE_PALETTE}
        />
        {valley.find && (
          <ValleyFind
            key={valley.find.id}
            kind={valley.find.kind}
            x={valley.find.x}
            y={valley.find.y}
            pay={valley.find.pay}
            showMs={valley.find.showMs}
            still={valley.reduceMotion}
            drift={valley.find.drift}
            onCatch={valley.onCatch}
            onGone={valley.onGone}
          />
        )}
        <FloatingNumbers ref={numbers} />
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
        <Badge icon="nutrition" iconSize={10} color={colors.forage.accent} variant="ghost">
          <Text variant="caption" style={{ color: colors.forage.accent }}>
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
