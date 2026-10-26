import React, { useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { getScene, OFFLINE_FRAMING } from '../data/story/lines'
import type { SceneTab } from '../data/story/lines'
import type { BeatId } from '../types/story'
import { markScripted, hasRun } from '../types/scripted'
import { isSystemOn } from '../types/systems'
import { OfflineModal } from './OfflineModal'
import { NpcDialog } from './NpcDialog'
import { FoodWarningModal } from './FoodWarningModal'
import { ConfirmModal } from './ConfirmModal'
import { REFUGEE_FOOD_EACH } from '../types/foodEvents'
import { useActiveEvent } from '../hooks/useActiveEvent'
import { StarvationModal } from './StarvationModal'
import { WandererModal } from './WandererModal'
import { MilestoneModal } from './MilestoneModal'
import { BreachEvent } from './BreachEvent'
import { wallAwayLine } from '../types/timeAway'

interface EventHostProps {
  /** Switches the visible tab (the host lives above the tab navigator) */
  onNavigate: (tab: SceneTab) => void
  /** Called when a scene is closed (read or skipped), but not for replays */
  onSceneClosed?: (id: BeatId) => void
}

/**
 * The only place pop-ups are shown, mounted once above the tabs so events appear on
 * every screen. One at a time, highest priority first:
 * the Breach > offline > story scene > starvation > food warning > milestone > wanderer.
 */
export function EventHost({ onNavigate, onSceneClosed }: EventHostProps) {
  const {
    state, applyScripted, dismissBreach,
    pendingOfflineEarnings, dismissOfflineEarnings,
    pendingStarvationReport, dismissStarvationReport,
    pendingFoodWarning, dismissFoodWarning, answerRefugees,
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
        wallLine={pendingOfflineEarnings?.wall ? wallAwayLine(pendingOfflineEarnings.wall) : undefined}
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
          starvationOn={isSystemOn(state, 'starvation')}
          onGoToForage={handleFoodWarningGoForage}
          onDismiss={dismissFoodWarning}
        />
      )}
      {/* Refugees at the Gate (layer 3, phase C): take them in, fed on arrival, or turn them away */}
      {state.foodEvent?.phase === 'choice' && (
        <RefugeesChoice
          visible={activeModal === 'refugees'}
          count={state.foodEvent.refugees ?? 0}
          food={state.food}
          onAnswer={answerRefugees}
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
      {state.pendingBreach !== null && (
        <BreachEvent
          key={state.pendingBreach.count}
          visible={activeModal === 'breach'}
          report={state.pendingBreach}
          onDone={dismissBreach}
        />
      )}
    </>
  )
}

function RefugeesChoice({ visible, count, food, onAnswer }: { visible: boolean; count: number; food: number; onAnswer: (takeIn: boolean) => void }) {
  const cost = count * REFUGEE_FOOD_EACH
  const affordable = food >= cost
  return (
    <ConfirmModal
      visible={visible}
      title="Refugees at the Gate"
      message={`${count} refugees reach the gate, hungry and exhausted. Take them in: ${count} more villagers, who eat ${cost} food from the stores when they arrive.${affordable ? '' : ' The stores cannot feed them right now.'}`}
      confirmLabel="Take them in"
      cancelLabel="Turn them away"
      confirmDisabled={!affordable}
      icon="people"
      onConfirm={() => onAnswer(true)}
      onCancel={() => onAnswer(false)}
    />
  )
}
