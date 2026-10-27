import React from 'react'
import { View, Modal, Pressable, StyleSheet } from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { colors, spacing, radius, elevation, dark } from '../theme'

type IconName = GameIconName

export interface ReportRow {
  icon: IconName
  text: string
  /** Defaults to the report's accent color */
  color?: string
}

interface ReportModalProps {
  visible: boolean
  icon: IconName
  /** The accent bar, the icon and the rows' default color */
  accent: string
  title: string
  message: string
  rows: ReportRow[]
  dismissLabel?: string
  /** Whether a tap outside the card closes it; off for reports too important to lose by accident */
  dismissOnBackdrop?: boolean
  onDismiss: () => void
}

/** A card that reports what happened (deaths, losses) as a list of rows, with one dismiss button. */
export function ReportModal({ visible, icon, accent, title, message, rows, dismissLabel = 'Understood', dismissOnBackdrop = true, onDismiss }: ReportModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      {dismissOnBackdrop ? (
        <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityLabel="Close" accessibilityRole="button">
          <View />
        </Pressable>
      ) : (
        <View style={styles.backdrop} />
      )}

      <View style={styles.centerer} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: accent }]} />

          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { borderColor: accent + '80', shadowColor: accent }]}>
              <GameIcon name={icon} size={26} color={accent} />
            </View>
          </View>

          <View style={styles.content}>
            <Text variant="h3" center accessibilityRole="header">{title}</Text>
            <Text variant="bodySmall" color="secondary" center>{message}</Text>
            <View style={styles.rows}>
              {rows.map((row, i) => (
                <View key={i} style={styles.row}>
                  <GameIcon name={row.icon} size={14} color={row.color ?? accent} />
                  <Text variant="bodySmall" style={{ ...styles.rowText, color: row.color ?? accent }}>{row.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text variant="label" color="secondary">{dismissLabel}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
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
  rows: {
    marginTop: spacing[2],
    gap: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rowText: {
    flexShrink: 1,
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
    minHeight: 48,
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
  },
  buttonPressed: {
    backgroundColor: colors.bg.surface3,
  },
})
