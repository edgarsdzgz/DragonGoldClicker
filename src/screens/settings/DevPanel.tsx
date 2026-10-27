import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, Button, SectionLabel, PillTabs } from '../../components'
import type { PillTab } from '../../components'
import { useGame } from '../../context/GameContext'
import { useDevSettings, GAME_SPEEDS } from '../../context/DevSettingsContext'
import type { GameSpeed, Pacing } from '../../context/DevSettingsContext'
import { resolveBreach } from '../../types/breach'
import { FOOD_CHECK_INTERVAL, MAX_CITY_HP, HORDE_LEVEL_KILLS, roundInsp, isSystemOn } from '../../types/game'
import { startFoodEvent } from '../../types/foodEvents'
import type { GameState } from '../../types/game'
import { spacing } from '../../theme'
import { DevCheckpoints } from './DevCheckpoints'
import { DevStory } from './DevStory'
import { DevArtGallery } from './DevArtGallery'
import { DevCityPreview } from './DevCityPreview'
import { DevWallPreview } from './DevWallPreview'
import { DevTitlePreview } from './DevTitlePreview'

/**
 * Dev-only test panel (Settings > Dev). Rendered only when DEV_TOOLS_ENABLED (src/config/devTools.ts).
 * Speeds up, skips, and replays progression so testing never takes hours.
 */

const PACING_TABS: PillTab[] = [
  { key: 'test', label: 'Test pacing', icon: 'flash-outline' },
  { key: 'live', label: 'Live pacing', icon: 'hourglass-outline' },
]

const SPEED_TABS: PillTab[] = GAME_SPEEDS.map((s) => ({ key: String(s), label: `${s}x` }))

const WALL_HIT = 15
/** Far past any expedition duration, so every active expedition is ready to claim */
const EXPEDITION_SKIP_MS = 24 * 3600 * 1000

export function DevPanel() {
  const { state, devApply, devForceWanderer } = useGame()
  const dev = useDevSettings()

  const grant = (fn: (s: GameState) => Partial<GameState>) => devApply((s) => ({ ...s, ...fn(s) }))

  return (
    <View style={styles.root}>
      <Surface style={styles.section}>
        <SectionLabel spacing={2}>STORY PACING</SectionLabel>
        <PillTabs tabs={PACING_TABS} activeKey={dev.pacing} onSelect={(k) => dev.setPacing(k as Pacing)} />
        <Text variant="caption" color="muted">
          Test pacing shortens the wait between story beats to seconds. Live is the real, hours-long pacing.
        </Text>
      </Surface>

      <Surface style={styles.section}>
        <SectionLabel spacing={2}>GAME SPEED</SectionLabel>
        <PillTabs tabs={SPEED_TABS} activeKey={String(dev.speed)} onSelect={(k) => dev.setSpeed(Number(k) as GameSpeed)} />
        <Text variant="caption" color="muted">
          Speeds up income, food checks, siege ticks and wanderer cooldowns together. Expeditions use real time; finish them below.
        </Text>
      </Surface>

      <Surface style={styles.section}>
        <SectionLabel spacing={2}>GRANTS</SectionLabel>
        <View style={styles.buttonGrid}>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => ({ inspiration: roundInsp(s.inspiration + 10), totalInspirationEarned: roundInsp(s.totalInspirationEarned + 10) }))}>+10 renown</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => ({ inspiration: roundInsp(s.inspiration + 100), totalInspirationEarned: roundInsp(s.totalInspirationEarned + 100) }))}>+100 renown</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => ({ food: s.food + 100 }))}>+100 food</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => ({ villagers: s.villagers + 5 }))}>+5 villagers</Button>
          <Button size="sm" variant="secondary" onPress={() => grant(() => ({ cityHp: MAX_CITY_HP }))}>Repair wall</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => ({ hordeKills: s.hordeKills + HORDE_LEVEL_KILLS }))}>Horde +1 level</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => resolveBreach(s))}>Breach now</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => ({ completedResearch: [...new Set([...s.completedResearch, 'lean_rations', 'feast_hall'])] }))}>All rations</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => startFoodEvent(s, 'lean_season', Math.random))}>Lean season</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => startFoodEvent(s, 'bountiful_harvest', Math.random))}>Harvest</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => startFoodEvent(s, 'raid', Math.random))}>Raid</Button>
          <Button size="sm" variant="secondary" onPress={() => grant((s) => startFoodEvent(s, 'refugees', Math.random))}>Refugees</Button>
        </View>
      </Surface>

      <DevStory />
      <DevArtGallery />
      <DevCityPreview />
      <DevWallPreview />
      <DevTitlePreview />

      <Surface style={styles.section}>
        <SectionLabel spacing={2}>FORCE EVENTS</SectionLabel>
        <View style={styles.buttonGrid}>
          <Button size="sm" variant="secondary" onPress={devForceWanderer}>Wanderer arrives</Button>
          <Button size="sm" variant="secondary" disabled={!isSystemOn(state, 'hunger')} onPress={() => grant(() => ({ foodTimer: FOOD_CHECK_INTERVAL - 1 }))}>Food check now</Button>
          <Button size="sm" variant="secondary" onPress={() => grant(() => ({ food: 0 }))}>Empty food stores</Button>
          <Button size="sm" variant="secondary" disabled={!isSystemOn(state, 'siege')} onPress={() => grant((s) => ({ cityHp: Math.max(1, s.cityHp - WALL_HIT) }))}>{`Damage wall ${WALL_HIT}`}</Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={state.activeExpeditions.length === 0}
            onPress={() => grant((s) => ({ activeExpeditions: s.activeExpeditions.map((e) => ({ ...e, startedAt: e.startedAt - EXPEDITION_SKIP_MS })) }))}
          >
            Finish expeditions
          </Button>
        </View>
      </Surface>

      <DevCheckpoints />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[3],
  },
  section: {
    gap: spacing[2],
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
})
