/**
 * Third-party assets shipped in the game, with the attribution their licenses require.
 * Shown in Settings > Credits and mirrored in CREDITS.md at the repo root. Keep both in sync.
 */
export interface CreditEntry {
  /** Where the asset is used in the game */
  role: string
  title: string
  author: string
  authorUrl: string
  source: string
  sourceUrl: string
  license: string
  licenseUrl: string
  /** Changes made for the game, if any (CC licenses ask that changes be indicated) */
  changes?: string
}

export const CREDITS: CreditEntry[] = [
  {
    role: 'Main theme',
    title: 'Refusing The Ultimatum',
    author: 'Arthur Vyncke',
    authorUrl: 'https://soundcloud.com/arthurvost',
    source: 'Royalty Free Music by free-stock-music.com',
    sourceUrl: 'https://www.free-stock-music.com',
    license: 'Creative Commons / Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.en_US',
    changes: 'Converted from MP3 to AAC for the game, played on a loop and faded in and out as the screen changes. The music itself is unmodified.',
  },
  {
    role: 'The Warfront',
    title: 'Legionnaire (Original)',
    author: 'Scott Buckley',
    authorUrl: 'https://www.scottbuckley.com.au',
    source: 'Free download from BreakingCopyright',
    sourceUrl: 'https://breakingcopyright.com/song/scott-buckley-legionnaire',
    license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    changes: 'Converted from MP3 to AAC for the game, played on a loop and faded in and out as the screen changes. The music itself is unmodified.',
  },
]
