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
import { TitleScreen } from './src/screens/TitleScreen'
import { useBgMusic, useImmersiveMode } from './src/hooks'
import { useGameSounds } from './src/hooks/useGameSounds'
import { useLaunch } from './src/loading/useLaunch'
import type { LoadedGame } from './src/hooks/useStorage'
import { createMusicPicks, musicPlan } from './src/data/music'
import { setMusicScene, useMusicScene } from './src/hooks/musicScene'
import { useMusicCues } from './src/hooks/useMusicCues'
import { configureTextDefaults } from './src/theme/textDefaults'

// Configure global text rendering defaults for Expo 54 / RN 0.81
configureTextDefaults()

/** The Breach's track has played through: the music under it comes back */
const breachHeard = () => setMusicScene({ breach: null })

/**
 * The music: the theme on the title, then what the game has on show (data/music.ts, musicPlan).
 * Kept in a component of its own that renders nothing, so a tab change re-renders only this, not
 * the game.
 */
function BgMusic() {
  const [picks] = useState(() => createMusicPicks())
  useBgMusic(musicPlan(useMusicScene(), picks), breachHeard)
  return null
}

/** Tells the music what the game has on show (hooks/useMusicCues.ts) */
function MusicCues() {
  useMusicCues()
  return null
}

/** The game's event sounds, in a component of its own for the same reason: the state ticks */
function GameSounds() {
  useGameSounds()
  return null
}

function AppInner({ game }: { game: LoadedGame }) {
  return (
    <GameProvider initial={game}>
      <GameSounds />
      <StoryProvider>
        <MusicCues />
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
  // Loading starts now, behind the splashes; the title waits for it, then the player starts
  const launch = useLaunch()
  const [game, setGame] = useState<LoadedGame | null>(null)
  const [titleShown, setTitleShown] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  const start = () => {
    if (launch.progress.status === 'ready' && !game) setGame(launch.begin())
  }

  return (
    <SafeAreaProvider>
      <DevSettingsProvider>
        <AudioSettingsProvider>
          {/* The theme starts with the title and plays on into the game */}
          {titleShown && <BgMusic />}
          {game && <AppInner game={game} />}
          {!introDone && (
            <IntroScreen
              title={<TitleScreen progress={launch.progress} onStart={start} onRetry={launch.retry} onStartFresh={launch.startFresh} />}
              onTitle={() => setTitleShown(true)}
              started={game !== null}
              onFinished={() => setIntroDone(true)}
            />
          )}
          <StatusBar style="light" />
        </AudioSettingsProvider>
      </DevSettingsProvider>
    </SafeAreaProvider>
  )
}
