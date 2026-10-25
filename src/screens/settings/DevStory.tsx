import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, Button, SectionLabel } from '../../components'
import { useGame } from '../../context/GameContext'
import { useStory } from '../../context/StoryContext'
import { getScene } from '../../data/story/lines'
import { STORY_BEATS } from '../../types/game'
import { colors, spacing } from '../../theme'

/**
 * Dev panel section: see which beats have fired, jump the story forward, reset it,
 * or replay one scene. None of it touches the economy.
 */
export function DevStory() {
  const { state, devApply } = useGame()
  const { enqueueScene } = useStory()

  const seen = new Set(state.beatsSeen)

  // Mark every beat up to and including the chosen one as seen (no scenes shown)
  const jumpTo = (index: number) =>
    devApply((s) => ({
      ...s,
      beatsSeen: STORY_BEATS.slice(0, index + 1).map((b) => b.id),
      lastBeatAtPlaySec: s.playSeconds,
    }))

  const resetStory = () => devApply((s) => ({ ...s, beatsSeen: [], lastBeatAtPlaySec: 0 }))

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>STORY</SectionLabel>
      <Text variant="caption" color="muted">
        {`${seen.size}/${STORY_BEATS.length} beats seen, play time ${state.playSeconds}s. Jump marks every beat up to the chosen one as seen and shows no scenes; later beats become unseen.`}
      </Text>

      {STORY_BEATS.map((beat, i) => {
        const isSeen = seen.has(beat.id)
        const hasScene = !beat.silent && getScene(beat.id) !== undefined
        return (
          <View key={beat.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="label">{`${beat.chapter}. ${beat.id}${beat.side ? ' (side)' : ''}`}</Text>
              <Text variant="caption" style={{ color: isSeen ? colors.status.success : colors.text.muted }}>
                {isSeen ? 'SEEN' : 'UNSEEN'}
                {beat.silent ? ' - silent' : ''}
              </Text>
            </View>
            <Button size="xs" variant="secondary" onPress={() => jumpTo(i)} accessibilityLabel={`Jump to beat ${beat.id}`}>Jump</Button>
            <Button
              size="xs"
              variant="ghost"
              disabled={!isSeen || !hasScene}
              onPress={() => enqueueScene(beat.id)}
              accessibilityLabel={`Replay scene ${beat.id}`}
            >
              Replay
            </Button>
          </View>
        )
      })}

      <View style={styles.actions}>
        <Button size="sm" variant="secondary" onPress={resetStory}>Reset story</Button>
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rowText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
})
