import { dialogPaging } from '../dialogPaging'
import { SCENES } from '../../data/story/lines'

describe('dialogPaging', () => {
  it('a one-line scene is one page: Continue only, no Skip', () => {
    expect(dialogPaging(1, 0)).toEqual({ pageCount: 1, lastPage: true, canSkip: false })
  })

  it('a multi-page scene steps through its lines and offers Skip throughout', () => {
    expect(dialogPaging(3, 0)).toEqual({ pageCount: 3, lastPage: false, canSkip: true })
    expect(dialogPaging(3, 1).lastPage).toBe(false)
    expect(dialogPaging(3, 2)).toEqual({ pageCount: 3, lastPage: true, canSkip: true })
  })

  it('treats an empty scene as one page', () => {
    expect(dialogPaging(0, 0)).toMatchObject({ pageCount: 1, canSkip: false })
  })

  it('the Renown scene is a two-page scene; the single-line scenes have no Skip', () => {
    expect(dialogPaging(SCENES.first_renown!.lines.length, 0).canSkip).toBe(true)
    expect(dialogPaging(SCENES.the_keep!.lines.length, 0).canSkip).toBe(false)
  })
})
