import React from 'react'
import { View } from 'react-native'
import { StatBox, Button, MealCountdown } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { colors } from '../../theme'
import {
  FORAGER_TIERS,
  getTotalForagers,
  getForagerCap,
  getLodgeUpgradeCost,
  formatNumber,
} from '../../types/game'
import { ForagerTierRow } from './TierRow'
import { CapacitySection } from './shared'
import { SummaryBar } from './SummaryBar'
import { styles } from './interiorStyles'

export function LodgeInterior() {
  const { state, buildOrUpgradeLodge, autoFoodRate } = useGame()
  const total = getTotalForagers(state.foragers)
  const cap = getForagerCap(state.lodgeLevel)
  const upgradeCost = getLodgeUpgradeCost(state.lodgeLevel)
  const canUpgrade = upgradeCost !== null && state.inspiration >= upgradeCost
  const unlockedTiers = FORAGER_TIERS.filter(
    (t) => t.unlocksAtLodgeLevel <= state.lodgeLevel
  )
  const lockedTiers = FORAGER_TIERS.filter(
    (t) => t.unlocksAtLodgeLevel > state.lodgeLevel
  )

  return (
    <View style={styles.interiorContainer}>
      {/* Summary bar */}
      <SummaryBar>
        <StatBox value={`${total}/${cap}`} label="Foragers" valueColor={colors.building.lodge} />
        <StatBox value={state.villagers} label="Villagers" />
        <StatBox value={autoFoodRate.toFixed(2)} label="food/s" valueColor={colors.building.lodge} />
      </SummaryBar>

      {/* Meal countdown */}
      <MealCountdown variant="compact" />

      {/* Capacity bar */}
      <CapacitySection label="Capacity" current={total} max={cap} />

      {/* Forager tiers */}
      <View style={styles.tiersSection}>
        {unlockedTiers.map((tier) => (
          <ForagerTierRow key={tier.id} tier={tier} buildingColor={colors.building.lodge} />
        ))}
        {lockedTiers.map((tier) => (
          <ForagerTierRow key={tier.id} tier={tier} buildingColor={colors.building.lodge} />
        ))}
      </View>

      {/* Upgrade button */}
      {upgradeCost !== null && (
        <Button
          size="sm"
          icon="arrow-up-circle"
          onPress={buildOrUpgradeLodge}
          disabled={!canUpgrade}
          accentColor={colors.building.lodge}
          rejectPhrases={REJECT_GOLD}
          fullWidth
        >
          {`Upgrade to Lv${state.lodgeLevel + 1} - ${formatNumber(upgradeCost)} insp`}
        </Button>
      )}
    </View>
  )
}
