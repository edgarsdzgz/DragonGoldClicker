import React from 'react'
import { ReportModal } from './ReportModal'
import type { StarvationResult } from '../types/game'
import { colors } from '../theme'

interface StarvationModalProps {
  visible: boolean
  report: StarvationResult
  onDismiss: () => void
}

function buildDeathLines(report: StarvationResult): string[] {
  const lines: string[] = []
  if (report.villagersLost > 0) {
    lines.push(`${report.villagersLost} idle villager${report.villagersLost > 1 ? 's' : ''} starved`)
  }
  if (report.soldiersLost.conscripts > 0) {
    lines.push(`${report.soldiersLost.conscripts} conscript${report.soldiersLost.conscripts > 1 ? 's' : ''} starved`)
  }
  if (report.soldiersLost.footmen > 0) {
    lines.push(`${report.soldiersLost.footmen} footm${report.soldiersLost.footmen > 1 ? 'en' : 'an'} starved`)
  }
  if (report.soldiersLost.knights > 0) {
    lines.push(`${report.soldiersLost.knights} knight${report.soldiersLost.knights > 1 ? 's' : ''} starved`)
  }
  if (report.foragersLost.gatherers > 0) {
    lines.push(`${report.foragersLost.gatherers} gatherer${report.foragersLost.gatherers > 1 ? 's' : ''} starved`)
  }
  if (report.foragersLost.trappers > 0) {
    lines.push(`${report.foragersLost.trappers} trapper${report.foragersLost.trappers > 1 ? 's' : ''} starved`)
  }
  if (report.foragersLost.rangers > 0) {
    lines.push(`${report.foragersLost.rangers} ranger${report.foragersLost.rangers > 1 ? 's' : ''} starved`)
  }
  if (report.explorersLost > 0) {
    lines.push(`${report.explorersLost} explorer${report.explorersLost > 1 ? 's' : ''} starved`)
  }
  return lines
}

export function StarvationModal({ visible, report, onDismiss }: StarvationModalProps) {
  const lines = buildDeathLines(report)
  const totalLost = report.villagersLost +
    report.soldiersLost.conscripts + report.soldiersLost.footmen + report.soldiersLost.knights +
    report.foragersLost.gatherers + report.foragersLost.trappers + report.foragersLost.rangers +
    report.explorersLost

  return (
    <ReportModal
      visible={visible}
      icon="skull"
      accent={colors.status.error}
      title={totalLost === 1 ? 'A Villager Has Died' : `${totalLost} Have Perished`}
      message="Starvation has claimed your people. Gather food to prevent more deaths."
      rows={lines.map((text) => ({ icon: 'close-circle', text }))}
      onDismiss={onDismiss}
    />
  )
}
