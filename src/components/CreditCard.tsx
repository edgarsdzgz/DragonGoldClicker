import React from 'react'
import { View, StyleSheet, Pressable, Linking } from 'react-native'
import { Text } from './Text'
import type { CreditEntry } from '../data/credits'
import { spacing } from '../theme'

/** A tappable link line. URLs come only from bundled credit data, never from user input. */
function CreditLink({ label, url, spoken }: { label: string; url: string; spoken: string }) {
  return (
    <Pressable
      onPress={() => { Linking.openURL(url).catch(() => { /* no browser available */ }) }}
      accessibilityRole="link"
      accessibilityLabel={spoken}
      accessibilityHint="Opens in your browser"
      hitSlop={8}
      style={styles.link}
    >
      <Text variant="bodySmall" color="link">{label}</Text>
    </Pressable>
  )
}

/** One third-party asset's attribution, in the form its license asks for. */
export function CreditCard({ credit }: { credit: CreditEntry }) {
  return (
    <View style={styles.root}>
      <Text variant="caption" color="muted">{credit.role.toUpperCase()}</Text>
      <Text variant="label">{credit.attribution ?? `${credit.title} by ${credit.author}`}</Text>
      <CreditLink label={credit.authorUrl} url={credit.authorUrl} spoken={`${credit.author}'s page`} />
      <CreditLink label={credit.source} url={credit.sourceUrl} spoken={`Source: ${credit.source}`} />
      <CreditLink label={credit.license} url={credit.licenseUrl} spoken={`License: ${credit.license}`} />
      {credit.changes && <Text variant="caption" color="muted">{credit.changes}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[1],
    paddingVertical: spacing[2],
  },
  link: {
    minHeight: 32,
    justifyContent: 'center',
  },
})
