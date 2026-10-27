import React from 'react'
import { StyleSheet } from 'react-native'
import type { TextStyle } from 'react-native'
import { Text } from './Text'
import type { MonsterRank } from '../types/monsterRoster'
import { gold } from '../theme'

/** The word before a ranked monster's name */
const RANK_LABEL: Record<MonsterRank, string> = { elite: 'ELITE' }

interface MonsterNameProps {
  name: string
  rank?: MonsterRank
  /** The row's own style (its height and color) */
  style?: TextStyle
}

/** A monster's name, with its rank before it in a deeper gold when it has one */
export function MonsterName({ name, rank, style }: MonsterNameProps) {
  return (
    <Text variant="label" center style={style}>
      {rank && <Text variant="label" style={styles.rank}>{`${RANK_LABEL[rank]} `}</Text>}
      {name}
    </Text>
  )
}

const styles = StyleSheet.create({
  rank: {
    color: gold[500],
    letterSpacing: 1,
  },
})
