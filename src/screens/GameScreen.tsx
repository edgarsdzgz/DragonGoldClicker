import React, { useRef, useCallback, useState, useEffect } from 'react'
import { View, StyleSheet, Animated, useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { Text, StoryObjective, StorySpotlight, CoachTarget } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { Battlefield } from '../components/Battlefield'
import type { BattlefieldHandle, StrikeShown } from '../components/Battlefield'
import { useGame } from '../context/GameContext'
import { useCoach } from '../context/CoachContext'
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
import { armySize, armyVolleyNow, armyDps } from '../types/army'
import { battlefieldLayout, TALL_WINDOW, FLAVOR_H } from '../types/warfrontLayout'
import { DevShortcut } from '../components/DevShortcut'
import { warfrontReveal } from '../types/opening'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PopulationChips } from './warfront/PopulationChips'
import { Gate } from './warfront/Gate'
import { fighterDamageMultiplier } from '../types/fedState'
import { clawDef, canSharpen, canReforge, tapDamageNow, tapHit, rollsDouble } from '../types/claws'
import { ClawsChip } from '../components/ClawsChip'
import { ClawsSheet } from '../components/ClawsSheet'

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
  const { state, click, rallyFighter, directRepairer, sharpenClaws } = useGame()
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

  // The latest state for the strike handler, so a held press does not rebuild it every tick
  const stateRef = useRef(state)
  stateRef.current = state

  // Each tap may roll a double strike (Weak Points): it lands harder and feels harder
  const handleStrike = useCallback((): StrikeShown => {
    const s = stateRef.current
    const double = rollsDouble(s, Math.random())
    click(double)
    playSwing()
    if (double) haptics.medium()
    else haptics.light()
    return { damage: tapHit(s, double), double }
  }, [click, playSwing, haptics])

  // The army's volleys that landed: one small number each (only while the Warfront shows)
  const fighterPower = fighterDamageMultiplier(state)
  const army = armySize(state)
  const volleyNow = armyVolleyNow(state)
  const allyStrikesSeen = useRef(state.allyStrikes)
  useEffect(() => {
    const landed = state.allyStrikes - allyStrikesSeen.current
    allyStrikesSeen.current = state.allyStrikes
    // A volley counts one strike per member of the army and lands as one hit
    const volleys = landed / Math.max(1, army)
    if (landed > 0 && focused) battlefieldRef.current?.showAllyHit(`-${(volleys * volleyNow).toFixed(2)}`)
  }, [state.allyStrikes, focused, army, volleyNow])

  // A kill: coin sound, the bounty floats up, and about one in four brings a flavor line. Only
  // the player's own kills get the haptic; fighters' kills away from the Warfront stay quiet.
  const allyKillsSeen = useRef(state.allyKills)
  useKillEvents(state.monstersDefeated, state.monsterIndex, state.hordeKills, (monster) => {
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
  // Short windows drop the footer line so the battlefield keeps its room; the Claws chip stays
  const showFooter = windowHeight >= TALL_WINDOW
  const showDetails = showFooter && reveal.details
  const claws = clawDef(state.clawLevel)
  const [clawsOpen, setClawsOpen] = useState(false)
  // Guided tutorial: the Sharpen step waits for the claws sheet to open
  const { setSheetOpen } = useCoach()
  useEffect(() => {
    setSheetOpen('claws', clawsOpen)
    return () => setSheetOpen('claws', false)
  }, [clawsOpen, setSheetOpen])
  const playSharpen = useSfx(SFX.COIN)
  // Feedback follows the rule checked before the action (an action's own report is not reliable)
  const handleSharpen = useCallback(() => {
    if (!canSharpen(stateRef.current)) return
    sharpenClaws()
    playSharpen()
    haptics.medium()
  }, [sharpenClaws, playSharpen, haptics])

  return (
    <Animated.View style={[styles.container, shakeStyle, !reveal.chrome && { paddingBottom: insets.bottom }]}>
      {reveal.topBar && (
        <ResourceBar
          inspiration={state.inspiration}
          food={state.food}
          foodSystemActive={hungerOn}
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
            hordeKills={state.hordeKills}
            kills={state.monstersDefeated}
            damage={tapDamageNow(state)}
            clawLevel={state.clawLevel}
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

      {/* Footer: kills, the claws (damage per tap) and the fighters' damage. Short windows keep
          only the Claws chip. */}
      {(showDetails || reveal.claws) && (
        <View style={styles.footer}>
          {showDetails && (
            <Text variant="caption" color="muted">
              {killsText(state.monstersDefeated)}
            </Text>
          )}
          {reveal.claws ? (
            <CoachTarget id="claws">
              <ClawsChip
                level={state.clawLevel}
                name={claws.name}
                damage={tapDamageNow(state)}
                canSharpen={canSharpen(state)}
                onPress={() => setClawsOpen(true)}
              />
            </CoachTarget>
          ) : (
            <Text variant="caption" color="link">{tapDamageNow(state)} damage per tap</Text>
          )}
          {showDetails && army > 0 && (
            <Text variant="caption" style={styles.allyDps}>
              {fighterPower > 0 ? `army ${armyDps(state).toFixed(2)} damage/s` : 'the army stands down'}
            </Text>
          )}
        </View>
      )}
      <ClawsSheet
        visible={clawsOpen}
        onClose={() => setClawsOpen(false)}
        level={state.clawLevel}
        renown={state.inspiration}
        reforge={canReforge(state)}
        onSharpen={handleSharpen}
      />
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
