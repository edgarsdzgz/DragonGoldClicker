// =============================================================================
// THE ROSTER: every monster that can come to the gate (data only)
// =============================================================================

/**
 * Above the rank and file: an elite stands in for its kind now and then; a mini-boss or a boss closes
 * its horde level (types/spawnPool.ts)
 */
export type MonsterRank = 'elite' | 'miniboss' | 'boss'

export interface MonsterDef {
  id: string
  name: string
  /** For "The orcs wore the wall down" (the Welcome Back card) */
  plural: string
  hp: number
  /** Inspiration paid when it dies */
  bounty: number
  /** The horde's advance (`hordeKills`) at which this monster debuts in the spawn pool (types/spawnPool.ts) */
  fromKills: number
  /** Wall damage each time it strikes, every WALL_STRIKE_SEC it stands at the gate (types/wall.ts) */
  wallStrike: number
  /**
   * Ranked monsters are never rolled from the pool. An elite stands in for one of `standsInFor`
   * from `fromKills`; a mini-boss or a boss is the monster at exactly `fromKills`, its level's last
   */
  rank?: MonsterRank
  standsInFor?: string[]
}

/**
 * In order of debut. Provisional numbers; balance comes with the simulator. The bestiary plan
 * (approved 2026-10-27: _dev/planning/bestiary-in-the-horde.md): each horde level (25 kills) up to
 * 13 brings a new monster three kills in, and some levels a second of the same kind later on (the
 * owner: "with their kind"). The bounty is 0.05 inspiration per HP and the wall strike about HP / 5,
 * for every monster. Wall strikes are core-tap layer 6.
 */
const REGULARS: MonsterDef[] = [
  // The early horde
  { id: 'kobold', name: 'Kobold', plural: 'kobolds', hp: 5, bounty: 0.25, fromKills: 0, wallStrike: 1 },
  { id: 'goblin', name: 'Goblin', plural: 'goblins', hp: 8, bounty: 0.4, fromKills: 13, wallStrike: 1.5 },
  { id: 'giant_rat', name: 'Giant Rat', plural: 'giant rats', hp: 4, bounty: 0.2, fromKills: 20, wallStrike: 0.8 },
  { id: 'shadow_crawler', name: 'Shadow Crawler', plural: 'shadow crawlers', hp: 12, bounty: 0.6, fromKills: 28, wallStrike: 2 },
  { id: 'goblin_scout', name: 'Goblin Scout', plural: 'goblin scouts', hp: 7, bounty: 0.35, fromKills: 38, wallStrike: 1.5 },
  { id: 'war_hound', name: 'War Hound', plural: 'war hounds', hp: 9, bounty: 0.45, fromKills: 45, wallStrike: 1.5 },
  { id: 'orc', name: 'Orc', plural: 'orcs', hp: 20, bounty: 1.0, fromKills: 53, wallStrike: 4 },
  { id: 'goblin_archer', name: 'Goblin Archer', plural: 'goblin archers', hp: 10, bounty: 0.5, fromKills: 63, wallStrike: 2 },
  { id: 'banner_runner', name: 'Banner-Runner', plural: 'banner-runners', hp: 14, bounty: 0.7, fromKills: 78, wallStrike: 3 },
  // A flier: drawn above the road over its shadow (art/warfront.ts FLIER_LIFT)
  { id: 'giant_bat', name: 'Giant Bat', plural: 'giant bats', hp: 12, bounty: 0.6, fromKills: 90, wallStrike: 2 },
  // The middle horde: armored, from level 5 (the dark cracks)
  { id: 'shield_bearer', name: 'Shield Bearer', plural: 'shield bearers', hp: 26, bounty: 1.3, fromKills: 103, wallStrike: 4 },
  { id: 'goblin_wolf_rider', name: 'Goblin Wolf Rider', plural: 'goblin wolf riders', hp: 20, bounty: 1.0, fromKills: 115, wallStrike: 4 },
  { id: 'beetle_guard', name: 'Beetle Guard', plural: 'beetle guards', hp: 22, bounty: 1.1, fromKills: 128, wallStrike: 4 },
  { id: 'harpy', name: 'Harpy', plural: 'harpies', hp: 24, bounty: 1.2, fromKills: 140, wallStrike: 4 },
  { id: 'chitin_warrior', name: 'Chitin Warrior', plural: 'chitin warriors', hp: 28, bounty: 1.4, fromKills: 153, wallStrike: 5 },
  { id: 'nomad_scout', name: 'Nomad Scout', plural: 'nomad scouts', hp: 22, bounty: 1.1, fromKills: 165, wallStrike: 4 },
  { id: 'nomad_warrior', name: 'Nomad Warrior', plural: 'nomad warriors', hp: 30, bounty: 1.5, fromKills: 178, wallStrike: 6 },
  { id: 'nomad_archer', name: 'Nomad Archer', plural: 'nomad archers', hp: 26, bounty: 1.3, fromKills: 190, wallStrike: 5 },
  { id: 'storm_rider', name: 'Storm Rider', plural: 'storm riders', hp: 30, bounty: 1.5, fromKills: 198, wallStrike: 6 },
  // The Unmaking's own: what it makes of the living, from level 9
  { id: 'wraith', name: 'Wraith', plural: 'wraiths', hp: 24, bounty: 1.2, fromKills: 203, wallStrike: 5 },
  { id: 'skeleton', name: 'Skeleton', plural: 'skeletons', hp: 28, bounty: 1.4, fromKills: 215, wallStrike: 5 },
  { id: 'shadow_phantom', name: 'Shadow Phantom', plural: 'shadow phantoms', hp: 34, bounty: 1.7, fromKills: 228, wallStrike: 7 },
  { id: 'spectral_hound', name: 'Spectral Hound', plural: 'spectral hounds', hp: 30, bounty: 1.5, fromKills: 240, wallStrike: 6 },
  { id: 'ashen_convert', name: 'Ashen Convert', plural: 'ashen converts', hp: 30, bounty: 1.5, fromKills: 253, wallStrike: 6 },
  { id: 'cult_apprentice', name: 'Cult Apprentice', plural: 'cult apprentices', hp: 28, bounty: 1.4, fromKills: 265, wallStrike: 5 },
  { id: 'ember_prophet', name: 'Ember Prophet', plural: 'ember prophets', hp: 36, bounty: 1.8, fromKills: 278, wallStrike: 7 },
  { id: 'mantair_corsair', name: 'Mantair Corsair', plural: 'mantair corsairs', hp: 34, bounty: 1.7, fromKills: 290, wallStrike: 7 },
  { id: 'ember_wraith', name: 'Ember Wraith', plural: 'ember wraiths', hp: 40, bounty: 2.0, fromKills: 303, wallStrike: 8 },
  // Never from the spawn pool: only a Raid on the Stores brings it (types/foodEvents.ts). It runs
  // for the stores, not the wall, so it never strikes.
  { id: 'raider', name: 'Raider', plural: 'raiders', hp: 10, bounty: 0.5, fromKills: Infinity, wallStrike: 0 },
]

/** An elite has this many times the HP (and so the pay) of its kind */
export const ELITE_HP = 2.5
/** ...and this many times its wall strike */
export const ELITE_STRIKE = 2

function eliteStats(kind: string): Pick<MonsterDef, 'hp' | 'bounty' | 'wallStrike'> {
  const k = REGULARS.find((m) => m.id === kind)
  if (!k) throw new Error(`Elite of an unknown kind: ${kind}`)
  const hp = Math.round(k.hp * ELITE_HP)
  return { hp, bounty: Math.round(hp * 5) / 100, wallStrike: k.wallStrike * ELITE_STRIKE }
}

export const MONSTERS: MonsterDef[] = [
  ...REGULARS,
  // The elites (owner, 2026-10-27): 1 in 12 rolls of their kind comes as the elite instead, and the
  // first roll of their kind after they unlock (fromKills) always does. 2.5 times the HP and pay of
  // the first kind they stand in for, and twice its wall strike.
  ...elite('kobold_shaman', 'Kobold Shaman', 'kobold shamans', 20, ['kobold']),
  ...elite('goblin_chieftain', 'Goblin Chieftain', 'goblin chieftains', 45, ['goblin', 'goblin_scout', 'goblin_archer']),
  ...elite('orc_warchief', 'Orc Warchief', 'orc warchiefs', 70, ['orc', 'shield_bearer']),
  ...elite('troll', 'Troll', 'trolls', 115, ['beetle_guard']),
  ...elite('ogre', 'Ogre', 'ogres', 160, ['chitin_warrior']),
  ...elite('windcaller', 'Windcaller', 'windcallers', 185, ['nomad_warrior', 'nomad_scout', 'nomad_archer', 'storm_rider']),
  ...elite('iron_golem', 'Iron Golem', 'iron golems', 240, ['skeleton', 'ashen_convert']),
  // The bosses, borrowed from the old game's plan (v2.3.2 GDD: "miniboss every 5, boss every 10"
  // wards; tome 05: a mini-boss has 15x HP and 3x damage, a boss 40x and 5x). Each is the last kill
  // of its horde level (fromKills = level x 25 - 1): 15 or 40 times the HP of the pool's average
  // monster there, 3 or 5 times its wall strike (to the half). Once killed it stays killed, even
  // when a Breach pushes the horde back. Owner, 2026-10-27: "borrow from that, it's all planned".
  { id: 'minotaur', name: 'Minotaur', plural: 'minotaurs', rank: 'miniboss', fromKills: 124, hp: 286, bounty: 14.3, wallStrike: 10.5 },
  { id: 'khagan', name: 'Khagan of the Sirocco', plural: 'khagans', rank: 'boss', fromKills: 249, hp: 1153, bounty: 57.65, wallStrike: 28.5 },
  { id: 'basilisk', name: 'Basilisk', plural: 'basilisks', rank: 'miniboss', fromKills: 374, hp: 504, bounty: 25.2, wallStrike: 20 },
  { id: 'forge_master', name: 'Forge-Master of the Inferno', plural: 'forge-masters', rank: 'boss', fromKills: 499, hp: 1344, bounty: 67.2, wallStrike: 33.5 },
  { id: 'spider_queen', name: 'Spider Queen', plural: 'spider queens', rank: 'miniboss', fromKills: 624, hp: 504, bounty: 25.2, wallStrike: 20 },
  { id: 'corrupted_drake', name: 'Corrupted Drake', plural: 'corrupted drakes', rank: 'boss', fromKills: 749, hp: 1344, bounty: 67.2, wallStrike: 33.5 },
  { id: 'stone_golem', name: 'Stone Golem', plural: 'stone golems', rank: 'miniboss', fromKills: 874, hp: 504, bounty: 25.2, wallStrike: 20 },
  { id: 'corrupted_wyvern', name: 'Corrupted Wyvern', plural: 'corrupted wyverns', rank: 'boss', fromKills: 999, hp: 1344, bounty: 67.2, wallStrike: 33.5 },
  { id: 'giant_elemental', name: 'Giant Elemental', plural: 'giant elementals', rank: 'miniboss', fromKills: 1124, hp: 504, bounty: 25.2, wallStrike: 20 },
  { id: 'lich', name: 'Lich', plural: 'liches', rank: 'boss', fromKills: 1249, hp: 1344, bounty: 67.2, wallStrike: 33.5 },
]

/** A mini-boss's and a boss's HP and wall strike, as multiples of the pool's average monster there */
export const BOSS_SCALE: Record<'miniboss' | 'boss', { hp: number; strike: number }> = {
  miniboss: { hp: 15, strike: 3 },
  boss: { hp: 40, strike: 5 },
}

/** An elite's entry, from the first kind it stands in for (defined above it in MONSTERS) */
function elite(id: string, name: string, plural: string, fromKills: number, standsInFor: string[]): MonsterDef[] {
  return [{ id, name, plural, fromKills, standsInFor, rank: 'elite', ...eliteStats(standsInFor[0]) }]
}
