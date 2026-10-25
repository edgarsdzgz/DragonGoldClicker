import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { PillTabs } from './PillTabs'
import type { PillTab } from './PillTabs'
import { Surface } from './Surface'
import { Text } from './Text'
import { useGame } from '../context/GameContext'
import { useJournal } from '../context/JournalContext'
import { getStoryEntries, getHowItWorks, isLoreUnlocked, getLoreLines } from '../data/story/journal'
import { colors, spacing, gold } from '../theme'

const TAB_STORY: PillTab = { key: 'story', label: 'Story', icon: 'book-outline' }
const TAB_HOW: PillTab = { key: 'how', label: 'How It Works', icon: 'help-circle-outline' }
const TAB_LORE: PillTab = { key: 'lore', label: 'Lore', icon: 'library-outline' }

/** The Journal: every scene seen so far, how each system works, and (after Lirae) lore. */
export function JournalSheet() {
  const { state } = useGame()
  const { isOpen, close } = useJournal()
  const [tab, setTab] = useState('story')

  const loreOn = isLoreUnlocked(state)
  const tabs = loreOn ? [TAB_STORY, TAB_HOW, TAB_LORE] : [TAB_STORY, TAB_HOW]
  const active = tabs.some((t) => t.key === tab) ? tab : 'story'

  return (
    <BottomSheet visible={isOpen} onClose={close} title="Journal" subtitle="What Draconia has lived through" icon="book" iconColor={gold[400]}>
      <PillTabs tabs={tabs} activeKey={active} onSelect={setTab} />
      <View style={styles.list}>
        {active === 'story' && <StoryTab />}
        {active === 'how' && <HowTab />}
        {active === 'lore' && <LoreTab />}
      </View>
    </BottomSheet>
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
  empty: {
    paddingVertical: spacing[3],
    color: colors.text.muted,
  },
})
