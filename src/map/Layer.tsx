import type { AnyLayer, GeoJSONSourceRaw, MapLayerMouseEvent } from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import type { Feature, FeatureCollection } from 'geojson'
import { useMapContext } from './MapContext'
import { diffKeys } from './diffProps'

export type LayerType = Extract<AnyLayer['type'], 'circle' | 'heatmap' | 'line' | 'fill' | 'symbol'>

export interface LayerProps {
  id: string
  type: LayerType
  data: FeatureCollection | Feature
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
  beforeId?: string
  onClick?: (feature: Feature) => void
}

/**
 * Renders nothing. Owns exactly one GeoJSON source + one style layer, and
 * keeps both in sync with its props for as long as it stays mounted:
 *
 *   mount    -> map.addSource(...) + map.addLayer(...)
 *   update   -> source.setData(...) / map.setPaintProperty(...) / setLayoutProperty(...)
 *   unmount  -> map.removeLayer(...) + map.removeSource(...)
 *
 * Sibling <Layer/> elements stack in the order they're rendered, same as
 * DOM elements — later ones paint on top, matching ordinary JSX intuition.
 */
export function Layer({ id, type, data, paint = {}, layout = {}, beforeId, onClick }: LayerProps) {
  const { map, isStyleLoaded } = useMapContext()
  const sourceId = `${id}-source`
  const isMountedRef = useRef(false)
  const prevPaintRef = useRef<Record<string, unknown>>({})
  const prevLayoutRef = useRef<Record<string, unknown>>({})
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick
  // Only read at mount time (the initial position); subsequent changes are
  // applied reactively via `moveLayer` further down.
  const beforeIdRef = useRef(beforeId)

  // Mount / unmount only — reacting to `type` changing would require
  // different handling than a plain update, so it's treated as a
  // "recreate the layer" prop via the dep array. `beforeId` is deliberately
  // left out here; it's handled reactively below via `moveLayer` instead.
  useEffect(() => {
    if (!map || !isStyleLoaded) return

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: 'geojson', data } satisfies GeoJSONSourceRaw)
    }
    if (!map.getLayer(id)) {
      map.addLayer({ id, type, source: sourceId, paint, layout } as AnyLayer, beforeIdRef.current)
    }
    prevPaintRef.current = paint
    prevLayoutRef.current = layout
    isMountedRef.current = true

    const handleClick = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (feature) onClickRef.current?.(feature as unknown as Feature)
    }
    map.on('click', id, handleClick)

    return () => {
      map.off('click', id, handleClick)
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isStyleLoaded, id, type])

  // Reactive prop: source data. `setData` patches the existing source in
  // place — no layer/source recreation, no flicker.
  useEffect(() => {
    if (!map || !isMountedRef.current) return
    const source = map.getSource(sourceId)
    if (source && source.type === 'geojson') {
      source.setData(data)
    }
  }, [map, sourceId, data])

  // Reactive prop: paint. Diffed key-by-key so an update only issues the
  // mapbox calls it actually needs.
  useEffect(() => {
    if (!map || !isMountedRef.current || !map.getLayer(id)) return
    for (const key of diffKeys(prevPaintRef.current, paint)) {
      map.setPaintProperty(id, key, paint[key])
    }
    prevPaintRef.current = paint
  }, [map, id, paint])

  // Reactive prop: layout (e.g. visibility, symbol layout, ...).
  useEffect(() => {
    if (!map || !isMountedRef.current || !map.getLayer(id)) return
    for (const key of diffKeys(prevLayoutRef.current, layout)) {
      map.setLayoutProperty(id, key, layout[key])
    }
    prevLayoutRef.current = layout
  }, [map, id, layout])

  // Reactive prop: beforeId (stacking order). `moveLayer` repositions the
  // existing layer in place — no removeLayer/addLayer round-trip needed.
  useEffect(() => {
    if (!map || !isMountedRef.current || !map.getLayer(id)) return
    if (beforeIdRef.current === beforeId) return
    map.moveLayer(id, beforeId)
    beforeIdRef.current = beforeId
  }, [map, id, beforeId])

  return null
}
