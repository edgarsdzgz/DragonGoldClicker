import { StyleSheet } from 'react-native'
import { colors, spacing } from '../../theme'

export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: spacing[4],
  },
})
