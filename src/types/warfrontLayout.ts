// Warfront layout math (pure, so the fit on small and large phones is tested)

/** Monster sprite diameter limits in dp */
export const MAX_MONSTER = 200
/** The sprite is kept at least this big while the flavour line or queue row can still be dropped */
export const MIN_MONSTER = 120
/** Smallest sprite we will ever draw, when even dropping the optional rows is not enough */
export const FLOOR_MONSTER = 80

/** Height of the flavour row: always rendered at this height, one line with ellipsis */
export const FLAVOR_H = 36
/** The dim queue of next monsters */
export const QUEUE_H = 28
/** Monster name under the sprite: 20dp of text plus its 2dp top margin */
export const NAME_H = 22
/** Enemy HP under the name: pips, or "cur/max" text over a bar */
export const HP_H = 30
/** Breathing room above and below the stack */
export const FIELD_PAD = 8

/** Windows shorter than this drop the footer line to give the battlefield room */
export const TALL_WINDOW = 700

export interface BattlefieldLayout {
  /** Monster sprite diameter */
  monster: number
  showFlavor: boolean
  showQueue: boolean
}

/**
 * Lay out the battlefield (the tap area between the wave row and the gate) in its measured
 * height. The stack is [flavour][queue][monster][name][HP]. The flavour line goes first when
 * space is short, then the queue, and only then does the monster shrink (down to 80dp),
 * so nothing ever overlaps the gate below.
 */
export function battlefieldLayout(height: number, opts: { queue?: boolean } = {}): BattlefieldLayout {
  const fixed = NAME_H + HP_H + FIELD_PAD * 2
  const queueH = opts.queue ? QUEUE_H : 0
  const fits = (flavor: boolean, queue: boolean) =>
    height - fixed - (flavor ? FLAVOR_H : 0) - (queue ? queueH : 0)

  const tries: Array<[boolean, boolean]> = [[true, true], [false, true], [false, false]]
  for (const [showFlavor, showQueue] of tries) {
    const room = fits(showFlavor, showQueue)
    if (room >= MIN_MONSTER) return { monster: Math.min(MAX_MONSTER, Math.floor(room)), showFlavor, showQueue: showQueue && !!opts.queue }
  }
  const room = fits(false, false)
  return { monster: Math.max(FLOOR_MONSTER, Math.min(MAX_MONSTER, Math.floor(room))), showFlavor: false, showQueue: false }
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

// -----------------------------------------------------------------------------
// The camp view (between waves)
// -----------------------------------------------------------------------------

/** The Begin wave button: always at least 48dp tall */
export const BEGIN_BUTTON_H = 52
const CAMP_HORDE_H = 18
const CAMP_PREVIEW_H = 22
const CAMP_BONUS_H = 16
const CAMP_GAP = 8
export const CAMP_MAX_SILHOUETTE = 48
export const CAMP_MIN_SILHOUETTE = 24

export interface CampLayout {
  showSilhouettes: boolean
  /** Size of each of the five dim silhouettes */
  silhouette: number
  /** Height the camp needs without the silhouettes (it never shrinks below this) */
  minHeight: number
}

/** Height of the camp text and button, which always show: horde line, preview, bonus, button */
export const CAMP_CORE_H = CAMP_HORDE_H + CAMP_PREVIEW_H + CAMP_BONUS_H + BEGIN_BUTTON_H + CAMP_GAP * 3 + FIELD_PAD * 2

/**
 * Budget the camp the way the monster is budgeted. The text and the button always show; the row
 * of silhouettes takes what is left (24-48dp) and is dropped when there is less than that.
 */
export function campLayout(height: number): CampLayout {
  const room = height - CAMP_CORE_H - CAMP_GAP
  const showSilhouettes = room >= CAMP_MIN_SILHOUETTE
  return {
    showSilhouettes,
    silhouette: showSilhouettes ? Math.min(CAMP_MAX_SILHOUETTE, Math.floor(room)) : 0,
    minHeight: CAMP_CORE_H,
  }
}

// =============================================================================
// THE FORAGE TAB: the FORAGE orb fits the space it is given
// =============================================================================

/** The large orb's glow ring is this many times its diameter (260 around 200, see HarvestOrb) */
export const ORB_GLOW_RATIO = 1.3
export const FORAGE_ORB_MAX = 200
export const FORAGE_ORB_MIN = 90

/**
 * The FORAGE orb's diameter for the height its area has (the flavour row above it included), so
 * its glow never spills onto the TRAIN row below. Between FORAGE_ORB_MIN and FORAGE_ORB_MAX.
 */
export function forageOrbDiameter(areaHeight: number): number {
  const room = (areaHeight - FLAVOR_H - FIELD_PAD * 2) / ORB_GLOW_RATIO
  return Math.max(FORAGE_ORB_MIN, Math.min(FORAGE_ORB_MAX, Math.floor(room)))
}
