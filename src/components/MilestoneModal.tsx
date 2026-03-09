import React from 'react'
import { View, StyleSheet, Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { Badge } from './Badge'
import { Button } from './Button'
import { colors, spacing, radius, gold, dark } from '../theme'
import type { MilestoneDef } from '../types/game'

interface MilestoneModalProps {
  visible: boolean
  milestone: MilestoneDef
  onAccept: () => void
  onReject: () => void
}

export function MilestoneModal({ visible, milestone, onAccept, onReject }: MilestoneModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="people" size={40} color={gold[400]} style={styles.icon} />
          <Text variant="h2" center style={{ color: gold[300] }}>
            Refugees Approach
          </Text>
          <Text variant="body" color="secondary" center style={styles.body}>
            Word of Draconia's resilience has spread. A group of{' '}
            {milestone.villagers} displaced villager{milestone.villagers !== 1 ? 's' : ''}{' '}
            seeks shelter within your walls.
          </Text>
          <Badge icon="person-add" color={gold[400]}>
            <Text variant="caption" style={{ color: gold[400] }}>
              +{milestone.villagers} villager{milestone.villagers !== 1 ? 's' : ''}
            </Text>
          </Badge>
          <View style={styles.actions}>
            <Button size="lg" fullWidth onPress={onAccept}>
              Welcome Them
            </Button>
            <Pressable onPress={onReject} style={styles.dismissLink}>
              <Text variant="bodySmall" color="muted" center>
                Turn them away
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  card: {
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: gold[500] + '40',
    padding: spacing[6],
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: spacing[3],
  },
  icon: {
    marginBottom: spacing[1],
  },
  body: {
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  dismissLink: {
    padding: spacing[2],
  },
})
