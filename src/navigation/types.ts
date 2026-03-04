import type { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

// Tab navigator
export type TabParamList = {
  GameTab: undefined
  ShopTab: undefined
  StatsTab: undefined
}

// Root stack (wraps tabs + future modals)
export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>
}

// Navigation prop types
export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>
