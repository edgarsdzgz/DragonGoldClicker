import React from 'react'
import { ActionRow, Button } from '../../components'
import { REJECT_GOLD, REJECT_MAXED, REJECT_NO_POP } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics, useSfx } from '../../hooks'
import { SFX } from '../../data/sfx'
import { colors } from '../../theme'
import {
  formatNumber,
  formatAmount,
  FOOD_CHECK_INTERVAL,
  SOLDIER_TIERS,
  FOOD_CONSUMPTION,
  getSoldierCount,
  getLodgeUpgradeCost,
  getTotalForagers,
  getForagerCap,
  getForagerCost,
  getForagerCount,
} from '../../types/game'
import type { SoldierTierDef, ForagerTierDef } from '../../types/game'
import { rankBlock, rankCost, rankBelow } from '../../types/army'
import type { RankBlock } from '../../types/army'

// =============================================================================
// RANK ROW (the Garrison, chapter 5): train a fighter into a conscript, or promote one rank up
// =============================================================================

const BLOCK_LABEL: Record<Exclude<RankBlock, null | 'renown'>, string> = {
  noGarrison: 'BUILD FIRST',
  locked: 'LOCKED',
  full: 'FULL',
  nobody: 'NONE',
}

export function SoldierTierRow({ tier, buildingColor }: { tier: SoldierTierDef; buildingColor?: string }) {
  const { state, makeRank } = useGame()
  const haptics = useHaptics()
  const playPurchase = useSfx(SFX.PURCHASE)
  const count = getSoldierCount(state.soldiers, tier.id)
  const block = rankBlock(state, tier.id)
  const cost = rankCost(state, tier.id)
  const from = rankBelow(tier.id)
  const fromName = from === 'fighter' ? 'a fighter' : `a ${SOLDIER_TIERS.find((t) => t.id === from)!.name.toLowerCase()}`
  const verb = from === 'fighter' ? 'Train' : 'Promote'
  const locked = block === 'locked'

  const rejectPhrases = block === 'full'
    ? ['Upgrade the Garrison for more room', 'The ranks are full: upgrade to expand']
    : block === 'nobody'
      ? [from === 'fighter' ? 'Rally a fighter first' : `No ${SOLDIER_TIERS.find((t) => t.id === from)!.plural} to promote`]
      : REJECT_GOLD

  const handleMake = () => {
    haptics.medium()
    playPurchase()
    makeRank(tier.id)
  }

  return (
    <ActionRow
      icon={locked ? 'lock-closed' : undefined}
      iconColor={colors.text.muted}
      title={`${tier.name} (${count})`}
      subtitle={locked ? undefined : `${verb} ${fromName}. ${formatAmount(tier.damage)} damage per volley, eats ${FOOD_CONSUMPTION[tier.id]} a meal`}
      locked={locked}
      lockLabel={`Garrison Lv${tier.unlocksAtBarracksLevel}`}
      right={
        !locked ? (
          <Button
            size="xs"
            onPress={handleMake}
            disabled={block !== null}
            accentColor={buildingColor}
            rejectPhrases={rejectPhrases}
            accessibilityLabel={`${verb} ${fromName} into a ${tier.name.toLowerCase()} for ${formatNumber(cost)} renown`}
          >
            {block !== null && block !== 'renown' ? BLOCK_LABEL[block] : `${formatNumber(cost)} renown`}
          </Button>
        ) : undefined
      }
    />
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
      subtitle={locked ? undefined : `${formatAmount(tier.baseRate * FOOD_CHECK_INTERVAL)} food per meal -- ${count} trained`}
      locked={locked}
      lockLabel={`Lodge Lv${tier.unlocksAtLodgeLevel}`}
      right={
        !locked ? (
          <Button size="xs" onPress={handleTrain} disabled={!canAfford} accentColor={buildingColor} rejectPhrases={rejectPhrases}>
            {buttonLabel}
          </Button>
        ) : undefined
      }
    />
  )
}
