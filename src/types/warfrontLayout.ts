// Warfront layout math (pure, so the fit on small and large phones is tested)

/** Battle circle diameter limits in dp */
export const MIN_ORB = 180
export const MAX_ORB = 260
/** Smallest circle we will ever draw, when even the minimum cannot fit */
export const FLOOR_ORB = 120

/** Padding of the touch area around the circle */
export const ORB_PAD = 8
/** Gap kept between the circle's touch area and the row below */
export const ORB_GAP = 4
/** Height of the flavour row: always rendered at this height, one line with ellipsis */
export const FLAVOR_H = 36

/** Windows shorter than this drop the footer line to give the circle room */
export const TALL_WINDOW = 700

export interface BattleLayout {
  /** Circle diameter */
  diameter: number
  /** Whether the flavour line fits above the circle */
  showFlavor: boolean
}

/**
 * Size the battle circle from the free height of the battle area. The circle is
 * 180-260dp when it can be; the flavour line is dropped before the circle shrinks
 * below 180; and below that the circle shrinks (down to 120) rather than overlap.
 */
export function battleLayout(freeHeight: number): BattleLayout {
  const chrome = ORB_PAD * 2 + ORB_GAP
  const withFlavor = freeHeight - chrome - FLAVOR_H
  const showFlavor = withFlavor >= MIN_ORB
  const room = showFlavor ? withFlavor : freeHeight - chrome
  const diameter = Math.max(FLOOR_ORB, Math.min(MAX_ORB, Math.floor(room)))
  return { diameter, showFlavor }
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
