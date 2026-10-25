import React from 'react'
import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { getScene } from '../data/story/lines'
import type { SceneTab } from '../data/story/lines'
import { OfflineModal } from './OfflineModal'
import { NpcDialog } from './NpcDialog'
import { FoodWarningModal } from './FoodWarningModal'
import { StarvationModal } from './StarvationModal'
import { WandererModal } from './WandererModal'
import { MilestoneModal } from './MilestoneModal'
import { GameOverModal } from './GameOverModal'

interface EventHostProps {
  /** Switches the visible tab (the host lives above the tab navigator) */
  onNavigate: (tab: SceneTab) => void
}

/**
 * The only place pop-ups are shown, mounted once above the tabs so events appear on
 * every screen. One at a time, highest priority first:
 * game over > offline > story scene > starvation > food warning > milestone > wanderer.
 */
export function EventHost({ onNavigate }: EventHostProps) {
  const {
    isGameOver, dismissGameOver, resetGame,
    pendingOfflineEarnings, dismissOfflineEarnings,
    pendingStarvationReport, dismissStarvationReport,
    pendingFoodWarning, dismissFoodWarning,
    pendingMilestone, acceptMilestone, rejectMilestone,
    pendingWanderer, acceptWanderer, rejectWanderer,
  } = useGame()
  const { scenes, dismissScene } = useStory()

  const sceneId = scenes[0]
  const scene = sceneId ? getScene(sceneId) : undefined

  const activeModal =
    isGameOver ? 'gameOver' :
    pendingOfflineEarnings !== null ? 'offline' :
    scene ? 'scene' :
    pendingStarvationReport !== null ? 'starvation' :
    pendingFoodWarning > 0 ? 'foodWarning' :
    pendingMilestone !== null ? 'milestone' :
    pendingWanderer !== null ? 'wanderer' :
    null

  const handleSceneDismiss = () => {
    dismissScene()
    if (scene?.navigateTo) onNavigate(scene.navigateTo)
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
        onCollect={dismissOfflineEarnings}
      />
      {scene && (
        <NpcDialog
          key={sceneId}
          visible={activeModal === 'scene'}
          npcName={scene.speaker}
          icon={scene.icon}
          title={scene.title}
          lines={scene.lines}
          dismissLabel={scene.dismissLabel}
          onDismiss={handleSceneDismiss}
          onSkip={dismissScene}
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
