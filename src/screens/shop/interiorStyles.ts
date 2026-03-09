import { StyleSheet } from 'react-native'
import { colors, spacing, radius, gold, dark } from '../../theme'

// =============================================================================
// SHARED INTERIOR STYLES (used by all building interiors)
// =============================================================================

export const styles = StyleSheet.create({
  // Shared interior
  interiorContainer: {
    gap: spacing[2],
  },

  // Tier sections
  tiersSection: {
    gap: spacing[2],
  },
  gearCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  // Promote buttons
  promoteRow: {
    flexDirection: 'row',
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing[2],
  },
  promoteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(212, 146, 44, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 146, 44, 0.2)',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: radius.sm,
  },
  promoteBtnDisabled: {
    opacity: 0.4,
    borderColor: colors.border.subtle,
    backgroundColor: 'transparent',
  },
  promoteBtnPressed: {
    backgroundColor: 'rgba(212, 146, 44, 0.15)',
  },
})

// =============================================================================
// OFFLINE TIER STYLES
// =============================================================================

export const offStyles = StyleSheet.create({
  tierList: {
    paddingVertical: spacing[1],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 36,
  },
  stepDotColumn: {
    width: 20,
    alignItems: 'center',
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: gold[400],
  },
  connectorLine: {
    width: 2,
    height: 12,
    borderRadius: 1,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
})

// =============================================================================
// EXPEDITION STYLES
// =============================================================================

export const expStyles = StyleSheet.create({
  resultRowSuccess: {
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  resultRowMiss: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressPct: {
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  costChipRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  pityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  pityDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pityDotFilled: {
    backgroundColor: colors.building.explorer,
  },
  pityDotEmpty: {
    backgroundColor: dark[600],
  },
  sendBtnGradientWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing[1],
  },
  sendBtnPressed: {
    opacity: 0.8,
  },
  sendBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  sendCostPills: {
    flexDirection: 'row',
    gap: spacing[1],
    marginLeft: spacing[1],
  },
  sendCostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
})

// =============================================================================
// DRACONIA HALL STYLES
// =============================================================================

export const draconiaStyles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[4],
  },
  offlineSection: {
    marginTop: spacing[3],
  },
})
