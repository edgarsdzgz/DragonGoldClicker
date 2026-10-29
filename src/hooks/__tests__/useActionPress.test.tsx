import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import { useActionPress } from '../useActionPress'
import type { PressKind } from '../useActionPress'

jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }))

type Handlers = ReturnType<typeof useActionPress>['handlers']

function mount(action: (kind: PressKind) => void, repeatOnHold: boolean): Handlers {
  const out: { handlers?: Handlers } = {}
  function Probe() {
    out.handlers = useActionPress(action, { repeatOnHold }).handlers
    return null
  }
  act(() => { TestRenderer.create(<Probe />) })
  return out.handlers as Handlers
}

describe('useActionPress: a backlog of touches after a stall', () => {
  let now = 10_000
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(Date, 'now').mockImplementation(() => now)
  })
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it.each([false, true])('100 touches handed over at once act once (repeatOnHold %s)', (repeatOnHold) => {
    const action = jest.fn()
    const handlers = mount(action, repeatOnHold)
    act(() => {
      for (let n = 0; n < 100; n++) {
        handlers.onPressIn()
        handlers.onPressOut()
      }
    })
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('taps at a fast human pace all act', () => {
    const action = jest.fn()
    const handlers = mount(action, true)
    act(() => {
      for (let n = 0; n < 20; n++) {
        now += 80
        handlers.onPressIn()
        handlers.onPressOut()
      }
    })
    expect(action).toHaveBeenCalledTimes(20)
  })
})
