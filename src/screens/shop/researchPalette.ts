import { colors, dark } from '../../theme'
import type { ResearchCategory } from '../../types/game'

/** The Librarium's sky-blue, and the card tints derived from it */
export const LIB = {
  accent: colors.building.librarium,
  completedBg: '#0d2235',
  nodeBg: '#0c1a28',
  lockedBg: dark[800],
  lineDim: '#1a2a3a',
} as const

/** Each branch takes the color of what it improves */
export const BRANCH_COLORS: Record<ResearchCategory, string> = {
  dragon: colors.warfront.slay,
  army: colors.building.garrison,
  stores: colors.building.lodge,
  wall: colors.warfront.repair,
}
