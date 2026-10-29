import React from 'react'
import { View } from 'react-native'
import { StatBox, Button } from '../../components'
import { ArmyReadout } from '../../components/ArmyReadout'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { gold } from '../../theme'
import {
  SOLDIER_TIERS,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
  formatNumber,
  WALL_STRIKE_SEC,
} from '../../types/game'
import { armyKillSeconds, toughestInPool } from '../../types/army'
import { SoldierTierRow } from './TierRow'
import { CapacitySection } from './shared'
import { SummaryBar } from './SummaryBar'
import { styles } from './interiorStyles'

export function BarracksInterior() {
  const { state, buildOrUpgradeBarracks } = useGame()
  const toughest = toughestInPool(state)
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
        <StatBox value={state.fighters} label="Fighters" />
      </SummaryBar>

      {/* Can the army hold the Gate while the player is away? (chapter 5) */}
      <ArmyReadout monsterName={toughest.name} killSec={armyKillSeconds(state, toughest)} strikeSec={WALL_STRIKE_SEC} />

      {/* Capacity bar */}
      <CapacitySection label="Capacity" current={total} max={cap} />

      {/* Soldier tiers */}
      <View style={styles.tiersSection}>
        {unlockedTiers.map((tier) => (
          <SoldierTierRow key={tier.id} tier={tier} />
        ))}
        {lockedTiers.map((tier) => (
          <SoldierTierRow key={tier.id} tier={tier} />
        ))}
      </View>

      {/* Upgrade button */}
      {upgradeCost !== null && (
        <Button
          size="sm"
          icon="arrow-up-circle"
          onPress={buildOrUpgradeBarracks}
          disabled={!canUpgrade}
          rejectPhrases={REJECT_GOLD}
          fullWidth
        >
          {`Upgrade to Lv${state.barracksLevel + 1} - ${formatNumber(upgradeCost)} renown`}
        </Button>
      )}
    </View>
  )
}
