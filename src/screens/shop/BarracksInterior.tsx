import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, StatBox, Button } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { colors, gold } from '../../theme'
import {
  SOLDIER_TIERS,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
  formatNumber,
} from '../../types/game'
import { SoldierTierRow } from './TierRow'
import { CapacitySection } from './shared'
import { SummaryBar } from './SummaryBar'
import { styles } from './interiorStyles'

export function BarracksInterior() {
  const { state, buildOrUpgradeBarracks, effectiveAutoRate } = useGame()
  const total = getTotalSoldiers(state.soldiers)
  const cap = getSoldierCap(state.barracksLevel)
  const upgradeCost = getBarracksUpgradeCost(state.barracksLevel)
  const canUpgrade = upgradeCost !== null && state.inspiration >= upgradeCost
  const unlockedTiers = SOLDIER_TIERS.filter(
    (t) => t.unlocksAtBarracksLevel <= state.barracksLevel
  )
  const lockedTiers = SOLDIER_TIERS.filter(
    (t) => t.unlocksAtBarracksLevel > state.barracksLevel
  )

  return (
    <View style={styles.interiorContainer}>
      {/* Summary bar */}
      <SummaryBar>
        <StatBox value={`${total}/${cap}`} label="Soldiers" valueColor={gold[400]} />
        {state.foodSystemActive && (
          <StatBox value={state.villagers} label="Villagers" />
        )}
        <StatBox value={effectiveAutoRate.toFixed(2)} label="insp/s" />
        <StatBox label="Gear">
          <View style={styles.gearCount}>
            <Ionicons name="flash" size={12} color={gold[300]} />
            <Text variant="caption" color="secondary">{state.armoryGear.swords}</Text>
          </View>
          <View style={styles.gearCount}>
            <Ionicons name="shield" size={12} color={gold[300]} />
            <Text variant="caption" color="secondary">{state.armoryGear.shields}</Text>
          </View>
        </StatBox>
      </SummaryBar>

      {/* Capacity bar */}
      <CapacitySection label="Capacity" current={total} max={cap} />

      {/* Soldier tiers */}
      <View style={styles.tiersSection}>
        {unlockedTiers.map((tier) => (
          <SoldierTierRow key={tier.id} tier={tier} buildingColor={colors.building.garrison} />
        ))}
        {lockedTiers.map((tier) => (
          <SoldierTierRow key={tier.id} tier={tier} buildingColor={colors.building.garrison} />
        ))}
      </View>

      {/* Upgrade button */}
      {upgradeCost !== null && (
        <Button
          size="sm"
          icon="arrow-up-circle"
          onPress={buildOrUpgradeBarracks}
          disabled={!canUpgrade}
          accentColor={colors.building.garrison}
          rejectPhrases={REJECT_GOLD}
          fullWidth
        >
          {`Upgrade to Lv${state.barracksLevel + 1} - ${formatNumber(upgradeCost)} insp`}
        </Button>
      )}
    </View>
  )
}
