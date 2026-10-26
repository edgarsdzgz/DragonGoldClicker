/**
 * Dragon Gold Mobile Design System
 * Ember & Stone -- torchlit medieval siege defense
 */

// =============================================================================
// RAW COLOR RAMPS
// =============================================================================

export const dark = {
  950: '#05050a',
  900: '#0a0a0f',
  800: '#12121a',
  700: '#1a1a25',
  600: '#252530',
  500: '#35354a',
  400: '#55556a',
  300: '#80809a',
  200: '#b0b0c5',
  100: '#e0e0ea',
  50: '#f5f5f8',
} as const

export const gold = {
  950: '#3a2008',
  900: '#6b3a0d',
  800: '#8a4a12',
  700: '#a8621a',
  600: '#c47a20',
  500: '#d4922c',
  400: '#e0a840',
  300: '#f0c060',
  200: '#f5d896',
  100: '#faecc8',
  50: '#fef6e6',
} as const

// =============================================================================
// SEMANTIC COLOR TOKENS
// =============================================================================

export const colors = {
  /** Warm charcoal backgrounds -- torchlit stone feel */
  bg: {
    base: '#0f0d0b',
    surface1: '#161412',
    surface2: '#1e1c19',
    surface3: '#272520',
    overlay: '#0a080680',
  },

  text: {
    primary: '#f1f1f5',
    secondary: '#94949e',
    muted: '#64646e',
    link: gold[400],
    inverse: dark[900],
  },

  border: {
    subtle: dark[700],
    strong: dark[600],
    accent: gold[500],
  },
  divider: {
    default: '#1a1a2580',
  },

  accent: {
    default: gold[500],
    hover: gold[400],
    pressed: gold[600],
    muted: gold[300],
  },

  status: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#ff6b6b',
    info: '#60a5fa',
  },

  focus: {
    ring: '#e0a84080',
  },

  /** Disabled-state tokens (WCAG AA compliant) */
  disabled: {
    /** Text on accent-tinted dark bg -- 6:1+ contrast ratio */
    text: '#b0b0c5',
    /** Text on transparent/surface bg -- 4.5:1 contrast ratio */
    textSubtle: '#80809a',
    /** Border for disabled secondary buttons */
    border: '#252530',
  },

  building: {
    garrison: '#f87171',
    forge: '#f59e0b',
    lodge: '#4ade80',
    explorer: '#60a5fa',
    draconia: '#a78bfa',
    librarium: '#38bdf8',
    housing: '#c084fc',
    wizard: '#e879f9',
    tower: '#fb923c',
  },

  /** Warfront-specific action colors */
  warfront: {
    rally: '#dc4444',
    repair: '#b0a890',
    slay: gold[400],
    /** Fighters' hits on the monster */
    ally: '#93c5fd',
    /** The claw slash by tier (layer 3): plain, gold from Serrated, ember from Ember */
    clawPlain: '#ffffff',
    clawGold: gold[200],
    clawEmber: '#ffb15c',
  },

  dark,
  goldRamp: gold,
} as const

// =============================================================================
// SPACING (4pt base grid)
// =============================================================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 48,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

// =============================================================================
// ELEVATION (Shadows)
// =============================================================================

export const elevation = {
  1: {
    shadowColor: dark[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: dark[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  3: {
    shadowColor: dark[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  4: {
    shadowColor: dark[950],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    lineHeight: 29,
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 23,
  },
  h4: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  // Large display for gold counter
  display: {
    fontSize: 42,
    fontWeight: 'bold' as const,
    lineHeight: 50,
  },
} as const

// =============================================================================
// ANIMATION TIMING
// =============================================================================

export const animation = {
  duration: {
    instant: 0,
    fast: 80,
    normal: 120,
    medium: 200,
    slow: 240,
    modal: 280,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const

// =============================================================================
// TOUCH TARGETS (Accessibility)
// =============================================================================

export const touchTarget = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const
