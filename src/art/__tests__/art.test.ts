import * as fs from 'fs'
import * as path from 'path'
import { SPRITES, MAP_PLOTS, MAP_GATE } from '../manifest'
import type { SpriteId } from '../manifest'
import { snapScale, spriteBox, stripFrame } from '../pixel'

const ROOT = path.resolve(__dirname, '../../..')

/** Width and height from a PNG's header */
function pngSize(file: string): [number, number] {
  const b = fs.readFileSync(file)
  return [b.readUInt32BE(16), b.readUInt32BE(20)]
}

describe('pixel scale', () => {
  it('one art pixel covers a whole number of screen pixels', () => {
    // The A16: 2.625 screen pixels per point, so x4 is 10.5 -> 11 screen pixels
    expect(snapScale(4, 2.625) * 2.625).toBe(11)
    expect(snapScale(3, 2.625) * 2.625).toBe(8)
    expect(snapScale(3, 2)).toBe(3)
    // Never below one screen pixel
    expect(snapScale(0.1, 3) * 3).toBe(1)
  })

  it('a sprite fills its frame size times the snapped scale', () => {
    expect(spriteBox('icon_hammer', 4, 2)).toEqual({ width: 48, height: 48 })
    // A strip's box is one frame, not the whole strip
    expect(spriteBox('mob_kobold_walk_anim', 2, 1)).toEqual({ width: 26, height: 32 })
  })

  it('strips loop, or stop on their last frame', () => {
    expect([0, 1, 2, 3, 4].map((t) => stripFrame(t, 3, true))).toEqual([0, 1, 2, 0, 1])
    expect([0, 1, 2, 3, 4].map((t) => stripFrame(t, 3, false))).toEqual([0, 1, 2, 2, 2])
    expect(stripFrame(7, 1, true)).toBe(0)
  })
})

describe('the manifest', () => {
  const text = fs.readFileSync(path.join(ROOT, 'src/art/manifest.ts'), 'utf8')
  const entries = [...text.matchAll(/"([^"]+)": \{ source: require\('\.\.\/\.\.\/(assets\/art\/[^']+)'\)/g)]

  it('lists every sprite, each with its file in assets/art', () => {
    expect(entries.length).toBe(Object.keys(SPRITES).length)
    expect(entries.length).toBeGreaterThan(100)
    for (const [, , file] of entries) expect(fs.existsSync(path.join(ROOT, file))).toBe(true)
  })

  it("each file is its frame size times its frame count", () => {
    for (const [, id, file] of entries) {
      const def = SPRITES[id as SpriteId]
      expect([id, ...pngSize(path.join(ROOT, file))]).toEqual([id, def.w * def.frames, def.h])
      expect(def.frames === 1 ? def.fps === 0 : def.fps > 0).toBe(true)
    }
  })

  it('has the city plots and the gate layout', () => {
    expect(MAP_PLOTS.plots.length).toBe(10)
    expect(MAP_GATE.gate.states).toEqual(['sound', 'cracking', 'failing', 'breached'])
  })
})
