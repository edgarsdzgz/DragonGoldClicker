import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { SPRITES } from '../manifest'
import type { SpriteId } from '../manifest'
import {
  WELCOME_BACK_PICTURE, BREACH_REPORT_PICTURE, REFUGEES_PICTURE, FORAGE_ORB_ART, STARVING_ICON,
  expeditionPicture, wandererPicture, foodEventBadge, roleFigure,
} from '../events'
import { granarySprite } from '../granary'
import { WANDERER_TABLE } from '../../types/wanderers'
import { SOLDIER_TIERS, FORAGER_TIERS } from '../../types/game'
import type { FoodEventId } from '../../types/foodEvents'

const size = (id: SpriteId) => [SPRITES[id].w, SPRITES[id].h]

describe("the events' pictures (Batch 7)", () => {
  it('Welcome Back, the Breach report and the refugees each have their banner', () => {
    expect(WELCOME_BACK_PICTURE).toBe('evt_welcome-back')
    expect(BREACH_REPORT_PICTURE).toBe('evt_breach-report')
    expect(REFUGEES_PICTURE).toBe('evt_refugees')
    for (const id of [WELCOME_BACK_PICTURE, BREACH_REPORT_PICTURE, REFUGEES_PICTURE]) expect([id, size(id)]).toEqual([id, [110, 34]])
  })

  it("an expedition's picture follows its title: none found, one, two, three or more", () => {
    expect(expeditionPicture(0)).toBe('evt_exp-silent')
    expect(expeditionPicture(1)).toBe('evt_exp-light')
    expect(expeditionPicture(2)).toBe('evt_exp-survivors')
    expect(expeditionPicture(3)).toBe('evt_exp-find')
    expect(expeditionPicture(7)).toBe('evt_exp-find')
    for (const n of [0, 1, 2, 3]) expect(size(expeditionPicture(n))).toEqual([110, 34])
  })

  it('every kind of wanderer has its group on the road', () => {
    expect(wandererPicture('lone_wanderer')).toBe('evt_wanderer-lone')
    expect(wandererPicture('traveling_couple')).toBe('evt_wanderer-couple')
    expect(wandererPicture('small_family')).toBe('evt_wanderer-family')
    expect(wandererPicture('veteran')).toBe('evt_wanderer-veteran')
    expect(new Set(WANDERER_TABLE.map((w) => wandererPicture(w.type))).size).toBe(WANDERER_TABLE.length)
  })

  it('every food event has its badge; the orb and the starvation warning have theirs', () => {
    const ids: FoodEventId[] = ['lean_season', 'bountiful_harvest', 'raid', 'refugees']
    expect(ids.map(foodEventBadge)).toEqual(['evt_food-lean', 'evt_food-bountiful', 'evt_food-raid', 'evt_food-refugees'])
    for (const id of ids) expect(size(foodEventBadge(id))).toEqual([24, 24])
    expect(size(FORAGE_ORB_ART)).toEqual([20, 20])
    expect(size(STARVING_ICON)).toEqual([12, 12])
  })
})

describe('the roles as figures (Batch 6)', () => {
  it('every soldier rank, forager tier and the explorer has a figure', () => {
    const roles = [...SOLDIER_TIERS.map((t) => t.id), ...FORAGER_TIERS.map((t) => t.id), 'explorer' as const]
    expect(roles).toHaveLength(7)
    for (const r of roles) expect([r, Object.keys(SPRITES).includes(roleFigure(r))]).toEqual([r, true])
    expect(roleFigure('knight')).toBe('ppl_knight')
  })
})

describe('the screens use them', () => {
  // A rule nobody calls draws nothing: each is named outside src/art (by a card, a row or a badge)
  const src = join(__dirname, '..', '..')
  const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === '__tests__' || f === 'art' ? [] : files(p)
    return /\.tsx?$/.test(f) ? [p] : []
  })
  const text = files(src).map((p) => readFileSync(p, 'utf8')).join('\n')

  it.each([
    'WELCOME_BACK_PICTURE', 'BREACH_REPORT_PICTURE', 'REFUGEES_PICTURE', 'FORAGE_ORB_ART', 'STARVING_ICON',
    'expeditionPicture(', 'wandererPicture(', 'foodEventBadge(', 'roleFigure(', 'granarySprite(',
  ])('%s', (name) => {
    expect(text.includes(name)).toBe(true)
  })
})

describe('the granary', () => {
  it('empty only when the food is out, then full to the next quarter', () => {
    expect(granarySprite(0, 400)).toBe('evt_granary_0')
    expect(granarySprite(-5, 400)).toBe('evt_granary_0')
    expect(granarySprite(1, 400)).toBe('evt_granary_25')
    expect(granarySprite(100, 400)).toBe('evt_granary_25')
    expect(granarySprite(101, 400)).toBe('evt_granary_50')
    expect(granarySprite(200, 400)).toBe('evt_granary_50')
    expect(granarySprite(201, 400)).toBe('evt_granary_75')
    expect(granarySprite(300, 400)).toBe('evt_granary_75')
    expect(granarySprite(301, 400)).toBe('evt_granary_100')
    expect(granarySprite(400, 400)).toBe('evt_granary_100')
  })
})
