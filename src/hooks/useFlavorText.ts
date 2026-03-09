import { useRef, useCallback, useState } from 'react'
import { Animated } from 'react-native'

/**
 * Returns a random flavor-text line on a click cooldown, with fade animation.
 *
 * @param lines  Pool of strings to pick from
 * @param min    Minimum clicks between messages (default 10)
 * @param max    Maximum clicks between messages (default 20)
 * @param hold   How long the text stays visible in ms (default 2500)
 */
export function useFlavorText(
  lines: readonly string[],
  { min = 40, max = 80, hold = 2500 } = {},
) {
  const opacity = useRef(new Animated.Value(0)).current
  const [text, setText] = useState('')

  const clicksSinceLastRef = useRef(0)
  const cooldownRef = useRef(randomBetween(min, max))
  const animatingRef = useRef(false)

  const onTick = useCallback(() => {
    clicksSinceLastRef.current += 1

    if (clicksSinceLastRef.current < cooldownRef.current) return
    if (animatingRef.current) return

    // Pick a random line
    const line = lines[Math.floor(Math.random() * lines.length)]
    setText(line)
    clicksSinceLastRef.current = 0
    cooldownRef.current = randomBetween(min, max)
    animatingRef.current = true

    // Fade in -> hold -> fade out
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(hold),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      animatingRef.current = false
    })
  }, [lines, min, max, hold, opacity])

  return { text, opacity, onTick }
}

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}
