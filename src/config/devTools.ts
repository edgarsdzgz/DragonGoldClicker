/**
 * Whether the test tools (Settings > Dev, game speed, test pacing, grants,
 * checkpoints) are available in this build.
 *
 * - Development builds (__DEV__): always on.
 * - Playtest builds: standalone release builds made with EXPO_PUBLIC_DEV_TOOLS=1
 *   in the build environment. Expo inlines EXPO_PUBLIC_* values at bundle time.
 * - Player builds: release builds without the flag. Tools are compiled off.
 */
export const DEV_TOOLS_ENABLED: boolean = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === '1'
