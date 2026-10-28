import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import {
  ASHARA_TAP_BONUS, HOLLOW_KNIGHT_AWAY_BONUS, SHIELD_WALL, TOWER_FIRE_BONUS, VARN_BREATH_TAPS, WIZARD_TOWER_COST,
  buildWizardTower, varnOnWall,
} from '../allies'
import { varnBreath, applyDamage, monsterAt } from '../monsters'
import { MONSTERS } from '../monsterRoster'
import { tapDamageNow } from '../claws'
import { armyVolleyDamage } from '../army'
import { wallStrikeDamage } from '../wall'
import { wallWhileAway } from '../timeAway'
import { applyTimeAway } from '../saveLoad'
import { claimExpedition } from '../outpost'
import { getBeat, STORY_BEATS } from '../story'
import { activeQuests } from '../quests'
import { isBuildingRevealed } from '../systems'
import { HORDE_LEVEL_KILLS, UNMAKING_DEEPEST_LEVEL } from '../horde'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const BOSS = MONSTERS.findIndex((m) => m.rank === 'boss')

describe('chapters 9 to 13: the order and the triggers', () => {
  it('follow Dragonsteel, one chapter each', () => {
    const at = STORY_BEATS.findIndex((b) => b.id === 'dragonsteel')
    expect(STORY_BEATS.slice(at + 1).map((b) => [b.id, b.chapter])).toEqual([
      ['small_wings', 9], ['she_did_not_ask', 10], ['the_exile', 11], ['the_eldest', 12], ['hollow_knight', 13],
    ])
  })

  it('Varn: a minute after the claws are reforged', () => {
    const b = getBeat('small_wings')!
    expect(b.trigger(make({}))).toBe(false)
    expect(b.trigger(make({ questsDone: ['reforge_the_claws'] }))).toBe(true)
    expect(b.dwellSec).toBe(60)
  })

  it('Sera: the wall below half after Varn, but not while it lies breached', () => {
    const b = getBeat('she_did_not_ask')!
    const varn = { beatsSeen: ['small_wings'] }
    expect(b.trigger(make({ cityHp: 40 }))).toBe(false)
    expect(b.trigger(make({ ...varn, cityHp: 50 }))).toBe(false)
    expect(b.trigger(make({ ...varn, cityHp: 49 }))).toBe(true)
    expect(b.trigger(make({ ...varn, cityHp: 0 }))).toBe(false)
  })

  it('Thornwick: the first expedition home after Sera, and he reveals the tower', () => {
    const b = getBeat('the_exile')!
    const sera = { beatsSeen: ['small_wings', 'she_did_not_ask'], lastBeatAtPlaySec: 500 }
    expect(b.trigger(make({ ...sera, lastExpeditionHomeAt: 400 }))).toBe(false)
    expect(b.trigger(make({ ...sera, lastExpeditionHomeAt: 501 }))).toBe(true)
    expect(b.trigger(make({ lastExpeditionHomeAt: 501, lastBeatAtPlaySec: 500 }))).toBe(false)
    expect(isBuildingRevealed(make({ beatsSeen: ['the_exile'] }), 'wizard')).toBe(true)
    expect(activeQuests(make({ beatsSeen: ['the_exile'] })).map((q) => q.id)).toContain('raise_the_tower')
  })

  it('an expedition coming home marks the play second', () => {
    const s = make({ playSeconds: 777, postLevel: 1, activeExpeditions: [{ id: 1, startedAt: 0, duration: 1 }] as GameState['activeExpeditions'] })
    expect(claimExpedition(s, 1, 5000, 0).lastExpeditionHomeAt).toBe(777)
  })

  it('Ashara: the first time the Unmaking marks the horde deepest, after Thornwick', () => {
    const b = getBeat('the_eldest')!
    const deep = (UNMAKING_DEEPEST_LEVEL - 1) * HORDE_LEVEL_KILLS
    expect(b.trigger(make({ beatsSeen: ['the_exile'], hordeKills: deep - 1 }))).toBe(false)
    expect(b.trigger(make({ beatsSeen: ['the_exile'], hordeKills: deep }))).toBe(true)
    expect(b.trigger(make({ hordeKills: deep }))).toBe(false)
  })

  it('the Hollow Knight: the first boss to fall after Ashara', () => {
    const b = getBeat('hollow_knight')!
    const ashara = { beatsSeen: ['the_eldest'], lastBeatAtPlaySec: 900 }
    expect(b.trigger(make({ ...ashara, lastBossFellAt: 800 }))).toBe(false)
    expect(b.trigger(make({ ...ashara, lastBossFellAt: 901 }))).toBe(true)
  })

  it('a boss falling marks the play second; a common monster does not', () => {
    const boss = make({ playSeconds: 1234, monsterIndex: BOSS, monsterHp: 1 })
    expect(applyDamage(boss, 5, 0).state.lastBossFellAt).toBe(1234)
    const kobold = make({ playSeconds: 1234, monsterIndex: 0, monsterHp: 1 })
    expect(applyDamage(kobold, 5, 0).state.lastBossFellAt).toBe(0)
  })
})

describe("what the new cast brings", () => {
  it('Varn breathes for three taps, counted as his, and only from his chapter', () => {
    expect(varnOnWall(make({}))).toBe(false)
    expect(varnOnWall(make({ beatsSeen: ['small_wings'] }))).toBe(true)
    const s = make({ tapDamage: 2, monsterIndex: 0, monsterHp: 100 })
    const r = varnBreath(s, 0)
    expect(r.dealt).toBe(2 * VARN_BREATH_TAPS)
    expect(r.state.varnBreaths).toBe(1)
    expect(r.state.totalClicks).toBe(0)
    const kill = varnBreath(make({ tapDamage: 2, monsterIndex: 0, monsterHp: 1 }), 0)
    expect(kill.killed).toBe(true)
    expect(kill.state.allyKills).toBe(1)
  })

  it("Sera's shield wall: blows on the wall land at three quarters, while away too", () => {
    const at = { monsterIndex: 0, cityHp: 100 }
    const plain = make(at)
    const shielded = make({ ...at, beatsSeen: ['she_did_not_ask'] })
    expect(wallStrikeDamage(shielded)).toBeCloseTo(wallStrikeDamage(plain) * SHIELD_WALL)
    const away = { beatsSeen: ['the_breach'], monsterIndex: BOSS, monsterHp: monsterAt(BOSS, 0).hp, cityHp: 100 }
    const lostPlain = 100 - wallWhileAway(make(away), 5)!.hpAfter
    const lostShielded = 100 - wallWhileAway(make({ ...away, beatsSeen: ['the_breach', 'she_did_not_ask'] }), 5)!.hpAfter
    expect(lostPlain).toBeGreaterThan(0)
    expect(lostShielded).toBeCloseTo(lostPlain * SHIELD_WALL)
  })

  it("Thornwick's tower: it costs its price once, then the volley burns hotter", () => {
    expect(buildWizardTower(make({ inspiration: WIZARD_TOWER_COST - 1 })).wizardTowerBuilt).toBe(false)
    const built = buildWizardTower(make({ inspiration: WIZARD_TOWER_COST + 5 }))
    expect(built).toMatchObject({ wizardTowerBuilt: true, inspiration: 5, totalInspirationSpent: WIZARD_TOWER_COST })
    expect(buildWizardTower(built)).toBe(built)
    const army = { fighters: 10, soldiers: { conscripts: 0, footmen: 0, knights: 0 }, armoryGear: { swords: 0, shields: 0 }, completedResearch: [] }
    const plain = armyVolleyDamage({ ...army, wizardTowerBuilt: false })
    expect(armyVolleyDamage({ ...army, wizardTowerBuilt: true })).toBeCloseTo(plain * (1 + TOWER_FIRE_BONUS))
  })

  it("Ashara's strength: every tap from her chapter on", () => {
    expect(tapDamageNow(make({ tapDamage: 20 }))).toBe(20)
    expect(tapDamageNow(make({ tapDamage: 20, beatsSeen: ['the_eldest'] }))).toBe(20 * (1 + ASHARA_TAP_BONUS))
  })

  it('the Hollow Knight: renown earned while away counts for half again as much', () => {
    const saved = make({ beatsSeen: ['call_to_arms', 'the_keep'], fighters: 5, lastSavedAt: 0 })
    const plain = applyTimeAway(saved, 2 * 3600 * 1000).offlineEarnings!.inspiration
    const held = applyTimeAway({ ...saved, beatsSeen: [...saved.beatsSeen, 'hollow_knight'] }, 2 * 3600 * 1000).offlineEarnings!.inspiration
    expect(held).toBeCloseTo(plain * (1 + HOLLOW_KNIGHT_AWAY_BONUS), 1)
  })
})
