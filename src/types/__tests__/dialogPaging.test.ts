import { dialogPaging, dialogTap, LETTERS_PER_MOUTH, mouthOpen, OPEN_GUARD_MS, PRESS_GUARD_MS, READ_GUARD_MS } from '../dialogPaging'
import { SCENES } from '../../data/story/lines'

describe('dialogPaging', () => {
  it('a one-line scene is one page: Continue only, no Skip', () => {
    expect(dialogPaging(1, 0)).toEqual({ pageCount: 1, lastPage: true, canSkip: false })
  })

  it('a multi-page scene steps through its lines but has no Skip unless it is a cutscene', () => {
    expect(dialogPaging(3, 0)).toEqual({ pageCount: 3, lastPage: false, canSkip: false })
    expect(dialogPaging(3, 1).lastPage).toBe(false)
    expect(dialogPaging(3, 2)).toEqual({ pageCount: 3, lastPage: true, canSkip: false })
  })

  it('a multi-page cutscene offers Skip throughout; a one-page cutscene does not', () => {
    expect(dialogPaging(3, 0, true).canSkip).toBe(true)
    expect(dialogPaging(3, 2, true).canSkip).toBe(true)
    expect(dialogPaging(1, 0, true).canSkip).toBe(false)
  })

  it('treats an empty scene as one page', () => {
    expect(dialogPaging(0, 0)).toMatchObject({ pageCount: 1, canSkip: false })
  })

  it('no scene is a cutscene yet, so no scene shows Skip', () => {
    for (const scene of Object.values(SCENES)) {
      if (!scene) continue
      expect(dialogPaging(scene.lines.length, 0, scene.cutscene).canSkip).toBe(false)
    }
  })
})

describe('mouthOpen', () => {
  it('opens and shuts every few letters while the line types', () => {
    const line = 'Shields up, little ones!'.length
    const frames = Array.from({ length: 16 }, (_, n) => mouthOpen(n, line))
    expect(frames).toEqual([...Array(4).fill(false), ...Array(4).fill(true), ...Array(4).fill(false), ...Array(4).fill(true)])
    expect(LETTERS_PER_MOUTH).toBe(4)
  })

  it('rests shut once the line is whole, however long it is', () => {
    for (let length = 0; length < 12; length++) expect(mouthOpen(length, length)).toBe(false)
  })
})

describe('dialogTap: taps meant for the monster never skip a scene', () => {
  const opened = { openedAt: 1000, lastPressAt: 0, wholeAt: null }

  it('ignores taps just after the scene opens', () => {
    expect(dialogTap(1000 + OPEN_GUARD_MS - 1, opened)).toBe('ignore')
    expect(dialogTap(1000 + OPEN_GUARD_MS, opened)).toBe('finish')
  })

  it('a double tap counts once', () => {
    const t = { openedAt: 0, lastPressAt: 5000, wholeAt: null }
    expect(dialogTap(5000 + PRESS_GUARD_MS - 1, t)).toBe('ignore')
    expect(dialogTap(5000 + PRESS_GUARD_MS, t)).toBe('finish')
  })

  it('a whole line stays up a moment before a tap moves on', () => {
    const t = { openedAt: 0, lastPressAt: 0, wholeAt: 9000 }
    expect(dialogTap(9000 + READ_GUARD_MS - 1, t)).toBe('ignore')
    expect(dialogTap(9000 + READ_GUARD_MS, t)).toBe('next')
  })

  it('mashing 5 taps a second through a 2-line scene takes several seconds, not 4 taps', () => {
    // The playtest: taps on the kobold kept coming at 200 ms when "The Elder Approaches" opened.
    // Here each line is finished by a tap (it types for longer than the taps take).
    let now = 0
    const t = { openedAt: 0, lastPressAt: 0, wholeAt: null as number | null }
    let page = 0
    let taps = 0
    while (page < 2) {
      now += 200
      taps++
      const action = dialogTap(now, t)
      if (action === 'ignore') continue
      t.lastPressAt = now
      if (action === 'finish') t.wholeAt = now
      else { page++; t.wholeAt = null }
    }
    expect(taps).toBeGreaterThanOrEqual(10)
    expect(now).toBeGreaterThanOrEqual(2000)
  })

  it('a clock that stepped backward never locks the scene', () => {
    expect(dialogTap(100, { openedAt: 5000, lastPressAt: 5000, wholeAt: 5000 })).toBe('next')
  })
})
