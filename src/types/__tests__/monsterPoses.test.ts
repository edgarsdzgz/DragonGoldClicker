import { artForPose, restingPose, MONSTER_ART } from '../../data/monsterArt'

describe('monster poses', () => {
  it('rests in hurt at a third of max HP or less', () => {
    expect(restingPose(5, 5)).toBe('idle')
    expect(restingPose(2, 5)).toBe('idle')
    expect(restingPose(1, 5)).toBe('hurt')
    expect(restingPose(4, 12)).toBe('hurt')
    expect(restingPose(5, 12)).toBe('idle')
  })

  it('falls back to idle when a pose is missing', () => {
    const idle = { uri: 'idle' }
    expect(artForPose({ idle }, 'hit')).toBe(idle)
    expect(artForPose({ idle, hit: { uri: 'hit' } }, 'hit')).toEqual({ uri: 'hit' })
  })

  it('the kobold has all three frames', () => {
    expect(Object.keys(MONSTER_ART.kobold!).sort()).toEqual(['hit', 'hurt', 'idle'])
  })
})
