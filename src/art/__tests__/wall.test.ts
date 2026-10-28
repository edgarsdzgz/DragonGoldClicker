import { SPRITES, MAP_GATE } from '../manifest'
import { wallFighters, fighterSprite, impactPoint, BREACH_CENTER, REPAIR_SPOTS, repairing, wallChange, MAX_WALL_FIGHTERS } from '../wall'

const gate = MAP_GATE.gate

describe('fighters on the wall', () => {
  it('one per member of the army, up to four', () => {
    expect(wallFighters(0)).toEqual([])
    expect(wallFighters(1)).toHaveLength(1)
    expect(wallFighters(3)).toHaveLength(3)
    expect(wallFighters(40)).toHaveLength(MAX_WALL_FIGHTERS)
    expect(MAX_WALL_FIGHTERS).toBe(4)
    expect(wallFighters(-2)).toEqual([])
  })

  it('the first two stand either side of the gatehouse, so a small army looks balanced', () => {
    const [a, b] = wallFighters(2)
    expect(a.x).toBeLessThan(gate.width / 2)
    expect(b.x).toBeGreaterThan(gate.width / 2)
  })

  it('they stand on the wall walk, and a jab never reaches past the map', () => {
    const h = SPRITES.ppl_fighter_idle.h
    for (const f of wallFighters(MAX_WALL_FIGHTERS)) {
      expect(f.y + h).toBe(gate.y + 12)
      expect(f.x).toBeGreaterThanOrEqual(0)
      expect(f.x + SPRITES.ppl_fighter_attack_anim.w).toBeLessThanOrEqual(gate.width)
    }
  })

  it('stand, or jab while a volley lands', () => {
    expect(fighterSprite(false)).toBe('ppl_fighter_idle')
    expect(fighterSprite(true)).toBe('ppl_fighter_attack_anim')
  })
})

describe('the wall struck, repaired and fallen', () => {
  it('blows land across the gatehouse, inside the gate box', () => {
    expect(impactPoint(0)).toEqual({ x: gate.x + 45, y: gate.y + 22 })
    expect(impactPoint(1).x).toBe(gate.x + 85)
    expect(BREACH_CENTER).toEqual({ x: gate.width / 2, y: gate.y + gate.height / 2 })
    expect(SPRITES['fx_breach_anim'].w).toBe(gate.width)
    for (const s of REPAIR_SPOTS) expect(s.y).toBeGreaterThan(gate.y)
  })

  it('repairers work only on a standing wall that is not whole, during the siege', () => {
    expect(repairing(true, 2, 50, 100)).toBe(true)
    expect(repairing(false, 2, 50, 100)).toBe(false)
    expect(repairing(true, 0, 50, 100)).toBe(false)
    expect(repairing(true, 2, 100, 100)).toBe(false)
    expect(repairing(true, 2, 0, 100)).toBe(false)
  })

  it('reads a blow, a breach, or nothing', () => {
    const at = { hp: 80, breaches: 0, startedAt: 1 }
    expect(wallChange(at, { ...at, hp: 75 })).toBe('struck')
    expect(wallChange(at, { ...at, hp: 85 })).toBeNull()
    expect(wallChange(at, at)).toBeNull()
    // A breach patches the wall, so the HP can rise; the fall is what shows
    expect(wallChange(at, { hp: 90, breaches: 1, startedAt: 1 })).toBe('breach')
    // A new game or a loaded save is not a blow
    expect(wallChange(at, { hp: 10, breaches: 3, startedAt: 2 })).toBeNull()
  })
})
