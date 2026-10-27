import React from 'react'
import { StyleSheet } from 'react-native'
import type { TextStyle } from 'react-native'
import { Text } from './Text'
import type { MonsterRank } from '../types/monsterRoster'
import { colors, gold } from '../theme'

/** The word before a ranked monster's name, and its color */
const RANK_LABEL: Record<MonsterRank, string> = { elite: 'ELITE', miniboss: 'MINI-BOSS', boss: 'BOSS' }
const RANK_COLOR: Record<MonsterRank, string> = { elite: gold[500], miniboss: gold[500], boss: colors.warfront.rally }

interface MonsterNameProps {
  name: string
  rank?: MonsterRank
  /** The row's own style (its height and color) */
  style?: TextStyle
}

/** A monster's name, with its rank before it when it has one: deeper gold, a boss in red */
export function MonsterName({ name, rank, style }: MonsterNameProps) {
  return (
    <Text variant="label" center style={style}>
      {rank && <Text variant="label" style={{ ...styles.rank, color: RANK_COLOR[rank] }}>{`${RANK_LABEL[rank]} `}</Text>}
      {name}
    </Text>
  )
}

const styles = StyleSheet.create({
  rank: {
    letterSpacing: 1,
  },
})
