import React, { useRef, useEffect, useCallback } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Text, Badge, InspirationIcon } from '../components'
import { FlavorText } from '../components/FlavorText'
import { HarvestOrb } from '../components/HarvestOrb'
import { ResourceBar } from '../components/ResourceBar'
import { OfflineModal } from '../components/OfflineModal'
import { NpcDialog } from '../components/NpcDialog'
import { FoodWarningModal } from '../components/FoodWarningModal'
import { StarvationModal } from '../components/StarvationModal'
import { WandererModal } from '../components/WandererModal'
import { useGame } from '../context/GameContext'
import { useFlavorText } from '../hooks/useFlavorText'
import { useSfx } from '../hooks/useSfx'
import { SFX } from '../data/sfx'
import { COMBAT_LINES } from '../data/flavorText'
import { colors, spacing, gold } from '../theme'
import { formatNumber, getTotalSoldiers, getTotalForagers } from '../types/game'

const SLAY_PALETTE = { accent: gold[400], glow: gold[500] }

export function GameScreen() {
  const { state, click, effectiveAutoRate, pendingOfflineEarnings, dismissOfflineEarnings, pendingFoodIntro, dismissFoodIntro, pendingStarvationReport, dismissStarvationReport, pendingFoodWarning, dismissFoodWarning, pendingExplorerIntro, dismissExplorerIntro, pendingWanderer, acceptWanderer, rejectWanderer } = useGame()
  const navigation = useNavigation<any>()
  const incomeFlash = useRef(new Animated.Value(1)).current
  const flavor = useFlavorText(COMBAT_LINES)

  const playClick = useSfx(SFX.CLICK)

  const handleClick = useCallback(() => {
    click()
    playClick()
    flavor.onTick()
  }, [click, playClick, flavor.onTick])

  // Subtle pulse on the income indicator to show it's "alive"
  useEffect(() => {
    if (effectiveAutoRate <= 0) return
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(incomeFlash, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(incomeFlash, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [effectiveAutoRate, incomeFlash])

  const handleFoodIntroDismiss = useCallback(() => {
    dismissFoodIntro()
    navigation.navigate('ForageTab')
  }, [dismissFoodIntro, navigation])

  const handleFoodWarningGoForage = useCallback(() => {
    dismissFoodWarning()
    navigation.navigate('ForageTab')
  }, [dismissFoodWarning, navigation])

  const handleExplorerIntroDismiss = useCallback(() => {
    dismissExplorerIntro()
    navigation.navigate('DraconiaTab')
  }, [dismissExplorerIntro, navigation])

  return (
    <View style={styles.container}>
      <OfflineModal
        visible={pendingOfflineEarnings !== null}
        inspirationEarned={pendingOfflineEarnings?.inspiration ?? 0}
        secondsAway={pendingOfflineEarnings?.seconds ?? 0}
        onCollect={dismissOfflineEarnings}
      />
      <NpcDialog
        visible={pendingFoodIntro}
        npcName="Elder Pyreth"
        icon="person"
        title="Our Stores Run Low"
        lines={[
          'My lord, I bring troubling news. Our food stores in Draconia are dwindling.',
          'Every soul in the city must eat. Villagers consume a modest share, but soldiers require far more -- and the higher their rank, the greater their appetite.',
          'If our food runs out entirely, our people will begin to starve. And without food, the soldiers will refuse to fight.',
          'We have no farms yet, but the wilderness around Draconia is rich with wild plants and game. I have opened a foraging path for you.',
          'Go to the Forage tab and gather what you can. It is humble work, but it will keep our people alive.',
        ]}
        dismissLabel="Begin foraging"
        onDismiss={handleFoodIntroDismiss}
      />
      {pendingFoodWarning > 0 && (
        <FoodWarningModal
          visible={pendingFoodWarning > 0}
          level={pendingFoodWarning as 3 | 1}
          onGoToForage={handleFoodWarningGoForage}
          onDismiss={dismissFoodWarning}
        />
      )}
      {pendingStarvationReport !== null && (
        <StarvationModal
          visible={pendingStarvationReport !== null}
          report={pendingStarvationReport}
          onDismiss={dismissStarvationReport}
        />
      )}
      <NpcDialog
        visible={pendingExplorerIntro}
        npcName="Scout Mirael"
        icon="compass"
        title="Beyond the Walls"
        lines={[
          'My lord, our scouts have spotted something troubling. The wilderness beyond Draconia grows wilder by the day -- and our villagers are stretched thin.',
          'But there is opportunity in the danger. We have located a ruined outpost on the frontier that could serve as a staging ground for expeditions into the wasteland.',
          'Wayfinders trained there can venture out and rescue lost souls -- villagers stranded beyond our borders. More people means a stronger Draconia.',
          'The outpost will not come cheap, but the investment will pay for itself many times over. I urge you to save up and build it when you can.',
        ]}
        dismissLabel="View the outpost"
        onDismiss={handleExplorerIntroDismiss}
      />
      {pendingWanderer !== null && (
        <WandererModal
          visible={pendingWanderer !== null}
          encounter={pendingWanderer}
          onAccept={acceptWanderer}
          onReject={rejectWanderer}
        />
      )}
      <ResourceBar inspiration={state.inspiration} food={state.food} foodSystemActive={state.foodSystemActive} autoInspPerSec={effectiveAutoRate} />

      {/* HERO: Inspiration is the primary number */}
      <View style={styles.heroSection}>
        <View style={styles.inspRow}>
          <InspirationIcon size={24} />
          <Text variant="display" color="link">
            {formatNumber(state.inspiration)}
          </Text>
        </View>
        <Text variant="bodySmall" color="muted" center>inspiration</Text>

        {effectiveAutoRate > 0 && (
          <Animated.View style={{ opacity: incomeFlash, marginTop: spacing[1] }}>
            <Badge icon="trending-up" color={colors.status.success}>
              <Text variant="caption" style={{ color: colors.status.success }}>
                +{effectiveAutoRate.toFixed(2)} insp/s
              </Text>
            </Badge>
          </Animated.View>
        )}
      </View>

      {/* Population status */}
      <View style={styles.autoIndicator}>
        <View style={styles.popRow}>
          {state.villagers > 0 && (
            <Badge icon="home" color={gold[500]}>
              <Text variant="caption" color="secondary">
                {state.villagers} villager{state.villagers !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
          {getTotalSoldiers(state.soldiers) > 0 && (
            <Badge icon="people" color={gold[300]}>
              <Text variant="caption" style={{ color: gold[300] }}>
                {getTotalSoldiers(state.soldiers)} soldier{getTotalSoldiers(state.soldiers) !== 1 ? 's' : ''}
                {state.foodSystemActive && state.food === 0 ? ' (idle)' : ' fighting'}
              </Text>
            </Badge>
          )}
          {getTotalForagers(state.foragers) > 0 && (
            <Badge icon="leaf" color={colors.status.success}>
              <Text variant="caption" style={{ color: colors.status.success }}>
                {getTotalForagers(state.foragers)} forager{getTotalForagers(state.foragers) !== 1 ? 's' : ''}
              </Text>
            </Badge>
          )}
        </View>
        {state.foodSystemActive && state.food === 0 && getTotalSoldiers(state.soldiers) > 0 && (
          <Badge icon="warning" color={colors.status.error} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: colors.status.error }}>
              No food! Soldiers refuse to fight.
            </Text>
          </Badge>
        )}
        {state.foodSystemActive && state.food === 0 && state.villagers > 0 && (
          <Badge icon="warning" color={colors.status.warning} style={{ marginTop: spacing[1] }}>
            <Text variant="caption" style={{ color: colors.status.warning }}>
              Villagers are starving!
            </Text>
          </Badge>
        )}
      </View>

      {/* Flavor text */}
      <FlavorText text={flavor.text} opacity={flavor.opacity} color={gold[300]} />

      {/* SLAY button */}
      <HarvestOrb
        onAction={handleClick}
        icon="flash"
        label="SLAY"
        palette={SLAY_PALETTE}
      />

      {/* Footer: secondary kill counter + reward hint */}
      <View style={styles.footer}>
        <Text variant="caption" color="muted" center>
          {formatNumber(state.monstersDefeated)} monsters slain
        </Text>
        <Badge iconElement={<InspirationIcon size={8} />} color={gold[400]} variant="ghost">
          <Text variant="caption" color="link">
            +{state.clickPower} per click
          </Text>
        </Badge>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing[6],
    gap: spacing[1],
  },
  inspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  autoIndicator: {
    alignItems: 'center',
    paddingTop: spacing[2],
  },
  popRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
    gap: spacing[1],
  },
})
