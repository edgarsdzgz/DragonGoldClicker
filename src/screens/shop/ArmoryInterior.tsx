import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, ActionRow, Button, SectionLabel } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics, useSfx } from '../../hooks'
import { SFX } from '../../data/sfx'
import { colors, spacing, gold } from '../../theme'
import {
  formatNumber,
  SWORD_COST,
  SHIELD_COST,
  SWORD_BONUS,
  SHIELD_BONUS,
  AVATAR_WEAPONS,
  getTotalSoldiers,
} from '../../types/game'
import type { AvatarWeaponDef } from '../../types/game'
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
      subtitle={`${owned}/${max} owned -- +${bonus} insp/s each`}
      right={
        <Button size="xs" onPress={handleBuy} disabled={!canBuy} accentColor={colors.building.forge} rejectPhrases={rejectPhrases} holdToRepeat>
          {buttonLabel}
        </Button>
      }
    />
  )
}

// =============================================================================
// AVATAR WEAPON ROW
// =============================================================================

function AvatarWeaponRow({ weapon }: { weapon: AvatarWeaponDef }) {
  const { state, buyWeapon } = useGame()
  const haptics = useHaptics()
  const owned = state.ownedWeapons.includes(weapon.id)
  const canAfford = state.inspiration >= weapon.cost

  const handleBuy = () => {
    if (owned || !canAfford) return
    haptics.medium()
    buyWeapon(weapon.id)
  }

  return (
    <ActionRow
      icon={weapon.icon}
      iconColor={owned ? gold[400] : colors.text.muted}
      title={weapon.name}
      subtitle={weapon.description}
      style={owned ? { borderWidth: 1, borderColor: '#d4922c26' } : undefined}
      right={
        owned ? (
          <Text variant="caption" style={{ color: colors.status.success }}>OWNED</Text>
        ) : (
          <Button size="xs" onPress={handleBuy} disabled={!canAfford} accentColor={colors.building.forge} rejectPhrases={REJECT_GOLD}>
            {`${formatNumber(weapon.cost)} g`}
          </Button>
        )
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

      {/* Avatar weapons */}
      <View style={{ marginTop: spacing[3] }}>
        <SectionLabel>AVATAR WEAPONS</SectionLabel>
      </View>
      {/* TODO layer 3: weapons will raise tap damage; for now clickPower only feeds the city's defence */}
      <Text variant="caption" color="muted">
        Click power: {state.clickPower}
      </Text>
      {AVATAR_WEAPONS.map((w) => (
        <AvatarWeaponRow key={w.id} weapon={w} />
      ))}
    </View>
  )
}
