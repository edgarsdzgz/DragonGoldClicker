import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList, RootStackNavProp, TabParamList } from './types'
import { colors, spacing, gold } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { useSfx } from '../hooks/useSfx'
import { SFX } from '../data/sfx'
import { useGame } from '../context/GameContext'
import { useTabLocks } from './useTabLocks'
import { UnlockToast } from '../components/UnlockToast'
import { EventHost } from '../components/EventHost'
import { APP_ROOT_TARGET } from '../components/HighlightBackdrop'
import { useStoryDirector } from '../hooks/useStoryDirector'
import { warfrontReveal } from '../types/opening'
import { useScriptedEvents } from '../hooks/useScriptedEvents'
import { useQuestToasts } from '../hooks/useQuestToasts'
import { useFoodEventToasts } from '../hooks/useFoodEventToasts'
import { useWallWarnings } from '../hooks/useWallWarnings'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { useCoach } from '../context/CoachContext'
import { CoachMark } from '../components/CoachMark'
import { rankBlock } from '../types/army'
import { foragerBlock } from '../types/lodge'
import { JournalSheet } from '../components/JournalSheet'
import type { SceneTab } from '../data/story/lines'
import type { UnlockToastHandle } from '../components/UnlockToast'
import {
  BARRACKS_LEVELS,
  ARMORY_COST,
  DRACONIA_HALL_COST,
  SOLDIER_TIERS,
  gearBlock,
  LODGE_LEVELS,
  FORAGER_TIERS,
  POST_LEVELS,
  EXPLORER_COST,
  EXPEDITION_INSPIRATION_COST,
  EXPEDITION_FOOD_COST,
  isBuildingRevealed,
  getBarracksUpgradeCost,
  getLodgeUpgradeCost,
  getExplorerCap,
  getPostUpgradeCost,
  getOfflineUpgradeCost,
  LIBRARIUM_COST,
  RESEARCH_NODES,
} from '../types/game'

import { GameScreen } from '../screens/GameScreen'
import { ForageScreen } from '../screens/ForageScreen'
import { ShopScreen } from '../screens/ShopScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

// =============================================================================
// HAPTIC TAB BAR BUTTON
// =============================================================================

function HapticTabButton({ coachId, ...props }: any) {
  const haptics = useHaptics()
  // Tab buttons live in the bar, so they must not depend on their own tab being focused
  const coach = useCoachTarget(coachId, undefined, { skipFocusGate: true })
  const playTap = useSfx(SFX.TAP)

  return (
    <TouchableOpacity
      {...props}
      ref={coach.ref}
      onLayout={(e) => {
        props.onLayout?.(e)
        coach.onLayout()
      }}
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
    if (!state.armoryBuilt && isBuildingRevealed(state, 'forge') && g >= ARMORY_COST) return true
    if (!state.draconiaHallBuilt && isBuildingRevealed(state, 'keep') && g >= DRACONIA_HALL_COST) return true
    if (isBuildingRevealed(state, 'lodge') && state.lodgeLevel === 0 && g >= LODGE_LEVELS[0].cost) return true
    if (state.postLevel === 0 && isBuildingRevealed(state, 'outpost') && g >= POST_LEVELS[0].cost) return true

    // -- Built buildings with affordable actions --

    // Garrison: upgrade or train
    if (state.barracksLevel > 0) {
      const upgCost = getBarracksUpgradeCost(state.barracksLevel)
      if (upgCost !== null && g >= upgCost) return true
      if (SOLDIER_TIERS.some((tier) => rankBlock(state, tier.id) === null)) return true
    }

    // Forge: sword or shield (the player's own upgrade is the claws, on the Warfront)
    if (gearBlock(state, 'sword') === null || gearBlock(state, 'shield') === null) return true

    // Lodge: upgrade or train forager
    if (state.lodgeLevel > 0) {
      const upgCost = getLodgeUpgradeCost(state.lodgeLevel)
      if (upgCost !== null && g >= upgCost) return true
      if (FORAGER_TIERS.some((tier) => foragerBlock(state, tier.id) === null)) return true
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
    if (!state.librariumBuilt && isBuildingRevealed(state, 'librarium') && g >= LIBRARIUM_COST) return true
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
  const { foodWarningLevel, state } = useGame()
  // The opening hides the tab bar on the Warfront until call_to_arms; other tabs (the dev
  // shortcut's Settings) keep it so there is always a way back
  const tabBarHidden = !warfrontReveal(state).chrome
  const buildHasAction = useBuildTabBadge()
  const locks = useTabLocks()
  const toastRef = useRef<UnlockToastHandle | null>(null)
  const navigation = useNavigation<RootStackNavProp>()
  useStoryDirector()
  const { setFocusedTab } = useCoach()
  const goToTab = useCallback((tab: SceneTab) => navigation.navigate('Main', { screen: tab }), [navigation])
  const onSceneClosed = useScriptedEvents({ onNavigate: goToTab, toastRef })
  useQuestToasts(toastRef)
  useFoodEventToasts(toastRef)
  useWallWarnings(toastRef)
  // The app's root view: scenes place their highlight box relative to it (see HighlightBackdrop)
  const appRoot = useCoachTarget(APP_ROOT_TARGET, undefined, { skipFocusGate: true })
  // A reset (from Settings) stamps a new startedAt: the new game opens on the Warfront
  const startedAt = useRef(state.startedAt)
  useEffect(() => {
    if (state.startedAt === startedAt.current) return
    startedAt.current = state.startedAt
    navigation.navigate('Main', { screen: 'GameTab' })
  }, [state.startedAt, navigation])
  // Fallback for when the system nav bar is visible (immersive refused, or swiped in)
  const insets = useSafeAreaInsets()

  return (
    <View ref={appRoot.ref} onLayout={appRoot.onLayout} collapsable={false} style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="GameTab"
        screenListeners={({ route }) => ({ focus: () => setFocusedTab(route.name) })}
        // Hardware back returns to Warfront (always unlocked). The default, firstRoute,
        // jumped to the Draconia tab and bypassed its lock.
        backBehavior="initialRoute"
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: colors.bg.surface1,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarStyle: tabBarHidden && route.name === 'GameTab' ? { display: 'none' } : {
            backgroundColor: colors.bg.surface1,
            borderTopColor: colors.border.subtle,
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: spacing[2] + insets.bottom,
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
        })}
      >
        <Tab.Screen
          name="DraconiaTab"
          component={ShopScreen}
          options={{
            headerShown: false,
            tabBarButton: (props) => <HapticTabButton {...props} coachId="tab_draconia" />,
            tabBarLabel: locks.DraconiaTab.locked ? 'Locked' : 'Draconia',
            tabBarIcon: ({ color, size }) => (
              locks.DraconiaTab.locked
                ? <Ionicons name="lock-closed" size={size} color={colors.text.muted} />
                : <Ionicons name="hammer" size={size} color={color} />
            ),
            tabBarAccessibilityLabel: locks.DraconiaTab.locked
              ? 'Draconia tab - locked'
              : 'Draconia tab',
            tabBarBadge: !locks.DraconiaTab.locked && buildHasAction ? '' : undefined,
            tabBarBadgeStyle: {
              backgroundColor: gold[500],
              minWidth: 10,
              maxHeight: 10,
              borderRadius: 5,
              fontSize: 0,
              top: 2,
            },
          }}
          listeners={{
            tabPress: (e) => {
              if (locks.DraconiaTab.locked) {
                e.preventDefault()
                toastRef.current?.show(locks.DraconiaTab.requirement)
              }
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
        <Tab.Screen
          name="ForageTab"
          component={ForageScreen}
          options={{
            headerShown: false,
            tabBarButton: (props) => <HapticTabButton {...props} coachId="tab_forage" />,
            tabBarLabel: locks.ForageTab.locked ? 'Locked' : 'Forage',
            tabBarIcon: ({ color, size }) => (
              locks.ForageTab.locked
                ? <Ionicons name="lock-closed" size={size} color={colors.text.muted} />
                : <Ionicons name="leaf" size={size} color={color} />
            ),
            tabBarAccessibilityLabel: locks.ForageTab.locked
              ? 'Forage tab - locked'
              : 'Forage tab',
            tabBarBadge: !locks.ForageTab.locked && foodWarningLevel > 0 ? '!' : undefined,
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
          listeners={{
            tabPress: (e) => {
              if (locks.ForageTab.locked) {
                e.preventDefault()
                toastRef.current?.show(locks.ForageTab.requirement)
              }
            },
          }}
        />
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
      <UnlockToast toastRef={toastRef} />
      <JournalSheet />
      <EventHost onNavigate={goToTab} onSceneClosed={onSceneClosed} />
      <CoachMark />
    </View>
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
