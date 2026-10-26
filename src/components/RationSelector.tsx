import React, { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { useGame } from '../context/GameContext'
import { useHaptics } from '../hooks'
import { RATIONS, isRationAvailable, rationDef } from '../types/rations'
import type { RationDef, RationId } from '../types/rations'
import { FIGHTER_FOOD_COST, RESEARCH_NODES, formatAmount } from '../types/game'
import { colors, spacing, radius, gold } from '../theme'

/** What a ration does, in one line */
export function rationEffectText(r: RationDef): string {
  if (r.damage <= 0) return 'Fighters stand down: they eat nothing and do not fight, but still guard the wall.'
  return `Each fighter eats ${formatAmount(FIGHTER_FOOD_COST * r.upkeep)} per meal and hits at ${Math.round(r.damage * 100)}%.`
}

/**
 * The fighters' rations: five segments from none to double (core-tap layer 3.4). Locked ones
 * show a lock and say which research opens them. The line below explains the chosen ration.
 */
export function RationSelector() {
  const { state, setRation } = useGame()
  const haptics = useHaptics()
  // A locked segment, tapped: say how to unlock it instead of the current ration's effect
  const [lockedTapped, setLockedTapped] = useState<RationId | null>(null)
  const current = rationDef(state.ration)

  const choose = (r: RationDef) => {
    haptics.light()
    if (!isRationAvailable(state, r.id)) {
      setLockedTapped(r.id)
      return
    }
    setLockedTapped(null)
    setRation(r.id)
  }

  const lockedDef = lockedTapped ? rationDef(lockedTapped) : null
  const lockedResearch = lockedDef?.research ? RESEARCH_NODES.find((n) => n.id === lockedDef.research)?.name : null

  return (
    <View style={styles.root}>
      <Text variant="caption" color="muted" style={styles.title}>FIGHTERS' RATIONS</Text>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Fighters' rations">
        {RATIONS.map((r) => {
          const available = isRationAvailable(state, r.id)
          const selected = r.id === current.id
          return (
            <Pressable
              key={r.id}
              onPress={() => choose(r)}
              style={[styles.segment, selected && styles.selected, !available && styles.locked]}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !available }}
              accessibilityLabel={`${r.label} rations${available ? '' : ', locked'}`}
              hitSlop={{ top: 6, bottom: 6 }}
            >
              {!available && <Ionicons name="lock-closed" size={10} color={colors.text.muted} />}
              <Text
                variant="caption"
                style={{ color: selected ? gold[300] : available ? colors.text.secondary : colors.text.muted, fontWeight: selected ? '700' : '500' }}
              >
                {r.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <Text variant="caption" color="muted" center style={styles.effect} accessibilityLiveRegion="polite">
        {lockedDef
          ? `${lockedDef.label} rations: research ${lockedResearch ?? 'it'} in the Librarium.`
          : rationEffectText(current)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[1],
    paddingHorizontal: spacing[4],
  },
  title: {
    letterSpacing: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.surface1,
  },
  selected: {
    borderColor: gold[500],
    backgroundColor: colors.bg.surface2,
  },
  locked: {
    opacity: 0.6,
  },
  effect: {
    minHeight: 16,
  },
})
