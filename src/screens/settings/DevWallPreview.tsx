import React, { useRef, useState } from 'react'
import { PixelRatio, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text, Surface, SectionLabel, PillTabs, Button } from '../../components'
import type { PillTab } from '../../components'
import { MAP_GATE, mapUnit } from '../../art'
import type { GateState } from '../../art'
import { WarfrontScene } from '../warfront/WarfrontScene'
import type { WarfrontSceneHandle } from '../warfront/WarfrontScene'
import { spacing } from '../../theme'

const ARMY_TABS: PillTab[] = [0, 1, 2, 4].map((n) => ({ key: String(n), label: n === 0 ? 'No army' : `${n} on the wall` }))
const GATE_TABS: PillTab[] = MAP_GATE.gate.states.map((s) => ({ key: s, label: s }))
/** Map pixels of night shown above the gate, for the fighters and the blows */
const ABOVE_GATE = 24

/** Dev panel section: the wall's life on demand (fighters, volleys, blows, repairs, the breach); nothing touches the save */
export function DevWallPreview() {
  const width = useWindowDimensions().width - spacing[4] * 4
  const unit = mapUnit(width, PixelRatio.get())
  const height = (MAP_GATE.gate.height + ABOVE_GATE) * unit
  const scene = useRef<WarfrontSceneHandle>(null)
  const [army, setArmy] = useState('2')
  const [gate, setGate] = useState<GateState>('sound')
  const [repairing, setRepairing] = useState(false)

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>WALL PREVIEW</SectionLabel>
      <PillTabs tabs={ARMY_TABS} activeKey={army} onSelect={setArmy} />
      <PillTabs tabs={GATE_TABS} activeKey={gate} onSelect={(k) => setGate(k as GateState)} />
      <View style={[styles.stage, { width, height }]}>
        <WarfrontScene ref={scene} unit={unit} wallTop={height} gate={gate} army={Number(army)} repairing={repairing} />
      </View>
      <View style={styles.buttons}>
        <Button size="sm" variant="secondary" onPress={() => scene.current?.volley()}>Volley</Button>
        <Button size="sm" variant="secondary" onPress={() => scene.current?.struck()}>Blow</Button>
        <Button size="sm" variant="secondary" onPress={() => setRepairing((r) => !r)}>{repairing ? 'Stop repair' : 'Repair'}</Button>
        <Button size="sm" variant="secondary" onPress={() => scene.current?.breach()}>Breach</Button>
      </View>
      <Text variant="caption" color="muted">A sample wall, not your save.</Text>
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
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
})
