import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { colors, spacing, radius } from '../theme'

interface ArmyReadoutProps {
  /** The monster measured against (the toughest the horde sends now) */
  monsterName: string
  /** Seconds the army alone takes to kill it (Infinity when it cannot) */
  killSec: number
  /** Seconds between that monster's strikes on the wall */
  strikeSec: number
}

/**
 * Can the army hold the Gate while the player is away? The army's kill time against the
 * monster's strike timer, in words, with a verdict that does not rest on color alone.
 */
export function ArmyReadout({ monsterName, killSec, strikeSec }: ArmyReadoutProps) {
  const holds = killSec < strikeSec
  const tint = holds ? colors.status.success : colors.status.warning
  const kills = Number.isFinite(killSec)
    ? `Your army kills ${article(monsterName)} ${monsterName} in about ${killSec} seconds.`
    : `Your army cannot kill ${article(monsterName)} ${monsterName} on its own.`
  const verdict = holds
    ? 'The army holds the Gate while you are away.'
    : 'The wall takes hits while you are away.'

  return (
    <View style={[styles.box, { borderColor: tint + '66' }]} accessible accessibilityLabel={`${kills} It strikes the wall every ${strikeSec}. ${verdict}`}>
      <Ionicons name={holds ? 'shield-checkmark' : 'warning'} size={16} color={tint} />
      <View style={styles.text}>
        <Text variant="bodySmall">{kills}</Text>
        <Text variant="caption" color="secondary">{`${article(monsterName, true)} ${monsterName} strikes the wall every ${strikeSec}.`}</Text>
        <Text variant="caption" style={{ color: tint }}>{verdict}</Text>
      </View>
    </View>
  )
}

function article(name: string, capital = false): string {
  const a = /^[aeiou]/i.test(name) ? 'an' : 'a'
  return capital ? a[0].toUpperCase() + a.slice(1) : a
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.bg.surface1,
  },
  text: {
    flex: 1,
    gap: 2,
  },
})
