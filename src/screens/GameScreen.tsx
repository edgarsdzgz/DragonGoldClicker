import React, { useRef, useCallback, useState, useEffect } from 'react'
import { View, StyleSheet, Animated, useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
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
import { formatNumber, getFighterCost, getRepairerCost, getFighterDps, isSystemOn, FIGHTER_HIT_DAMAGE } from '../types/game'
import { battlefieldLayout, TALL_WINDOW, FLAVOR_H } from '../types/warfrontLayout'
import { DevShortcut } from '../components/DevShortcut'
import { warfrontReveal } from '../types/opening'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PopulationChips } from './warfront/PopulationChips'
import { Gate } from './warfront/Gate'

const RALLY_PALETTE = { accent: colors.warfront.rally, glow: colors.warfront.rally }
const REPAIR_PALETTE = { accent: colors.warfront.repair, glow: colors.warfront.repair }

/**
 * The Warfront is a scene read top to bottom along the monsters' path: there is always a monster
 * at the gate, the whole battlefield is the tap target, and the gate sits by the thumb at the
 * bottom. Fighters wear the same monster down. (Waves are in cold storage: src/modes/waves.)
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
  const insets = useSafeAreaInsets()
  // What the Warfront shows so far (the opening reveals it in order)
  const reveal = warfrontReveal(state)

  // The battlefield takes whatever height is left; its contents are sized to fit it
  const [fieldHeight, setFieldHeight] = useState(0)
  const onFieldLayout = (e: LayoutChangeEvent) => setFieldHeight(Math.floor(e.nativeEvent.layout.height))
  const field = battlefieldLayout(fieldHeight)
  const focused = useIsFocused()

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

  // Fighters' swings that landed: one small number per tick's worth (only while the Warfront shows)
  const allyStrikesSeen = useRef(state.allyStrikes)
  useEffect(() => {
    const landed = state.allyStrikes - allyStrikesSeen.current
    allyStrikesSeen.current = state.allyStrikes
    if (landed > 0 && focused) battlefieldRef.current?.showAllyHit(`-${(landed * FIGHTER_HIT_DAMAGE).toFixed(2)}`)
  }, [state.allyStrikes, focused])

  // A kill: coin sound, the bounty floats up, and about one in four brings a flavour line. Only
  // the player's own kills get the haptic; fighters' kills away from the Warfront stay quiet.
  const allyKillsSeen = useRef(state.allyKills)
  useKillEvents(state.monstersDefeated, state.monsterIndex, (monster) => {
    const byFighters = state.allyKills > allyKillsSeen.current
    allyKillsSeen.current = state.allyKills
    if (!focused) return { silent: true }
    if (!byFighters) haptics.medium()
    playKill()
    battlefieldRef.current?.showBounty(`+${monster.bounty.toFixed(2)}`)
    battlefieldRef.current?.showKill(monster)
    if (Math.random() < 0.25) flavor.show()
  })

  const rallyOn = isSystemOn(state, 'rally')
  const repairOn = isSystemOn(state, 'repair')
  const hungerOn = isSystemOn(state, 'hunger')
  // Short windows drop the footer line so the battlefield keeps its room
  const showFooter = windowHeight >= TALL_WINDOW

  return (
    <Animated.View style={[styles.container, shakeStyle, !reveal.chrome && { paddingBottom: insets.bottom }]}>
      {reveal.topBar && (
        <ResourceBar
          inspiration={state.inspiration}
          food={state.food}
          foodSystemActive={hungerOn}
          autoInspPerSec={effectiveAutoRate}
        />
      )}
      {/* The quest line shows from the first kill (the Defend the Wall quest) */}
      {reveal.topBar && <StoryObjective />}
      {reveal.chrome && <PopulationChips />}
      {!reveal.chrome && <DevShortcut offsetTop={reveal.topBar ? 56 : 0} />}

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
            showName={reveal.monsterName}
            coachId="slay"
            header={field.showFlavor && reveal.details ? (
              <FlavorText text={flavor.text} opacity={flavor.opacity} color={gold[300]} reserveHeight={FLAVOR_H} />
            ) : undefined}
          />
        )}
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
                  {formatNumber(getFighterCost(state.fightersRallied))} renown
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
                  {formatNumber(getRepairerCost(state.repairersDirected))} renown
                </Text>
              </CoachTarget>
            </StorySpotlight>
          )}
        </View>
      )}

      {/* Footer: kills, damage per tap and the fighters' damage (only on tall windows) */}
      {showFooter && reveal.details && (
        <View style={styles.footer}>
          <Text variant="caption" color="muted">
            {killsText(state.monstersDefeated)}
          </Text>
          <Text variant="caption" color="link">{state.tapDamage} damage per tap</Text>
          {state.fighters > 0 && (
            <Text variant="caption" style={styles.allyDps}>fighters {getFighterDps(state.fighters).toFixed(2)} damage/s</Text>
          )}
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
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingBottom: spacing[2],
    paddingTop: spacing[1],
    paddingHorizontal: spacing[4],
  },
  allyDps: {
    color: colors.warfront.ally,
  },
})
