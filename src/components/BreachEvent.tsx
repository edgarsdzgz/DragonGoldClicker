import React, { useState } from 'react'
import { NpcDialog } from './NpcDialog'
import { ReportModal } from './ReportModal'
import { BREACH_SCENES } from '../data/story/lines'
import { breachLines } from '../types/breach'
import type { BreachReport } from '../types/breach'
import { colors } from '../theme'
import { BREACH_REPORT_PICTURE } from '../art'

interface BreachEventProps {
  visible: boolean
  report: BreachReport
  onDone: () => void
}

/**
 * The Breach (core-tap layer 6): the scenes in order (the full one the first time, a short one
 * after), then the report of what it cost. Closing the app midway replays it from the start.
 */
export function BreachEvent({ visible, report, onDone }: BreachEventProps) {
  const scenes = report.count === 1 ? BREACH_SCENES.first : BREACH_SCENES.again
  const [step, setStep] = useState(0)
  const scene = scenes[step]
  const next = () => setStep((i) => i + 1)

  if (scene) {
    return (
      <NpcDialog
        visible={visible}
        npcName={scene.speaker}
        icon={scene.icon}
        who={scene.who}
        mood={scene.mood}
        lineMoods={scene.lineMoods}
        stage={scene.stage}
        title={scene.title}
        picture={scene.picture}
        lines={scene.lines}
        dismissLabel={scene.dismissLabel}
        onDismiss={next}
      />
    )
  }

  const lost = report.renownAfter < 0 ? ' Your renown is in debt: kills pay it back.' : ''
  return (
    <ReportModal
      visible={visible}
      icon="flame"
      picture={BREACH_REPORT_PICTURE}
      accent={colors.status.error}
      title={report.count === 1 ? 'The Breach' : `Breach ${report.count}`}
      message={`The wall fell, and Draconia paid to survive it.${lost}`}
      rows={breachLines(report).map((l) => ({
        icon: l.kind === 'loss' ? 'close-circle' : 'shield-checkmark',
        text: l.text,
        color: l.kind === 'loss' ? colors.status.error : colors.status.success,
      }))}
      dismissLabel="Rebuild"
      dismissOnBackdrop={false}
      onDismiss={onDone}
    />
  )
}
