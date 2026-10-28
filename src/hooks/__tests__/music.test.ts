import { readFileSync } from 'fs'
import { join } from 'path'
import { MUSIC_TRACKS, TRACKS, screenTrack } from '../../data/music'
import { CREDITS } from '../../data/credits'
import { setMusicScreen, getMusicScreen } from '../musicScreen'
import { crossfade, CROSSFADE_MS, FADE_STEP_MS } from '../crossfade'
import type { FadingPlayer } from '../crossfade'

const ROOT = join(__dirname, '..', '..', '..')

describe('the music for each screen', () => {
  it('the Warfront has the siege; the title and every other screen keep the theme', () => {
    // By name: under jest every audio file is the same stub, so the sources cannot be told apart
    expect(screenTrack('GameTab')).toBe('siege')
    expect(screenTrack(null)).toBe('theme')
    for (const tab of ['DraconiaTab', 'ForageTab', 'SettingsTab', 'Main']) expect([tab, screenTrack(tab)]).toEqual([tab, 'theme'])
    expect(Object.keys(TRACKS).sort()).toEqual(['siege', 'theme'])
  })

  it('the navigator tells the music which screen is on show', () => {
    setMusicScreen('ForageTab')
    expect(getMusicScreen()).toBe('ForageTab')
    setMusicScreen(null)
    expect(getMusicScreen()).toBeNull()
  })
})

describe('every track is credited (Settings > Credits and CREDITS.md, kept in step)', () => {
  const source = readFileSync(join(ROOT, 'src', 'data', 'music.ts'), 'utf8')
  const files = [...source.matchAll(/assets\/music\/out\/([^']+\.m4a)/g)].map((m) => m[1])
  const doc = readFileSync(join(ROOT, 'CREDITS.md'), 'utf8')

  it('one credit per track', () => {
    expect(files).toHaveLength(MUSIC_TRACKS.length)
    expect(CREDITS).toHaveLength(files.length)
  })

  it("CREDITS.md names each track's file and each in-game credit", () => {
    for (const f of files) expect([f, doc.includes(`assets/music/out/${f}`)]).toEqual([f, true])
    for (const c of CREDITS) {
      expect([c.title, doc.includes(c.author)]).toEqual([c.title, true])
      expect([c.title, doc.includes(c.licenseUrl)]).toEqual([c.title, true])
    }
  })

  it('every credit links its license and says what was changed', () => {
    for (const c of CREDITS) {
      expect(c.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\/licenses\//)
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
