/**
 * Third-party assets shipped in the game, with the attribution their licenses require.
 * Shown in Settings > Credits and mirrored in CREDITS.md at the repo root. Keep both in sync.
 */
export interface CreditEntry {
  /** Where the asset is used in the game */
  role: string
  title: string
  author: string
  /** The credit line the author asks for, word for word; without one the card shows "<title> by <author>" */
  attribution?: string
  authorUrl: string
  source: string
  sourceUrl: string
  license: string
  licenseUrl: string
  /** Changes made for the game, if any (CC licenses ask that changes be indicated) */
  changes?: string
}

const SCOTT = { author: 'Scott Buckley', authorUrl: 'https://www.scottbuckley.com.au' }
const DARREN = {
  author: 'Darren Curtis',
  authorUrl: 'https://www.darrencurtismusic.com',
  source: 'Free download from the composer, with his Materials Release',
  sourceUrl: 'https://www.darrencurtismusic.com',
  license: "Darren Curtis's Materials Release (signed by him; not Creative Commons)",
  licenseUrl: 'https://www.darrencurtismusic.com',
}
const CC_BY_4 = {
  license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
}
const FROM_SCOTT = { source: 'Free download from the composer', sourceUrl: 'https://www.scottbuckley.com.au/library/' }
const FROM_BREAKING_COPYRIGHT = { source: 'Free download from BreakingCopyright', sourceUrl: 'https://breakingcopyright.com' }

/** His credit, in the form his track pages give it */
const scottCredit = (title: string) => `'${title}' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au`

/** What was changed: the format, and how the game plays it. The music itself is never edited */
const changed = (from: 'MP3' | 'WAV', playback: string) =>
  `Converted from ${from} to AAC for the game; ${playback}, and faded in and out as the music changes. The music itself is unmodified.`
const LOOPED = 'played on a loop'
const turnsWith = (other: string) => `played in turn with "${other}" (each to its end, then the other)`
const BOSS = 'played on a loop through a boss fight, from the top'
const STORY = 'played on a loop under a story scene, from the top'

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
    ...SCOTT,
    attribution: scottCredit('Legionnaire (Original)'),
    source: 'Free download from BreakingCopyright',
    sourceUrl: 'https://breakingcopyright.com/song/scott-buckley-legionnaire',
    ...CC_BY_4,
    changes: changed('MP3', turnsWith('Ignis')),
  },
  { role: 'The Warfront', title: 'Ignis', ...SCOTT, attribution: scottCredit('Ignis'), ...FROM_SCOTT, ...CC_BY_4, changes: changed('MP3', turnsWith('Legionnaire')) },
  { role: 'Draconia in ruins', title: 'A Kind Of Hope', ...SCOTT, attribution: scottCredit('A Kind Of Hope'), ...FROM_SCOTT, ...CC_BY_4, changes: changed('MP3', LOOPED) },
  { role: 'Draconia rebuilt', title: 'Haven of the Faeries', ...DARREN, attribution: 'Haven of the Faeries by Darren Curtis', changes: changed('WAV', LOOPED) },
  { role: 'A boss at the gate', title: 'Rites of Passage', ...SCOTT, attribution: scottCredit('Rites of Passage'), ...FROM_SCOTT, ...CC_BY_4, changes: changed('MP3', BOSS) },
  {
    role: 'A boss at the gate',
    title: 'Some Clowns Wanna Burn the World (Dark Mode)',
    ...DARREN,
    attribution: 'Some Clowns Wanna Burn the World (Dark Mode) by Darren Curtis',
    changes: changed('WAV', BOSS),
  },
  { role: 'A boss at the gate', title: 'Under Siege!', ...DARREN, attribution: 'Under Siege! by Darren Curtis', changes: changed('WAV', BOSS) },
  { role: 'The deep Unmaking', title: 'Conquer the Great Sands', ...DARREN, attribution: 'Conquer the Great Sands by Darren Curtis', changes: changed('WAV', turnsWith('Prepare Thyself')) },
  { role: 'The deep Unmaking', title: 'Prepare Thyself', ...DARREN, attribution: 'Prepare Thyself by Darren Curtis', changes: changed('WAV', turnsWith('Conquer the Great Sands')) },
  {
    role: 'The Breach',
    title: 'Through the Sinister Gate',
    author: 'Justin Allan Arnold',
    attribution: "'Through the Sinister Gate' by Justin Allan Arnold - licensed under CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). soundcloud.com/justin-allan-arnold",
    authorUrl: 'https://soundcloud.com/justin-allan-arnold',
    ...FROM_BREAKING_COPYRIGHT,
    license: 'Creative Commons Attribution 3.0 Unported (CC BY 3.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    changes: changed('MP3', 'played once, when the wall falls'),
  },
  { role: 'The Forage valley', title: 'Welcome to Hoibittown', ...DARREN, attribution: 'Welcome to Hoibittown by Darren Curtis', changes: changed('WAV', LOOPED) },
  {
    role: 'The Librarium',
    title: 'The Invention Rooms',
    author: 'Savfk',
    attribution: 'The Invention Rooms by Savfk - www.youtube.com/@savfkmusic',
    authorUrl: 'https://www.youtube.com/@savfkmusic',
    ...FROM_BREAKING_COPYRIGHT,
    ...CC_BY_4,
    changes: changed('MP3', LOOPED),
  },
  { role: "The Wizard's Tower", title: 'Signal To Noise', ...SCOTT, attribution: scottCredit('Signal To Noise'), ...FROM_BREAKING_COPYRIGHT, ...CC_BY_4, changes: changed('MP3', LOOPED) },
  { role: 'Story scenes: hope', title: 'Childhood', ...SCOTT, attribution: scottCredit('Childhood'), ...FROM_BREAKING_COPYRIGHT, ...CC_BY_4, changes: changed('MP3', STORY) },
  { role: 'Story scenes: dread', title: 'The Long Dark', ...SCOTT, attribution: scottCredit('The Long Dark'), ...FROM_SCOTT, ...CC_BY_4, changes: changed('MP3', STORY) },
  { role: 'Story scenes: dread', title: 'Horizons', ...SCOTT, attribution: scottCredit('Horizons'), ...FROM_BREAKING_COPYRIGHT, ...CC_BY_4, changes: changed('MP3', STORY) },
]
