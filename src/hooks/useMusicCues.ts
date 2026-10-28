import { useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { BOSS_MUSIC_DELAY_MS, BREACH_MUSIC_MAX_MS, breachToStart, gameMusic } from './musicCues'
import { getMusicScene, setMusicScene } from './musicScene'

/**
 * Tells the music what the game has on show (hooks/musicScene.ts, data/music.ts): the city's light,
 * the deep Unmaking, a boss fight at the gate, a Breach, and the mood of the story scene on show.
 */
export function useMusicCues() {
  const { state } = useGame()
  const { scenes } = useStory()
  const { cityRebuilt, deep, fight, breach, storyUid, mood } = gameMusic(state, scenes[0])

  useEffect(() => setMusicScene({ cityRebuilt, deep }), [cityRebuilt, deep])

  useEffect(() => {
    if (fight === null) return setMusicScene({ bossFight: null })
    const timer = setTimeout(() => setMusicScene({ bossFight: fight }), BOSS_MUSIC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [fight])

  useEffect(() => {
    const start = breachToStart(breach)
    if (start === null) return
    setMusicScene({ breach: start })
    // Should its end never be reported (the app was away), the Breach gives the music back by then.
    // Not cleared when the report closes: the track plays on past it.
    setTimeout(() => { if (getMusicScene().breach === start) setMusicScene({ breach: null }) }, BREACH_MUSIC_MAX_MS)
  }, [breach])

  useEffect(() => {
    setMusicScene({ story: storyUid !== null && mood ? { uid: storyUid, mood } : null })
  }, [storyUid, mood])

  // A game closed (a new game, or the app going back to the title) takes its music with it
  useEffect(() => () => setMusicScene({ cityRebuilt: false, deep: false, bossFight: null, story: null, breach: null }), [])
}
