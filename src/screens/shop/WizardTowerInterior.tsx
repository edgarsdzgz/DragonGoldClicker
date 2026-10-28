import React from 'react'
import { View } from 'react-native'
import { StatRow, Text } from '../../components'
import { useGame } from '../../context/GameContext'
import { colors } from '../../theme'
import { TOWER_FIRE_BONUS } from '../../types/allies'
import { armyVolleyNow } from '../../types/army'
import { DescriptionBanner } from './shared'
import { styles as interiorStyles } from './interiorStyles'

// =============================================================================
// THE WIZARD'S TOWER (chapter 11): Thornwick's fire, high up and away from anything that burns
// =============================================================================

export function WizardTowerInterior() {
  const { state } = useGame()
  return (
    <View style={interiorStyles.interiorContainer}>
      <DescriptionBanner icon="sparkles" color={colors.building.wizard}>
        <Text variant="bodySmall" color="secondary">
          Thornwick's fire falls with every volley: your army hits {Math.round(TOWER_FIRE_BONUS * 100)}% harder.
        </Text>
      </DescriptionBanner>
      <StatRow icon="flame" label="The army's volley" value={armyVolleyNow(state).toFixed(2)} accent />
    </View>
  )
}
