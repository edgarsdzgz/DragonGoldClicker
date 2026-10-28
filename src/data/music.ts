import type { AudioSource } from 'expo-audio'
import type { StoryMood } from '../types/story'

// =============================================================================
// THE MUSIC: licensed tracks, credited in Settings > Credits and CREDITS.md (see
// _dev/docs/music-licenses.md). Which slot each fills is in _dev/docs/music-wishlist.md.
// =============================================================================

/** Every track, by name (the wishlist's slot in each comment) */
export const TRACKS = {
  /** The main theme: the title, and every screen without a track of its own. CC BY-SA 3.0 */
  theme: require('../../assets/music/out/Refusing the Ultimatum.m4a'),
  /** 1, 1b: the siege on the Warfront, taking turns. Scott Buckley, CC BY 4.0 */
  siege: require('../../assets/music/out/Legionnaire.m4a'),
  siege2: require('../../assets/music/out/Ignis.m4a'),
  /** 2: Draconia in ruins. Scott Buckley, CC BY 4.0 */
  ruin: require('../../assets/music/out/A Kind Of Hope.m4a'),
  /** 3, 3b, 3c: a boss at the gate, one per fight. Scott Buckley (CC BY 4.0), Darren Curtis (his release) */
  boss1: require('../../assets/music/out/Rites of Passage.m4a'),
  boss2: require('../../assets/music/out/Some Clowns Wanna Burn the World (Dark Mode).m4a'),
  boss3: require('../../assets/music/out/Under Siege.m4a'),
  /** 4: Draconia once the city brightens. Darren Curtis, his release */
  rebuilt: require('../../assets/music/out/Haven of the Faeries.m4a'),
  /** 5: the Breach, once through. Justin Allan Arnold, CC BY 3.0 */
  breach: require('../../assets/music/out/Through the Sinister Gate.m4a'),
  /** 6: the Forage valley. Darren Curtis, his release */
  valley: require('../../assets/music/out/Welcome to Hoibittown.m4a'),
  /** 7: under a story scene of hope. Scott Buckley, CC BY 4.0 */
  hope: require('../../assets/music/out/Childhood.m4a'),
  /** 8, 8b: under a story scene of dread, by turns. Scott Buckley, CC BY 4.0 */
  dread: require('../../assets/music/out/The Long Dark.m4a'),
  dread2: require('../../assets/music/out/Horizons.m4a'),
  /** 9, 9b: the Warfront in the deep Unmaking, taking turns. Darren Curtis, his release */
  deep: require('../../assets/music/out/Conquer the Great Sands.m4a'),
  deep2: require('../../assets/music/out/Prepare Thyself.m4a'),
  /** 10: inside the Librarium. Savfk, CC BY 4.0 */
  librarium: require('../../assets/music/out/The Invention Rooms.m4a'),
  /** 11: inside the Wizard's Tower. Scott Buckley, CC BY 4.0 */
  tower: require('../../assets/music/out/Signal To Noise.m4a'),
} as const satisfies Record<string, AudioSource>
export type TrackId = keyof typeof TRACKS

/** The theme, which the title's loader warms up so the music starts with the title */
export const THEME: AudioSource = TRACKS.theme

/** Every track */
export const MUSIC_TRACKS: readonly AudioSource[] = Object.values(TRACKS)

export const BOSS_TRACKS = ['boss1', 'boss2', 'boss3'] as const satisfies readonly TrackId[]
export const DREAD_BEDS = ['dread', 'dread2'] as const satisfies readonly TrackId[]

export type { StoryMood }

/** The sheets inside Draconia that bring their own music while open */
export type MusicSheet = 'librarium' | 'wizard'

/** What is on show, as far as the music cares (hooks/musicScene.ts holds it) */
export interface MusicScene {
  /** The tab route on show; null on the title */
  screen: string | null
  /** A sheet open inside Draconia that has its own music */
  sheet: MusicSheet | null
  /** The city has brightened out of its ruin (art/city.ts, cityLight: dusk or day) */
  cityRebuilt: boolean
  /** The horde is in the deep Unmaking (horde level UNMAKING_DEEPEST_LEVEL and up) */
  deep: boolean
  /** The boss fight at the gate (one key per fight), once the boss's horn has sounded */
  bossFight: number | null
  /** The story scene on show, if it has a mood */
  story: { uid: number; mood: StoryMood } | null
  /** The Breach on show (its count), until its track has played through */
  breach: number | null
}

export const NO_SCENE: MusicScene = {
  screen: null, sheet: null, cityRebuilt: false, deep: false, bossFight: null, story: null, breach: null,
}

/** What to play */
export interface MusicPlan {
  /** A new key fades to its music; the same key keeps what is playing */
  key: string
  /** One track, or two that take turns */
  tracks: readonly TrackId[]
  /** loop: one track repeats. turns: each plays to its end, then the next. once: plays through once */
  mode: 'loop' | 'turns' | 'once'
  /** Start from the top the first time this key plays (a new fight, a new scene); else resume */
  fromTop?: boolean
}

/** The choices made per fight and per scene (createMusicPicks) */
export interface MusicPicks {
  boss(fight: number): TrackId
  bed(uid: number, mood: StoryMood): TrackId
}

const loop = (track: TrackId): MusicPlan => ({ key: track, tracks: [track], mode: 'loop' })

/**
 * The music for what is on show. Strongest first: the Breach, then a story scene, then the screen.
 * On the Warfront a boss fight beats the deep Unmaking, which beats the siege; in Draconia an open
 * Librarium or Tower beats the city. Every other screen, and the title, keep the theme.
 */
export function musicPlan(s: MusicScene, picks: MusicPicks): MusicPlan {
  if (s.breach !== null) return { key: `breach:${s.breach}`, tracks: ['breach'], mode: 'once', fromTop: true }
  if (s.story) return { key: `story:${s.story.uid}`, tracks: [picks.bed(s.story.uid, s.story.mood)], mode: 'loop', fromTop: true }
  switch (s.screen) {
    case 'GameTab':
      if (s.bossFight !== null) return { key: `boss:${s.bossFight}`, tracks: [picks.boss(s.bossFight)], mode: 'loop', fromTop: true }
      return s.deep
        ? { key: 'deep', tracks: ['deep', 'deep2'], mode: 'turns' }
        : { key: 'siege', tracks: ['siege', 'siege2'], mode: 'turns' }
    case 'DraconiaTab':
      if (s.sheet === 'librarium') return loop('librarium')
      if (s.sheet === 'wizard') return loop('tower')
      return loop(s.cityRebuilt ? 'rebuilt' : 'ruin')
    case 'ForageTab':
      return loop('valley')
    default:
      return loop('theme')
  }
}

/**
 * Picks that hold for a fight or a scene. A boss fight draws one of the three boss tracks at
 * random, never the last fight's; dread scenes take The Long Dark and Horizons by turns.
 */
export function createMusicPicks(random: () => number = Math.random): MusicPicks {
  let fight: number | null = null
  let lastBoss: TrackId | null = null
  let scene: number | null = null
  let bed: TrackId = DREAD_BEDS[0]
  let dreads = 0
  return {
    boss(next) {
      if (next !== fight || !lastBoss) {
        const pool = BOSS_TRACKS.filter((t) => t !== lastBoss)
        lastBoss = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
        fight = next
      }
      return lastBoss
    },
    bed(uid, mood) {
      if (mood === 'hope') return 'hope'
      if (uid !== scene) {
        scene = uid
        bed = DREAD_BEDS[dreads++ % DREAD_BEDS.length]
      }
      return bed
    },
  }
}
