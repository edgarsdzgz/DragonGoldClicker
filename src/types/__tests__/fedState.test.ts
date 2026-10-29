import { rationEffectText, FED_DAMAGE } from '../fedState'
import { rationDef } from '../rations'

describe('rationEffectText: the ration line agrees with the well-fed badge', () => {
  it('names both the ration and the well-fed strength (the badge read 110% under "hits at 100%")', () => {
    const text = rationEffectText(rationDef('full'))
    expect(text).toContain('hits at 100%')
    expect(text).toContain(`${Math.round(FED_DAMAGE.well_fed * 100)}% when well fed`)
  })

  it('no rations: fighters stand down', () => {
    expect(rationEffectText({ ...rationDef('full'), damage: 0 })).toMatch(/stand down/)
  })
})
