import { overallFraction, runSteps, READY_LABEL } from '../steps'
import type { LoadProgress, LoadStep } from '../steps'

const step = (id: string, weight: number, run: LoadStep['run'] = async () => {}): LoadStep => ({ id, label: `Doing ${id}`, weight, run })

describe('the bar', () => {
  it('fills by weight: finished steps, plus the running step\'s share', () => {
    expect(overallFraction([1, 3], 0, 0)).toBe(0)
    expect(overallFraction([1, 3], 0, 1)).toBe(0.25)
    expect(overallFraction([1, 3], 1, 0)).toBe(0.25)
    expect(overallFraction([1, 3], 1, 0.5)).toBe(0.625)
    expect(overallFraction([1, 3], 2, 0)).toBe(1)
  })

  it('never runs backward or past full on a bad report', () => {
    expect(overallFraction([1, 1], 1, 2)).toBe(1)
    expect(overallFraction([1, 1], 1, -1)).toBe(0.5)
    expect(overallFraction([], 0, 0)).toBe(1)
    expect(overallFraction([0, 0], 0, 0.5)).toBe(0)
  })
})

describe('running the steps', () => {
  it('runs them in order, says which is running, and ends ready and full', async () => {
    const order: string[] = []
    const seen: LoadProgress[] = []
    const status = await runSteps(
      [
        step('save', 1, async () => { order.push('save') }),
        step('art', 1, async (report) => { order.push('art'); report(0.5, '1 of 2') }),
      ],
      (p) => seen.push(p),
    )
    expect(status).toBe('ready')
    expect(order).toEqual(['save', 'art'])
    expect(seen.map((p) => p.stepId)).toEqual(['save', 'art', 'art', null])
    expect(seen[2]).toEqual({ status: 'loading', stepId: 'art', label: 'Doing art', detail: '1 of 2', fraction: 0.75 })
    expect(seen[seen.length - 1]).toEqual({ status: 'ready', stepId: null, label: READY_LABEL, fraction: 1 })
  })

  it('stops at a failing step, names it, and never runs the rest', async () => {
    const seen: LoadProgress[] = []
    let laterRan = false
    const status = await runSteps(
      [step('ok', 1), step('save', 1, async () => { throw new Error('bad save') }), step('art', 1, async () => { laterRan = true })],
      (p) => seen.push(p),
    )
    expect(status).toBe('failed')
    expect(laterRan).toBe(false)
    const last = seen[seen.length - 1]
    expect(last.status).toBe('failed')
    expect(last.stepId).toBe('save')
    expect(last.fraction).toBeCloseTo(1 / 3)
  })
})
