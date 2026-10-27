import { SPRITES, SEAL_BUILD_TIMING, SPLASH_TIMING } from '../manifest'
import { frameCell, sequenceMs, fitWhole, tapSplash } from '../sequence'
import { INTRO, SHORT_LAST_HOLD_MS } from '../intro'

describe('frame sheets', () => {
  it('a sheet reads left to right, ten frames to a row', () => {
    const t = SEAL_BUILD_TIMING
    expect(frameCell(t, 0)).toEqual({ x: 0, y: 0 })
    expect(frameCell(t, 9)).toEqual({ x: 9 * t.frame_width, y: 0 })
    expect(frameCell(t, 10)).toEqual({ x: 0, y: t.frame_height })
    // Out-of-range frames clamp to the ends
    expect(frameCell(t, t.frames + 5)).toEqual(frameCell(t, t.frames - 1))
    expect(frameCell(t, -3)).toEqual({ x: 0, y: 0 })
  })

  it('a strip with no columns is one row', () => {
    expect(frameCell(SPLASH_TIMING, 27)).toEqual({ x: 27 * 72, y: 0 })
  })

  it('every intro sheet holds all its frames, each with a hold time', () => {
    for (const s of INTRO) {
      const def = SPRITES[s.id]
      const t = s.timing
      const columns = t.columns ?? t.frames
      // The manifest knows the whole image; a strip registers one frame of it
      const sheetW = def.w * def.frames
      expect(sheetW).toBeGreaterThanOrEqual(columns * t.frame_width)
      expect(def.h).toBeGreaterThanOrEqual(Math.ceil(t.frames / columns) * t.frame_height)
      expect(t.ms).toHaveLength(t.frames)
      expect(s.shortFrom).toBeGreaterThan(0)
      expect(s.shortFrom).toBeLessThan(t.frames - 1)
    }
  })
})

describe('splash timing', () => {
  it('runs from a frame to the end of the last hold, which a short version caps', () => {
    expect(sequenceMs(SPLASH_TIMING)).toBe(5500)
    const full = sequenceMs(SEAL_BUILD_TIMING)
    const short = sequenceMs(SEAL_BUILD_TIMING, SEAL_BUILD_TIMING.beats.etched, SHORT_LAST_HOLD_MS)
    expect(short).toBeLessThan(full / 2)
  })

  it('the short intro on later launches stays under five seconds', () => {
    const total = INTRO.reduce((sum, s) => sum + sequenceMs(s.timing, s.shortFrom, SHORT_LAST_HOLD_MS), 0)
    expect(total).toBeLessThan(5000)
  })

  it('fits art in whole screen pixels per art pixel', () => {
    // A16: 411 points wide at 2.625; the 180-pixel seal at 90% gets 5 screen pixels each
    expect(fitWhole(411 * 0.9, 180, 2.625) * 2.625).toBe(5)
    expect(fitWhole(10, 180, 2)).toBe(0.5)
  })
})

describe('tap to skip', () => {
  it('the first tap skips to the end, the second leaves', () => {
    expect(tapSplash('playing')).toBe('skipped')
    expect(tapSplash('skipped')).toBe('done')
    expect(tapSplash('done')).toBe('done')
  })
})
