// =============================================================================
// SHARED NUMERIC UTILITIES (no domain imports -- safe from circular deps)
// =============================================================================

/** Round to 2 decimal places for inspiration-economy values */
export function roundInsp(n: number): number {
  return parseFloat(n.toFixed(2))
}

/** Round a cost to the nearest 0.05 so prices always end in 0 or 5 */
export function roundCost(n: number): number {
  return parseFloat((Math.round(n / 0.05) * 0.05).toFixed(2))
}
