import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Surface, Button, StatRow, SectionLabel, InspirationIcon, ToggleRow } from '../components'
import { PillTabs } from '../components/PillTabs'
import type { PillTab } from '../components/PillTabs'
import { VolumeControl } from '../components/VolumeControl'
import { ConfirmModal } from '../components/ConfirmModal'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useAudioSettings } from '../context/AudioSettingsContext'
import { DevPanel } from './settings/DevPanel'
import { colors, spacing } from '../theme'
import { formatNumber, getTotalSoldiers, getFoodConsumption, FOOD_CHECK_INTERVAL, RESEARCH_NODES } from '../types/game'

const TABS: PillTab[] = [
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
  { key: 'stats', label: 'Stats', icon: 'stats-chart' },
  // Test tools: development builds only, never shipped to players
  ...(__DEV__ ? [{ key: 'dev', label: 'Dev', icon: 'construct-outline' } as PillTab] : []),
]

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('settings')
  const { state, effectiveAutoRate, resetGame } = useGame()
  const [showResetModal, setShowResetModal] = useState(false)

  return (
    <View style={styles.container}>
      <ResourceBar inspiration={state.inspiration} food={state.food} foodSystemActive={state.foodSystemActive} autoInspPerSec={effectiveAutoRate} />
      <PillTabs tabs={TABS} activeKey={activeTab} onSelect={setActiveTab} />

      {activeTab === 'settings' && (
        <SettingsContent
          showResetModal={showResetModal}
          onShowReset={() => setShowResetModal(true)}
        />
      )}
      {activeTab === 'stats' && <StatsContent />}
      {__DEV__ && activeTab === 'dev' && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <DevPanel />
        </ScrollView>
      )}

      <ConfirmModal
        visible={showResetModal}
        title="Reset Game"
        message="All inspiration, soldiers, buildings, and progress will be permanently erased. This cannot be undone."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        icon="skull"
        onConfirm={() => {
          setShowResetModal(false)
          resetGame()
        }}
        onCancel={() => setShowResetModal(false)}
      />
    </View>
  )
}

// -- Settings sub-page --

function SettingsContent({ showResetModal, onShowReset }: { showResetModal: boolean; onShowReset: () => void }) {
  const audio = useAudioSettings()

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.section}>
        <SectionLabel spacing={2}>SOUND & VIBRATION</SectionLabel>
        <VolumeControl
          label="Music"
          value={audio.musicVolume}
          muted={audio.musicMuted}
          onValueChange={audio.setMusicVolume}
          onToggleMute={audio.toggleMusicMute}
        />
        <View style={styles.spacer} />
        <VolumeControl
          label="Sound Effects"
          value={audio.sfxVolume}
          muted={audio.sfxMuted}
          onValueChange={audio.setSfxVolume}
          onToggleMute={audio.toggleSfxMute}
        />
        <View style={styles.spacer} />
        <ToggleRow
          label="Vibration"
          description="Buzz on taps, purchases and events"
          icon="phone-portrait-outline"
          value={audio.hapticsEnabled}
          onValueChange={audio.toggleHaptics}
        />
      </Surface>

      <View style={styles.resetSection}>
        <SectionLabel spacing={2}>DANGER ZONE</SectionLabel>
        <Button
          variant="ghost"
          onPress={onShowReset}
          size="sm"
        >
          Reset Game
        </Button>
        <Text variant="caption" color="muted" center>
          This will erase all progress
        </Text>
      </View>
    </ScrollView>
  )
}

// -- Stats sub-page --

function StatsContent() {
  const { state, effectiveAutoRate } = useGame()

  const totalTrained = getTotalSoldiers(state.soldiersTrained)
  const foodPerCheck = getFoodConsumption(state.villagers, state.soldiers)
  const foodPerSec = foodPerCheck / FOOD_CHECK_INTERVAL
  const timePlayed = Math.floor((Date.now() - state.startedAt) / 1000)
  const hours = Math.floor(timePlayed / 3600)
  const minutes = Math.floor((timePlayed % 3600) / 60)

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.section}>
        <SectionLabel spacing={2}>ECONOMY</SectionLabel>
        <StatRow icon="wallet" iconElement={<InspirationIcon size={14} />} label="Inspiration" value={formatNumber(state.inspiration)} accent />
        <StatRow icon="trending-up" label="Total Earned" value={formatNumber(state.totalInspirationEarned)} />
        <StatRow icon="trending-down" label="Total Spent" value={formatNumber(state.totalInspirationSpent)} />
        <StatRow icon="speedometer" label="Auto insp/s" value={effectiveAutoRate.toFixed(2)} />
      </Surface>

      <Surface style={styles.section}>
        <SectionLabel spacing={2}>COMBAT</SectionLabel>
        <StatRow icon="skull" label="Monsters Defeated" value={formatNumber(state.monstersDefeated)} accent />
        <StatRow icon="hand-left" label="Total Clicks" value={formatNumber(state.totalClicks)} />
        <StatRow icon="flash" label="Click Power" value={String(state.clickPower)} />
      </Surface>

      <Surface style={styles.section}>
        <SectionLabel spacing={2}>ARMY</SectionLabel>
        <StatRow icon="people" label="Active Soldiers" value={String(getTotalSoldiers(state.soldiers))} accent />
        <StatRow icon="ribbon" label="Soldiers Trained" value={String(totalTrained)} />
        {state.soldiersTrained.conscripts > 0 && (
          <StatRow icon="person" label="Conscripts Trained" value={String(state.soldiersTrained.conscripts)} />
        )}
        {state.soldiersTrained.footmen > 0 && (
          <StatRow icon="person" label="Footmen Trained" value={String(state.soldiersTrained.footmen)} />
        )}
        {state.soldiersTrained.knights > 0 && (
          <StatRow icon="person" label="Knights Trained" value={String(state.soldiersTrained.knights)} />
        )}
        {state.soldiersPromoted > 0 && (
          <StatRow icon="arrow-up-circle" label="Promotions" value={String(state.soldiersPromoted)} />
        )}
        {state.barracksLevel > 0 && (
          <StatRow icon="home" label="Barracks Level" value={String(state.barracksLevel)} />
        )}
      </Surface>

      {state.foodSystemActive && (
        <Surface style={styles.section}>
          <SectionLabel spacing={2}>DRACONIA</SectionLabel>
          <StatRow icon="nutrition" label="Food" value={formatNumber(state.food)} accent />
          <StatRow icon="home" label="Villagers" value={String(state.villagers)} />
          <StatRow icon="trending-down" label="Food/check" value={`-${foodPerCheck} every ${FOOD_CHECK_INTERVAL}s`} />
          <StatRow icon="speedometer" label="Consumption" value={`${foodPerSec.toFixed(2)}/s`} />
          {state.villagersLost > 0 && (
            <StatRow icon="skull" label="Villagers Lost" value={String(state.villagersLost)} />
          )}
        </Surface>
      )}

      {state.armoryBuilt && (
        <Surface style={styles.section}>
          <SectionLabel spacing={2}>ARMORY</SectionLabel>
          <StatRow icon="flash" label="Swords" value={String(state.armoryGear.swords)} />
          <StatRow icon="shield" label="Shields" value={String(state.armoryGear.shields)} />
          <StatRow icon="hammer" label="Weapons Owned" value={String(state.ownedWeapons.length)} />
        </Surface>
      )}

      {state.librariumBuilt && (
        <Surface style={styles.section}>
          <SectionLabel spacing={2}>LIBRARIUM</SectionLabel>
          <StatRow icon="book" label="Research Complete" value={`${state.completedResearch.length}/${RESEARCH_NODES.length}`} />
        </Surface>
      )}

      <Surface style={styles.section}>
        <SectionLabel spacing={2}>SESSION</SectionLabel>
        <StatRow icon="time" label="Time Played" value={`${hours}h ${minutes}m`} />
      </Surface>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    gap: spacing[3],
    paddingBottom: spacing[8],
  },
  section: {
    gap: spacing[1],
  },
  spacer: {
    height: spacing[2],
  },
  resetSection: {
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[2],
  },
})
