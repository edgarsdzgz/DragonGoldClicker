import React from 'react'
import { TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList, TabParamList } from './types'
import { colors, spacing, gold } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

import { GameScreen } from '../screens/GameScreen'
import { ShopScreen } from '../screens/ShopScreen'
import { StatsScreen } from '../screens/StatsScreen'

// =============================================================================
// HAPTIC TAB BAR BUTTON
// =============================================================================

function HapticTabButton(props: any) {
  const haptics = useHaptics()

  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        haptics.light()
        props.onPress?.(e)
      }}
    />
  )
}

// =============================================================================
// BOTTOM TAB NAVIGATOR
// =============================================================================

const Tab = createBottomTabNavigator<TabParamList>()

function TabNavigator() {
  return (
    <Tab.Navigator
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
        name="GameTab"
        component={GameScreen}
        options={{
          title: 'Dragon Gold',
          tabBarLabel: 'Game',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Game tab',
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={{
          title: 'Shop',
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Shop tab',
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Stats tab',
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
