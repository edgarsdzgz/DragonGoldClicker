import React from 'react'
import { ActionRow, Button } from '../../components'
import { REJECT_GOLD, REJECT_MAXED, REJECT_NO_POP } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics, useSfx } from '../../hooks'
import { SFX } from '../../data/sfx'
import { colors } from '../../theme'
import { roleFigure } from '../../art'
import {
  formatNumber,
  formatAmount,
  FOOD_CHECK_INTERVAL,
  SOLDIER_TIERS,
  FORAGER_TIERS,
  FOOD_CONSUMPTION,
  getSoldierCount,
  getLodgeUpgradeCost,
  getForagerCount,
} from '../../types/game'
import type { SoldierTierDef, ForagerTierDef } from '../../types/game'
import { rankBlock, rankCost, rankBelow } from '../../types/army'
import type { RankBlock } from '../../types/army'
import { foragerBlock, foragerCost, foragerBelow } from '../../types/lodge'
import type { ForagerBlock } from '../../types/lodge'

// =============================================================================
// RANK ROW (the Garrison, chapter 5): train a fighter into a conscript, or promote one rank up
// =============================================================================

const BLOCK_LABEL: Record<Exclude<RankBlock, null | 'renown'>, string> = {
  noGarrison: 'BUILD FIRST',
  locked: 'LOCKED',
  full: 'FULL',
  nobody: 'NONE',
}

export function SoldierTierRow({ tier }: { tier: SoldierTierDef }) {
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
      figure={roleFigure(tier.id)}
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
// FORAGER ROW (the Lodge, chapter 5 phase C): train a villager into a gatherer, or promote one rank up
// =============================================================================

const FORAGER_BLOCK_LABEL: Record<Exclude<ForagerBlock, null | 'renown'>, string> = {
  locked: 'LOCKED',
  full: 'FULL',
  nobody: 'NONE',
}

export function ForagerTierRow({ tier }: { tier: ForagerTierDef }) {
  const { state, trainForager } = useGame()
  const haptics = useHaptics()
  const playPurchase = useSfx(SFX.PURCHASE)
  const count = getForagerCount(state.foragers, tier.id)
  const block = foragerBlock(state, tier.id)
  const cost = foragerCost(state, tier.id)
  const from = foragerBelow(tier.id)
  const fromName = from === 'villager' ? 'a villager' : `a ${FORAGER_TIERS.find((t) => t.id === from)!.name.toLowerCase()}`
  const verb = from === 'villager' ? 'Train' : 'Promote'
  const locked = block === 'locked'

  const rejectPhrases = block === 'full'
    ? getLodgeUpgradeCost(state.lodgeLevel) !== null
      ? ['Upgrade the Lodge for more room', 'The lodge is full: upgrade to expand']
      : REJECT_MAXED
    : block === 'nobody'
      ? from === 'villager' ? REJECT_NO_POP : [`No ${FORAGER_TIERS.find((t) => t.id === from)!.plural} to promote`]
      : REJECT_GOLD

  const handleMake = () => {
    haptics.medium()
    playPurchase()
    trainForager(tier.id)
  }

  return (
    <ActionRow
      icon={locked ? 'lock-closed' : undefined}
      iconColor={colors.text.muted}
      figure={roleFigure(tier.id)}
      title={`${tier.name} (${count})`}
      subtitle={locked ? undefined : `${verb} ${fromName}. ${formatAmount(tier.baseRate * FOOD_CHECK_INTERVAL)} food per meal`}
      locked={locked}
      lockLabel={`Lodge Lv${tier.unlocksAtLodgeLevel}`}
      right={
        !locked ? (
          <Button
            size="xs"
            onPress={handleMake}
            disabled={block !== null}
            rejectPhrases={rejectPhrases}
            accessibilityLabel={`${verb} ${fromName} into a ${tier.name.toLowerCase()} for ${formatNumber(cost)} renown`}
          >
            {block !== null && block !== 'renown' ? FORAGER_BLOCK_LABEL[block] : `${formatNumber(cost)} renown`}
          </Button>
        ) : undefined
      }
    />
  )
}
