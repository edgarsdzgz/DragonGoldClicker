import React, { useRef } from 'react'
import { View, StyleSheet, Pressable, Animated } from 'react-native'
import { Text } from '../components'
import { useGame } from '../context/GameContext'
import { useHaptics } from '../hooks'
import { colors, spacing, gold } from '../theme'
import { formatNumber } from '../types/game'

export function GameScreen() {
  const { state, click, idleIncome } = useGame()
  const haptics = useHaptics()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    click()
    haptics.light()

    // Quick scale bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <Text variant="caption" color="secondary">
          {formatNumber(state.clickPower)} gold/click
        </Text>
        {idleIncome > 0 && (
          <Text variant="caption" color="secondary">
            {formatNumber(idleIncome)} gold/sec
          </Text>
        )}
      </View>

      <View style={styles.goldDisplay}>
        <Text variant="display" color="link" center>
          {formatNumber(state.gold)}
        </Text>
        <Text variant="bodySmall" color="muted" center>
          gold
        </Text>
      </View>

      <View style={styles.buttonArea}>
        <Pressable onPress={handlePress} style={styles.clickerTouchArea}>
          <Animated.View
            style={[styles.clickerButton, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text variant="h1" center style={styles.dragonText}>
              DRAGON
            </Text>
            <Text variant="h3" color="link" center>
              TAP FOR GOLD
            </Text>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text variant="caption" color="muted" center>
          Total clicks: {formatNumber(state.totalClicks)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
    paddingHorizontal: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
    paddingHorizontal: spacing[2],
  },
  goldDisplay: {
    alignItems: 'center',
    paddingTop: spacing[8],
  },
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickerTouchArea: {
    padding: spacing[4],
  },
  clickerButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.bg.surface1,
    borderWidth: 3,
    borderColor: gold[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  dragonText: {
    color: gold[400],
    marginBottom: spacing[2],
  },
  footer: {
    paddingBottom: spacing[6],
  },
})
