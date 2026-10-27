import AsyncStorage from '@react-native-async-storage/async-storage'
import { readSave, setAsideBrokenSave } from '../useStorage'

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))

const KEY = '@dragongold/gamestate'

beforeEach(async () => {
  await AsyncStorage.clear()
})

describe('the save slot', () => {
  it('no save is a new game, not an error', async () => {
    await expect(readSave()).resolves.toBeNull()
  })

  it('a save is read and upgraded', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ inspiration: 7, saveMigrationVersion: 1, lastSavedAt: 1 }))
    const s = await readSave()
    expect(s?.inspiration).toBe(7)
  })

  it('a broken save is an error, so it is never taken for a new game and overwritten', async () => {
    await AsyncStorage.setItem(KEY, '{broken')
    await expect(readSave()).rejects.toThrow()
  })

  it('a new game keeps the broken save aside under its own key, then clears the slot', async () => {
    await AsyncStorage.setItem(KEY, '{broken')
    await setAsideBrokenSave(42)
    await expect(AsyncStorage.getItem(`${KEY}_unreadable_42`)).resolves.toBe('{broken')
    await expect(AsyncStorage.getItem(KEY)).resolves.toBeNull()
    await expect(readSave()).resolves.toBeNull()
  })
})
