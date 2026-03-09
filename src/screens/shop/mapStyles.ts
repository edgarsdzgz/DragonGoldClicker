import { StyleSheet } from 'react-native'
import { colors, spacing, radius, gold, dark } from '../../theme'

export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scrollView: {
    flex: 1,
  },
  cityTitle: {
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: spacing[4],
    color: gold[400],
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },

  // Zones
  zone: {
    paddingVertical: spacing[2],
  },
  zoneNodesCenter: {
    alignItems: 'center',
  },
  zoneNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  // Building nodes
  nodeContainer: {
    alignItems: 'center',
    width: 110,
    gap: 4,
  },
  nodeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeCircleBuilt: {
    borderStyle: 'solid',
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  nodeCircleUnbuilt: {
    borderStyle: 'dashed',
    borderColor: dark[500],
    backgroundColor: colors.bg.surface2,
  },
  nodeCircleAffordable: {
    borderStyle: 'dashed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  nodeLabel: {
    textAlign: 'center',
    marginTop: 2,
  },
  nodeStatus: {
    textAlign: 'center',
    fontSize: 10,
  },
  actionBadge: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.bg.base,
    zIndex: 1,
  },

  // Zone path connector
  pathContainer: {
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  pathLine: {
    width: 1,
    height: 16,
    backgroundColor: dark[600],
  },
  pathDot: {
    width: 5,
    height: 5,
    transform: [{ rotate: '45deg' }],
    backgroundColor: dark[500],
    marginVertical: 2,
  },

  // Build prompt
  buildPrompt: {
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  buildButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  buildButtonDisabled: {
    opacity: 0.5,
  },
  buildButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
})
