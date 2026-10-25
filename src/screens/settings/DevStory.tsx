import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, Button, SectionLabel } from '../../components'
import { useGame } from '../../context/GameContext'
import { useStory } from '../../context/StoryContext'
import { getScene } from '../../data/story/lines'
import { STORY_BEATS, TUTORIAL_STEPS, getActiveStep } from '../../types/game'
import { backfillScripted } from '../../types/storyMigration'
import { colors, spacing } from '../../theme'

/**
 * Dev panel section: see which beats have fired, jump the story forward, reset it,
 * or replay one scene. None of it touches the economy.
 */
export function DevStory() {
  const { state, devApply } = useGame()
  const { enqueueScene } = useStory()

  const seen = new Set(state.beatsSeen)

  // Mark every beat up to and including the chosen one as seen (no scenes shown).
  // Guided steps and scripted events of the EARLIER beats count as done, so the chosen
  // beat's own guided step is still there to test.
  const jumpTo = (index: number) =>
    devApply((s) => {
      const before = STORY_BEATS.slice(0, index).map((b) => b.id)
      return {
        ...s,
        beatsSeen: STORY_BEATS.slice(0, index + 1).map((b) => b.id),
        lastBeatAtPlaySec: s.playSeconds,
        tutorialStepsDone: TUTORIAL_STEPS.filter((t) => before.includes(t.afterBeat)).map((t) => t.id),
        scriptedDone: backfillScripted({ ...s, beatsSeen: before }),
      }
    })

  const resetTutorial = () => devApply((s) => ({ ...s, tutorialStepsDone: [] }))

  // Reset story: beats, the guided tutorial and scripted events all start over; the economy stays
  const resetStory = () =>
    devApply((s) => ({ ...s, beatsSeen: [], lastBeatAtPlaySec: 0, tutorialStepsDone: [], scriptedDone: [] }))

  const doneSteps = new Set(state.tutorialStepsDone ?? [])
  const activeStep = getActiveStep(state)

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>STORY</SectionLabel>
      <Text variant="caption" color="muted">
        {`${seen.size}/${STORY_BEATS.length} beats seen, play time ${state.playSeconds}s. Jump marks every beat up to the chosen one as seen and shows no scenes; later beats become unseen. Reset story also resets the tutorial and scripted events.`}
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
              onPress={() => enqueueScene(beat.id, { replay: true })}
              accessibilityLabel={`Replay scene ${beat.id}`}
            >
              Replay
            </Button>
          </View>
        )
      })}

      <SectionLabel spacing={2}>GUIDED TUTORIAL</SectionLabel>
      {TUTORIAL_STEPS.map((step) => {
        const done = doneSteps.has(step.id)
        const isActive = activeStep?.id === step.id
        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="label">{step.id}</Text>
              <Text variant="caption" style={{ color: done ? colors.status.success : colors.text.muted }}>
                {done ? 'DONE' : isActive ? 'ACTIVE' : 'PENDING'}
                {` - after ${step.afterBeat}`}
              </Text>
            </View>
          </View>
        )
      })}

      <View style={styles.actions}>
        <Button size="sm" variant="secondary" onPress={resetTutorial}>Reset tutorial</Button>
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
