import React, { useRef, useEffect, useCallback } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, InspirationIcon, ProgressBar } from '../components'
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
import { formatNumber, getTotalSoldiers, getTotalForagers, getFighterCost, getRepairerCost, MAX_CITY_HP, isSystemOn } from '../types/game'

const SLAY_PALETTE = { accent: gold[400], glow: gold[500] }
const RALLY_PALETTE = { accent: colors.warfront.rally, glow: colors.warfront.rally }
const REPAIR_PALETTE = { accent: colors.warfront.repair, glow: colors.warfront.repair }

export function GameScreen() {
  const { state, click, rallyFighter, directRepairer, effectiveAutoRate, threatLevel, defenseLevel } = useGame()
  const { shakeNonce } = useShakeRequest()
  const shakeStyle = useScreenShake(shakeNonce)
  const incomeFlash = useRef(new Animated.Value(1)).current
  const flavor = useFlavorText(COMBAT_LINES)

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
  }, [effectiveAutoRate, incomeFlash])

  const rallyOn = isSystemOn(state, 'rally')
  const repairOn = isSystemOn(state, 'repair')
  const hungerOn = isSystemOn(state, 'hunger')

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <ResourceBar inspiration={state.inspiration} food={state.food} foodSystemActive={hungerOn} autoInspPerSec={effectiveAutoRate} />

      {/* City HP bar (hidden until the siege begins) */}
      {isSystemOn(state, 'siege') && (
        <View style={styles.cityHpBar}>
          <View style={styles.cityHpHeader}>
            <View style={styles.cityHpLabel}>
              <Ionicons name="shield-checkmark" size={14} color={state.cityHp > 30 ? colors.status.success : colors.status.error} />
              <Text variant="caption" style={{ color: state.cityHp > 30 ? colors.status.success : colors.status.error }}>
                Draconia {state.cityHp.toFixed(2)}/{MAX_CITY_HP} HP
              </Text>
            </View>
            {threatLevel > defenseLevel && (
              <Text variant="caption" style={{ color: colors.status.error }}>
                Threat {threatLevel} / Def {defenseLevel}
              </Text>
            )}
            {threatLevel <= defenseLevel && threatLevel > 0 && (
              <Text variant="caption" style={{ color: colors.status.success }}>
                Defended
              </Text>
            )}
          </View>
          <ProgressBar
            progress={state.cityHp / MAX_CITY_HP}
            height={6}
            gradientColors={state.cityHp > 30 ? ['#4ade80', '#22c55e'] : ['#ff6b6b', '#ef4444']}
          />
        </View>
      )}

      {/* HERO: Inspiration is the primary number */}
      <View style={styles.heroSection}>
        <View style={styles.inspRow}>
          <InspirationIcon size={24} />
          <Text variant="display" color="link">
            {formatNumber(state.inspiration)}
          </Text>
        </View>
        <Text variant="bodySmall" color="muted" center>inspiration</Text>

        {effectiveAutoRate > 0 && (
          <Animated.View style={{ opacity: incomeFlash, marginTop: spacing[1] }}>
            <Badge icon="trending-up" color={colors.status.success}>
              <Text variant="caption" style={{ color: colors.status.success }}>
                +{effectiveAutoRate.toFixed(2)} insp/s
              </Text>
            </Badge>
          </Animated.View>
        )}
      </View>

      {/* Population status */}
      <View style={styles.popSection}>
        <View style={styles.popRow}>
          {state.villagers > 0 && (
            <Badge icon="home" color={gold[500]}>
              <Text variant="caption" color="secondary">
                {state.villagers} villager{state.villagers !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
          {state.fighters > 0 && (
            <Badge icon="shield" color={colors.warfront.rally}>
              <Text variant="caption" style={{ color: colors.warfront.rally }}>
                {state.fighters} fighter{state.fighters !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
          {state.repairers > 0 && (
            <Badge icon="construct" color={colors.warfront.repair}>
              <Text variant="caption" style={{ color: colors.warfront.repair }}>
                {state.repairers} repairer{state.repairers !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
          {getTotalSoldiers(state.soldiers) > 0 && (
            <Badge icon="people" color={gold[300]}>
              <Text variant="caption" style={{ color: gold[300] }}>
                {getTotalSoldiers(state.soldiers)} soldier{getTotalSoldiers(state.soldiers) !== 1 ? 's' : ''}
                {hungerOn && state.food === 0 ? ' (idle)' : ' fighting'}
              </Text>
            </Badge>
          )}
          {getTotalForagers(state.foragers) > 0 && (
            <Badge icon="leaf" color={colors.status.success}>
              <Text variant="caption" style={{ color: colors.status.success }}>
                {getTotalForagers(state.foragers)} forager{getTotalForagers(state.foragers) !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
        </View>
        {hungerOn && state.food === 0 && (state.fighters > 0 || getTotalSoldiers(state.soldiers) > 0) && (
          <Badge icon="warning" color={colors.status.error} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: colors.status.error }}>
              No food! Fighters refuse to fight.
            </Text>
          </Badge>
        )}
        {hungerOn && state.food === 0 && state.villagers > 0 && (
          <Badge icon="warning" color={colors.status.warning} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: colors.status.warning }}>
              Villagers are starving!
            </Text>
          </Badge>
        )}
      </View>

      {/* Battle area: SLAY dominates center */}
      <View style={styles.battleArea}>
        <FlavorText text={flavor.text} opacity={flavor.opacity} color={gold[300]} style={{ marginBottom: spacing[3] }} />
        <HarvestOrb
          onAction={handleClick}
          icon="flash"
          label="SLAY"
          coachId="slay"
          palette={SLAY_PALETTE}
        />
      </View>

      {/* Command row: Rally + Repair as secondary HarvestOrbs */}
      <View style={styles.commandRow}>
        {rallyOn && (
          <View style={styles.commandSlot}>
            <HarvestOrb
              onAction={rallyFighter}
              icon="shield"
              label="RALLY"
              coachId="rally"
              palette={RALLY_PALETTE}
              size="md"
              disabled={state.villagers <= 0 || state.inspiration < getFighterCost(state.fightersRallied)}
            />
            <Text variant="bodySmall" center style={{ color: gold[400], fontWeight: '600' }}>
              {formatNumber(getFighterCost(state.fightersRallied))} insp
            </Text>
          </View>
        )}

        {repairOn && (
          <View style={styles.commandSlot}>
            <HarvestOrb
              onAction={directRepairer}
              icon="construct"
              label="REPAIR"
              coachId="repair"
              palette={REPAIR_PALETTE}
              size="md"
              disabled={state.villagers <= 0 || state.inspiration < getRepairerCost(state.repairersDirected)}
            />
            <Text variant="bodySmall" center style={{ color: gold[400], fontWeight: '600' }}>
              {formatNumber(getRepairerCost(state.repairersDirected))} insp
            </Text>
          </View>
        )}
      </View>

      {/* Footer: secondary kill counter + reward hint */}
      <View style={styles.footer}>
        <Text variant="caption" color="muted" center>
          {formatNumber(state.monstersDefeated)} monsters slain
        </Text>
        <Badge iconElement={<InspirationIcon size={8} />} color={gold[400]} variant="ghost">
          <Text variant="caption" color="link">
            +{state.clickPower.toFixed(2)} per click
          </Text>
        </Badge>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  cityHpBar: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
  cityHpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityHpLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing[3],
    gap: spacing[1],
  },
  inspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  popSection: {
    alignItems: 'center',
    paddingTop: spacing[2],
  },
  popRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
})
