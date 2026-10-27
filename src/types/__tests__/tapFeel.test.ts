import { MAX_FLOATING_NUMBERS } from '../../components/FloatingNumbers'

describe('tap feel limits', () => {
  it('keeps at most 8 floating numbers alive', () => {
    expect(MAX_FLOATING_NUMBERS).toBe(8)
  })
})
