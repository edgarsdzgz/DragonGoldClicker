import React from 'react'
import { View, Modal, Pressable, StyleSheet } from 'react-native'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { Button } from './Button'
import { colors, spacing, radius, elevation, dark } from '../theme'

interface FoodWarningModalProps {
  visible: boolean
  /** 3 = warning (3 events left), 1 = urgent (1 event left) */
  level: 3 | 1
  onGoToForage: () => void
  onDismiss: () => void
}

export function FoodWarningModal({
  visible,
  level,
  onGoToForage,
  onDismiss,
}: FoodWarningModalProps) {
  const urgent = level === 1
  const accentColor = urgent ? colors.status.error : colors.status.warning

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Backdrop -- tapping outside dismisses */}
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View />
      </Pressable>

      <View style={styles.centerer} pointerEvents="box-none">
        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                {
                  borderColor: accentColor + '80',
                  shadowColor: accentColor,
                },
              ]}
            >
              <GameIcon
                name={urgent ? 'alert-circle' : 'warning'}
                size={26}
                color={accentColor}
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text variant="h3" center>
              {urgent ? 'Food Nearly Gone!' : 'Food Running Low'}
            </Text>
            <Text variant="bodySmall" color="secondary" center>
              {urgent
                ? 'After the next meal the stores will be empty. Your fighters will go hungry and stand down until they are fed.'
                : 'Your food stores are dwindling. If nothing changes, your fighters will go hungry soon.'}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Actions */}
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
                Dismiss
              </Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Button
                size="md"
                icon="leaf"
                accentColor="#4ade80"
                onPress={onGoToForage}
                fullWidth
              >
                Go Gather
              </Button>
            </View>
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
  divider: {
    height: 1,
    backgroundColor: dark[700],
    marginHorizontal: spacing[4],
  },
  actions: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
  },
  button: {
    flex: 1,
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
