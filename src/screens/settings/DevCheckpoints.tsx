import React, { useState } from 'react'
import { View, StyleSheet, TextInput } from 'react-native'
import { Text, Surface, Button, SectionLabel, ConfirmModal } from '../../components'
import { useGame } from '../../context/GameContext'
import { useCheckpoints } from '../../hooks/useCheckpoints'
import type { Checkpoint } from '../../hooks/useCheckpoints'
import { DEFAULT_GAME_STATE, formatNumber } from '../../types/game'
import { colors, spacing, radius, typography } from '../../theme'

/** Dev panel section: save the current game under a name and load it back later. */
export function DevCheckpoints() {
  const { state, devApply } = useGame()
  const { checkpoints, saveCheckpoint, deleteCheckpoint } = useCheckpoints()
  const [name, setName] = useState('')
  const [pendingLoad, setPendingLoad] = useState<Checkpoint | null>(null)

  const handleSave = () => {
    saveCheckpoint(name, state)
    setName('')
  }

  const handleLoad = () => {
    if (!pendingLoad) return
    // Merge over defaults so checkpoints from older save formats still load
    const snapshot = pendingLoad.state
    devApply(() => ({ ...DEFAULT_GAME_STATE, ...snapshot, lastSavedAt: Date.now() }))
    setPendingLoad(null)
  }

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>CHECKPOINTS</SectionLabel>
      <View style={styles.saveRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name, e.g. before the breach"
          placeholderTextColor={colors.text.muted}
          accessibilityLabel="Checkpoint name"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        <Button size="sm" onPress={handleSave} icon="save-outline">Save</Button>
      </View>

      {checkpoints.length === 0 ? (
        <Text variant="caption" color="muted">No checkpoints yet. Save one before testing a scene so you can replay it.</Text>
      ) : (
        checkpoints.map((cp) => (
          <View key={cp.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="label">{cp.name}</Text>
              <Text variant="caption" color="muted">
                {`${new Date(cp.savedAt).toLocaleString()} - ${formatNumber(cp.state.inspiration)} renown, ${cp.state.fighters ?? 0} fighters`}
              </Text>
            </View>
            <Button size="xs" variant="secondary" onPress={() => setPendingLoad(cp)}>Load</Button>
            <Button size="xs" variant="ghost" onPress={() => deleteCheckpoint(cp.id)} accessibilityLabel={`Delete checkpoint ${cp.name}`}>Delete</Button>
          </View>
        ))
      )}

      <ConfirmModal
        visible={pendingLoad !== null}
        title="Load Checkpoint"
        message={`Replace the current game with "${pendingLoad?.name ?? ''}"? Save a checkpoint first if you want to come back to where you are.`}
        confirmLabel="Load"
        cancelLabel="Cancel"
        icon="refresh"
        onConfirm={handleLoad}
        onCancel={() => setPendingLoad(null)}
      />
    </Surface>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: colors.bg.surface2,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 48,
  },
  rowText: {
    flex: 1,
  },
})
