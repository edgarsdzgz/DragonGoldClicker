import React from 'react'
import { View, Pressable } from 'react-native'
import { GameIcon } from '../../components/GameIcon'
import { Text, ActionRow, Button, StatBox, Badge, SectionLabel, InspirationIcon, ExpeditionReportModal } from '../../components'
import { REJECT_GOLD, REJECT_MAXED, REJECT_NO_POP } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { useGame } from '../../context/GameContext'
import { useHaptics } from '../../hooks'
import { colors, dark } from '../../theme'
import { roleFigure } from '../../art'
import { formatNumber, getExplorerCap, getPostUpgradeCost, EXPEDITION_FOOD_COST, EXPEDITION_PITY_THRESHOLD } from '../../types/game'
import {
  explorerBlock, explorerCost, expeditionBlock, expeditionSeconds, explorersFree, isExpeditionBack, postBlock,
} from '../../types/outpost'
import type { ExplorerBlock } from '../../types/outpost'
import { CapacitySection, DescriptionBanner } from './shared'
import { SummaryBar } from './SummaryBar'
import { styles, expStyles } from './interiorStyles'

// =============================================================================
// THE OUTPOST (chapter 7, Beyond the Walls): explorers bring people home, paid in food
// =============================================================================

const EXPLORER_GRADIENT: [string, string] = [colors.explorer.glow, colors.explorer.soft]

/** "5 min" or "3 min 45 s" */
function minutes(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return s === 0 ? `${m} min` : `${m} min ${s} s`
}

const TRAIN_LABEL: Record<Exclude<ExplorerBlock, null | 'renown'>, string> = {
  noOutpost: 'BUILD FIRST',
  full: 'FULL',
  nobody: 'NO VILLAGERS',
}

function ExpeditionRow({ expedition }: { expedition: { id: number; startedAt: number; duration: number } }) {
  const { claimExpedition } = useGame()
  const haptics = useHaptics()
  const [now, setNow] = React.useState(Date.now())
  const back = isExpeditionBack(expedition, now)

  React.useEffect(() => {
    if (back) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [back])

  const elapsed = (now - expedition.startedAt) / 1000
  const progress = Math.min(1, elapsed / expedition.duration)

  const handleClaim = () => {
    haptics.medium()
    claimExpedition(expedition.id)
  }

  return (
    <ActionRow
      icon="compass"
      iconColor={colors.building.explorer}
      title={`Expedition #${expedition.id}`}
      subtitle={back ? 'Back home. See who came with them.' : `${minutes(Math.ceil(expedition.duration - elapsed))} to go`}
      right={
        back ? (
          <Button size="xs" accentColor={colors.building.explorer} onPress={handleClaim}>
            WELCOME
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

export function PostInterior() {
  const { state, buildOrUpgradePost, trainExplorer, sendExpedition, dismissExpeditionReport } = useGame()
  const haptics = useHaptics()
  const cap = getExplorerCap(state.postLevel)
  const upgradeCost = getPostUpgradeCost(state.postLevel)
  const trainBlock = explorerBlock(state)
  const sendBlock = expeditionBlock(state)
  const canSend = sendBlock === null
  const free = explorersFree(state)
  const tripSec = expeditionSeconds(state)

  const handleTrain = () => {
    if (trainBlock !== null) return
    haptics.medium()
    trainExplorer()
  }

  const handleSend = () => {
    if (!canSend) return
    haptics.medium()
    sendExpedition()
  }

  const pityDots = Array.from({ length: EXPEDITION_PITY_THRESHOLD }, (_, i) => i < state.expeditionDryStreak)
  const trainRejectPhrases = trainBlock === 'full'
    ? (upgradeCost !== null ? ['Upgrade the Outpost for more room', 'The Outpost is full'] : REJECT_MAXED)
    : trainBlock === 'nobody' ? REJECT_NO_POP : REJECT_GOLD
  // Nobody free: either none trained yet, or all of them away on a journey
  const noneFree = state.explorers > 0 ? 'Everyone is out' : 'Train an explorer first'
  const sendLabel = sendBlock === 'nobody' ? noneFree : sendBlock === 'food' ? 'Not enough food' : 'Send Expedition'

  return (
    <View style={styles.interiorContainer}>
      <SummaryBar>
        <StatBox value={`${state.explorers}/${cap}`} label="Explorers" valueColor={colors.building.explorer} />
        <StatBox value={free} label="At home" valueColor={free > 0 ? colors.building.explorer : colors.text.muted} />
        <StatBox value={state.villagersRescued} label="Brought home" />
      </SummaryBar>

      <CapacitySection label="Explorer Capacity" current={state.explorers} max={cap} gradientColors={EXPLORER_GRADIENT} />

      <DescriptionBanner icon="compass" color={colors.building.explorer}>
        <Text variant="bodySmall" color="secondary">
          Each journey costs food. Explorers come back with up to three people, or none.
        </Text>
      </DescriptionBanner>

      <View style={expStyles.costChipRow}>
        <Badge icon="time" color={colors.text.muted} variant="ghost" size="sm">
          <Text variant="caption" color="muted">{minutes(tripSec)}</Text>
        </Badge>
        <Badge icon="nutrition" color={colors.text.secondary} variant="ghost" size="sm">
          <Text variant="caption" color="muted">{`${EXPEDITION_FOOD_COST} food`}</Text>
        </Badge>
      </View>

      <View style={expStyles.pityRow} accessibilityLabel={`${state.expeditionDryStreak} of ${EXPEDITION_PITY_THRESHOLD} empty journeys; after ${EXPEDITION_PITY_THRESHOLD}, the next finds someone`}>
        <Text variant="caption" color="muted">Empty journeys:</Text>
        <View style={expStyles.pityDots}>
          {pityDots.map((filled, i) => (
            <View key={i} style={[expStyles.pityDot, filled ? expStyles.pityDotFilled : expStyles.pityDotEmpty]} />
          ))}
        </View>
        <Text variant="caption" color="muted">
          {state.expeditionDryStreak >= EXPEDITION_PITY_THRESHOLD ? 'NEXT FINDS SOMEONE' : `${state.expeditionDryStreak}/${EXPEDITION_PITY_THRESHOLD}`}
        </Text>
      </View>

      <ActionRow
        figure={roleFigure('explorer')}
        title="Train Explorer"
        subtitle={`${state.explorers}/${cap} trained. Takes a villager; eats 2 food a meal.`}
        right={
          <Button
            size="xs"
            accentColor={colors.building.explorer}
            iconElement={trainBlock === null || trainBlock === 'renown' ? <InspirationIcon size={7} /> : undefined}
            onPress={handleTrain}
            disabled={trainBlock !== null}
            rejectPhrases={trainRejectPhrases}
          >
            {trainBlock === null || trainBlock === 'renown' ? formatNumber(explorerCost(state)) : TRAIN_LABEL[trainBlock]}
          </Button>
        }
      />

      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={({ pressed }) => [expStyles.sendBtnWrap, !canSend && { opacity: 0.4 }, pressed && canSend && expStyles.sendBtnPressed]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend }}
        accessibilityLabel={canSend ? `Send an expedition for ${EXPEDITION_FOOD_COST} food` : sendLabel}
      >
        <View style={[expStyles.sendBtnFace, { backgroundColor: canSend ? colors.explorer.accent : colors.bg.surface2 }]}>
          <GameIcon name="compass" size={16} color={canSend ? dark[900] : colors.text.muted} dim={!canSend} />
          <Text variant="button" style={{ color: canSend ? dark[900] : colors.text.muted }}>
            {sendLabel}
          </Text>
          <View style={expStyles.sendCostPills}>
            <View style={expStyles.sendCostPill}>
              <GameIcon name="nutrition" size={10} color={canSend ? dark[900] : colors.text.muted} dim={!canSend} />
              <Text variant="caption" style={{ color: canSend ? dark[900] : colors.text.muted }}>
                {EXPEDITION_FOOD_COST}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      {state.activeExpeditions.length > 0 && (
        <>
          <SectionLabel>OUT IN THE VALLEY</SectionLabel>
          <View style={styles.tiersSection}>
            {state.activeExpeditions.map((exp) => (
              <ExpeditionRow key={exp.id} expedition={exp} />
            ))}
          </View>
        </>
      )}

      {upgradeCost !== null && (
        <Button
          size="sm"
          icon="arrow-up-circle"
          onPress={buildOrUpgradePost}
          disabled={postBlock(state) !== null}
          accentColor={colors.building.explorer}
          rejectPhrases={REJECT_GOLD}
          fullWidth
        >
          {`Upgrade to Lv${state.postLevel + 1} - ${formatNumber(upgradeCost)} renown`}
        </Button>
      )}

      <ExpeditionReportModal
        visible={state.expeditionReport !== null}
        report={state.expeditionReport}
        onDismiss={dismissExpeditionReport}
      />
    </View>
  )
}
