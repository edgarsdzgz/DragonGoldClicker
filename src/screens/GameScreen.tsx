import React, { useRef, useCallback, useState, useEffect } from 'react'
import { View, StyleSheet, Animated, useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { Text, StoryObjective, StorySpotlight, CoachTarget } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { Battlefield } from '../components/Battlefield'
import type { BattlefieldHandle } from '../components/Battlefield'
import { useGame } from '../context/GameContext'
import { useShakeRequest } from '../context/ShakeContext'
import { useScreenShake } from '../hooks/useScreenShake'
import { useFlavorText } from '../hooks/useFlavorText'
import { useKillEvents } from '../hooks/useKillEvents'
import { useHaptics } from '../hooks/useHaptics'
import { useSfx } from '../hooks/useSfx'
import { SFX, SFX_WEAPON_POOL } from '../data/sfx'
import { useRandomSfx } from '../hooks/useRandomSfx'
import { COMBAT_LINES } from '../data/flavorText'
import { colors, spacing, gold } from '../theme'
import { formatNumber, getFighterCost, getRepairerCost, isSystemOn } from '../types/game'
import { battlefieldLayout, TALL_WINDOW, FLAVOR_H } from '../types/warfrontLayout'
import { PopulationChips } from './warfront/PopulationChips'
import { WaveRow } from './warfront/WaveRow'
import { MonsterQueue } from '../components/MonsterQueue'
import { WaveBanner } from '../components/WaveBanner'
import { waveView } from '../types/monsters'
import { waveBonus, WAVE_BANNER_MS } from '../types/waves'
import { Gate } from './warfront/Gate'

const RALLY_PALETTE = { accent: colors.warfront.rally, glow: colors.warfront.rally }
const REPAIR_PALETTE = { accent: colors.warfront.repair, glow: colors.warfront.repair }

/**
 * The Warfront is a scene read top to bottom along the monsters' path: they come from the
 * top, the whole battlefield is the tap target, and the gate sits by the thumb at the bottom.
 */
const killsText = (kills: number) => {
  const n = Math.floor(kills)
  return `${n} ${n === 1 ? 'monster' : 'monsters'} slain`
}

export function GameScreen() {
  const { state, click, rallyFighter, directRepairer, effectiveAutoRate } = useGame()
  const { shakeNonce } = useShakeRequest()
  const shakeStyle = useScreenShake(shakeNonce)
  const flavor = useFlavorText(COMBAT_LINES)
  const windowHeight = useWindowDimensions().height

  // The battlefield takes whatever height is left; its contents are sized to fit it
  const [fieldHeight, setFieldHeight] = useState(0)
  const onFieldLayout = (e: LayoutChangeEvent) => setFieldHeight(Math.floor(e.nativeEvent.layout.height))
  const field = battlefieldLayout(fieldHeight, { queue: true })
  const queue = waveView(state).queue

  // Clearing a wave: a banner for a moment, during which taps are ignored
  const [banner, setBanner] = useState<string | null>(null)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current)
  }, [])

  // Each hit is a claw swing (a random one from the weapon pool, slightly varied in pitch)
  const playSwing = useRandomSfx(SFX_WEAPON_POOL, { cooldownMs: 90, pitchVariation: 0.06 })
  const playKill = useSfx(SFX.COIN)
  const haptics = useHaptics()
  const battlefieldRef = useRef<BattlefieldHandle>(null)

  const handleStrike = useCallback(() => {
    click()
    playSwing()
    haptics.light()
  }, [click, playSwing, haptics])

  // A kill: medium haptic, coin sound, the bounty floats up, and about one in four brings a flavour line
  useKillEvents(state.monstersDefeated, state.monsterIndex, (monster) => {
    haptics.medium()
    playKill()
    battlefieldRef.current?.showBounty(`+${monster.bounty.toFixed(2)}`)
    battlefieldRef.current?.showKill(monster)
    if (state.waveKills === 0) {
      // The kill finished the wave (the state here is already the new one)
      setBanner(`Wave cleared +${waveBonus(monster.bounty).toFixed(2)}`)
      if (bannerTimer.current) clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setBanner(null), WAVE_BANNER_MS)
      // One announcement for the kill and the wave, so the two never collide
      return { text: `${monster.name} slain. Wave cleared, +${waveBonus(monster.bounty).toFixed(2)}`, force: true }
    } else if (Math.random() < 0.25) {
      flavor.show()
    }
  })

  const rallyOn = isSystemOn(state, 'rally')
  const repairOn = isSystemOn(state, 'repair')
  const hungerOn = isSystemOn(state, 'hunger')
  // Short windows drop the footer line so the battlefield keeps its room
  const showFooter = windowHeight >= TALL_WINDOW

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <ResourceBar
        inspiration={state.inspiration}
        food={state.food}
        foodSystemActive={hungerOn}
        autoInspPerSec={effectiveAutoRate}
      />
      <WaveRow />
      <StoryObjective />
      <PopulationChips />

      {/* Battlefield: the tap target, between the top rows and the gate */}
      <View style={styles.battlefield} onLayout={onFieldLayout}>
        {fieldHeight > 0 && (
          <Battlefield
            ref={battlefieldRef}
            monster={field.monster}
            monsterIndex={state.monsterIndex}
            monsterHp={state.monsterHp}
            kills={state.monstersDefeated}
            damage={state.tapDamage}
            onStrike={handleStrike}
            locked={banner !== null}
            coachId="slay"
            queue={field.showQueue ? <MonsterQueue monsters={queue} /> : undefined}
            header={field.showFlavor ? (
              <FlavorText text={flavor.text} opacity={flavor.opacity} color={gold[300]} reserveHeight={FLAVOR_H} />
            ) : undefined}
          />
        )}
        <WaveBanner text={banner} />
      </View>

      <Gate />

      {/* Command row: Rally + Repair below the gate, near the thumb */}
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

      {/* Footer: one line, kills and damage per tap (only on tall windows) */}
      {showFooter && (
        <View style={styles.footer}>
          <Text variant="caption" color="muted">
            {killsText(state.monstersDefeated)}
          </Text>
          <Text variant="caption" color="link">{state.tapDamage} damage per tap</Text>
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
  battlefield: {
    flex: 1,
    minHeight: 0,
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
    gap: spacing[3],
    paddingBottom: spacing[2],
    paddingTop: spacing[1],
  },
})
