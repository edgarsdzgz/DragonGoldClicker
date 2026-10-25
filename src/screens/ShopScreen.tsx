import React from 'react'
import { View, ScrollView, Pressable, Animated, Easing } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, ZoneHeader, BottomSheet, ConfirmModal, InspirationIcon, type ResourceItem } from '../components'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useHaptics, useSfx } from '../hooks'
import { SFX } from '../data/sfx'
import { colors, gold } from '../theme'
import {
  ARMORY_COST,
  DRACONIA_HALL_COST,
  LIBRARIUM_COST,
  OFFLINE_LEVELS,
  RESEARCH_NODES,
  isBuildingRevealed,
  isSystemOn,
  SOLDIER_TIERS,
  FORAGER_TIERS,
  SWORD_COST,
  SHIELD_COST,
  AVATAR_WEAPONS,
  EXPLORER_COST,
  EXPEDITION_INSPIRATION_COST,
  EXPEDITION_FOOD_COST,
  getTotalSoldiers,
  getSoldierCap,
  getSoldierCost,
  getSoldierCount,
  getBarracksUpgradeCost,
  getTotalForagers,
  getForagerCap,
  getForagerCost,
  getForagerCount,
  getLodgeUpgradeCost,
  getExplorerCap,
  getPostUpgradeCost,
  getOfflineUpgradeCost,
} from '../types/game'
import type { BuildingId, BuildingInfo, ResourceKey } from './shop/types'
import { BarracksInterior } from './shop/BarracksInterior'
import { ArmoryInterior } from './shop/ArmoryInterior'
import { LodgeInterior } from './shop/LodgeInterior'
import { PostInterior } from './shop/PostInterior'
import { DraconiaHallInterior } from './shop/DraconiaHallInterior'
import { LibrariumInterior } from './shop/LibrariumInterior'
import { mapStyles } from './shop/mapStyles'

// =============================================================================
// BUILDING INTERIOR ROUTER
// =============================================================================

function ComingSoonInterior() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Ionicons name="hammer" size={32} color={colors.text.muted} />
      <Text variant="body" color="muted" center style={{ marginTop: 8 }}>
        Under construction
      </Text>
      <Text variant="caption" color="muted" center>
        This building will be available in a future update.
      </Text>
    </View>
  )
}

function BuildingInterior({ id }: { id: BuildingId }) {
  switch (id) {
    case 'keep': return <DraconiaHallInterior />
    case 'garrison': return <BarracksInterior />
    case 'forge': return <ArmoryInterior />
    case 'lodge': return <LodgeInterior />
    case 'outpost': return <PostInterior />
    case 'librarium': return <LibrariumInterior />
    case 'housing':
    case 'wizard':
    case 'tower_east':
    case 'tower_west':
      return <ComingSoonInterior />
  }
}

// =============================================================================
// BUILDING NODE
// =============================================================================

function BuildingNode({
  building,
  onPress,
}: {
  building: BuildingInfo
  onPress: () => void
}) {
  const canBuildNow = !building.isBuilt && building.canAfford

  // Breathing pulse for affordable nodes
  const pulse = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (canBuildNow) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      )
      animation.start()
      return () => animation.stop()
    } else {
      pulse.setValue(0)
    }
  }, [canBuildNow, pulse])

  if (!building.visible) return null

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        mapStyles.nodeContainer,
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${building.name}`}
    >
      <Animated.View
        style={[
          mapStyles.nodeCircle,
          building.isBuilt
            ? [
                mapStyles.nodeCircleBuilt,
                {
                  borderColor: building.accentColor,
                  backgroundColor: `${building.accentColor}30`,
                  shadowColor: building.accentColor,
                },
              ]
            : canBuildNow
              ? [
                  mapStyles.nodeCircleAffordable,
                  {
                    borderColor: building.accentColor,
                    backgroundColor: `${building.accentColor}18`,
                    shadowColor: building.accentColor,
                  },
                ]
              : mapStyles.nodeCircleUnbuilt,
          canBuildNow && {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
            transform: [{
              scale: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.04],
              }),
            }],
          },
        ]}
      >
        {building.isBuilt && building.hasAction && (
          <View
            style={[
              mapStyles.actionBadge,
              { backgroundColor: building.accentColor },
            ]}
          />
        )}
        <Ionicons
          name={building.icon}
          size={24}
          color={building.isBuilt || canBuildNow ? building.accentColor : colors.text.muted}
        />
      </Animated.View>
      <Text
        variant="caption"
        color={building.isBuilt || canBuildNow ? 'primary' : 'muted'}
        style={mapStyles.nodeLabel}
      >
        {building.name}
      </Text>
      {building.isBuilt && building.statusLabel ? (
        <Text variant="caption" color="muted" style={mapStyles.nodeStatus}>
          {building.statusLabel}
        </Text>
      ) : !building.isBuilt && building.cost !== null ? (
        <Badge
          iconElement={<InspirationIcon size={7} />}
          color={gold[400]}
          size="sm"
          variant={canBuildNow ? 'subtle' : 'ghost'}
        >
          <Text variant="caption" style={{ color: gold[400], fontSize: 10 }}>
            {building.cost}
          </Text>
        </Badge>
      ) : null}
    </Pressable>
  )
}

// =============================================================================
// ZONE PATH CONNECTOR
// =============================================================================

function ZonePath() {
  return (
    <View style={mapStyles.pathContainer}>
      <View style={mapStyles.pathLine} />
      <View style={mapStyles.pathDot} />
      <View style={mapStyles.pathLine} />
    </View>
  )
}

// =============================================================================
// MAIN SHOP SCREEN - CITY MAP
// =============================================================================

export function ShopScreen() {
  const [selected, setSelected] = React.useState<BuildingId | null>(null)
  const {
    state,
    buildOrUpgradeBarracks,
    buildArmory,
    buildOrUpgradeLodge,
    buildOrUpgradePost,
    buildDraconiaHall,
    buildLibrarium,
    isResearchAvailable,
    effectiveAutoRate,
  } = useGame()
  const haptics = useHaptics()
  const playCoin = useSfx(SFX.COIN)
  const playShop = useSfx(SFX.SHOP)

  // Clear open panel when navigating away so it doesn't reopen on return
  useFocusEffect(
    React.useCallback(() => {
      return () => setSelected(null)
    }, []),
  )

  const total = getTotalSoldiers(state.soldiers)
  const cap = getSoldierCap(state.barracksLevel)
  const barracksBuilt = state.barracksLevel > 0

  const lodgeBuilt = state.lodgeLevel > 0
  const foragerTotal = getTotalForagers(state.foragers)
  const foragerCap = getForagerCap(state.lodgeLevel)
  const lodgeBuildCost = getLodgeUpgradeCost(0)
  const barracksBuildCost = getBarracksUpgradeCost(0)

  const postBuildCost = getPostUpgradeCost(0)

  // Compute "has action" flags for built buildings
  const garrisonHasAction = barracksBuilt && (() => {
    const upgCost = getBarracksUpgradeCost(state.barracksLevel)
    if (upgCost !== null && state.inspiration >= upgCost) return true
    if (total < cap && state.villagers > 0) {
      for (const tier of SOLDIER_TIERS) {
        if (tier.unlocksAtBarracksLevel <= state.barracksLevel) {
          const cost = getSoldierCost(tier, getSoldierCount(state.soldiersTrained, tier.id))
          if (state.inspiration >= cost) return true
        }
      }
    }
    return false
  })()

  const forgeHasAction = state.armoryBuilt && (() => {
    const totalSoldiers = getTotalSoldiers(state.soldiers)
    if (state.armoryGear.swords < totalSoldiers && state.inspiration >= SWORD_COST) return true
    if (state.armoryGear.shields < totalSoldiers && state.inspiration >= SHIELD_COST) return true
    for (const w of AVATAR_WEAPONS) {
      if (!state.ownedWeapons.includes(w.id) && state.inspiration >= w.cost) return true
    }
    return false
  })()

  const lodgeHasAction = lodgeBuilt && (() => {
    const upgCost = getLodgeUpgradeCost(state.lodgeLevel)
    if (upgCost !== null && state.inspiration >= upgCost) return true
    if (foragerTotal < foragerCap && state.villagers > 0) {
      for (const tier of FORAGER_TIERS) {
        if (tier.unlocksAtLodgeLevel <= state.lodgeLevel) {
          const cost = getForagerCost(tier, getForagerCount(state.foragersTrained, tier.id))
          if (state.inspiration >= cost) return true
        }
      }
    }
    return false
  })()

  const outpostHasAction = state.postLevel > 0 && (() => {
    const explorerCap = getExplorerCap(state.postLevel)
    if (state.explorers < explorerCap && state.villagers > 0 && state.inspiration >= EXPLORER_COST) return true
    const available = state.explorers - state.activeExpeditions.length
    if (available > 0 && state.inspiration >= EXPEDITION_INSPIRATION_COST && state.food >= EXPEDITION_FOOD_COST) return true
    const upgCost = getPostUpgradeCost(state.postLevel)
    if (upgCost !== null && state.inspiration >= upgCost) return true
    return false
  })()

  const keepHasAction = state.draconiaHallBuilt && (() => {
    const upgCost = getOfflineUpgradeCost(state.offlineLevel)
    return upgCost !== null && state.inspiration >= upgCost
  })()

  const librariumHasAction = state.librariumBuilt && (() => {
    for (const node of RESEARCH_NODES) {
      if (isResearchAvailable(node.id) && state.inspiration >= node.cost) return true
    }
    return false
  })()

  // Fogged buildings appear when their story beat reveals them (or once built)
  const revealed = (id: Parameters<typeof isBuildingRevealed>[1], built: boolean) =>
    built || isBuildingRevealed(state, id)

  const buildings: Record<string, BuildingInfo> = {
    keep: {
      id: 'keep',
      name: 'Draconia Keep',
      icon: 'business',
      description: 'The heart of the settlement. From this seat of power, manage villager roles and unlock offline inspiration collection.',
      accentColor: colors.building.draconia,
      isBuilt: state.draconiaHallBuilt,
      visible: revealed('keep', state.draconiaHallBuilt),
      cost: DRACONIA_HALL_COST,
      canAfford: state.inspiration >= DRACONIA_HALL_COST,
      onBuild: buildDraconiaHall,
      hasAction: keepHasAction,
      resourceKeys: ['inspiration'],
      statusLabel: state.draconiaHallBuilt
        ? `Offline: ${OFFLINE_LEVELS[state.offlineLevel].label}`
        : undefined,
    },
    garrison: {
      id: 'garrison',
      name: 'The Garrison',
      icon: 'shield',
      description: 'A fortified training ground where villagers take up arms. Soldiers auto-defeat monsters and earn inspiration for the settlement.',
      accentColor: colors.building.garrison,
      isBuilt: barracksBuilt,
      visible: true,
      cost: barracksBuildCost,
      canAfford: barracksBuildCost !== null && state.inspiration >= barracksBuildCost,
      onBuild: buildOrUpgradeBarracks,
      hasAction: garrisonHasAction,
      resourceKeys: ['inspiration', 'villagers'],
      statusLabel: barracksBuilt
        ? `Lv${state.barracksLevel} -- ${total}/${cap} soldiers`
        : undefined,
    },
    forge: {
      id: 'forge',
      name: 'The Forge',
      icon: 'construct',
      description: 'A blazing smithy where weapons and armor are hammered into shape. Equip soldiers with swords and shields, or arm yourself.',
      accentColor: colors.building.forge,
      isBuilt: state.armoryBuilt,
      visible: revealed('forge', state.armoryBuilt),
      cost: ARMORY_COST,
      canAfford: state.inspiration >= ARMORY_COST,
      onBuild: buildArmory,
      hasAction: forgeHasAction,
      resourceKeys: ['inspiration'],
      statusLabel: state.armoryBuilt
        ? `${state.armoryGear.swords} swords, ${state.armoryGear.shields} shields`
        : undefined,
    },
    lodge: {
      id: 'lodge',
      name: "Ranger's Lodge",
      icon: 'leaf',
      description: 'A rustic outpost at the edge of the wilds. Train rangers to forage food from the surrounding wilderness.',
      accentColor: colors.building.lodge,
      isBuilt: lodgeBuilt,
      visible: revealed('lodge', lodgeBuilt),
      cost: lodgeBuildCost,
      canAfford: lodgeBuildCost !== null && state.inspiration >= lodgeBuildCost,
      onBuild: buildOrUpgradeLodge,
      hasAction: lodgeHasAction,
      resourceKeys: ['inspiration', 'villagers'],
      statusLabel: lodgeBuilt
        ? `Lv${state.lodgeLevel} -- ${foragerTotal}/${foragerCap} rangers`
        : undefined,
    },
    outpost: {
      id: 'outpost',
      name: "Wayfinder's Outpost",
      icon: 'compass',
      description: 'A staging ground for expeditions beyond the walls. Train wayfinders to venture into the wasteland and rescue lost villagers.',
      accentColor: colors.building.explorer,
      isBuilt: state.postLevel > 0,
      visible: revealed('outpost', state.postLevel > 0),
      cost: postBuildCost,
      canAfford: (postBuildCost ?? 0) > 0 && state.inspiration >= (postBuildCost ?? 0),
      onBuild: buildOrUpgradePost,
      hasAction: outpostHasAction,
      resourceKeys: ['inspiration', 'food', 'villagers'],
      statusLabel: state.postLevel > 0
        ? `Lv${state.postLevel} -- ${state.explorers}/${getExplorerCap(state.postLevel)} wayfinders`
        : undefined,
    },
    librarium: {
      id: 'librarium',
      name: 'The Librarium',
      icon: 'book',
      description: 'A vast archive of ancient knowledge. Research upgrades to strengthen every aspect of Draconia.',
      accentColor: colors.building.librarium,
      isBuilt: state.librariumBuilt,
      visible: revealed('librarium', state.librariumBuilt),
      cost: LIBRARIUM_COST,
      canAfford: state.inspiration >= LIBRARIUM_COST,
      onBuild: buildLibrarium,
      hasAction: librariumHasAction,
      resourceKeys: ['inspiration'],
      statusLabel: state.librariumBuilt
        ? `${state.completedResearch.length}/${RESEARCH_NODES.length} researched`
        : undefined,
    },
    housing: {
      id: 'housing',
      name: 'Housing',
      icon: 'home',
      description: 'Residential quarters that improve productivity and unlock population growth.',
      accentColor: colors.building.housing,
      isBuilt: false,
      visible: true,
      cost: null,
      canAfford: false,
      onBuild: () => {},
      hasAction: false,
      resourceKeys: ['inspiration'],
      statusLabel: 'Coming soon',
    },
    wizard: {
      id: 'wizard',
      name: "Wizard's Tower",
      icon: 'sparkles',
      description: 'A towering spire of arcane power. Enchant weapons and unlock powerful bonuses.',
      accentColor: colors.building.wizard,
      isBuilt: false,
      visible: true,
      cost: null,
      canAfford: false,
      onBuild: () => {},
      hasAction: false,
      resourceKeys: ['inspiration'],
      statusLabel: 'Coming soon',
    },
    tower_east: {
      id: 'tower_east',
      name: 'Tower East',
      icon: 'flag',
      description: 'A defensive tower on the eastern wall. Station fighters to boost defense and inspiration income.',
      accentColor: colors.building.tower,
      isBuilt: false,
      visible: true,
      cost: null,
      canAfford: false,
      onBuild: () => {},
      hasAction: false,
      resourceKeys: ['inspiration'],
      statusLabel: 'Coming soon',
    },
    tower_west: {
      id: 'tower_west',
      name: 'Tower West',
      icon: 'flag',
      description: 'A defensive tower on the western wall. Station fighters to boost defense and inspiration income.',
      accentColor: colors.building.tower,
      isBuilt: false,
      visible: true,
      cost: null,
      canAfford: false,
      onBuild: () => {},
      hasAction: false,
      resourceKeys: ['inspiration'],
      statusLabel: 'Coming soon',
    },
  }

  const resolveResources = (keys: ResourceKey[]): ResourceItem[] =>
    keys.map((key): ResourceItem => {
      switch (key) {
        case 'inspiration':
          return { icon: 'wallet', iconElement: <InspirationIcon size={10} />, value: state.inspiration, color: gold[400] }
        case 'food':
          return { icon: 'nutrition', value: state.food, color: state.food === 0 ? colors.status.error : state.food <= 10 ? colors.status.warning : colors.text.secondary }
        case 'villagers':
          return { icon: 'people', value: state.villagers, color: colors.text.secondary, label: 'idle' }
      }
    })

  const selectedBuilding = selected ? buildings[selected] ?? null : null
  const [purchaseTarget, setPurchaseTarget] = React.useState<BuildingId | null>(null)
  const purchaseBuilding = purchaseTarget ? buildings[purchaseTarget] ?? null : null

  const comingSoonIds: BuildingId[] = ['housing', 'wizard', 'tower_east', 'tower_west']

  const handleNodePress = (id: BuildingId) => {
    haptics.selection()
    const b = buildings[id]
    if (comingSoonIds.includes(id)) {
      // Coming soon buildings open interior directly (shows placeholder)
      setSelected(id)
    } else if (b && !b.isBuilt) {
      playShop()
      setPurchaseTarget(id)
    } else {
      setSelected(id)
    }
  }

  return (
    <View style={mapStyles.container}>
      <ResourceBar
        inspiration={state.inspiration}
        food={state.food}
        foodSystemActive={isSystemOn(state, 'hunger')}
        autoInspPerSec={effectiveAutoRate}
      />
      <ScrollView
        style={mapStyles.scrollView}
        contentContainerStyle={mapStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* City title */}
        <Text variant="h2" style={mapStyles.cityTitle}>Draconia</Text>

        {/* === ZONE: THE KEEP === */}
        <View style={mapStyles.zone}>
          <ZoneHeader label="THE KEEP" />
          <View style={mapStyles.zoneNodesCenter}>
            <BuildingNode
              building={buildings.keep}
              onPress={() => handleNodePress('keep')}
            />
          </View>
        </View>

        <ZonePath />

        {/* === ZONE: INNER WARD === */}
        <View style={mapStyles.zone}>
          <ZoneHeader label="INNER WARD" />
          <View style={mapStyles.zoneNodesRow}>
            <BuildingNode
              building={buildings.housing}
              onPress={() => handleNodePress('housing')}
            />
            {buildings.librarium.visible && (
              <BuildingNode
                building={buildings.librarium}
                onPress={() => handleNodePress('librarium')}
              />
            )}
            <BuildingNode
              building={buildings.wizard}
              onPress={() => handleNodePress('wizard')}
            />
          </View>
        </View>

        <ZonePath />

        {/* === ZONE: CRAFT WARD === */}
        <View style={mapStyles.zone}>
          <ZoneHeader label="CRAFT WARD" />
          <View style={mapStyles.zoneNodesRow}>
            <BuildingNode
              building={buildings.forge}
              onPress={() => handleNodePress('forge')}
            />
            {buildings.lodge.visible && (
              <BuildingNode
                building={buildings.lodge}
                onPress={() => handleNodePress('lodge')}
              />
            )}
          </View>
        </View>

        <ZonePath />

        {/* === ZONE: OUTER WARD === */}
        <View style={mapStyles.zone}>
          <ZoneHeader label="OUTER WARD" />
          <View style={mapStyles.zoneNodesRow}>
            <BuildingNode
              building={buildings.garrison}
              onPress={() => handleNodePress('garrison')}
            />
            {buildings.outpost.visible && (
              <BuildingNode
                building={buildings.outpost}
                onPress={() => handleNodePress('outpost')}
              />
            )}
          </View>
        </View>

        <ZonePath />

        {/* === ZONE: CITY EDGE === */}
        <View style={mapStyles.zone}>
          <ZoneHeader label="CITY EDGE" />
          <View style={mapStyles.zoneNodesRow}>
            <BuildingNode
              building={buildings.tower_east}
              onPress={() => handleNodePress('tower_east')}
            />
            <BuildingNode
              building={buildings.tower_west}
              onPress={() => handleNodePress('tower_west')}
            />
          </View>
        </View>
      </ScrollView>

      {/* Purchase confirmation for unbuilt buildings */}
      <ConfirmModal
        visible={purchaseBuilding !== null}
        title={purchaseBuilding?.name ?? ''}
        message={purchaseBuilding?.description ?? ''}
        icon={purchaseBuilding?.icon ?? 'hammer'}
        confirmLabel={`Build - ${purchaseBuilding?.cost ?? 0} inspiration`}
        cancelLabel="Cancel"
        accentColor={purchaseBuilding?.accentColor}
        confirmDisabled={purchaseBuilding !== null && !purchaseBuilding.canAfford}
        onConfirm={() => {
          if (purchaseBuilding?.canAfford && purchaseTarget) {
            haptics.medium()
            playCoin()
            purchaseBuilding.onBuild()
            const openId = purchaseTarget
            setPurchaseTarget(null)
            setSelected(openId)
          }
        }}
        onCancel={() => setPurchaseTarget(null)}
      />

      {/* Building interior sheet for built buildings */}
      <BottomSheet
        visible={selectedBuilding !== null}
        onClose={() => setSelected(null)}
        title={selectedBuilding?.name ?? ''}
        subtitle={selectedBuilding?.statusLabel}
        icon={selectedBuilding?.icon}
        iconColor={selectedBuilding?.accentColor}
        resources={selectedBuilding ? resolveResources(selectedBuilding.resourceKeys) : undefined}
      >
        {selectedBuilding && <BuildingInterior id={selectedBuilding.id} />}
      </BottomSheet>
    </View>
  )
}
