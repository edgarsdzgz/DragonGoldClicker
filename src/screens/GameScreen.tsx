import React, { useRef, useEffect, useCallback, useState } from 'react'
import { View, StyleSheet, Animated, useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { Text, Badge, InspirationIcon, StorySpotlight, CoachTarget } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useShakeRequest } from '../context/ShakeContext'
import { useScreenShake } from '../hooks/useScreenShake'
import { useFlavorText } from '../hooks/useFlavorText'
import { useSfx } from '../hooks/useSfx'
import { SFX } from '../data/sfx'
import { COMBAT_LINES } from '../data/flavorText'
import { colors, spacing, gold } from '../theme'
import { formatNumber, getFighterCost, getRepairerCost, isSystemOn } from '../types/game'
import { battleLayout, TALL_WINDOW, ORB_GAP } from '../types/warfrontLayout'
import { WarfrontStatus } from './warfront/WarfrontStatus'
import { PopulationChips } from './warfront/PopulationChips'

const SLAY_PALETTE = { accent: gold[400], glow: gold[500] }
const RALLY_PALETTE = { accent: colors.warfront.rally, glow: colors.warfront.rally }
const REPAIR_PALETTE = { accent: colors.warfront.repair, glow: colors.warfront.repair }

export function GameScreen() {
  const { state, click, rallyFighter, directRepairer, effectiveAutoRate } = useGame()
  const { shakeNonce } = useShakeRequest()
  const shakeStyle = useScreenShake(shakeNonce)
  const incomeFlash = useRef(new Animated.Value(1)).current
  const flavor = useFlavorText(COMBAT_LINES)
  const windowHeight = useWindowDimensions().height

  // The battle circle is sized from the height the battle area actually gets
  const [battleHeight, setBattleHeight] = useState(0)
  const onBattleLayout = (e: LayoutChangeEvent) => setBattleHeight(Math.floor(e.nativeEvent.layout.height))
  const battle = battleLayout(battleHeight)

  const playClick = useSfx(SFX.CLICK)

  const handleClick = useCallback(() => {
    click()
    playClick()
    flavor.onTick()
  }, [click, playClick, flavor.onTick])

  // Subtle pulse on the income indicator to show it's "alive"
  useEffect(() => {
    if (effectiveAutoRate <= 0) return
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(incomeFlash, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
        Animated.timing(incomeFlash, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [effectiveAutoRate, incomeFlash])

  const rallyOn = isSystemOn(state, 'rally')
  const repairOn = isSystemOn(state, 'repair')
  const hungerOn = isSystemOn(state, 'hunger')
  // Short windows drop the footer line so the circle keeps its room
  const showFooter = windowHeight >= TALL_WINDOW

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <ResourceBar
        inspiration={state.inspiration}
        food={state.food}
        foodSystemActive={hungerOn}
        autoInspPerSec={effectiveAutoRate}
        hideInspiration
      />
      <WarfrontStatus />

      {/* HERO: Inspiration is the primary number */}
      <View style={styles.heroSection}>
        <View style={styles.inspRow}>
          <InspirationIcon size={24} />
          <Text variant="display" color="link">
            {formatNumber(state.inspiration)}
          </Text>
        </View>
        <View style={styles.heroSub}>
          <Text variant="bodySmall" color="muted">inspiration</Text>
          {effectiveAutoRate > 0 && (
            <Animated.View style={{ opacity: incomeFlash }}>
              <Badge icon="trending-up" color={colors.status.success}>
                <Text variant="caption" style={{ color: colors.status.success }}>
                  +{effectiveAutoRate.toFixed(2)} insp/s
                </Text>
              </Badge>
            </Animated.View>
          )}
        </View>
      </View>

      <PopulationChips />

      {/* Battle area: takes whatever height is left; the circle is sized to fit it */}
      <View style={styles.battleArea} onLayout={onBattleLayout}>
        {battle.showFlavor && (
          <FlavorText text={flavor.text} opacity={flavor.opacity} color={gold[300]} />
        )}
        {battleHeight > 0 && (
          <HarvestOrb
            onAction={handleClick}
            icon="flash"
            label="SLAY"
            coachId="slay"
            palette={SLAY_PALETTE}
            diameter={battle.diameter}
            style={{ marginTop: ORB_GAP }}
          />
        )}
      </View>

      {/* Command row: Rally + Repair as secondary HarvestOrbs */}
      {(rallyOn || repairOn) && (
        <View style={styles.commandRow}>
          {rallyOn && (
            <StorySpotlight target="rally">
              <CoachTarget id="rally" style={styles.commandSlot}>
                <HarvestOrb
                  onAction={rallyFighter}
                  icon="shield"
                  label="RALLY"
                  palette={RALLY_PALETTE}
                  size="md"
                  disabled={state.villagers <= 0 || state.inspiration < getFighterCost(state.fightersRallied)}
                />
                <Text variant="bodySmall" center style={styles.cost}>
                  {formatNumber(getFighterCost(state.fightersRallied))} insp
                </Text>
              </CoachTarget>
            </StorySpotlight>
          )}

          {repairOn && (
            <StorySpotlight target="repair">
              <CoachTarget id="repair" style={styles.commandSlot}>
                <HarvestOrb
                  onAction={directRepairer}
                  icon="construct"
                  label="REPAIR"
                  palette={REPAIR_PALETTE}
                  size="md"
                  disabled={state.villagers <= 0 || state.inspiration < getRepairerCost(state.repairersDirected)}
                />
                <Text variant="bodySmall" center style={styles.cost}>
                  {formatNumber(getRepairerCost(state.repairersDirected))} insp
                </Text>
              </CoachTarget>
            </StorySpotlight>
          )}
        </View>
      )}

      {/* Footer: one line, kills and reward per tap (only on tall windows) */}
      {showFooter && (
        <View style={styles.footer}>
          <Text variant="caption" color="muted">
            {Math.floor(state.monstersDefeated)} monsters slain
          </Text>
          <Badge iconElement={<InspirationIcon size={8} />} color={gold[400]} variant="ghost">
            <Text variant="caption" color="link">+{state.clickPower.toFixed(2)} per click</Text>
          </Badge>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing[1],
  },
  heroSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  inspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  battleArea: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[1],
  },
  commandSlot: {
    alignItems: 'center',
    gap: 2,
  },
  cost: {
    color: gold[400],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingBottom: spacing[2],
    paddingTop: spacing[1],
  },
})
