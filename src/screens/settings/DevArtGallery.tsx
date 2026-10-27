import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, SectionLabel, PillTabs, PixelSprite } from '../../components'
import type { PillTab } from '../../components'
import { SPRITES } from '../../art'
import type { SpriteId } from '../../art'
import { colors, spacing, radius } from '../../theme'

/** The gallery's groups, by id prefix, with the scale each is shown at in the game */
const GROUPS: { key: string; label: string; prefix: string; scale: number }[] = [
  { key: 'icon', label: 'Icons', prefix: 'icon_', scale: 4 },
  { key: 'mob', label: 'Mobs', prefix: 'mob_', scale: 4 },
  { key: 'bld', label: 'Buildings', prefix: 'bld_', scale: 3 },
  { key: 'map', label: 'Maps', prefix: 'map_', scale: 2 },
  { key: 'ppl', label: 'People', prefix: 'ppl_', scale: 4 },
  { key: 'fx', label: 'FX', prefix: 'fx_', scale: 3 },
  { key: 'evt', label: 'Events', prefix: 'evt_', scale: 3 },
]
const TABS: PillTab[] = GROUPS.map((g) => ({ key: g.key, label: g.label }))
const IDS = Object.keys(SPRITES) as SpriteId[]

/**
 * Dev panel section: every sprite of the official art at its game scale, one group at a time,
 * to check sharpness, colors and strip speeds on the device before a screen uses them.
 */
export function DevArtGallery() {
  const [groupKey, setGroupKey] = useState(GROUPS[0].key)
  const group = GROUPS.find((g) => g.key === groupKey) ?? GROUPS[0]
  const ids = IDS.filter((id) => id.startsWith(group.prefix))

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>ART GALLERY</SectionLabel>
      <PillTabs tabs={TABS} activeKey={groupKey} onSelect={setGroupKey} />
      <Text variant="caption" color="muted">
        {`${ids.length} of ${IDS.length} sprites, shown at x${group.scale}. Strips play at their own speed.`}
      </Text>
      <View style={styles.grid}>
        {ids.map((id) => (
          <View key={id} style={styles.cell}>
            <PixelSprite id={id} scale={group.scale} accessibilityLabel={SPRITES[id].label} />
            <Text variant="caption" color="muted" style={styles.name}>{id}</Text>
          </View>
        ))}
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  cell: {
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface2,
  },
  name: {
    maxWidth: 140,
    textAlign: 'center',
  },
})
