import type { AudioSource } from 'expo-audio'

// =============================================================================
// THE MUSIC: licensed tracks, credited in Settings > Credits and CREDITS.md (see
// _dev/docs/music-licenses.md). What each screen still wants is in _dev/docs/music-wishlist.md.
// =============================================================================

/** The main theme, looped: the title, and every screen without a track of its own. CC BY-SA 3.0 */
export const THEME: AudioSource = require('../../assets/music/out/Refusing the Ultimatum.m4a')

/** The Warfront: the siege ("Legionnaire", Scott Buckley). CC BY 4.0 */
export const SIEGE: AudioSource = require('../../assets/music/out/Legionnaire.m4a')

/** Every track, by name */
export const TRACKS = { theme: THEME, siege: SIEGE } as const satisfies Record<string, AudioSource>
export type TrackId = keyof typeof TRACKS

/** Every track, so they can load before they are first played */
export const MUSIC_TRACKS: readonly AudioSource[] = Object.values(TRACKS)

/** Screens (the tab routes) with a track of their own; the rest keep the theme */
const SCREEN_MUSIC: Readonly<Partial<Record<string, TrackId>>> = {
  GameTab: 'siege',
}

/** The track for the screen on show (null before the game opens: the title) */
export function screenTrack(screen: string | null): TrackId {
  return (screen && SCREEN_MUSIC[screen]) || 'theme'
}

export function screenMusic(screen: string | null): AudioSource {
  return TRACKS[screenTrack(screen)]
}
