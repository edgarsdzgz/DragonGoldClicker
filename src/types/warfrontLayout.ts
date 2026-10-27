// Warfront layout math (pure, so the fit on small and large phones is tested)

/** Monster sprite diameter limits in dp */
export const MAX_MONSTER = 200
/** The sprite is kept at least this big while the flavor line can still be dropped */
export const MIN_MONSTER = 120
/** Smallest sprite ever drawn, when even dropping the flavor line is not enough */
export const FLOOR_MONSTER = 80

/** Height of the flavor row: always rendered at this height, one line with ellipsis */
export const FLAVOR_H = 36
/** Monster name under the sprite: 20dp of text plus its 2dp top margin */
export const NAME_H = 22
/** The enemy's life bar under the name: the bar alone, no numbers (owner, 2026-10-27) */
export const HP_H = 14
/** Breathing room above and below the stack */
export const FIELD_PAD = 8

export interface BattlefieldLayout {
  /** Monster sprite diameter */
  monster: number
  showFlavor: boolean
}

/**
 * Lay out the battlefield (the tap area above the gate) in its measured height. The stack is
 * [flavor][monster][name][HP]. The flavor line goes first when space is short, and only then does
 * the monster shrink (down to 80dp), so nothing ever overlaps the gate below.
 */
export function battlefieldLayout(height: number): BattlefieldLayout {
  const room = height - (NAME_H + HP_H + FIELD_PAD * 2)
  if (room - FLAVOR_H >= MIN_MONSTER) return { monster: Math.min(MAX_MONSTER, Math.floor(room - FLAVOR_H)), showFlavor: true }
  if (room >= MIN_MONSTER) return { monster: Math.min(MAX_MONSTER, Math.floor(room)), showFlavor: false }
  return { monster: Math.max(FLOOR_MONSTER, Math.min(MAX_MONSTER, Math.floor(room))), showFlavor: false }
}

// -----------------------------------------------------------------------------
// Population chips: words when they fit on one line, icon + number when not
// -----------------------------------------------------------------------------

/** Rough width of one chip with a text label: icon 14 + gap 4 + padding 24 + border 2, 6.6 per character */
export function chipWidth(label: string): number {
  return 14 + 4 + 24 + 2 + Math.ceil(label.length * 6.6)
}

const CHIP_GAP = 8

/** Whether all labels fit side by side in `available` dp (otherwise show icon + number only) */
export function chipsFit(labels: string[], available: number): boolean {
  if (labels.length === 0) return true
  const total = labels.reduce((sum, l) => sum + chipWidth(l), 0) + CHIP_GAP * (labels.length - 1)
  return total <= available
}

// =============================================================================
// THE FORAGE TAB: the FORAGE orb fits the space it is given
// =============================================================================

/** The large orb's glow ring is this many times its diameter (260 around 200, see HarvestOrb) */
export const ORB_GLOW_RATIO = 1.3
export const FORAGE_ORB_MAX = 200
export const FORAGE_ORB_MIN = 90

/**
 * The FORAGE orb's diameter for the height its area has (the flavor row above it included), so
 * its glow never spills onto the TRAIN row below. Between FORAGE_ORB_MIN and FORAGE_ORB_MAX.
 */
export function forageOrbDiameter(areaHeight: number): number {
  const room = (areaHeight - FLAVOR_H - FIELD_PAD * 2) / ORB_GLOW_RATIO
  return Math.max(FORAGE_ORB_MIN, Math.min(FORAGE_ORB_MAX, Math.floor(room)))
}
