import { useEffect, useState } from 'react'
import { Skia, loadData } from '@shopify/react-native-skia'
import type { SkImage } from '@shopify/react-native-skia'
import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'

// Each sprite is decoded once and shared by every view that draws it
const loaded = new Map<SpriteId, SkImage>()
const loading = new Map<SpriteId, Promise<SkImage | null>>()

function load(id: SpriteId): Promise<SkImage | null> {
  let p = loading.get(id)
  if (!p) {
    p = loadData(SPRITES[id].source as number, (d) => Skia.Image.MakeImageFromEncoded(d))
      .catch(() => null)
      .then((img) => {
        if (img) loaded.set(id, img)
        // A failed load is forgotten, so the next view to ask tries again
        else loading.delete(id)
        return img
      })
    loading.set(id, p)
  }
  return p
}

/** The decoded sprite, or null while it loads (or if it could not be loaded) */
export function useSpriteImage(id: SpriteId): SkImage | null {
  const [, setVersion] = useState(0)
  const ready = loaded.get(id) ?? null
  useEffect(() => {
    if (loaded.has(id)) return
    let live = true
    load(id).then((img) => {
      if (live && img) setVersion((v) => v + 1)
    })
    return () => {
      live = false
    }
  }, [id])
  return ready
}
