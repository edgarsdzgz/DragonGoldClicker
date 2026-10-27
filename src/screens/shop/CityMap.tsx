import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Canvas, FilterMode, Image, MipmapMode } from '@shopify/react-native-skia'
import { MAP_PLOTS, SPRITES, litSprite, plotFor, plotLabel, plotMarker, plotSprite, useSpriteImage } from '../../art'
import type { CityBuildingId, CityLight, PlotLook, SpriteId } from '../../art'
import { PixelSprite } from '../../components/PixelSprite'
import { Text } from '../../components/Text'
import { useCoachTarget } from '../../hooks/useCoachTarget'
import type { Rect } from '../../context/coachRegistry'
import { colors, radius, spacing } from '../../theme'

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None }
const MAP_W = MAP_PLOTS.size[0]
const MAP_H = MAP_PLOTS.size[1]
/** Narrowest a plot's name label may be, in points */
const LABEL_MIN_W = 96

export interface CityPlot {
  id: CityBuildingId
  name: string
  look: PlotLook
  /** A second line under the name, e.g. the build cost */
  detail?: string
}

interface CityMapProps {
  plots: CityPlot[]
  /** Points per map pixel */
  unit: number
  /** The city's light (art/city.ts cityLight): every piece is drawn in it */
  light: CityLight
  onPress: (id: CityBuildingId) => void
  /** Plots that take part in the guided tutorial, by building id */
  coachIds?: Partial<Record<CityBuildingId, string>>
  scrollIntoView?: (rect: Rect) => void
}

/** A still sprite drawn into the map's canvas at map pixel (x, y) */
function MapSprite({ id, x, y, unit }: { id: SpriteId; x: number; y: number; unit: number }) {
  const img = useSpriteImage(id)
  if (!img) return null
  const def = SPRITES[id]
  return <Image image={img} x={x * unit} y={y * unit} width={def.w * unit} height={def.h * unit} fit="fill" sampling={NEAREST} />
}

function PlotButton({ plot, unit, onPress, coachId, scrollIntoView }: {
  plot: CityPlot
  unit: number
  onPress: () => void
  coachId?: string
  scrollIntoView?: (rect: Rect) => void
}) {
  const coach = useCoachTarget(coachId, scrollIntoView)
  const p = plotFor(plot.id)
  const box = { left: p.x * unit, top: p.y * unit, width: p.width * unit, height: p.height * unit }
  const labelW = Math.max(box.width, LABEL_MIN_W)
  const labelLeft = Math.max(0, Math.min(box.left + box.width / 2 - labelW / 2, MAP_W * unit - labelW))

  if (!plot.look.visible) {
    return <View style={[styles.plot, box]} accessible accessibilityLabel="Undiscovered building" />
  }
  return (
    <>
      <Pressable
        ref={coach.ref}
        onLayout={coach.onLayout}
        onPress={onPress}
        style={({ pressed }) => [styles.plot, box, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={plotLabel(plot.name, plot.detail, plot.look)}
      />
      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.label, { left: labelLeft, top: box.top + box.height, width: labelW }]}
      >
        <View style={styles.chip}>
          <Text variant="caption" center numberOfLines={1} style={styles.labelText}>{plot.name}</Text>
          {plot.detail && <Text variant="caption" center numberOfLines={1} style={styles.detailText}>{plot.detail}</Text>}
        </View>
      </View>
    </>
  )
}

/**
 * Draconia as a map: the city's base map with every building on its plot, drawn as fog until
 * its beat reveals it, then its ruin, then the building at its level, with a marker when it can be
 * built or something waits inside. Each revealed plot is a button with its name under it. The
 * whole map is drawn in the city's light: night, dusk, or lit.
 */
export function CityMap({ plots, unit, light, onPress, coachIds, scrollIntoView }: CityMapProps) {
  const base = useSpriteImage(litSprite('map_city_base', light))
  const drawn = plots.map((plot) => {
    const p = plotFor(plot.id)
    const sprite = litSprite(plotSprite(plot.id, plot.look), light)
    const lit = plotMarker(plot.look)
    const marker = lit && litSprite(lit, light)
    return { plot, p, sprite, animated: SPRITES[sprite].frames > 1, marker }
  })

  return (
    <View style={{ width: MAP_W * unit, height: MAP_H * unit }}>
      <Canvas style={StyleSheet.absoluteFill} opaque>
        {base && <Image image={base} x={0} y={0} width={MAP_W * unit} height={MAP_H * unit} fit="fill" sampling={NEAREST} />}
        {drawn.map((d) => !d.animated && <MapSprite key={d.plot.id} id={d.sprite} x={d.p.x} y={d.p.y} unit={unit} />)}
        {drawn.map((d) => d.marker && (
          <MapSprite key={`${d.plot.id}-marker`} id={d.marker} x={d.p.x + d.p.width / 2 - SPRITES[d.marker].w / 2} y={d.p.y - 2} unit={unit} />
        ))}
      </Canvas>
      {drawn.map((d) => d.animated && (
        <PixelSprite key={d.plot.id} id={d.sprite} scale={unit} style={{ position: 'absolute', left: d.p.x * unit, top: d.p.y * unit }} />
      ))}
      {plots.map((plot) => (
        <PlotButton
          key={plot.id}
          plot={plot}
          unit={unit}
          onPress={() => onPress(plot.id)}
          coachId={coachIds?.[plot.id]}
          scrollIntoView={scrollIntoView}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  plot: {
    position: 'absolute',
    borderRadius: radius.sm,
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing[1],
    borderRadius: radius.sm,
    backgroundColor: 'rgba(10,8,14,0.72)',
  },
  labelText: {
    color: colors.text.primary,
  },
  detailText: {
    color: colors.text.secondary,
  },
})
