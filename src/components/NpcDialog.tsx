import React, { useEffect, useRef } from 'react'
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { colors, spacing, radius, elevation, gold, dark } from '../theme'
import { useHaptics, useSfx } from '../hooks'
import { SFX } from '../data/sfx'

interface NpcDialogProps {
  visible: boolean
  npcName: string
  icon: keyof typeof Ionicons.glyphMap
  title: string
  lines: string[]
  dismissLabel?: string
  onDismiss: () => void
}

export function NpcDialog({
  visible,
  npcName,
  icon,
  title,
  lines,
  dismissLabel = 'Understood',
  onDismiss,
}: NpcDialogProps) {
  const haptics = useHaptics()
  const playNpc = useSfx(SFX.NPC)
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.85)).current
  const cardOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      playNpc()
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      backdropOpacity.setValue(0)
      cardScale.setValue(0.85)
      cardOpacity.setValue(0)
    }
  }, [visible, playNpc, backdropOpacity, cardScale, cardOpacity])

  const handleDismiss = () => {
    haptics.light()
    onDismiss()
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      <View style={styles.centerer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Accent bar */}
          <View style={styles.accentBar} />

          {/* NPC identity */}
          <View style={styles.npcHeader}>
            <View style={styles.npcIcon}>
              <Ionicons name={icon} size={22} color={gold[400]} />
            </View>
            <Text variant="caption" style={styles.npcName}>
              {npcName}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text variant="h3" center>
              {title}
            </Text>
            {lines.map((line, i) => (
              <Text key={i} variant="bodySmall" color="secondary" style={styles.line}>
                {line}
              </Text>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Dismiss */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={dismissLabel}
            >
              <Text variant="label" bold style={{ color: dark[900] }}>
                {dismissLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
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
    backgroundColor: colors.status.warning,
  },
  npcHeader: {
    alignItems: 'center',
    paddingTop: spacing[5],
    gap: spacing[2],
  },
  npcIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(224, 168, 64, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 168, 64, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  npcName: {
    color: gold[400],
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
    gap: spacing[2],
  },
  line: {
    lineHeight: 20,
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
    backgroundColor: gold[500],
  },
  buttonPressed: {
    backgroundColor: gold[600],
  },
})
