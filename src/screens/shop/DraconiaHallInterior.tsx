import React, { useState } from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, ActionRow, Button, StatBox, Badge, SectionLabel, ReassignModal, InspirationIcon } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { colors, spacing, gold, dark } from '../../theme'
import {
  formatNumber,
  SOLDIER_TIERS,
  FORAGER_TIERS,
  OFFLINE_LEVELS,
  getSoldierCount,
  getForagerCount,
  getOfflineUpgradeCost,
  getTotalAssigned,
  getReassignOptions,
} from '../../types/game'
import type { SoldierTier, ForagerTier, RoleId } from '../../types/game'
import { DescriptionBanner } from './shared'
import { SummaryBar } from './SummaryBar'
import { styles, offStyles, draconiaStyles } from './interiorStyles'
import { armyRenownPerSec } from '../../types/army'

// =============================================================================
// OFFLINE TIER STEP
// =============================================================================

function OfflineTierStep({
  level,
  label,
  cost,
  isActive,
  isCompleted,
  isNext,
  canAfford,
  onUpgrade,
}: {
  level: number
  label: string
  cost: number
  isActive: boolean
  isCompleted: boolean
  isNext: boolean
  canAfford: boolean
  onUpgrade: () => void
}) {
  const dotColor = isCompleted || isActive
    ? gold[400]
    : isNext
      ? dark[500]
      : dark[600]

  return (
    <View style={offStyles.stepRow}>
      {/* Dot + connector line */}
      <View style={offStyles.stepDotColumn}>
        <View
          style={[
            offStyles.stepDot,
            {
              backgroundColor: dotColor,
              borderColor: isActive ? gold[400] : 'transparent',
              borderWidth: isActive ? 2 : 0,
            },
          ]}
        >
          {isCompleted && !isActive && (
            <Ionicons name="checkmark" size={8} color={dark[900]} />
          )}
          {isActive && (
            <View style={offStyles.stepDotInner} />
          )}
        </View>
      </View>

      {/* Label + action */}
      <View style={offStyles.stepContent}>
        <View style={offStyles.stepLabelRow}>
          <Text
            variant="label"
            style={{
              color: isActive ? gold[300] : isCompleted ? dark[200] : dark[400],
            }}
          >
            {label}
          </Text>
          {isActive && (
            <Badge color={gold[400]} variant="subtle" size="sm">
              <Text variant="caption" style={{ color: gold[400], fontSize: 10, letterSpacing: 1 }}>
                ACTIVE
              </Text>
            </Badge>
          )}
        </View>

        {isNext && cost > 0 && (
          <Button
            size="xs"
            iconElement={<InspirationIcon size={8} />}
            onPress={onUpgrade}
            disabled={!canAfford}
            accentColor={colors.building.draconia}
            rejectPhrases={REJECT_GOLD}
          >
            {formatNumber(cost)}
          </Button>
        )}
      </View>
    </View>
  )
}

// =============================================================================
// REASSIGN ROW (replaces DismissRow)
// =============================================================================

function ReassignRow({
  label,
  icon,
  accentColor,
  count,
  onReassign,
}: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  accentColor: string
  count: number
  onReassign: () => void
}) {
  const canReassign = count > 0

  return (
    <ActionRow
      icon={icon}
      iconColor={accentColor}
      title={label}
      subtitle={`${count} assigned`}
      right={
        <Button
          size="xs"
          accentColor={canReassign ? colors.building.draconia : undefined}
          icon={canReassign ? 'swap-horizontal' : undefined}
          onPress={onReassign}
          disabled={!canReassign}
        >
          {canReassign ? 'REASSIGN' : 'NONE'}
        </Button>
      }
    />
  )
}

// =============================================================================
// DRACONIA HALL INTERIOR
// =============================================================================

export function DraconiaHallInterior() {
  const {
    state,
    upgradeOffline,
    reassignRole,
  } = useGame()

  const [reassignFrom, setReassignFrom] = useState<RoleId | null>(null)

  const upgradeCost = getOfflineUpgradeCost(state.offlineLevel)

  // Collect all assigned roles with counts for the reassignment section
  const soldierRows: { label: string; tier: SoldierTier; icon: keyof typeof Ionicons.glyphMap; color: string; count: number }[] = SOLDIER_TIERS
    .map((t) => ({
      label: t.name,
      tier: t.id,
      icon: 'shield' as keyof typeof Ionicons.glyphMap,
      color: gold[500],
      count: getSoldierCount(state.soldiers, t.id),
    }))
    .filter((r) => r.count > 0)

  const foragerRows: { label: string; tier: ForagerTier; icon: keyof typeof Ionicons.glyphMap; color: string; count: number }[] = FORAGER_TIERS
    .map((t) => ({
      label: t.name,
      tier: t.id,
      icon: 'leaf' as keyof typeof Ionicons.glyphMap,
      color: colors.building.lodge,
      count: getForagerCount(state.foragers, t.id),
    }))
    .filter((r) => r.count > 0)

  const hasAnyAssigned = soldierRows.length > 0 || foragerRows.length > 0 || state.explorers > 0

  const totalAssigned = getTotalAssigned(state.soldiers, state.foragers, state.explorers)

  // Reassign modal data
  const reassignOptions = reassignFrom ? getReassignOptions(reassignFrom, state) : []
  const reassignLabel = reassignFrom
    ? reassignFrom.type === 'soldier' ? SOLDIER_TIERS.find((t) => t.id === reassignFrom.tier)?.name ?? ''
    : reassignFrom.type === 'forager' ? FORAGER_TIERS.find((t) => t.id === reassignFrom.tier)?.name ?? ''
    : reassignFrom.type === 'explorer' ? 'Explorer'
    : ''
    : ''
  const reassignIcon: keyof typeof Ionicons.glyphMap = reassignFrom
    ? reassignFrom.type === 'soldier' ? 'shield'
    : reassignFrom.type === 'forager' ? 'leaf'
    : reassignFrom.type === 'explorer' ? 'compass'
    : 'person'
    : 'person'
  const reassignColor = reassignFrom
    ? reassignFrom.type === 'soldier' ? gold[500]
    : reassignFrom.type === 'forager' ? colors.building.lodge
    : reassignFrom.type === 'explorer' ? colors.building.explorer
    : dark[300]
    : dark[300]

  // Auto-close modal when source unit count reaches 0
  const reassignCount = reassignFrom
    ? reassignFrom.type === 'soldier' ? getSoldierCount(state.soldiers, reassignFrom.tier)
    : reassignFrom.type === 'forager' ? getForagerCount(state.foragers, reassignFrom.tier)
    : reassignFrom.type === 'explorer' ? state.explorers
    : 0
    : 0

  React.useEffect(() => {
    if (reassignFrom && reassignCount <= 0) setReassignFrom(null)
  }, [reassignFrom, reassignCount])

  const handleReassignSelect = (target: RoleId, all: boolean) => {
    if (!reassignFrom) return
    if (all) {
      const count = reassignCount
      for (let i = 0; i < count; i++) {
        if (!reassignRole(reassignFrom, target)) break
      }
    } else {
      reassignRole(reassignFrom, target)
    }
    // Modal stays open -- auto-closed by effect when count reaches 0
  }

  return (
    <View style={styles.interiorContainer}>
      {/* Summary bar */}
      <SummaryBar>
        <StatBox value={totalAssigned} label="Assigned" valueColor={colors.building.draconia} />
        <StatBox value={state.villagers} label="Idle" />
        <StatBox value={state.villagers + totalAssigned} label="Total Pop" />
      </SummaryBar>

      {/* === REASSIGNMENT SECTION === */}
      <SectionLabel>REASSIGN ROLES</SectionLabel>

      {/* Description banner */}
      <DescriptionBanner icon="swap-horizontal" color={colors.building.draconia}>
        <Text variant="bodySmall" color="secondary">
          Reassign villagers to a new role with a partial refund, or dismiss to idle.
        </Text>
      </DescriptionBanner>

      {!hasAnyAssigned && (
        <View style={draconiaStyles.emptyState}>
          <Ionicons name="people-outline" size={24} color={dark[500]} />
          <Text variant="caption" color="muted">
            No villagers are assigned to roles yet.
          </Text>
          <Text variant="caption" color="muted">
            Train units in other buildings first.
          </Text>
        </View>
      )}

      {soldierRows.map((r) => (
        <ReassignRow
          key={r.tier}
          label={r.label}
          icon={r.icon}
          accentColor={r.color}
          count={r.count}
          onReassign={() => setReassignFrom({ type: 'soldier', tier: r.tier })}
        />
      ))}
      {foragerRows.map((r) => (
        <ReassignRow
          key={r.tier}
          label={r.label}
          icon={r.icon}
          accentColor={r.color}
          count={r.count}
          onReassign={() => setReassignFrom({ type: 'forager', tier: r.tier })}
        />
      ))}
      {state.explorers > 0 && (
        <ReassignRow
          label="Explorer"
          icon="compass"
          accentColor={colors.building.explorer}
          count={state.explorers}
          onReassign={() => setReassignFrom({ type: 'explorer' })}
        />
      )}

      {/* Reassign modal */}
      <ReassignModal
        visible={reassignFrom !== null}
        fromLabel={reassignLabel}
        fromIcon={reassignIcon}
        fromColor={reassignColor}
        fromCount={reassignCount}
        options={reassignOptions}
        playerInspiration={state.inspiration}
        onSelect={handleReassignSelect}
        onCancel={() => setReassignFrom(null)}
      />

      {/* === OFFLINE PROGRESS SECTION === */}
      <View style={draconiaStyles.offlineSection}>
        <SectionLabel>OFFLINE PROGRESS</SectionLabel>
      </View>

      {/* Description banner */}
      <DescriptionBanner icon="moon" color={gold[500]}>
        <Text variant="bodySmall" color="secondary">
          Your army earns about{' '}
          <Text variant="bodySmall" style={{ color: gold[400] }}>
            {(armyRenownPerSec(state) * 60).toFixed(2)} renown a minute
          </Text>
          {' '}while you rest.
        </Text>
      </DescriptionBanner>

      {/* Tier progression */}
      <View style={offStyles.tierList}>
        {OFFLINE_LEVELS.map((def, i) => {
          const isActive = state.offlineLevel === i
          const isCompleted = state.offlineLevel > i
          const isNext = state.offlineLevel === i - 1
          const canAfford = isNext && upgradeCost !== null && state.inspiration >= upgradeCost

          return (
            <View key={def.level}>
              {i > 0 && (
                <View style={offStyles.stepDotColumn}>
                  <View
                    style={[
                      offStyles.connectorLine,
                      {
                        backgroundColor: isCompleted || isActive
                          ? 'rgba(224, 168, 64, 0.3)'
                          : dark[700],
                      },
                    ]}
                  />
                </View>
              )}
              <OfflineTierStep
                level={def.level}
                label={def.label}
                cost={def.cost}
                isActive={isActive}
                isCompleted={isCompleted}
                isNext={isNext}
                canAfford={canAfford}
                onUpgrade={upgradeOffline}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}
