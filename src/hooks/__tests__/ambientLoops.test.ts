const mockPlayers = new Map<unknown, { loop: boolean; volume: number; playing: boolean; play: jest.Mock; pause: jest.Mock }>()

jest.mock('../sfxPlayers', () => ({
  sharedSfxPlayer: (source: unknown) => {
    let p = mockPlayers.get(source)
    if (!p) {
      const made = { loop: false, volume: 1, playing: false, play: jest.fn(), pause: jest.fn() }
      made.play.mockImplementation(() => { made.playing = true })
      made.pause.mockImplementation(() => { made.playing = false })
      mockPlayers.set(source, made)
      p = made
    }
    return p
  },
}))

import { claimLoop } from '../ambientLoops'

describe('the ambient loops', () => {
  it('a claim plays the loop, looping, at its volume; letting go pauses it', () => {
    const wind = 'wind'
    const a = Symbol('a')
    claimLoop(wind, a, 0.3)
    const p = mockPlayers.get(wind)!
    expect(p).toMatchObject({ playing: true, loop: true, volume: 0.3 })
    claimLoop(wind, a, 0)
    expect(p.playing).toBe(false)
  })

  it('two screens share a loop: one letting go never silences the other', () => {
    const torches = 'torches'
    const warfront = Symbol('warfront')
    const city = Symbol('city')
    claimLoop(torches, warfront, 0.5)
    claimLoop(torches, city, 0.2)
    const p = mockPlayers.get(torches)!
    // The loudest claim sets the volume
    expect(p.volume).toBe(0.5)
    claimLoop(torches, warfront, 0)
    expect(p).toMatchObject({ playing: true, volume: 0.2 })
    claimLoop(torches, city, 0)
    expect(p.playing).toBe(false)
  })

  it('a playing loop is not restarted when its volume changes', () => {
    const drums = 'drums'
    const a = Symbol('a')
    claimLoop(drums, a, 0.4)
    claimLoop(drums, a, 0.2)
    const p = mockPlayers.get(drums)!
    expect(p.play).toHaveBeenCalledTimes(1)
    expect(p.volume).toBe(0.2)
  })
})
