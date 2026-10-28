import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { getScene, sceneParts, OFFLINE_FRAMING } from '../data/story/lines'
import { sceneSting } from '../data/story/stings'
import type { SceneTab } from '../data/story/lines'
import type { BeatId } from '../types/story'
import { markScripted, hasRun } from '../types/scripted'
import { OfflineModal } from './OfflineModal'
import { NpcDialog } from './NpcDialog'
import { FoodWarningModal } from './FoodWarningModal'
import { ConfirmModal } from './ConfirmModal'
import { REFUGEE_FOOD_EACH } from '../types/foodEvents'
import { useActiveEvent } from '../hooks/useActiveEvent'
import { WandererModal } from './WandererModal'
import { BreachEvent } from './BreachEvent'
import { wallAwayLine } from '../types/timeAway'
import { useSfx } from '../hooks/useSfx'
import { SOUND } from '../data/sounds'
import { REFUGEES_PICTURE } from '../art'

interface EventHostProps {
  /** Switches the visible tab (the host lives above the tab navigator) */
  onNavigate: (tab: SceneTab) => void
  /** Called when a scene is closed (read or skipped), but not for replays */
  onSceneClosed?: (id: BeatId) => void
}

/**
 * The only place pop-ups are shown, mounted once above the tabs so events appear on
 * every screen. One at a time, highest priority first:
 * the Breach > offline > story scene > food warning > refugees > wanderer.
 */
export function EventHost({ onNavigate, onSceneClosed }: EventHostProps) {
  const {
    state, applyScripted, dismissBreach,
    pendingOfflineEarnings, dismissOfflineEarnings,
    pendingFoodWarning, dismissFoodWarning, answerRefugees,
    pendingWanderer, acceptWanderer, rejectWanderer,
  } = useGame()
  const { scenes, dismissScene } = useStory()

  const queued = scenes[0]
  const scene = queued ? getScene(queued.id) : undefined
  // A conversation plays its speakers' scenes in turn on one stage; the step belongs to its queue entry
  const [step, setStep] = useState({ uid: 0, at: 0 })
  const parts = scene ? sceneParts(scene) : []
  const at = queued && step.uid === queued.uid ? step.at : 0
  const part = parts[at]

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
  // The next speaker of a conversation, or the end of the scene
  const handlePartDone = () => {
    if (queued && at + 1 < parts.length) setStep({ uid: queued.uid, at: at + 1 })
    else handleSceneClose()
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
      {part && (
        <NpcDialog
          key={queued?.uid}
          visible={activeModal === 'scene'}
          npcName={part.speaker}
          icon={part.icon}
          who={part.who}
          mood={part.mood}
          lineMoods={part.lineMoods}
          stage={part.stage}
          title={part.title}
          picture={part.picture}
          sting={queued && !queued.replay && at === 0 ? sceneSting(queued.id) : undefined}
          lines={queued?.alt && part.altLines ? part.altLines : part.lines}
          dismissLabel={part.dismissLabel}
          onDismiss={handlePartDone}
          onSkip={handleSceneClose}
          cutscene={part.cutscene}
          highlight={part.highlight}
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
      {/* Refugees at the Gate (layer 3, phase C): take them in, fed on arrival, or turn them away */}
      {state.foodEvent?.phase === 'choice' && (
        <RefugeesChoice
          visible={activeModal === 'refugees'}
          count={state.foodEvent.refugees ?? 0}
          food={state.food}
          onAnswer={answerRefugees}
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
  // A knock at the gate
  const playKnock = useSfx(SOUND.gateKnock)
  useEffect(() => {
    if (visible) playKnock()
  }, [visible, playKnock])
  return (
    <ConfirmModal
      visible={visible}
      title="Refugees at the Gate"
      message={`${count} refugees reach the gate, hungry and exhausted. Take them in: ${count} more villagers, who eat ${cost} food from the stores when they arrive.${affordable ? '' : ' The stores cannot feed them right now.'}`}
      confirmLabel="Take them in"
      cancelLabel="Turn them away"
      confirmDisabled={!affordable}
      picture={REFUGEES_PICTURE}
      onConfirm={() => onAnswer(true)}
      onCancel={() => onAnswer(false)}
    />
  )
}
