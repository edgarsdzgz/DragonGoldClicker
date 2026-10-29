import React from 'react'
import { View } from 'react-native'
import type { GameIconName } from '../../art'
import { ActionRow, Button, SectionLabel, StatBox } from '../../components'
import { ArmyReadout } from '../../components/ArmyReadout'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics, useSfx } from '../../hooks'
import { SFX } from '../../data/sfx'
import { gold } from '../../theme'
import {
  SOLDIER_TIERS,
  WALL_STRIKE_SEC,
  formatNumber,
  gearBlock,
  gearCost,
  getTotalSoldiers,
  nextGearRank,
} from '../../types/game'
import type { GameState, Gear, GearBlock } from '../../types/game'
import { swordBonusNow } from '../../types/forge'
import { armyKillSeconds, toughestInPool } from '../../types/army'
import { SummaryBar } from './SummaryBar'
import { styles } from './interiorStyles'

// =============================================================================
// GEAR ROW (Kael's Forge, chapter 5 phase B): one sword or shield for the next soldier in line
// =============================================================================

const GEAR: Record<Gear, { title: string; icon: GameIconName; does: (s: GameState) => string }> = {
  // Tempered Steel (the Librarium) raises it
  sword: { title: 'Swords', icon: 'icon_swords', does: (s) => `An armed soldier hits ${Math.round(swordBonusNow(s) * 100)}% harder` },
  shield: { title: 'Shields', icon: 'shield', does: () => 'A shielded soldier never falls in a Breach' },
}

const BLOCK_LABEL: Record<Exclude<GearBlock, null | 'renown'>, string> = {
  noForge: 'BUILD FIRST',
  nobody: 'NO SOLDIERS',
  full: 'ALL EQUIPPED',
}

const BLOCK_PHRASES: Record<Exclude<GearBlock, null | 'renown'>, string[]> = {
  noForge: ['Build the Forge first'],
  nobody: ['Train soldiers at the Garrison first', 'No soldiers to equip yet', 'The racks stand empty'],
  full: ['Every soldier is equipped', 'Train more soldiers to arm them', 'The forge rests'],
}

function GearRow({ gear }: { gear: Gear }) {
  const { state, buySword, buyShield } = useGame()
  const haptics = useHaptics()
  const playPurchase = useSfx(SFX.PURCHASE)
  const def = GEAR[gear]
  const block = gearBlock(state, gear)
  const cost = gearCost(state, gear)
  const held = gear === 'sword' ? state.armoryGear.swords : state.armoryGear.shields
  const soldiers = getTotalSoldiers(state.soldiers)
  const nextRank = nextGearRank(state, gear)
  const nextName = nextRank ? SOLDIER_TIERS.find((t) => t.id === nextRank)!.name.toLowerCase() : null

  const handleForge = () => {
    haptics.medium()
    playPurchase()
    if (gear === 'sword') buySword()
    else buyShield()
  }

  return (
    <ActionRow
      icon={def.icon}
      iconColor={gold[400]}
      title={`${def.title} (${Math.min(held, soldiers)}/${soldiers})`}
      subtitle={nextName ? `${def.does(state)}. The next goes to a ${nextName}.` : `${def.does(state)}.`}
      right={
        <Button
          size="xs"
          onPress={handleForge}
          disabled={block !== null}
          rejectPhrases={block !== null && block !== 'renown' ? BLOCK_PHRASES[block] : REJECT_GOLD}
          accessibilityLabel={`Forge a ${gear} for ${formatNumber(cost)} renown`}
        >
          {block !== null && block !== 'renown' ? BLOCK_LABEL[block] : `${formatNumber(cost)} renown`}
        </Button>
      }
    />
  )
}

// =============================================================================
// THE FORGE
// =============================================================================

export function ArmoryInterior() {
  const { state } = useGame()
  const soldiers = getTotalSoldiers(state.soldiers)
  const toughest = toughestInPool(state)

  return (
    <View style={styles.interiorContainer}>
      <SummaryBar>
        <StatBox value={`${Math.min(state.armoryGear.swords, soldiers)}/${soldiers}`} label="Armed" valueColor={gold[400]} />
        <StatBox value={`${Math.min(state.armoryGear.shields, soldiers)}/${soldiers}`} label="Shielded" valueColor={gold[400]} />
      </SummaryBar>

      {/* Swords move this: can the army hold the Gate while the player is away? */}
      <ArmyReadout monsterName={toughest.name} killSec={armyKillSeconds(state, toughest)} strikeSec={WALL_STRIKE_SEC} />

      <SectionLabel>SOLDIER GEAR</SectionLabel>
      <GearRow gear="sword" />
      <GearRow gear="shield" />
    </View>
  )
}
