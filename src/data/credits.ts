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
    changes: 'Converted from MP3 to AAC for the game. The music itself is unmodified.',
  },
]
