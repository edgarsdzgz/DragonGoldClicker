import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Text } from './Text'
import { CLAWS, MAX_CLAW_LEVEL, clawDef, nextClaw } from '../types/claws'
import { formatNumber } from '../types/state'
import { colors, spacing, radius, gold, dark } from '../theme'

interface ClawsSheetProps {
  visible: boolean
  onClose: () => void
  level: number
  renown: number
  /** Kael reforges past Ancient (after his Dragonsteel scene, chapter 8) */
  reforge: boolean
  onSharpen: () => void
}

/**
 * The dragon's claws (layer 3): what they are now, what the next level gives and costs, and the
 * named track. Past Ancient the track ends with the current reforge and the next one (chapter 8).
 * One tap of Sharpen (or Reforge) buys one level.
 */
export function ClawsSheet({ visible, onClose, level, renown, reforge, onSharpen }: ClawsSheetProps) {
  const now = clawDef(level)
  const next = nextClaw(level, reforge)
  const affordable = next !== null && renown >= next.cost
  const reforging = next !== null && next.level > MAX_CLAW_LEVEL
  // The named levels, then where the reforges stand: the current one and the next
  const track = [
    ...CLAWS,
    ...(level > MAX_CLAW_LEVEL ? [now] : []),
    ...(reforging && next ? [next] : []),
  ]

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Your Claws"
      subtitle={`${now.name}: ${now.damage} damage per tap`}
      icon="flash"
      iconColor={gold[400]}
      heightPercent={70}
    >
      {next ? (
        <View style={styles.next}>
          <Text variant="body">{`${next.name}: ${next.damage} damage per tap (+${next.damage - now.damage})`}</Text>
          <Text variant="caption" color="muted">
            {affordable
              ? 'Harder strikes kill faster and earn more renown with every tap.'
              : `Needs ${formatNumber(next.cost)} renown. You have ${formatNumber(renown)}.`}
          </Text>
          <Button onPress={onSharpen} disabled={!affordable} icon={reforging ? 'hammer' : 'flash'} fullWidth>
            {`${reforging ? 'Reforge' : 'Sharpen'} for ${formatNumber(next.cost)} renown`}
          </Button>
        </View>
      ) : (
        <Text variant="body" style={styles.next}>Your claws are Ancient. Kael's forge may yet make them sharper.</Text>
      )}

      <View style={styles.track} accessibilityRole="list">
        {track.map((c) => {
          const owned = c.level <= level
          const isNow = c.level === level
          return (
            <View
              key={c.level}
              style={[styles.row, isNow && styles.rowNow]}
              accessible
              accessibilityLabel={`${c.name}, ${c.damage} damage per tap${isNow ? ', yours now' : owned ? ', passed' : `, ${formatNumber(c.cost)} renown`}`}
            >
              <Ionicons
                name={owned ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={owned ? gold[400] : colors.text.muted}
              />
              <Text variant="bodySmall" color={owned ? 'primary' : 'muted'} style={styles.name}>{c.name}</Text>
              <Text variant="caption" color={owned ? 'link' : 'muted'}>{`${c.damage} per tap`}</Text>
              {!owned && <Text variant="caption" color="muted" style={styles.cost}>{formatNumber(c.cost)}</Text>}
            </View>
          )
        })}
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  next: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  track: {
    gap: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
  },
  rowNow: {
    backgroundColor: dark[800],
    borderWidth: 1,
    borderColor: gold[700],
  },
  name: {
    flex: 1,
  },
  cost: {
    minWidth: 48,
    textAlign: 'right',
  },
})
