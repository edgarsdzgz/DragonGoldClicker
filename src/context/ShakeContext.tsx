import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

/**
 * A request line from anywhere (a scripted event) to whichever screen shakes.
 * The screen passes `shakeNonce` to useScreenShake; each request changes it.
 */
interface ShakeContextType {
  shakeNonce: number
  requestShake: () => void
}

const ShakeContext = createContext<ShakeContextType>({ shakeNonce: 0, requestShake: () => {} })

export function ShakeProvider({ children }: { children: React.ReactNode }) {
  const [shakeNonce, setNonce] = useState(0)
  const requestShake = useCallback(() => setNonce((n) => n + 1), [])
  const value = useMemo(() => ({ shakeNonce, requestShake }), [shakeNonce, requestShake])
  return <ShakeContext.Provider value={value}>{children}</ShakeContext.Provider>
}

export function useShakeRequest(): ShakeContextType {
  return useContext(ShakeContext)
}
