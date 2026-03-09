import React from 'react'
import { View, Modal, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import type { StarvationResult } from '../types/game'
import { colors, spacing, radius, elevation, dark } from '../theme'

interface StarvationModalProps {
  visible: boolean
  report: StarvationResult
  onDismiss: () => void
}

function buildDeathLines(report: StarvationResult): string[] {
  const lines: string[] = []
  if (report.villagersLost > 0) {
    lines.push(`${report.villagersLost} idle villager${report.villagersLost > 1 ? 's' : ''} starved`)
  }
  if (report.soldiersLost.conscripts > 0) {
    lines.push(`${report.soldiersLost.conscripts} conscript${report.soldiersLost.conscripts > 1 ? 's' : ''} starved`)
  }
  if (report.soldiersLost.footmen > 0) {
    lines.push(`${report.soldiersLost.footmen} footm${report.soldiersLost.footmen > 1 ? 'en' : 'an'} starved`)
  }
  if (report.soldiersLost.knights > 0) {
    lines.push(`${report.soldiersLost.knights} knight${report.soldiersLost.knights > 1 ? 's' : ''} starved`)
  }
  if (report.foragersLost.gatherers > 0) {
    lines.push(`${report.foragersLost.gatherers} gatherer${report.foragersLost.gatherers > 1 ? 's' : ''} starved`)
  }
  if (report.foragersLost.trappers > 0) {
    lines.push(`${report.foragersLost.trappers} trapper${report.foragersLost.trappers > 1 ? 's' : ''} starved`)
  }
  if (report.foragersLost.rangers > 0) {
    lines.push(`${report.foragersLost.rangers} ranger${report.foragersLost.rangers > 1 ? 's' : ''} starved`)
  }
  if (report.explorersLost > 0) {
    lines.push(`${report.explorersLost} explorer${report.explorersLost > 1 ? 's' : ''} starved`)
  }
  return lines
}

export function StarvationModal({ visible, report, onDismiss }: StarvationModalProps) {
  const lines = buildDeathLines(report)
  const totalLost = report.villagersLost +
    report.soldiersLost.conscripts + report.soldiersLost.footmen + report.soldiersLost.knights +
    report.foragersLost.gatherers + report.foragersLost.trappers + report.foragersLost.rangers +
    report.explorersLost

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View />
      </Pressable>

      <View style={styles.centerer} pointerEvents="box-none">
        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={styles.accentBar} />

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="skull" size={26} color={colors.status.error} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text variant="h3" center>
              {totalLost === 1 ? 'A Villager Has Died' : `${totalLost} Have Perished`}
            </Text>
            <Text variant="bodySmall" color="secondary" center>
              Starvation has claimed your people. Gather food to prevent more deaths.
            </Text>

            {/* Death breakdown */}
            <View style={styles.deathList}>
              {lines.map((line, i) => (
                <View key={i} style={styles.deathRow}>
                  <Ionicons name="close-circle" size={14} color={colors.status.error} />
                  <Text variant="bodySmall" style={{ color: colors.status.error }}>
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Dismiss */}
          <View style={styles.actions}>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.button,
                styles.dismissButton,
                pressed && styles.dismissPressed,
              ]}
            >
              <Text variant="label" color="secondary">
                Understood
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 2, 6, 0.85)',
  },
  centerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: dark[700],
    ...elevation[4],
  },
  accentBar: {
    height: 3,
    width: '100%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.status.error,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    height: 80,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bg.surface1,
    borderWidth: 1.5,
    borderColor: colors.status.error + '80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
    gap: spacing[2],
  },
  deathList: {
    marginTop: spacing[2],
    gap: spacing[1],
  },
  deathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: dark[700],
    marginHorizontal: spacing[4],
  },
  actions: {
    padding: spacing[4],
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    minHeight: 44,
  },
  dismissButton: {
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
  },
  dismissPressed: {
    backgroundColor: colors.bg.surface3,
  },
})
