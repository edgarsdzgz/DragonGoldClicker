import React, { useState } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text, Surface, SectionLabel, PillTabs } from '../../components'
import type { PillTab } from '../../components'
import { TitleScreen } from '../TitleScreen'
import type { LoadProgress } from '../../loading/steps'
import { READY_LABEL } from '../../loading/steps'
import { spacing } from '../../theme'

/** The title's states, as the loader would report them */
const STATES: Record<string, LoadProgress> = {
  save: { status: 'loading', stepId: 'save', label: 'Opening your save', fraction: 0.05 },
  art: { status: 'loading', stepId: 'art', label: 'Readying the art', detail: '70 of 175', fraction: 0.44 },
  music: { status: 'loading', stepId: 'music', label: 'Tuning the music', fraction: 0.85 },
  ready: { status: 'ready', stepId: null, label: READY_LABEL, fraction: 1 },
  broken: { status: 'failed', stepId: 'save', label: 'Opening your save', fraction: 0 },
  failed: { status: 'failed', stepId: 'music', label: 'Tuning the music', fraction: 0.8 },
}
const TABS: PillTab[] = [
  { key: 'save', label: 'Save' },
  { key: 'art', label: 'Art' },
  { key: 'music', label: 'Music' },
  { key: 'ready', label: 'Ready' },
  { key: 'broken', label: 'Broken save' },
  { key: 'failed', label: 'Other failure' },
]
/** The preview's share of the window, so the footer sits as it does on the real title */
const SHARE = 0.75

/** Dev panel section: the title screen in each of its states; its buttons do nothing here */
export function DevTitlePreview() {
  const [state, setState] = useState('art')
  const { width, height } = useWindowDimensions()
  const w = width - spacing[4] * 4

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>TITLE PREVIEW</SectionLabel>
      <PillTabs tabs={TABS} activeKey={state} onSelect={setState} />
      <View style={[styles.stage, { width: w, height: height * SHARE }]}>
        <TitleScreen progress={STATES[state]} onStart={() => {}} onRetry={() => {}} onStartFresh={() => {}} />
      </View>
      <Text variant="caption" color="muted">A sample title; on this phone the real one loads before the gate finishes.</Text>
    </Surface>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
    alignItems: 'center',
  },
  stage: {
    overflow: 'hidden',
  },
})
