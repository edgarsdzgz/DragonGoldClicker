import { MAX_FLOATING_NUMBERS } from '../../components/FloatingNumbers'
import { SPAWN_DELAY_MS } from '../monsters'

describe('tap feel limits', () => {
  it('keeps at most 8 floating numbers alive', () => {
    expect(MAX_FLOATING_NUMBERS).toBe(8)
  })

  it('brings the next monster in after about 250ms', () => {
    expect(SPAWN_DELAY_MS).toBe(250)
  })
})
