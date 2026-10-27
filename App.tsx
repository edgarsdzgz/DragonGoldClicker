import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AudioSettingsProvider } from './src/context/AudioSettingsContext'
import { DevSettingsProvider } from './src/context/DevSettingsContext'
import { GameProvider } from './src/context/GameContext'
import { StoryProvider } from './src/context/StoryContext'
import { JournalProvider } from './src/context/JournalContext'
import { CoinFlightProvider } from './src/context/CoinFlightContext'
import { ShakeProvider } from './src/context/ShakeContext'
import { CoachProvider } from './src/context/CoachContext'
import { Navigation } from './src/navigation'
import { IntroScreen } from './src/screens/IntroScreen'
import { useBgMusic, useImmersiveMode } from './src/hooks'
import { configureTextDefaults } from './src/theme/textDefaults'

// Configure global text rendering defaults for Expo 54 / RN 0.81
configureTextDefaults()

const BGM_PLAYLIST = [
  // Main theme, looped. CC BY-SA 3.0: credited in Settings > Credits and CREDITS.md
  require('./assets/music/out/Refusing the Ultimatum.m4a'),
]

/**
 * The music player's status updates every 500ms. Kept in a component of its own that renders
 * nothing, so those updates re-render only this, not the whole game (they did, twice a second).
 */
function BgMusic() {
  useBgMusic(BGM_PLAYLIST)
  return null
}

function AppInner() {
  return (
    <GameProvider>
      <BgMusic />
      <StoryProvider>
        <CoachProvider>
          <ShakeProvider>
            <JournalProvider>
              <CoinFlightProvider>
                <Navigation />
              </CoinFlightProvider>
            </JournalProvider>
          </ShakeProvider>
        </CoachProvider>
      </StoryProvider>
    </GameProvider>
  )
}

export default function App() {
  useImmersiveMode()
  // The game mounts when the intro's splashes are over, under its fading cover
  const [gameShown, setGameShown] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  return (
    <SafeAreaProvider>
      <DevSettingsProvider>
        <AudioSettingsProvider>
          {gameShown && <AppInner />}
          {!introDone && <IntroScreen onReveal={() => setGameShown(true)} onFinished={() => setIntroDone(true)} />}
          <StatusBar style="light" />
        </AudioSettingsProvider>
      </DevSettingsProvider>
    </SafeAreaProvider>
  )
}
