import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AudioSettingsProvider } from './src/context/AudioSettingsContext'
import { GameProvider } from './src/context/GameContext'
import { Navigation } from './src/navigation'
import { useBgMusic } from './src/hooks'
import { configureTextDefaults } from './src/theme/textDefaults'

// Configure global text rendering defaults for Expo 54 / RN 0.81
configureTextDefaults()

const BGM_PLAYLIST = [
  require('./assets/music/out/Ruins of Dawn_04.m4a'),
]

function AppInner() {
  useBgMusic(BGM_PLAYLIST)

  return (
    <GameProvider>
      <Navigation />
      <StatusBar style="light" />
    </GameProvider>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioSettingsProvider>
        <AppInner />
      </AudioSettingsProvider>
    </SafeAreaProvider>
  )
}
