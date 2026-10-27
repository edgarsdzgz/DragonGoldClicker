import React, { useState } from 'react'
import { PixelRatio, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, Surface, SectionLabel, PillTabs } from '../../components'
import type { PillTab } from '../../components'
import { cityUnit } from '../../art'
import type { CityBuildingId, CityLight, PlotLook } from '../../art'
import { CityMap } from '../shop/CityMap'
import type { CityPlot } from '../shop/CityMap'
import { spacing } from '../../theme'

const NAMES: Record<CityBuildingId, string> = {
  keep: 'Draconia Keep', garrison: 'The Garrison', forge: 'The Forge', lodge: "Ranger's Lodge",
  outpost: 'The Outpost', librarium: 'The Librarium', housing: 'Housing', wizard: "Wizard's Tower",
  tower_east: 'Tower East', tower_west: 'Tower West',
}
const SOON: CityBuildingId[] = ['housing', 'wizard', 'tower_east', 'tower_west']
const fog: PlotLook = { visible: false, built: false, level: 0 }
const ruin = (over: Partial<PlotLook> = {}): PlotLook => ({ visible: true, built: false, level: 0, ...over })
const built = (level: number, over: Partial<PlotLook> = {}): PlotLook => ({ visible: true, built: true, level, ...over })

/** Three moments of a city, from a ruin to a restored Keep; nothing here reads or touches the save */
const MOMENTS: Record<string, Record<CityBuildingId, PlotLook>> = {
  start: {
    keep: ruin(), garrison: ruin({ canAfford: true }), forge: fog, lodge: fog, outpost: fog,
    librarium: fog, housing: fog, wizard: fog, tower_east: fog, tower_west: fog,
  },
  mid: {
    keep: built(0), garrison: built(3, { hasAction: true }), forge: built(0, { lit: true }), lodge: built(1),
    outpost: ruin({ canAfford: true }), librarium: fog, housing: fog, wizard: fog, tower_east: fog, tower_west: fog,
  },
  late: {
    keep: built(3, { maxed: true }), garrison: built(5), forge: built(0, { lit: true }), lodge: built(3),
    outpost: built(2), librarium: built(0, { hasAction: true }), housing: ruin({ comingSoon: true }),
    wizard: ruin({ comingSoon: true }), tower_east: ruin({ comingSoon: true }), tower_west: ruin({ comingSoon: true }),
  },
}
const TABS: PillTab[] = [
  { key: 'start', label: 'Start' },
  { key: 'mid', label: 'Mid' },
  { key: 'late', label: 'Late' },
]
const LIGHTS: PillTab[] = [
  { key: 'night', label: 'Night' },
  { key: 'dusk', label: 'Dusk' },
  { key: 'day', label: 'Lit' },
]

/** Dev panel section: the Draconia map at three moments and in each light, to check the plots and markers on the device */
export function DevCityPreview() {
  const [moment, setMoment] = useState('start')
  const [light, setLight] = useState<CityLight>('night')
  const width = useWindowDimensions().width - spacing[4] * 4
  const looks = MOMENTS[moment]
  const plots: CityPlot[] = (Object.keys(looks) as CityBuildingId[]).map((id) => ({
    id,
    name: NAMES[id],
    look: { ...looks[id], comingSoon: looks[id].comingSoon ?? (SOON.includes(id) || undefined) },
    detail: looks[id].visible && !looks[id].built && !SOON.includes(id) ? '120 renown' : undefined,
  }))

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>CITY PREVIEW</SectionLabel>
      <PillTabs tabs={TABS} activeKey={moment} onSelect={setMoment} />
      <PillTabs tabs={LIGHTS} activeKey={light} onSelect={(k) => setLight(k as CityLight)} />
      <Text variant="caption" color="muted">Sample cities, not your save. Plots do nothing here.</Text>
      <CityMap plots={plots} unit={cityUnit(width, PixelRatio.get())} light={light} onPress={() => {}} />
    </Surface>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
    alignItems: 'center',
  },
})
