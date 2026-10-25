import React from 'react'
import { View, ViewStyle } from 'react-native'
import { useCoachTarget } from '../hooks/useCoachTarget'

interface CoachTargetProps {
  /** Target id the guided tutorial refers to */
  id: string
  style?: ViewStyle
  children: React.ReactNode
}

/**
 * Registers a wrapper View (and everything inside it) as a coach target. Use it when the
 * highlighted area should include more than one control, e.g. an orb and its cost label.
 */
export function CoachTarget({ id, style, children }: CoachTargetProps) {
  const target = useCoachTarget(id)
  return (
    <View ref={target.ref} onLayout={target.onLayout} collapsable={false} style={style}>
      {children}
    </View>
  )
}
