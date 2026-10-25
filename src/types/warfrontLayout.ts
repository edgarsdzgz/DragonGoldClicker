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
/** Monster name under the sprite */
export const NAME_H = 20
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
