import React, { useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { getScene, OFFLINE_FRAMING } from '../data/story/lines'
import type { SceneTab } from '../data/story/lines'
import type { BeatId } from '../types/story'
import { markScripted, hasRun } from '../types/scripted'
import { OfflineModal } from './OfflineModal'
import { NpcDialog } from './NpcDialog'
import { FoodWarningModal } from './FoodWarningModal'
import { useActiveEvent } from '../hooks/useActiveEvent'
import { StarvationModal } from './StarvationModal'
import { WandererModal } from './WandererModal'
import { MilestoneModal } from './MilestoneModal'
import { GameOverModal } from './GameOverModal'

interface EventHostProps {
  /** Switches the visible tab (the host lives above the tab navigator) */
  onNavigate: (tab: SceneTab) => void
  /** Called when a scene is closed (read or skipped), but not for replays */
  onSceneClosed?: (id: BeatId) => void
}

/**
 * The only place pop-ups are shown, mounted once above the tabs so events appear on
 * every screen. One at a time, highest priority first:
 * game over > offline > story scene > starvation > food warning > milestone > wanderer.
 */
export function EventHost({ onNavigate, onSceneClosed }: EventHostProps) {
  const {
    state, applyScripted, dismissGameOver, resetGame,
    pendingOfflineEarnings, dismissOfflineEarnings,
    pendingStarvationReport, dismissStarvationReport,
    pendingFoodWarning, dismissFoodWarning,
    pendingMilestone, acceptMilestone, rejectMilestone,
    pendingWanderer, acceptWanderer, rejectWanderer,
  } = useGame()
  const { scenes, dismissScene } = useStory()

  const queued = scenes[0]
  const scene = queued ? getScene(queued.id) : undefined

  const activeModal = useActiveEvent()

  // Each queued scene closes once, even on a double tap on Skip or the dismiss button
  const closedUids = useRef(new Set<number>())
  const handleSceneClose = () => {
    if (!queued || closedUids.current.has(queued.uid)) return
    closedUids.current.add(queued.uid)
    dismissScene()
    if (!queued.replay) onSceneClosed?.(queued.id)
    // Skip goes where dismiss goes, so a skipped scene never strands the player off a guided step
    if (scene?.navigateTo) onNavigate(scene.navigateTo)
  }

  // The first offline report after the Keep stands is spoken over by Pyreth
  const offlineFramed = hasRun(state, 'offlineFraming')
  const collectOffline = () => {
    dismissOfflineEarnings()
    applyScripted((s) => markScripted(s, 'offlineFraming'))
  }

  const handleFoodWarningGoForage = () => {
    dismissFoodWarning()
    onNavigate('ForageTab')
  }

  return (
    <>
      <OfflineModal
        visible={activeModal === 'offline'}
        inspirationEarned={pendingOfflineEarnings?.inspiration ?? 0}
        secondsAway={pendingOfflineEarnings?.seconds ?? 0}
        onCollect={collectOffline}
        framing={offlineFramed ? undefined : OFFLINE_FRAMING}
      />
      {scene && (
        <NpcDialog
          key={queued?.uid}
          visible={activeModal === 'scene'}
          npcName={scene.speaker}
          icon={scene.icon}
          title={scene.title}
          lines={queued?.alt && scene.altLines ? scene.altLines : scene.lines}
          dismissLabel={scene.dismissLabel}
          onDismiss={handleSceneClose}
          onSkip={handleSceneClose}
          cutscene={scene.cutscene}
          highlight={scene.highlight}
        />
      )}
      {pendingFoodWarning > 0 && (
        <FoodWarningModal
          visible={activeModal === 'foodWarning'}
          level={pendingFoodWarning as 3 | 1}
          onGoToForage={handleFoodWarningGoForage}
          onDismiss={dismissFoodWarning}
        />
      )}
      {pendingStarvationReport !== null && (
        <StarvationModal
          visible={activeModal === 'starvation'}
          report={pendingStarvationReport}
          onDismiss={dismissStarvationReport}
        />
      )}
      {pendingWanderer !== null && (
        <WandererModal
          visible={activeModal === 'wanderer'}
          encounter={pendingWanderer}
          onAccept={acceptWanderer}
          onReject={rejectWanderer}
        />
      )}
      {pendingMilestone !== null && (
        <MilestoneModal
          visible={activeModal === 'milestone'}
          milestone={pendingMilestone}
          onAccept={acceptMilestone}
          onReject={rejectMilestone}
        />
      )}
      <GameOverModal
        visible={activeModal === 'gameOver'}
        onReset={resetGame}
        onDismiss={dismissGameOver}
      />
    </>
  )
}
