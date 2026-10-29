import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { SPRITES } from '../manifest'
import type { SpriteId } from '../manifest'
import { mobSprites, mobDeathSprite, gateSprite, slashSprite } from '../warfront'
import type { MobTier } from '../warfront'
import { plotSprite, plotMarker, litSprite, interiorHeader } from '../city'
import type { CityBuildingId, PlotLook } from '../city'
import { portraitSprite, talkSprite, sigilSprite } from '../cast'
import { ICON_ART, buildingIcon, studyIcon, clawIcon, isSpriteId } from '../icons'
import { granarySprite } from '../granary'
import { expeditionPicture, wandererPicture, foodEventBadge, roleFigure } from '../events'
import type { FigureRole } from '../events'
import { MONSTERS } from '../../types/monsterRoster'
import { MOODS } from '../../types/cast'
import type { CastId } from '../../types/cast'
import { RESEARCH_NODES } from '../../types/research'
import { GRANARY_CAP } from '../../types/food'
import { WANDERER_TABLE } from '../../types/wanderers'

const SRC = join(__dirname, '..', '..')

/** Every source file the game ships (no tests, not the manifest itself) */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === '__tests__' ? [] : sources(p)
    return /\.tsx?$/.test(f) && f !== 'manifest.ts' ? [p] : []
  })
}

/** Every sprite the game can draw: the ids its code names, and every id its art rules build */
function reachable(): Set<string> {
  const out = new Set<string>()
  const add = (id: string | null | undefined) => { if (id && isSpriteId(id)) out.add(id) }
  const text = sources(SRC).map((p) => readFileSync(p, 'utf8')).join('\n')
  for (const id of Object.keys(SPRITES)) if (new RegExp(`['"\`]${id.replace(/-/g, '\\-')}['"\`]`).test(text)) out.add(id)

  const tiers: MobTier[] = ['weak', 'strong', 'stronger']
  for (const m of MONSTERS) for (const t of tiers) {
    const s = mobSprites(m.id, t)
    if (s) Object.values(s).forEach(add)
    add(mobDeathSprite(m.id, t))
  }
  for (const g of ['sound', 'cracking', 'failing', 'breached'] as const) add(gateSprite(g))
  for (const c of ['plain', 'gold', 'ember'] as const) add(slashSprite(c))

  const city: CityBuildingId[] = ['keep', 'garrison', 'forge', 'lodge', 'outpost', 'librarium', 'housing', 'wizard', 'tower_east', 'tower_west']
  const looks: PlotLook[] = [{ visible: false, built: false, level: 0 }, { visible: true, built: false, level: 0, canAfford: true }]
  for (let level = 1; level <= 10; level++) for (const maxed of [false, true]) for (const lit of [false, true]) {
    looks.push({ visible: true, built: true, level, maxed, lit, hasAction: true })
  }
  for (const id of city) {
    add(interiorHeader(id))
    add(buildingIcon(id, 'icon_unknown') as string)
    for (const l of looks) for (const light of ['day', 'dusk', 'night'] as const) {
      add(litSprite(plotSprite(id, l), light))
      const m = plotMarker(l)
      if (m) add(litSprite(m, light))
    }
  }
  for (const light of ['day', 'dusk', 'night'] as const) add(litSprite('map_city_base', light))

  const cast: CastId[] = ['pyreth', 'rodain', 'mirael', 'kael', 'lirae', 'varn', 'ashara', 'thornwick', 'sera', 'hollow-knight', 'gate']
  for (const who of cast) {
    add(sigilSprite(who))
    for (const mood of [undefined, ...MOODS]) { add(portraitSprite(who, mood)); add(talkSprite(who, mood)) }
  }

  Object.values(ICON_ART).forEach(add)
  for (const r of RESEARCH_NODES) add(studyIcon(r.id, 'icon_unknown') as string)
  for (let lv = 0; lv <= 12; lv++) add(clawIcon(lv) as string)
  for (let f = 0; f <= GRANARY_CAP; f += GRANARY_CAP / 100) add(granarySprite(f, GRANARY_CAP))
  for (let n = 0; n <= 5; n++) add(expeditionPicture(n))
  for (const w of WANDERER_TABLE) add(wandererPicture(w.type))
  for (const e of ['lean_season', 'bountiful_harvest', 'raid', 'refugees'] as const) add(foodEventBadge(e))
  const roles: FigureRole[] = ['conscript', 'footman', 'knight', 'gatherer', 'trapper', 'ranger', 'explorer']
  roles.forEach((r) => add(roleFigure(r)))
  return out
}

/**
 * Locked art the game does not draw, each with why. A sprite that is neither drawn nor here fails the
 * test: wire it, or add it here with its reason. Light copies (_dusk, _night) follow their piece.
 */
const NOT_DRAWN: readonly [RegExp, string][] = [
  [/^mob_.+_idle$/, "a monster's walk strip is its idle (art/warfront.ts); the stills are spare"],
  [/^mob_kamaitachi(-strong|-stronger)?_/, 'the new monsters (monster-batches.md) join the waves Land by Land; none sends them yet'],
  [/^map_(foundation|scaffold)_\d+x\d+(_dusk|_night)?$/, 'building is instant: there is no construction step to show'],
  [/^map_plot-empty_(20x32|24x40|50x82)(_dusk|_night)?$/, 'every plot of these sizes has a ruin, shown until built'],
  [/^bld_forge_lit(_dusk|_night)?$/, 'the lit Forge is its animated strip'],
  [/^bld_housing_(house|row)(_dusk|_night)?$/, 'Housing is not in the game yet'],
  [/^ppl_(human|elf|horned|dwarf|halfling|orc|birdfolk|fishfolk|catfolk)$/, 'the townsfolk have nowhere to stand yet'],
  [/^ppl_repairer_anim$/, 'the repairers show as sparkles on the wall'],
  [/^ppl_(varn_flying|sera|thornwick|hollow-knight|hollow-knight_walk|ashara_flying)$/, "chapters 9 to 13's figures: no place chosen yet"],
  [/^fx_ember_anim$/, 'its job, the death embers, went to the death strips'],
  [/^(logo_(icon|wordmark|lockup|anim_frames_anim)|splash_lockup|seal_card)$/, 'logo and studio stills; the splashes play the sheets'],
  [/^app_(icon_1024|adaptive_1024|favicon_64)$/, "the app's icons: app.json uses copies at assets/ (the same files)"],
  [/^icon_gate$/, 'no screen names the gate as an icon yet'],
  [/^icon_heartstone(_16)?(_flicker_anim)?$/, 'there is no heartstone in the game yet'],
]

describe('every sprite the art session locked', () => {
  const live = reachable()
  const unused = (Object.keys(SPRITES) as SpriteId[]).filter((id) => !live.has(id))

  it('is drawn by the game, or not drawn for a reason', () => {
    const unexplained = unused.filter((id) => !NOT_DRAWN.some(([re]) => re.test(id)))
    expect(unexplained).toEqual([])
  })

  it('has no reason left over for art the game now draws', () => {
    const drawnAnyway = [...live].filter((id) => NOT_DRAWN.some(([re]) => re.test(id)))
    expect(drawnAnyway).toEqual([])
    for (const [re] of NOT_DRAWN) expect([re.source, unused.some((id) => re.test(id))]).toEqual([re.source, true])
  })
})
