import { dialogPaging } from '../dialogPaging'
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
