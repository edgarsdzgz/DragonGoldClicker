import React, { useMemo } from 'react'
import { TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList, TabParamList } from './types'
import { colors, spacing, gold } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { useSfx } from '../hooks/useSfx'
import { SFX } from '../data/sfx'
import { useGame } from '../context/GameContext'
import {
  BARRACKS_LEVELS,
  ARMORY_COST,
  DRACONIA_HALL_COST,
  SOLDIER_TIERS,
  SWORD_COST,
  SHIELD_COST,
  AVATAR_WEAPONS,
  LODGE_LEVELS,
  FORAGER_TIERS,
  POST_LEVELS,
  EXPLORER_COST,
  EXPEDITION_INSPIRATION_COST,
  EXPEDITION_FOOD_COST,
  shouldRevealExplorerPost,
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
  LIBRARIUM_COST,
  RESEARCH_NODES,
  getResearchBonuses,
} from '../types/game'

import { GameScreen } from '../screens/GameScreen'
import { ForageScreen } from '../screens/ForageScreen'
import { ShopScreen } from '../screens/ShopScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

// =============================================================================
// HAPTIC TAB BAR BUTTON
// =============================================================================

function HapticTabButton(props: any) {
  const haptics = useHaptics()
  const playTap = useSfx(SFX.TAP)

  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        haptics.light()
        playTap()
        props.onPress?.(e)
      }}
    />
  )
}

// =============================================================================
// BOTTOM TAB NAVIGATOR
// =============================================================================

const Tab = createBottomTabNavigator<TabParamList>()

function useBuildTabBadge(): boolean {
  const { state } = useGame()

  return useMemo(() => {
    const g = state.inspiration

    // -- Unbuilt buildings the player can afford --
    if (state.barracksLevel === 0 && g >= BARRACKS_LEVELS[0].cost) return true
    if (!state.armoryBuilt && g >= ARMORY_COST) return true
    if (!state.draconiaHallBuilt && g >= DRACONIA_HALL_COST) return true
    if (state.foodSystemActive && state.lodgeLevel === 0 && g >= LODGE_LEVELS[0].cost) return true
    if (state.postLevel === 0 && shouldRevealExplorerPost(state) && g >= POST_LEVELS[0].cost) return true

    // -- Built buildings with affordable actions --
    const rb = getResearchBonuses(state.completedResearch)

    // Garrison: upgrade or train
    if (state.barracksLevel > 0) {
      const upgCost = getBarracksUpgradeCost(state.barracksLevel)
      if (upgCost !== null && g >= upgCost) return true
      const total = getTotalSoldiers(state.soldiers)
      const cap = getSoldierCap(state.barracksLevel)
      if (total < cap && state.villagers > 0) {
        for (const tier of SOLDIER_TIERS) {
          if (tier.unlocksAtBarracksLevel <= state.barracksLevel) {
            const baseCost = getSoldierCost(tier, getSoldierCount(state.soldiersTrained, tier.id))
            if (g >= Math.max(1, Math.floor(baseCost * (1 - rb.soldierCostDiscount)))) return true
          }
        }
      }
    }

    // Forge: sword, shield, or weapon
    if (state.armoryBuilt) {
      const totalSoldiers = getTotalSoldiers(state.soldiers)
      if (state.armoryGear.swords < totalSoldiers && g >= SWORD_COST) return true
      if (state.armoryGear.shields < totalSoldiers && g >= SHIELD_COST) return true
      for (const w of AVATAR_WEAPONS) {
        if (!state.ownedWeapons.includes(w.id) && g >= w.cost) return true
      }
    }

    // Lodge: upgrade or train forager
    if (state.lodgeLevel > 0) {
      const upgCost = getLodgeUpgradeCost(state.lodgeLevel)
      if (upgCost !== null && g >= upgCost) return true
      const fTotal = getTotalForagers(state.foragers)
      const fCap = getForagerCap(state.lodgeLevel)
      if (fTotal < fCap && state.villagers > 0) {
        for (const tier of FORAGER_TIERS) {
          if (tier.unlocksAtLodgeLevel <= state.lodgeLevel) {
            if (g >= getForagerCost(tier, getForagerCount(state.foragersTrained, tier.id))) return true
          }
        }
      }
    }

    // Outpost: train explorer, send expedition, or upgrade
    if (state.postLevel > 0) {
      const eCap = getExplorerCap(state.postLevel)
      if (state.explorers < eCap && state.villagers > 0 && g >= EXPLORER_COST) return true
      const available = state.explorers - state.activeExpeditions.length
      if (available > 0 && g >= EXPEDITION_INSPIRATION_COST && state.food >= EXPEDITION_FOOD_COST) return true
      const upgCost = getPostUpgradeCost(state.postLevel)
      if (upgCost !== null && g >= upgCost) return true
    }

    // Keep: offline upgrade
    if (state.draconiaHallBuilt) {
      const upgCost = getOfflineUpgradeCost(state.offlineLevel)
      if (upgCost !== null && g >= upgCost) return true
    }

    // Librarium: can build or can research
    if (!state.librariumBuilt && state.draconiaHallBuilt && g >= LIBRARIUM_COST) return true
    if (state.librariumBuilt) {
      for (const node of RESEARCH_NODES) {
        if (!state.completedResearch.includes(node.id) && g >= node.cost) {
          // Simple prereq check inline for badge (just check research prereqs)
          const prereqsMet = node.prereqs.every((p) => {
            if (p.type === 'research') return state.completedResearch.includes(p.id)
            if (p.type === 'barracksLevel') return state.barracksLevel >= p.level
            if (p.type === 'lodgeLevel') return state.lodgeLevel >= p.level
            if (p.type === 'postLevel') return state.postLevel >= p.level
            if (p.type === 'totalInspirationEarned') return state.totalInspirationEarned >= p.amount
            if (p.type === 'monstersDefeated') return state.monstersDefeated >= p.amount
            if (p.type === 'villagersRescued') return state.villagersRescued >= p.amount
            return false
          })
          if (prereqsMet) return true
        }
      }
    }

    return false
  }, [state])
}

function TabNavigator() {
  const { state, foodWarningLevel } = useGame()
  const buildHasAction = useBuildTabBadge()

  return (
    <Tab.Navigator
      initialRouteName="GameTab"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg.surface1,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: colors.bg.surface1,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: spacing[2],
          paddingTop: spacing[2],
        },
        tabBarActiveTintColor: gold[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => <HapticTabButton {...props} />,
      }}
    >
      <Tab.Screen
        name="DraconiaTab"
        component={ShopScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Draconia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hammer" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Draconia tab',
          tabBarBadge: buildHasAction ? '' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: gold[500],
            minWidth: 10,
            maxHeight: 10,
            borderRadius: 5,
            fontSize: 0,
            top: 2,
          },
        }}
      />
      <Tab.Screen
        name="GameTab"
        component={GameScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Warfront',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Warfront tab',
        }}
      />
      {state.foodSystemActive && (
        <Tab.Screen
          name="ForageTab"
          component={ForageScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Forage',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf" size={size} color={color} />
            ),
            tabBarAccessibilityLabel: 'Forage tab',
            tabBarBadge: foodWarningLevel > 0 ? '!' : undefined,
            tabBarBadgeStyle: {
              backgroundColor: foodWarningLevel === 1 ? colors.status.error : colors.status.warning,
              color: '#fff',
              fontSize: 10,
              fontWeight: 'bold',
              minWidth: 16,
              maxHeight: 16,
              borderRadius: 8,
              lineHeight: 15,
              top: 1,
            },
          }}
        />
      )}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tab.Navigator>
  )
}

// =============================================================================
// ROOT NAVIGATOR
// =============================================================================

const RootStack = createNativeStackNavigator<RootStackParamList>()

export function Navigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.bg.base,
          },
        }}
      >
        <RootStack.Screen name="Main" component={TabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
