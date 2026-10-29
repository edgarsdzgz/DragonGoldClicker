import React, { useState } from 'react'
import { View } from 'react-native'
import type { GameIconName } from '../../art'
import { GameIcon } from '../../components/GameIcon'
import { Text, ActionRow, Button, StatBox, Badge, SectionLabel, ReassignModal, InspirationIcon } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { colors, spacing, gold, dark } from '../../theme'
import {
  formatNumber,
  SOLDIER_TIERS,
  FORAGER_TIERS,
  OFFLINE_LEVELS,
  getOfflineUpgradeCost,
  getReassignOptions,
  peopleAtWork,
  roleCount,
  roleName,
} from '../../types/game'
import type { RoleId } from '../../types/game'
import { getRoleIcon, getRoleColor } from '../../components/ReassignModal'
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
            <GameIcon name="checkmark" size={8} color={dark[900]} />
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
  icon: GameIconName
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

  // Everyone at work who can be moved, one row per job (chapter 5 phase C)
  const movable: RoleId[] = [
    { type: 'fighter' },
    { type: 'repairer' },
    ...SOLDIER_TIERS.map((t): RoleId => ({ type: 'soldier', tier: t.id })),
    ...FORAGER_TIERS.map((t): RoleId => ({ type: 'forager', tier: t.id })),
    { type: 'explorer' },
  ]
  const rows = movable.filter((r) => roleCount(state, r) > 0)
  const totalAssigned = peopleAtWork(state)

  const reassignOptions = reassignFrom ? getReassignOptions(reassignFrom, state) : []
  const reassignCount = reassignFrom ? roleCount(state, reassignFrom) : 0

  // Auto-close the dialog when nobody is left to move
  React.useEffect(() => {
    if (reassignFrom && reassignCount <= 0) setReassignFrom(null)
  }, [reassignFrom, reassignCount])

  const handleReassignSelect = (target: RoleId, all: boolean) => {
    if (!reassignFrom) return
    reassignRole(reassignFrom, target, all ? reassignCount : 1)
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
          Move people to another job at no cost. Soldiers stand down to fighters and leave their gear in the Forge; trappers and rangers go back to gathering.
        </Text>
      </DescriptionBanner>

      {rows.length === 0 && (
        <View style={draconiaStyles.emptyState}>
          <GameIcon name="people-outline" size={24} color={dark[500]} />
          <Text variant="caption" color="muted">
            Nobody is at work yet.
          </Text>
        </View>
      )}

      {rows.map((r) => (
        <ReassignRow
          key={r.type === 'soldier' || r.type === 'forager' ? r.tier : r.type}
          label={roleName(r)}
          icon={getRoleIcon(r)}
          accentColor={getRoleColor(r)}
          count={roleCount(state, r)}
          onReassign={() => setReassignFrom(r)}
        />
      ))}

      {/* Reassign modal */}
      <ReassignModal
        visible={reassignFrom !== null}
        fromLabel={reassignFrom ? roleName(reassignFrom) : ''}
        fromIcon={reassignFrom ? getRoleIcon(reassignFrom) : 'person'}
        fromColor={reassignFrom ? getRoleColor(reassignFrom) : dark[300]}
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
