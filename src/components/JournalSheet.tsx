import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { PillTabs } from './PillTabs'
import type { PillTab } from './PillTabs'
import { Surface } from './Surface'
import { Text } from './Text'
import { useGame } from '../context/GameContext'
import { useJournal } from '../context/JournalContext'
import { getStoryEntries, getHowItWorks, isLoreUnlocked, getLoreLines } from '../data/story/journal'
import { QUESTS, activeQuests, isQuestDone, questProgress } from '../types/quests'
import { colors, spacing, gold } from '../theme'

const TAB_QUESTS: PillTab = { key: 'quests', label: 'Quests', icon: 'flag-outline' }
const TAB_STORY: PillTab = { key: 'story', label: 'Story', icon: 'book-outline' }
const TAB_HOW: PillTab = { key: 'how', label: 'How It Works', icon: 'help-circle-outline' }
const TAB_LORE: PillTab = { key: 'lore', label: 'Lore', icon: 'library-outline' }

/** The Journal: quests, every scene seen so far, how each system works, and (after Lirae) lore. */
export function JournalSheet() {
  const { state } = useGame()
  const { isOpen, close } = useJournal()
  const [tab, setTab] = useState('quests')

  // Quests appear once the first one is offered; they open first, since they say what to do next
  const questsOn = state.questsDone.length > 0 || activeQuests(state).length > 0
  const tabs = [...(questsOn ? [TAB_QUESTS] : []), TAB_STORY, TAB_HOW, ...(isLoreUnlocked(state) ? [TAB_LORE] : [])]
  const active = tabs.some((t) => t.key === tab) ? tab : tabs[0].key

  return (
    <BottomSheet visible={isOpen} onClose={close} title="Journal" subtitle="What Draconia has lived through" icon="book" iconColor={gold[400]}>
      <PillTabs tabs={tabs} activeKey={active} onSelect={setTab} />
      <View style={styles.list}>
        {active === 'quests' && <QuestsTab />}
        {active === 'story' && <StoryTab />}
        {active === 'how' && <HowTab />}
        {active === 'lore' && <LoreTab />}
      </View>
    </BottomSheet>
  )
}

/** The active quest(s) with progress, then the finished ones */
function QuestsTab() {
  const { state } = useGame()
  const active = activeQuests(state)
  const done = QUESTS.filter((q) => isQuestDone(state, q.id))
  return (
    <>
      {active.map((q) => {
        const progress = questProgress(q, state)
        return (
          <View key={q.id} accessible accessibilityLabel={`Current quest: ${q.title}. ${q.goal}, ${progress} of ${q.target}`}>
            <Surface level={2} style={styles.card}>
              <Text variant="caption" style={styles.speaker}>CURRENT QUEST</Text>
              <Text variant="h3">{q.title}</Text>
              <Text variant="bodySmall" color="secondary">{`${q.goal}: ${progress} / ${q.target}`}</Text>
              {q.reward && <Text variant="caption" style={styles.reward}>{`Reward: ${q.reward.renown.toFixed(2)} renown`}</Text>}
            </Surface>
          </View>
        )
      })}
      {done.map((q) => (
        <View key={q.id} accessible accessibilityLabel={`Quest complete: ${q.title}`}>
          <Surface level={1} style={styles.doneCard}>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.success} />
            <View style={styles.doneText}>
              <Text variant="label">{q.title}</Text>
              <Text variant="caption" color="muted">{q.goal}</Text>
            </View>
          </Surface>
        </View>
      ))}
      {active.length === 0 && done.length === 0 && <Empty text="No quests yet." />}
    </>
  )
}

function StoryTab() {
  const { state } = useGame()
  const entries = getStoryEntries(state)
  if (entries.length === 0) return <Empty text="Nothing has happened yet." />
  return (
    <>
      {entries.map(({ id, scene }) => (
        <Surface key={id} level={2} style={styles.card}>
          <Text variant="caption" style={styles.speaker}>{scene.speaker.toUpperCase()}</Text>
          <Text variant="h3">{scene.title}</Text>
          {scene.lines.map((line, i) => (
            <Text key={i} variant="bodySmall" color="secondary" style={styles.line}>{line}</Text>
          ))}
        </Surface>
      ))}
    </>
  )
}

function HowTab() {
  const { state } = useGame()
  return (
    <>
      {getHowItWorks(state).map((card) => (
        <Surface key={card.system} level={2} style={styles.card}>
          <Text variant="label">{card.title}</Text>
          <Text variant="bodySmall" color="secondary" style={styles.line}>{card.text}</Text>
        </Surface>
      ))}
    </>
  )
}

function LoreTab() {
  return (
    <>
      <Surface level={2} style={styles.card}>
        <Text variant="caption" style={styles.speaker}>LIRAE THE INK-WING</Text>
        {getLoreLines().map((line, i) => (
          <Text key={i} variant="bodySmall" color="secondary" style={styles.line}>{line}</Text>
        ))}
      </Surface>
      <Empty text="More pages to come." />
    </>
  )
}

function Empty({ text }: { text: string }) {
  return <Text variant="caption" color="muted" center style={styles.empty}>{text}</Text>
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
    paddingTop: spacing[3],
  },
  card: {
    gap: spacing[1],
  },
  speaker: {
    color: gold[400],
    letterSpacing: 1,
  },
  line: {
    lineHeight: 20,
  },
  reward: {
    color: gold[300],
  },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  doneText: {
    flex: 1,
  },
  empty: {
    paddingVertical: spacing[3],
    color: colors.text.muted,
  },
})
