import React from 'react'
import { GameIcon } from './GameIcon'
import { gold } from '../theme'

interface InspirationIconProps {
  size?: number
  color?: string
}

/**
 * The currency icon. The player-facing currency is now called renown and drawn as a gold star;
 * the component keeps its old name until the internal rename (with a save migration) lands.
 * Decorative: callers label the amount themselves.
 */
export function InspirationIcon({ size = 14, color = gold[400] }: InspirationIconProps) {
  // A star fills its box less than a disc does, so it is drawn a little larger
  return <GameIcon name="star" size={Math.round(size * 1.25)} color={color} />
}
