import React from 'react'
import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, ActionRow, Button } from '../../components'
import { REJECT_GOLD, REJECT_MAXED, REJECT_NO_POP } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics, useSfx } from '../../hooks'
import { SFX } from '../../data/sfx'
import { colors, spacing, radius, gold } from '../../theme'
import {
  formatNumber,
  SOLDIER_TIERS,
  FORAGER_TIERS,
  FOOD_CONSUMPTION,
  getTotalSoldiers,
  getSoldierCap,
  getSoldierCost,
  getSoldierCount,
  getPromotionCost,
  getPromotionTargets,
  getBarracksUpgradeCost,
  getLodgeUpgradeCost,
  getTotalForagers,
  getForagerCap,
  getForagerCost,
  getForagerCount,
  getResearchBonuses,
} from '../../types/game'
import type { SoldierTierDef, ForagerTierDef, SoldierTier } from '../../types/game'
import { styles } from './interiorStyles'

// =============================================================================
// PROMOTE BUTTON ROW
// =============================================================================

interface PromoteTarget {
  id: string
  name: string
  cost: number | null
  canPromote: boolean
}

function PromoteRow({
  targets,
  onPromote,
}: {
  targets: PromoteTarget[]
  onPromote: (toTierId: string) => void
}) {
  const haptics = useHaptics()

  return (
    <View style={styles.promoteRow}>
      {targets.map((target) => (
        <Pressable
          key={target.id}
          onPress={() => {
            haptics.medium()
            onPromote(target.id)
          }}
          disabled={!target.canPromote}
          style={({ pressed }) => [
            styles.promoteBtn,
            !target.canPromote && styles.promoteBtnDisabled,
            pressed && target.canPromote && styles.promoteBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Promote to ${target.name} for ${target.cost} inspiration`}
        >
          <Ionicons
            name="arrow-up"
            size={10}
            color={target.canPromote ? gold[400] : colors.text.muted}
          />
          <Text
            variant="caption"
            style={{ color: target.canPromote ? gold[400] : colors.text.muted }}
          >
            {target.name} {target.cost !== null ? `${formatNumber(target.cost)} g` : ''}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

// =============================================================================
// SOLDIER TIER ROW (wrapper)
// =============================================================================

export function SoldierTierRow({ tier, buildingColor }: { tier: SoldierTierDef; buildingColor?: string }) {
  const { state, trainSoldier, promoteSoldier } = useGame()
  const haptics = useHaptics()
  const playPurchase = useSfx(SFX.PURCHASE)
  const count = getSoldierCount(state.soldiers, tier.id)
  const lifetimeCount = getSoldierCount(state.soldiersTrained, tier.id)
  const total = getTotalSoldiers(state.soldiers)
  const cap = getSoldierCap(state.barracksLevel)
  const atCap = total >= cap
  const noVillagers = state.villagers <= 0
  const locked = state.barracksLevel < tier.unlocksAtBarracksLevel
  const baseCost = getSoldierCost(tier, lifetimeCount)
  const rb = getResearchBonuses(state.completedResearch)
  const cost = Math.max(1, Math.floor(baseCost * (1 - rb.soldierCostDiscount)))
  const canAfford = state.inspiration >= cost && !atCap && !locked && !noVillagers

  const promoteTargets = count > 0
    ? getPromotionTargets(tier.id, state.barracksLevel).map((target) => {
        const promoCost = getPromotionCost(tier.id, target.id, state.soldiersTrained)
        return {
          id: target.id,
          name: target.name,
          cost: promoCost,
          canPromote: promoCost !== null && state.inspiration >= promoCost,
        }
      })
    : []

  const canUpgradeBarracks = getBarracksUpgradeCost(state.barracksLevel) !== null
  const buttonLabel = atCap ? 'FULL' : noVillagers ? 'NO POP' : `${formatNumber(cost)} g`

  const rejectPhrases = atCap
    ? canUpgradeBarracks
      ? ['Upgrade the Garrison for more room', 'The ranks are full -- upgrade to expand', 'Build higher to train more']
      : REJECT_MAXED
    : noVillagers
      ? REJECT_NO_POP
      : REJECT_GOLD

  const handleTrain = () => {
    haptics.medium()
    playPurchase()
    trainSoldier(tier.id)
  }

  return (
    <ActionRow
      icon={locked ? 'lock-closed' : undefined}
      iconColor={colors.text.muted}
      title={tier.name}
      subtitle={locked ? undefined : `${tier.baseRate} insp/s each -- ${count} trained`}
      locked={locked}
      lockLabel={`Barracks Lv${tier.unlocksAtBarracksLevel}`}
      right={
        !locked ? (
          <Button size="xs" onPress={handleTrain} disabled={!canAfford} accentColor={buildingColor} rejectPhrases={rejectPhrases} holdToRepeat>
            {buttonLabel}
          </Button>
        ) : undefined
      }
    >
      {promoteTargets.length > 0 && (
        <PromoteRow
          targets={promoteTargets}
          onPromote={(toTierId) => promoteSoldier(tier.id, toTierId as SoldierTier)}
        />
      )}
    </ActionRow>
  )
}

// =============================================================================
// FORAGER TIER ROW (wrapper)
// =============================================================================

export function ForagerTierRow({ tier, buildingColor }: { tier: ForagerTierDef; buildingColor?: string }) {
  const { state, trainForager } = useGame()
  const haptics = useHaptics()
  const playPurchase = useSfx(SFX.PURCHASE)
  const count = getForagerCount(state.foragers, tier.id)
  const lifetimeCount = getForagerCount(state.foragersTrained, tier.id)
  const total = getTotalForagers(state.foragers)
  const cap = getForagerCap(state.lodgeLevel)
  const atCap = total >= cap
  const noVillagers = state.villagers <= 0
  const locked = state.lodgeLevel < tier.unlocksAtLodgeLevel
  const cost = getForagerCost(tier, lifetimeCount)
  const canAfford = state.inspiration >= cost && !atCap && !locked && !noVillagers
  const foodCost = FOOD_CONSUMPTION[tier.id]

  const canUpgradeLodge = getLodgeUpgradeCost(state.lodgeLevel) !== null
  const buttonLabel = atCap ? 'FULL' : noVillagers ? 'NO POP' : `${formatNumber(cost)} g`

  const rejectPhrases = atCap
    ? canUpgradeLodge
      ? ['Upgrade the Lodge for more room', 'The lodge is full -- time to expand', 'Build higher to train more']
      : REJECT_MAXED
    : noVillagers
      ? REJECT_NO_POP
      : REJECT_GOLD

  const handleTrain = () => {
    haptics.medium()
    playPurchase()
    trainForager(tier.id)
  }

  return (
    <ActionRow
      title={tier.name}
      subtitle={locked ? undefined : `${tier.baseRate} food/s -- eats ${foodCost}/chk -- ${count} trained`}
      locked={locked}
      lockLabel={`Lodge Lv${tier.unlocksAtLodgeLevel}`}
      right={
        !locked ? (
          <Button size="xs" onPress={handleTrain} disabled={!canAfford} accentColor={buildingColor} rejectPhrases={rejectPhrases} holdToRepeat>
            {buttonLabel}
          </Button>
        ) : undefined
      }
    />
  )
}
