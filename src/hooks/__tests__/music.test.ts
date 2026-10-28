import { readFileSync } from 'fs'
import { join } from 'path'
import { BOSS_TRACKS, MUSIC_TRACKS, NO_SCENE, TRACKS, createMusicPicks, musicPlan } from '../../data/music'
import type { MusicPicks, MusicPlan, MusicScene, TrackId } from '../../data/music'
import { CREDITS } from '../../data/credits'
import { getMusicScene, setMusicScene, setMusicScreen } from '../musicScene'
import { MusicDeck } from '../musicDeck'
import type { DeckPlayer } from '../musicDeck'
import { breachToStart, gameMusic, resetMusicCuesForTests } from '../musicCues'
import { crossfade, CROSSFADE_MS, FADE_STEP_MS } from '../crossfade'
import type { FadingPlayer } from '../crossfade'
import { DEFAULT_GAME_STATE } from '../../types/state'
import type { GameState } from '../../types/state'
import { MONSTERS } from '../../types/monsters'
import { HORDE_LEVEL_KILLS, UNMAKING_DEEPEST_LEVEL } from '../../types/horde'
import { STORY_BEATS } from '../../types/story'

const ROOT = join(__dirname, '..', '..', '..')

// By name throughout: under jest every audio file is the same stub, so sources cannot be told apart
const PICKS: MusicPicks = { boss: () => 'boss2', bed: (_uid, mood) => (mood === 'hope' ? 'hope' : 'dread2') }
const plan = (patch: Partial<MusicScene>) => musicPlan({ ...NO_SCENE, ...patch }, PICKS)
const tracks = (patch: Partial<MusicScene>) => plan(patch).tracks

describe('the music for what is on show', () => {
  it('the title and every screen without a track keep the theme', () => {
    expect(plan({})).toEqual({ key: 'theme', tracks: ['theme'], mode: 'loop' })
    for (const screen of ['SettingsTab', 'Main', 'Anything']) expect([screen, tracks({ screen })]).toEqual([screen, ['theme']])
  })

  it('the Warfront: the siege pair by turns, the deep pair from level 10, a boss over both', () => {
    expect(plan({ screen: 'GameTab' })).toEqual({ key: 'siege', tracks: ['siege', 'siege2'], mode: 'turns' })
    expect(plan({ screen: 'GameTab', deep: true })).toEqual({ key: 'deep', tracks: ['deep', 'deep2'], mode: 'turns' })
    expect(plan({ screen: 'GameTab', deep: true, bossFight: 7 })).toEqual({ key: 'boss:7', tracks: ['boss2'], mode: 'loop', fromTop: true })
  })

  it('Draconia: the ruin, then the city rebuilt; the Librarium and the Tower take over while open', () => {
    expect(tracks({ screen: 'DraconiaTab' })).toEqual(['ruin'])
    expect(tracks({ screen: 'DraconiaTab', cityRebuilt: true })).toEqual(['rebuilt'])
    expect(tracks({ screen: 'DraconiaTab', sheet: 'librarium' })).toEqual(['librarium'])
    expect(tracks({ screen: 'DraconiaTab', cityRebuilt: true, sheet: 'wizard' })).toEqual(['tower'])
    // A sheet means nothing off Draconia
    expect(tracks({ screen: 'ForageTab', sheet: 'wizard' })).toEqual(['valley'])
  })

  it('a story scene puts its bed under any screen, and the Breach beats it', () => {
    expect(plan({ screen: 'GameTab', bossFight: 3, story: { uid: 4, mood: 'hope' } })).toEqual({ key: 'story:4', tracks: ['hope'], mode: 'loop', fromTop: true })
    expect(tracks({ screen: 'ForageTab', story: { uid: 5, mood: 'dread' } })).toEqual(['dread2'])
    expect(plan({ screen: 'GameTab', story: { uid: 5, mood: 'dread' }, breach: 2 })).toEqual({ key: 'breach:2', tracks: ['breach'], mode: 'once', fromTop: true })
  })
})

describe('the picks for a fight and a scene', () => {
  it('a boss fight keeps its track; the next fight never repeats the last', () => {
    const rolls = [0.9, 0.9, 0, 0.5]
    const picks = createMusicPicks(() => rolls.shift() ?? 0)
    const first = picks.boss(10)
    expect(first).toBe('boss3')
    expect(picks.boss(10)).toBe(first)
    let last: TrackId = first
    for (const fight of [11, 12, 13, 14, 15, 16]) {
      const next = picks.boss(fight)
      expect(BOSS_TRACKS).toContain(next)
      expect([fight, next === last]).toEqual([fight, false])
      last = next
    }
  })

  it('a hope scene has Childhood; dread scenes take The Long Dark and Horizons by turns', () => {
    const picks = createMusicPicks()
    expect(picks.bed(1, 'hope')).toBe('hope')
    expect(picks.bed(2, 'dread')).toBe('dread')
    expect(picks.bed(2, 'dread')).toBe('dread')
    expect(picks.bed(3, 'hope')).toBe('hope')
    expect(picks.bed(4, 'dread')).toBe('dread2')
    expect(picks.bed(5, 'dread')).toBe('dread')
  })
})

type TestPlayer = DeckPlayer & { played: number; paused: number; seeks: number[] }

function deckRig() {
  const players = new Map<TrackId, TestPlayer>()
  const player = (id: TrackId): TestPlayer => {
    let p = players.get(id)
    if (!p) {
      const made: TestPlayer = {
        volume: -1, loop: false, currentTime: 30, duration: 120, played: 0, paused: 0, seeks: [],
        play: () => { made.played += 1 },
        pause: () => { made.paused += 1 },
        seekTo: (s: number) => { made.seeks.push(s) },
      }
      p = made
      players.set(id, p)
    }
    return p
  }
  const done: MusicPlan[] = []
  const deck = new MusicDeck(player, () => 0.5, (p) => done.push(p))
  return { deck, player, done, players }
}

describe('the music deck', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('two tracks take turns: each plays to its end, then the other from the top', () => {
    const { deck, player } = deckRig()
    deck.show(plan({ screen: 'GameTab' }))
    expect([deck.track, player('siege').loop]).toEqual(['siege', false])
    deck.ended('siege')
    expect([deck.track, player('siege2').seeks, player('siege2').played, player('siege2').volume]).toEqual(['siege2', [0], 1, 0.5])
    deck.ended('siege2')
    expect([deck.track, player('siege').seeks]).toEqual(['siege', [0]])
  })

  it('a track that ends while it is not the one playing changes nothing', () => {
    const { deck } = deckRig()
    deck.show(plan({ screen: 'GameTab' }))
    deck.ended('siege2')
    deck.ended('theme')
    expect(deck.track).toBe('siege')
  })

  it('a looping track never takes turns', () => {
    const { deck, player } = deckRig()
    deck.show(plan({ screen: 'ForageTab' }))
    expect(player('valley').loop).toBe(true)
    deck.ended('valley')
    expect(deck.track).toBe('valley')
  })

  it('a screen left and come back to resumes where it was, on the track whose turn it is', () => {
    const { deck, player } = deckRig()
    deck.show(plan({ screen: 'GameTab' }))
    deck.ended('siege')
    deck.show(plan({ screen: 'ForageTab' }))
    jest.advanceTimersByTime(CROSSFADE_MS)
    expect(player('siege2').paused).toBe(1)
    deck.show(plan({ screen: 'GameTab' }))
    expect([deck.track, player('siege2').seeks]).toEqual(['siege2', [0]])
  })

  it('a pair track that ended while it faded out hands over to the other on the way back', () => {
    const { deck, player } = deckRig()
    deck.show(plan({ screen: 'GameTab' }))
    deck.show(plan({ screen: 'ForageTab' }))
    // It reaches its end mid-fade: the deck hears it, but it is no longer the track playing
    player('siege').currentTime = 119.8
    deck.ended('siege')
    deck.show(plan({ screen: 'GameTab' }))
    expect([deck.track, player('siege2').seeks]).toEqual(['siege2', [0]])
  })

  it('warming makes a player ahead of its first play', () => {
    const { deck, players } = deckRig()
    deck.warm(['boss1', 'breach'])
    expect([...players.keys()]).toEqual(['boss1', 'breach'])
    expect([players.get('boss1')?.played, deck.track]).toEqual([0, null])
  })

  it('a boss fight starts its track from the top once, and resumes it after a scene', () => {
    const { deck, player } = deckRig()
    deck.show(plan({ screen: 'GameTab', bossFight: 1 }))
    expect([deck.track, player('boss2').seeks, player('boss2').loop]).toEqual(['boss2', [0], true])
    deck.show(plan({ screen: 'GameTab', bossFight: 1, story: { uid: 9, mood: 'hope' } }))
    deck.show(plan({ screen: 'GameTab', bossFight: 1 }))
    expect(player('boss2').seeks).toEqual([0])
    deck.show(plan({ screen: 'GameTab', bossFight: 2 }))
    expect(player('boss2').seeks).toEqual([0, 0])
  })

  it('the Breach plays once and says so when it ends', () => {
    const { deck, player, done } = deckRig()
    deck.show(plan({ screen: 'GameTab' }))
    deck.show(plan({ screen: 'GameTab', breach: 1 }))
    expect([deck.track, player('breach').loop, player('breach').seeks]).toEqual(['breach', false, [0]])
    expect(done).toEqual([])
    deck.ended('breach')
    expect(done.map((p) => p.key)).toEqual(['breach:1'])
  })

  it('the same track under a new key plays on without a fade (two hope scenes in a row)', () => {
    const { deck, player } = deckRig()
    deck.show(plan({ story: { uid: 1, mood: 'hope' } }))
    deck.show(plan({ story: { uid: 2, mood: 'hope' } }))
    jest.advanceTimersByTime(CROSSFADE_MS)
    expect([deck.track, player('hope').paused, player('hope').volume, player('hope').seeks]).toEqual(['hope', 0, 0.5, [0, 0]])
  })
})

describe('what the game tells the music', () => {
  const at = (patch: Partial<GameState>) => gameMusic({ ...DEFAULT_GAME_STATE, ...patch }, undefined)

  it('the city brightens with the Keep (the rule the city art uses)', () => {
    expect(at({}).cityRebuilt).toBe(false)
    expect(at({ beatsSeen: ['the_keep'] }).cityRebuilt).toBe(true)
  })

  it('the deep Unmaking starts at its level', () => {
    expect(at({ hordeKills: (UNMAKING_DEEPEST_LEVEL - 1) * HORDE_LEVEL_KILLS - 1 }).deep).toBe(false)
    expect(at({ hordeKills: (UNMAKING_DEEPEST_LEVEL - 1) * HORDE_LEVEL_KILLS }).deep).toBe(true)
  })

  it('a boss at the gate is a fight, keyed by the kill it arrived on; a mini-boss is not', () => {
    const boss = MONSTERS.findIndex((m) => m.rank === 'boss')
    const miniboss = MONSTERS.findIndex((m) => m.rank === 'miniboss')
    expect(at({ monsterIndex: boss, monstersDefeated: 42 }).fight).toBe(42)
    expect(at({ monsterIndex: miniboss, monstersDefeated: 42 }).fight).toBeNull()
    expect(at({ monsterIndex: 0 }).fight).toBeNull()
  })

  it('a scene brings its mood; an untagged one keeps the screen music', () => {
    const tagged = STORY_BEATS[0]
    const saved = tagged.music
    tagged.music = 'dread'
    try {
      expect(gameMusic(DEFAULT_GAME_STATE, { uid: 3, id: tagged.id })).toMatchObject({ storyUid: 3, mood: 'dread' })
    } finally {
      tagged.music = saved
    }
    const untagged = STORY_BEATS.find((b) => !b.music)
    if (untagged) expect(gameMusic(DEFAULT_GAME_STATE, { uid: 3, id: untagged.id }).storyUid).toBeNull()
  })

  it('a Breach starts its track once; the next Breach starts it again', () => {
    resetMusicCuesForTests()
    expect(breachToStart(null)).toBeNull()
    expect(breachToStart(1)).toBe(1)
    expect(breachToStart(1)).toBeNull()
    expect(breachToStart(2)).toBe(2)
  })

  it('the store keeps what each side tells it', () => {
    setMusicScreen('ForageTab')
    setMusicScene({ deep: true })
    expect(getMusicScene()).toMatchObject({ screen: 'ForageTab', deep: true })
    setMusicScene({ ...NO_SCENE })
    expect(getMusicScene()).toEqual(NO_SCENE)
  })
})

describe('every track is credited (Settings > Credits and CREDITS.md, kept in step)', () => {
  const source = readFileSync(join(ROOT, 'src', 'data', 'music.ts'), 'utf8')
  const files = [...source.matchAll(/assets\/music\/out\/([^']+\.m4a)/g)].map((m) => m[1])
  const doc = readFileSync(join(ROOT, 'CREDITS.md'), 'utf8')

  it('one credit per track', () => {
    expect(files).toHaveLength(Object.keys(TRACKS).length)
    expect(MUSIC_TRACKS).toHaveLength(files.length)
    expect(CREDITS).toHaveLength(files.length)
  })

  it("CREDITS.md names each track's file and carries each in-game credit word for word", () => {
    for (const f of files) expect([f, doc.includes(`assets/music/out/${f}`)]).toEqual([f, true])
    for (const c of CREDITS) {
      expect([c.title, doc.includes(c.author)]).toEqual([c.title, true])
      expect([c.title, doc.includes(c.licenseUrl)]).toEqual([c.title, true])
      if (c.attribution) expect([c.title, doc.includes(c.attribution)]).toEqual([c.title, true])
    }
  })

  it('every credit links its license (Creative Commons, or Darren Curtis release) and says what was changed', () => {
    for (const c of CREDITS) {
      if (c.author === 'Darren Curtis') expect(c.license).toMatch(/Materials Release.*not Creative Commons/)
      else expect(c.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\/licenses\//)
      expect(c.changes).toBeTruthy()
    }
  })
})

describe('the crossfade between tracks', () => {
  const player = (): FadingPlayer & { played: number; paused: number } => {
    const p = { volume: -1, played: 0, paused: 0, play: () => { p.played += 1 }, pause: () => { p.paused += 1 } }
    return p
  }
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('the first track starts at full volume, with nothing to fade from', () => {
    const a = player()
    crossfade(a, null, () => 0.4)
    expect([a.volume, a.played]).toEqual([0.4, 1])
  })

  it('the new track rises as the old one falls, then the old one pauses', () => {
    const a = player()
    const b = player()
    crossfade(b, a, () => 0.4)
    expect([b.volume, b.played]).toEqual([0, 1])
    jest.advanceTimersByTime(CROSSFADE_MS / 2)
    expect(b.volume).toBeCloseTo(0.2)
    expect(a.volume).toBeCloseTo(0.2)
    expect(a.paused).toBe(0)
    jest.advanceTimersByTime(CROSSFADE_MS / 2)
    expect(b.volume).toBe(0.4)
    expect(a.paused).toBe(1)
  })

  it('follows the slider mid-fade, and a cancel ends the fade at once', () => {
    let v = 0.4
    const a = player()
    const b = player()
    const cancel = crossfade(b, a, () => v)
    jest.advanceTimersByTime(FADE_STEP_MS * 4)
    v = 0.8
    cancel()
    expect([b.volume, a.paused]).toEqual([0.8, 1])
    // Nothing moves after
    jest.advanceTimersByTime(CROSSFADE_MS)
    expect([b.volume, a.paused]).toEqual([0.8, 1])
  })
})
