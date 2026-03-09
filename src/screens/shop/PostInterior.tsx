import React from 'react'
import { View, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text, ActionRow, Button, StatBox, Badge, SectionLabel, InspirationIcon, ExpeditionReportModal } from '../../components'
import type { ExpeditionReport } from '../../components'
import { REJECT_GOLD, REJECT_MAXED, REJECT_NO_POP } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useGame } from '../../context/GameContext'
import { useHaptics } from '../../hooks'
import { colors, spacing, gold } from '../../theme'
import {
  formatNumber,
  getExplorerCap,
  getPostUpgradeCost,
  EXPLORER_COST,
  EXPEDITION_INSPIRATION_COST,
  EXPEDITION_FOOD_COST,
  EXPEDITION_DURATION,
  EXPEDITION_PITY_THRESHOLD,
} from '../../types/game'
import { CapacitySection, DescriptionBanner } from './shared'
import { SummaryBar } from './SummaryBar'
import { styles, expStyles } from './interiorStyles'

const EXPLORER_GRADIENT = ['#3b82f6', '#93c5fd'] as [string, string]

// =============================================================================
// EXPEDITION ROW
// =============================================================================

interface ExpeditionRowProps {
  expedition: { id: number; startedAt: number; duration: number }
  onClaimed: (report: ExpeditionReport) => void
}

function ExpeditionRow({ expedition, onClaimed }: ExpeditionRowProps) {
  const { claimExpedition } = useGame()
  const haptics = useHaptics()
  const [now, setNow] = React.useState(Date.now())

  const elapsed = (now - expedition.startedAt) / 1000
  const done = elapsed >= expedition.duration

  React.useEffect(() => {
    if (done) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [done])

  const remaining = Math.max(0, expedition.duration - elapsed)
  const progress = Math.min(1, elapsed / expedition.duration)

  const handleClaim = () => {
    haptics.medium()
    const r = claimExpedition(expedition.id)
    if (r) {
      onClaimed({ expeditionId: expedition.id, villagersFound: r.villagersFound })
    }
  }

  return (
    <ActionRow
      icon="compass"
      iconColor={colors.building.explorer}
      title={`Expedition #${expedition.id}`}
      subtitle={done ? 'Returned! Ready to claim.' : `${Math.ceil(remaining)}s remaining`}
      right={
        done ? (
          <Button
            size="xs"
            accentColor={colors.building.explorer}
            onPress={handleClaim}
          >
            CLAIM
          </Button>
        ) : (
          <View style={expStyles.progressPct}>
            <Text variant="caption" bold style={{ color: colors.building.explorer }}>
              {Math.floor(progress * 100)}%
            </Text>
          </View>
        )
      }
    >
      <ProgressBar progress={progress} gradientColors={EXPLORER_GRADIENT} />
    </ActionRow>
  )
}

// =============================================================================
// POST INTERIOR
// =============================================================================

export function PostInterior() {
  const { state, buildOrUpgradePost, trainExplorer, sendExpedition } = useGame()
  const haptics = useHaptics()
  const [report, setReport] = React.useState<ExpeditionReport | null>(null)
  const cap = getExplorerCap(state.postLevel)
  const upgradeCost = getPostUpgradeCost(state.postLevel)
  const canUpgrade = upgradeCost !== null && state.inspiration >= upgradeCost
  const canTrain = state.explorers < cap && state.villagers > 0 && state.inspiration >= EXPLORER_COST
  const availableExplorers = state.explorers - state.activeExpeditions.length
  const canSend = availableExplorers > 0 && state.inspiration >= EXPEDITION_INSPIRATION_COST && state.food >= EXPEDITION_FOOD_COST

  const handleTrain = () => {
    if (!canTrain) return
    haptics.medium()
    trainExplorer()
  }

  const handleSend = () => {
    if (!canSend) return
    haptics.medium()
    sendExpedition()
  }

  // Pity tracker dots
  const pityDots = Array.from({ length: EXPEDITION_PITY_THRESHOLD }, (_, i) => i < state.expeditionDryStreak)

  const trainLabel = state.explorers >= cap ? 'FULL' : state.villagers <= 0 ? 'NO POP' : `${EXPLORER_COST} g`
  const canUpgradePost = getPostUpgradeCost(state.postLevel) !== null
  const trainRejectPhrases = state.explorers >= cap
    ? canUpgradePost
      ? ['Upgrade the Outpost for more room', 'The outpost is full -- time to expand']
      : REJECT_MAXED
    : state.villagers <= 0
      ? REJECT_NO_POP
      : REJECT_GOLD

  return (
    <View style={styles.interiorContainer}>
      {/* Summary bar */}
      <SummaryBar>
        <StatBox value={`${state.explorers}/${cap}`} label="Explorers" valueColor={colors.building.explorer} />
        <StatBox
          value={availableExplorers}
          label={availableExplorers > 0 ? 'Available' : 'Deployed'}
          valueColor={availableExplorers > 0 ? colors.building.explorer : colors.text.muted}
        />
        <StatBox value={state.villagersRescued} label="Rescued" />
      </SummaryBar>

      {/* Capacity bar */}
      <CapacitySection
        label="Explorer Capacity"
        current={state.explorers}
        max={cap}
        gradientColors={EXPLORER_GRADIENT}
      />

      {/* Description banner */}
      <DescriptionBanner icon="compass" color={colors.building.explorer}>
        <Text variant="bodySmall" color="secondary">
          Send explorers into the wasteland to find lost villagers.
        </Text>
      </DescriptionBanner>

      {/* Cost chips */}
      <View style={expStyles.costChipRow}>
        <Badge icon="time" color={colors.text.muted} variant="ghost" size="sm">
          <Text variant="caption" color="muted">{EXPEDITION_DURATION}s</Text>
        </Badge>
        <Badge iconElement={<InspirationIcon size={8} />} color={gold[400]} variant="ghost" size="sm">
          <Text variant="caption" color="muted">{EXPEDITION_INSPIRATION_COST}</Text>
        </Badge>
        <Badge icon="nutrition" color={colors.text.secondary} variant="ghost" size="sm">
          <Text variant="caption" color="muted">{EXPEDITION_FOOD_COST}</Text>
        </Badge>
      </View>

      {/* Pity tracker */}
      <View style={expStyles.pityRow}>
        <Text variant="caption" color="muted">Luck streak:</Text>
        <View style={expStyles.pityDots}>
          {pityDots.map((filled, i) => (
            <View
              key={i}
              style={[
                expStyles.pityDot,
                filled ? expStyles.pityDotFilled : expStyles.pityDotEmpty,
              ]}
            />
          ))}
        </View>
        <Text variant="caption" color="muted">
          {state.expeditionDryStreak >= EXPEDITION_PITY_THRESHOLD ? 'GUARANTEED' : `${state.expeditionDryStreak}/${EXPEDITION_PITY_THRESHOLD}`}
        </Text>
      </View>

      {/* Train explorer */}
      <ActionRow
        icon="person-add"
        iconColor={colors.building.explorer}
        title="Train Explorer"
        subtitle={`${state.explorers}/${cap} trained -- consumes 1 villager`}
        right={
          <Button
            size="xs"
            accentColor={colors.building.explorer}
            onPress={handleTrain}
            disabled={!canTrain}
            rejectPhrases={trainRejectPhrases}
          >
            {trainLabel}
          </Button>
        }
      />

      {/* Send expedition */}
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={({ pressed }) => [
          expStyles.sendBtnGradientWrap,
          !canSend && { opacity: 0.4 },
          pressed && canSend && expStyles.sendBtnPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Send expedition for ${EXPEDITION_INSPIRATION_COST} inspiration and ${EXPEDITION_FOOD_COST} food`}
      >
        <LinearGradient
          colors={canSend
            ? ['#3b82f6', '#2563eb'] as [string, string]
            : [colors.bg.surface3, colors.bg.surface2] as [string, string]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={expStyles.sendBtnGradient}
        >
          <Ionicons
            name="compass"
            size={16}
            color={canSend ? '#ffffff' : colors.text.muted}
          />
          <Text
            variant="button"
            style={{ color: canSend ? '#ffffff' : colors.text.muted }}
          >
            Send Expedition
          </Text>
          <View style={expStyles.sendCostPills}>
            <View style={expStyles.sendCostPill}>
              <InspirationIcon size={8} color={canSend ? 'rgba(255,255,255,0.8)' : colors.text.muted} />
              <Text variant="caption" style={{ color: canSend ? 'rgba(255,255,255,0.9)' : colors.text.muted }}>
                {EXPEDITION_INSPIRATION_COST}
              </Text>
            </View>
            <View style={expStyles.sendCostPill}>
              <Ionicons name="nutrition" size={10} color={canSend ? 'rgba(255,255,255,0.8)' : colors.text.muted} />
              <Text variant="caption" style={{ color: canSend ? 'rgba(255,255,255,0.9)' : colors.text.muted }}>
                {EXPEDITION_FOOD_COST}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {/* Active expeditions */}
      {state.activeExpeditions.length > 0 && (
        <>
          <SectionLabel>ACTIVE EXPEDITIONS</SectionLabel>
          <View style={styles.tiersSection}>
            {state.activeExpeditions.map((exp) => (
              <ExpeditionRow key={exp.id} expedition={exp} onClaimed={setReport} />
            ))}
          </View>
        </>
      )}

      {/* Upgrade button */}
      {upgradeCost !== null && (
        <Button
          size="sm"
          icon="arrow-up-circle"
          onPress={buildOrUpgradePost}
          disabled={!canUpgrade}
          accentColor={colors.building.explorer}
          rejectPhrases={REJECT_GOLD}
          fullWidth
        >
          {`Upgrade to Lv${state.postLevel + 1} - ${formatNumber(upgradeCost)} insp`}
        </Button>
      )}

      <ExpeditionReportModal
        visible={report !== null}
        report={report}
        onDismiss={() => setReport(null)}
      />
    </View>
  )
}
