import React from 'react'
import { View, ScrollView, PixelRatio, useWindowDimensions } from 'react-native'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { GameIcon } from '../components/GameIcon'
import { cityUnit, cityLight, interiorHeader } from '../art'
import type { CityBuildingId } from '../art'
import { Text, BottomSheet, ConfirmModal, InspirationIcon, StoryObjective, ArtBanner, type ResourceItem } from '../components'
import { ResourceBar } from '../components/ResourceBar'
import { useGame } from '../context/GameContext'
import { useHaptics, useSfx } from '../hooks'
import { useCoach } from '../context/CoachContext'
import type { Rect } from '../context/coachRegistry'
import { SFX } from '../data/sfx'
import { useAmbientLoop } from '../hooks/useAmbientLoop'
import { colors, gold, spacing } from '../theme'
import {
  ARMORY_COST,
  DRACONIA_HALL_COST,
  LIBRARIUM_COST,
  OFFLINE_LEVELS,
  MAX_OFFLINE_LEVEL,
  RESEARCH_NODES,
  isBuildingRevealed,
  isSystemOn,
  SOLDIER_TIERS,
  FORAGER_TIERS,
  gearBlock,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
  getTotalForagers,
  getForagerCap,
  getLodgeUpgradeCost,
  getExplorerCap,
  getPostUpgradeCost,
  getOfflineUpgradeCost,
  countOf,
} from '../types/game'
import type { BuildingId, BuildingInfo, ResourceKey } from './shop/types'
import { BarracksInterior } from './shop/BarracksInterior'
import { ArmoryInterior } from './shop/ArmoryInterior'
import { LodgeInterior } from './shop/LodgeInterior'
import { PostInterior } from './shop/PostInterior'
import { DraconiaHallInterior } from './shop/DraconiaHallInterior'
import { LibrariumInterior } from './shop/LibrariumInterior'
import { WizardTowerInterior } from './shop/WizardTowerInterior'
import { WIZARD_TOWER_COST, TOWER_FIRE_BONUS } from '../types/allies'
import { mapStyles } from './shop/mapStyles'
import { CityMap } from './shop/CityMap'
import type { CityPlot } from './shop/CityMap'
import { rankBlock } from '../types/army'
import { foragerBlock } from '../types/lodge'
import { canStudyAny, studiesDone } from '../types/library'
import { outpostHasAction } from '../types/outpost'

// =============================================================================
// BUILDING INTERIOR ROUTER
// =============================================================================

function ComingSoonInterior() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      <GameIcon name="hammer" size={32} color={colors.text.muted} />
      <Text variant="body" color="muted" center style={{ marginTop: 8 }}>
        Under construction
      </Text>
      <Text variant="caption" color="muted" center>
        This building will be available in a future update.
      </Text>
    </View>
  )
}

const HEADER_GAP = { marginBottom: spacing[3] }

/** A building's interior under its header picture; the forge is heard while it is open */
function BuildingInterior({ id }: { id: BuildingId }) {
  useAmbientLoop('forge', id === 'forge')
  return (
    <>
      <ArtBanner id={interiorHeader(id)} style={HEADER_GAP} />
      <InteriorBody id={id} />
    </>
  )
}

function InteriorBody({ id }: { id: BuildingId }) {
  switch (id) {
    case 'keep': return <DraconiaHallInterior />
    case 'garrison': return <BarracksInterior />
    case 'forge': return <ArmoryInterior />
    case 'lodge': return <LodgeInterior />
    case 'outpost': return <PostInterior />
    case 'librarium': return <LibrariumInterior />
    case 'wizard': return <WizardTowerInterior />
    case 'housing':
    case 'tower_east':
    case 'tower_west':
      return <ComingSoonInterior />
  }
}

// =============================================================================
// MAIN SHOP SCREEN - CITY MAP
// =============================================================================

export function ShopScreen() {
  const [selected, setSelected] = React.useState<BuildingId | null>(null)
  const windowWidth = useWindowDimensions().width
  const {
    state,
    buildOrUpgradeBarracks,
    buildArmory,
    buildOrUpgradeLodge,
    buildOrUpgradePost,
    buildDraconiaHall,
    buildLibrarium,
    buildWizardTower,
  } = useGame()
  const haptics = useHaptics()
  // Building plays its own sound when it stands (hooks/useGameSounds)
  const playShop = useSfx(SFX.SHOP)
  // The city in its light; the night wind blows over it while it is dark
  const light = cityLight(state)
  const focused = useIsFocused()
  useAmbientLoop('nightWind', focused && light === 'night')

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
    return SOLDIER_TIERS.some((tier) => rankBlock(state, tier.id) === null)
  })()

  const forgeHasAction = gearBlock(state, 'sword') === null || gearBlock(state, 'shield') === null

  const lodgeHasAction = lodgeBuilt && (() => {
    const upgCost = getLodgeUpgradeCost(state.lodgeLevel)
    if (upgCost !== null && state.inspiration >= upgCost) return true
    return FORAGER_TIERS.some((tier) => foragerBlock(state, tier.id) === null)
  })()

  const outpostAction = outpostHasAction(state, Date.now())

  const keepHasAction = state.draconiaHallBuilt && (() => {
    const upgCost = getOfflineUpgradeCost(state.offlineLevel)
    return upgCost !== null && state.inspiration >= upgCost
  })()

  const librariumHasAction = canStudyAny(state)

  // Fogged buildings appear when their story beat reveals them (or once built)
  const revealed = (id: Parameters<typeof isBuildingRevealed>[1], built: boolean) =>
    built || isBuildingRevealed(state, id)

  const buildings: Record<string, BuildingInfo> = {
    keep: {
      id: 'keep',
      name: 'Draconia Keep',
      icon: 'business',
      description: 'The heart of the settlement. From this seat of power, manage villager roles and unlock offline renown collection.',
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
      description: 'A fortified training ground. Your fighters train here into conscripts, footmen and knights, who strike harder at the Gate.',
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
      description: "Kael's smithy. Swords make your soldiers hit harder; shields keep them standing when the wall falls.",
      accentColor: colors.building.forge,
      isBuilt: state.armoryBuilt,
      visible: revealed('forge', state.armoryBuilt),
      cost: ARMORY_COST,
      canAfford: state.inspiration >= ARMORY_COST,
      onBuild: buildArmory,
      hasAction: forgeHasAction,
      resourceKeys: ['inspiration'],
      statusLabel: state.armoryBuilt
        ? `${countOf(state.armoryGear.swords, 'sword', 'swords')}, ${countOf(state.armoryGear.shields, 'shield', 'shields')}`
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
        ? `Lv${state.lodgeLevel} -- ${foragerTotal}/${foragerCap} foragers`
        : undefined,
    },
    outpost: {
      id: 'outpost',
      name: 'The Outpost',
      icon: 'compass',
      description: 'Explorers set out from the ridge to bring home people stranded in the valley. Each journey costs food.',
      accentColor: colors.building.explorer,
      isBuilt: state.postLevel > 0,
      visible: revealed('outpost', state.postLevel > 0),
      cost: postBuildCost,
      canAfford: (postBuildCost ?? 0) > 0 && state.inspiration >= (postBuildCost ?? 0),
      onBuild: buildOrUpgradePost,
      hasAction: outpostAction,
      resourceKeys: ['inspiration', 'food', 'villagers'],
      statusLabel: state.postLevel > 0
        ? `Lv${state.postLevel} -- ${state.explorers}/${getExplorerCap(state.postLevel)} explorers`
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
        ? `${studiesDone(state)}/${RESEARCH_NODES.length} studied`
        : undefined,
    },
    housing: {
      id: 'housing',
      name: 'Housing',
      icon: 'home',
      description: 'Residential quarters that improve productivity and unlock population growth.',
      accentColor: colors.building.housing,
      isBuilt: false,
      visible: false, // fogged until a beat reveals it
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
      description: `Thornwick's tower, high up and well away from anything that burns. His fire makes your army's volley ${Math.round(TOWER_FIRE_BONUS * 100)}% stronger.`,
      accentColor: colors.building.wizard,
      isBuilt: state.wizardTowerBuilt,
      visible: revealed('wizard', state.wizardTowerBuilt),
      cost: WIZARD_TOWER_COST,
      canAfford: state.inspiration >= WIZARD_TOWER_COST,
      onBuild: buildWizardTower,
      hasAction: false,
      resourceKeys: ['inspiration'],
      statusLabel: state.wizardTowerBuilt ? "Thornwick's fire burns" : undefined,
    },
    tower_east: {
      id: 'tower_east',
      name: 'Tower East',
      icon: 'flag',
      description: 'A defensive tower on the eastern wall. Station fighters to boost defense and renown income.',
      accentColor: colors.building.tower,
      isBuilt: false,
      visible: false, // fogged until a beat reveals it
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
      description: 'A defensive tower on the western wall. Station fighters to boost defense and renown income.',
      accentColor: colors.building.tower,
      isBuilt: false,
      visible: false, // fogged until a beat reveals it
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
          return { icon: 'nutrition', value: state.food, whole: true, color: state.food === 0 ? colors.status.error : state.food <= 10 ? colors.status.warning : colors.text.secondary }
        case 'villagers':
          return { icon: 'people', value: state.villagers, whole: true, color: colors.text.secondary, label: 'idle' }
      }
    })

  const selectedBuilding = selected ? buildings[selected] ?? null : null
  const [purchaseTarget, setPurchaseTarget] = React.useState<BuildingId | null>(null)
  const purchaseBuilding = purchaseTarget ? buildings[purchaseTarget] ?? null : null

  const comingSoonIds: BuildingId[] = ['housing', 'tower_east', 'tower_west']

  // Guided tutorial: tell it when the Garrison sheet is open, and scroll a target into view
  const { registry: coachRegistry, setSheetOpen } = useCoach()
  React.useEffect(() => {
    setSheetOpen('garrison', purchaseTarget === 'garrison')
    return () => setSheetOpen('garrison', false)
  }, [purchaseTarget, setSheetOpen])
  const scrollRef = React.useRef<ScrollView>(null)
  const scrollY = React.useRef(0)
  const scrollTargetIntoView = (rect: Rect) => {
    scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + rect.y - 220), animated: true })
  }

  // The city map: each building's plot, drawn by its state (art/city.ts)
  const unit = cityUnit(windowWidth, PixelRatio.get())
  const LEVELS: Record<BuildingId, number> = {
    keep: state.offlineLevel,
    garrison: state.barracksLevel,
    forge: 0,
    lodge: state.lodgeLevel,
    outpost: state.postLevel,
    librarium: 0,
    housing: 0,
    wizard: 0,
    tower_east: 0,
    tower_west: 0,
  }
  const plots: CityPlot[] = (Object.keys(LEVELS) as BuildingId[]).map((id) => {
    const b = buildings[id]
    const comingSoon = comingSoonIds.includes(id)
    return {
      id,
      name: b.name,
      detail: !b.isBuilt && !comingSoon && b.cost !== null ? `${b.cost} renown` : undefined,
      look: {
        visible: b.visible,
        built: b.isBuilt,
        level: LEVELS[id],
        maxed: id === 'keep' && state.offlineLevel >= MAX_OFFLINE_LEVEL,
        lit: id === 'forge' && state.armoryGear.swords + state.armoryGear.shields > 0,
        canAfford: !b.isBuilt && b.canAfford,
        hasAction: b.hasAction,
        comingSoon,
      },
    }
  })

  const handleNodePress = (id: CityBuildingId) => {
    const b = buildings[id]
    if (!b?.visible) return // fog: nothing to open yet
    haptics.selection()
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
      />
      <StoryObjective />
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y
          coachRegistry.notify()
        }}
        scrollEventThrottle={64}
        style={mapStyles.scrollView}
        contentContainerStyle={mapStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CityMap
          plots={plots}
          unit={unit}
          light={light}
          onPress={handleNodePress}
          coachIds={{ garrison: 'garrison' }}
          scrollIntoView={scrollTargetIntoView}
        />
      </ScrollView>

      {/* Purchase confirmation for unbuilt buildings */}
      <ConfirmModal
        visible={purchaseBuilding !== null}
        title={purchaseBuilding?.name ?? ''}
        message={purchaseBuilding?.description ?? ''}
        icon={purchaseBuilding?.icon ?? 'hammer'}
        confirmLabel={`Build - ${purchaseBuilding?.cost ?? 0} renown`}
        cancelLabel="Cancel"
        accentColor={purchaseBuilding?.accentColor}
        confirmDisabled={purchaseBuilding !== null && !purchaseBuilding.canAfford}
        confirmCoachId={purchaseTarget === 'garrison' ? 'garrison_build' : undefined}
        onConfirm={() => {
          if (purchaseBuilding?.canAfford && purchaseTarget) {
            haptics.medium()
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
