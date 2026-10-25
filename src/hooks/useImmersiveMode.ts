/**
 * Immersive Mode Hook
 *
 * Hides the Android system navigation bar for a full-screen game feel.
 * Players swipe up from the bottom edge to reveal it temporarily.
 * Re-applies on resume, since Android restores the bar when the app
 * returns from the background. No-op on iOS and web.
 */

import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'

async function hideNavigationBar() {
  try {
    await NavigationBar.setVisibilityAsync('hidden')
  } catch {
    // Silently fail if the launcher or device refuses the request
  }
}

export function useImmersiveMode() {
  useEffect(() => {
    if (Platform.OS !== 'android') return

    hideNavigationBar()
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') hideNavigationBar()
    })
    return () => sub.remove()
  }, [])
}
