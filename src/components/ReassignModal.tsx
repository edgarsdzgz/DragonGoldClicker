import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { InspirationIcon } from './InspirationIcon'
import { colors, spacing, radius, elevation, gold, dark } from '../theme'
import { useHaptics } from '../hooks'
import { formatNumber } from '../types/game'
import type { ReassignOption, RoleId } from '../types/game'

// =============================================================================
// ROLE OPTION ROW
// =============================================================================

export function getRoleIcon(target: RoleId): keyof typeof Ionicons.glyphMap {
  if (target.type === 'fighter') return 'shield'
  if (target.type === 'repairer') return 'construct'
  if (target.type === 'soldier') return 'people'
  if (target.type === 'forager') return 'leaf'
  if (target.type === 'explorer') return 'compass'
  return 'home'
}

export function getRoleColor(target: RoleId): string {
  if (target.type === 'fighter') return colors.warfront.rally
  if (target.type === 'repairer') return colors.warfront.repair
  if (target.type === 'soldier') return gold[300]
  if (target.type === 'forager') return colors.building.lodge
  if (target.type === 'explorer') return colors.building.explorer
  return dark[300]
}

function RoleOptionRow({
  option,
  inspiration: playerInspiration,
  onSelect,
}: {
  option: ReassignOption
  inspiration: number
  onSelect: () => void
}) {
  const haptics = useHaptics()
  const isDisabled = option.locked || option.atCap || (option.netCost > 0 && playerInspiration < option.netCost)
  const isDismiss = option.target.type === 'idle'
  const iconName = getRoleIcon(option.target)
  const accentColor = getRoleColor(option.target)

  const handlePress = () => {
    if (isDisabled) return
    haptics.medium()
    onSelect()
  }

  const costLabel = option.netCost > 0
    ? `${formatNumber(option.netCost)} renown`
    : option.netCost < 0
      ? `+${formatNumber(Math.abs(option.netCost))} renown`
      : 'FREE'

  const costColor = option.netCost > 0
    ? (playerInspiration >= option.netCost ? gold[300] : colors.status.error)
    : option.netCost < 0
      ? colors.status.success
      : dark[300]

  let statusLabel = ''
  if (option.locked) statusLabel = option.lockReason
  else if (option.atCap) statusLabel = 'FULL'

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        rowStyles.container,
        isDismiss && rowStyles.dismissContainer,
        isDisabled && rowStyles.disabled,
        pressed && !isDisabled && rowStyles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Move to ${option.label}, ${costLabel}`}
    >
      <View style={rowStyles.left}>
        <Ionicons
          name={option.locked ? 'lock-closed' : iconName}
          size={14}
          color={isDisabled ? dark[500] : accentColor}
        />
        <Text
          variant="label"
          style={{ color: isDisabled ? dark[400] : colors.text.primary }}
        >
          {option.label}
        </Text>
      </View>

      <View style={rowStyles.right}>
        {statusLabel ? (
          <Text variant="caption" color="muted">{statusLabel}</Text>
        ) : (
          <View style={[rowStyles.costBadge, { borderColor: `${costColor}30` }]}>
            <InspirationIcon size={7} color={costColor} />
            <Text variant="caption" bold style={{ color: costColor }}>
              {costLabel}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.surface2,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    minHeight: 44,
  },
  dismissContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: dark[600],
    borderStyle: 'dashed',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    backgroundColor: colors.bg.surface3,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
})

// =============================================================================
// REASSIGN MODAL
// =============================================================================

interface ReassignModalProps {
  visible: boolean
  fromLabel: string
  fromIcon: keyof typeof Ionicons.glyphMap
  fromColor: string
  fromCount: number
  options: ReassignOption[]
  playerInspiration: number
  onSelect: (target: RoleId, all: boolean) => void
  onCancel: () => void
}

export function ReassignModal({
  visible,
  fromLabel,
  fromIcon,
  fromColor,
  fromCount,
  options,
  playerInspiration,
  onSelect,
  onCancel,
}: ReassignModalProps) {
  const haptics = useHaptics()
  const [reassignAll, setReassignAll] = useState(false)
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.85)).current
  const cardOpacity = useRef(new Animated.Value(0)).current

  // Reset "reassign all" when modal opens/closes
  useEffect(() => {
    if (!visible) setReassignAll(false)
  }, [visible])

  useEffect(() => {
    if (visible) {
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
  }, [visible, backdropOpacity, cardScale, cardOpacity])

  const handleCancel = () => {
    haptics.light()
    onCancel()
  }

  // Separate dismiss option from role options
  const roleOptions = options.filter((o) => o.target.type !== 'idle')
  const dismissOption = options.find((o) => o.target.type === 'idle')

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Animated.View style={[modalStyles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <View style={modalStyles.centerer} pointerEvents="box-none">
        <Animated.View
          style={[
            modalStyles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Accent bar */}
          <View style={[modalStyles.accentBar, { backgroundColor: fromColor }]} />

          {/* Header */}
          <View style={modalStyles.header}>
            <View style={[modalStyles.headerIcon, { borderColor: `${fromColor}50` }]}>
              <Ionicons name={fromIcon} size={18} color={fromColor} />
            </View>
            <Text variant="h3" center>Reassign {fromLabel}</Text>
            <Text variant="bodySmall" color="secondary" center>
              {fromCount} remaining -- choose a new role.
            </Text>
          </View>

          {/* Reassign All toggle */}
          {fromCount > 1 && (
            <Pressable
              onPress={() => setReassignAll((v) => !v)}
              style={[
                modalStyles.toggleRow,
                reassignAll && modalStyles.toggleRowActive,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: reassignAll }}
              accessibilityLabel={`Reassign all ${fromCount}`}
            >
              <View style={[
                modalStyles.checkbox,
                reassignAll && { backgroundColor: fromColor, borderColor: fromColor },
              ]}>
                {reassignAll && (
                  <Ionicons name="checkmark" size={12} color={dark[900]} />
                )}
              </View>
              <Text variant="label" style={{ color: reassignAll ? colors.text.primary : dark[300] }}>
                Reassign all ({fromCount})
              </Text>
            </Pressable>
          )}

          {/* Options list */}
          <ScrollView
            style={modalStyles.optionsList}
            contentContainerStyle={modalStyles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {roleOptions.map((option, i) => (
              <RoleOptionRow
                key={`${option.target.type}-${'tier' in option.target ? option.target.tier : i}`}
                option={option}
                inspiration={playerInspiration}
                onSelect={() => onSelect(option.target, reassignAll)}
              />
            ))}

            {/* Separator before dismiss */}
            {dismissOption && (
              <>
                <View style={modalStyles.separator}>
                  <View style={modalStyles.separatorLine} />
                  <Text variant="caption" color="muted">or</Text>
                  <View style={modalStyles.separatorLine} />
                </View>
                <RoleOptionRow
                  option={dismissOption}
                  inspiration={playerInspiration}
                  onSelect={() => onSelect(dismissOption.target, reassignAll)}
                />
              </>
            )}
          </ScrollView>

          {/* Divider */}
          <View style={modalStyles.divider} />

          {/* Cancel */}
          <View style={modalStyles.actions}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [
                modalStyles.cancelBtn,
                pressed && modalStyles.cancelBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel reassignment"
            >
              <Text variant="label" color="secondary">Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const modalStyles = StyleSheet.create({
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
    maxHeight: '80%',
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
  header: {
    alignItems: 'center',
    paddingTop: spacing[5],
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surface2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: dark[600],
  },
  toggleRowActive: {
    borderColor: dark[500],
    backgroundColor: `${dark[700]}80`,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: dark[500],
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    maxHeight: 320,
  },
  optionsContent: {
    padding: spacing[4],
    gap: spacing[2],
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: dark[700],
  },
  divider: {
    height: 1,
    backgroundColor: dark[700],
    marginHorizontal: spacing[4],
  },
  actions: {
    padding: spacing[4],
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    minHeight: 44,
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
  },
  cancelBtnPressed: {
    backgroundColor: colors.bg.surface3,
  },
})
