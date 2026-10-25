import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AudioSettingsProvider } from './src/context/AudioSettingsContext'
import { DevSettingsProvider } from './src/context/DevSettingsContext'
import { GameProvider } from './src/context/GameContext'
import { StoryProvider } from './src/context/StoryContext'
import { ShakeProvider } from './src/context/ShakeContext'
import { CoachProvider } from './src/context/CoachContext'
import { Navigation } from './src/navigation'
import { useBgMusic, useImmersiveMode } from './src/hooks'
import { configureTextDefaults } from './src/theme/textDefaults'

// Configure global text rendering defaults for Expo 54 / RN 0.81
configureTextDefaults()

const BGM_PLAYLIST = [
  require('./assets/music/out/Ruins of Dawn_04.m4a'),
]

function AppInner() {
  useBgMusic(BGM_PLAYLIST)
  useImmersiveMode()

  return (
    <GameProvider>
      <StoryProvider>
        <CoachProvider>
          <ShakeProvider>
            <Navigation />
          </ShakeProvider>
        </CoachProvider>
      </StoryProvider>
      <StatusBar style="light" />
    </GameProvider>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DevSettingsProvider>
        <AudioSettingsProvider>
          <AppInner />
        </AudioSettingsProvider>
      </DevSettingsProvider>
    </SafeAreaProvider>
  )
}
