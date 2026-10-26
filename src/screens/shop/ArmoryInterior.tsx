import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ActionRow, Button, SectionLabel } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics, useSfx } from '../../hooks'
import { SFX } from '../../data/sfx'
import { colors, gold } from '../../theme'
import {
  SWORD_COST,
  SHIELD_COST,
  SWORD_BONUS,
  SHIELD_BONUS,
  getTotalSoldiers,
} from '../../types/game'
import { styles } from './interiorStyles'

// =============================================================================
// GEAR ROW
// =============================================================================

function GearRow({
  label,
  icon,
  owned,
  max,
  cost,
  bonus,
  canAfford,
  onBuy,
}: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  owned: number
  max: number
  cost: number
  bonus: number
  canAfford: boolean
  onBuy: () => void
}) {
  const haptics = useHaptics()
  const playPurchase = useSfx(SFX.PURCHASE)
  const atMax = owned >= max
  const canBuy = canAfford && !atMax && max > 0

  const handleBuy = () => {
    if (!canBuy) return
    haptics.medium()
    playPurchase()
    onBuy()
  }

  const buttonLabel = max === 0 ? 'NO SOLDIERS' : atMax ? 'MAX' : `${cost} g`

  const rejectPhrases = max === 0
    ? ['Train soldiers at the Garrison first', 'No soldiers to equip yet', 'The racks stand empty']
    : atMax
      ? ['All soldiers are fully equipped', 'Everyone is armed and ready', 'The armory rests']
      : REJECT_GOLD

  return (
    <ActionRow
      icon={icon}
      iconColor={gold[400]}
      title={label}
      subtitle={`${owned}/${max} owned -- +${bonus} renown/s each`}
      right={
        <Button size="xs" onPress={handleBuy} disabled={!canBuy} accentColor={colors.building.forge} rejectPhrases={rejectPhrases}>
          {buttonLabel}
        </Button>
      }
    />
  )
}

// =============================================================================
// ARMORY INTERIOR
// =============================================================================

export function ArmoryInterior() {
  const { state, buySword, buyShield } = useGame()
  const totalSoldiers = getTotalSoldiers(state.soldiers)

  return (
    <View style={styles.interiorContainer}>
      {/* Soldier gear */}
      <SectionLabel>SOLDIER GEAR</SectionLabel>
      <GearRow
        label="Swords"
        icon="flash"
        owned={state.armoryGear.swords}
        max={totalSoldiers}
        cost={SWORD_COST}
        bonus={SWORD_BONUS}
        canAfford={state.inspiration >= SWORD_COST}
        onBuy={buySword}
      />
      <GearRow
        label="Shields"
        icon="shield"
        owned={state.armoryGear.shields}
        max={totalSoldiers}
        cost={SHIELD_COST}
        bonus={SHIELD_BONUS}
        canAfford={state.inspiration >= SHIELD_COST}
        onBuy={buyShield}
      />
    </View>
  )
}
