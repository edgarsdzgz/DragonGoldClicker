import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GameProvider } from './src/context/GameContext'
import { Navigation } from './src/navigation'
import { configureTextDefaults } from './src/theme/textDefaults'

// Configure global text rendering defaults for Expo 54 / RN 0.81
configureTextDefaults()

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <Navigation />
        <StatusBar style="light" />
      </GameProvider>
    </SafeAreaProvider>
  )
}
