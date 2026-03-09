import React from 'react'
import { View, StyleSheet, Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { Button } from './Button'
import { colors, spacing, radius } from '../theme'

interface GameOverModalProps {
  visible: boolean
  onReset: () => void
  onDismiss: () => void
}

export function GameOverModal({ visible, onReset, onDismiss }: GameOverModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="skull" size={48} color={colors.status.error} style={styles.icon} />
          <Text variant="h2" center style={{ color: colors.status.error }}>
            Draconia Has Fallen
          </Text>
          <Text variant="body" color="secondary" center style={styles.body}>
            The city walls have crumbled. The monsters have overrun Draconia.
            Rally your strength and try again.
          </Text>
          <View style={styles.actions}>
            <Button size="lg" fullWidth onPress={onReset}>
              Start Over
            </Button>
            <Pressable onPress={onDismiss} style={styles.dismissLink}>
              <Text variant="bodySmall" color="muted" center>
                Continue watching
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
    borderColor: colors.status.error,
    padding: spacing[6],
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: spacing[4],
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
