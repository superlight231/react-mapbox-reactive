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

// Renders nothing — owns one GeoJSON source + one style layer, kept in sync with props.
export function Layer({ id, type, data, paint = {}, layout = {}, beforeId, onClick }: LayerProps) {
  const { map, isStyleLoaded } = useMapContext()
  const sourceId = `${id}-source`
  const isMountedRef = useRef(false)
  const prevPaintRef = useRef<Record<string, unknown>>({})
  const prevLayoutRef = useRef<Record<string, unknown>>({})
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick
  // Initial stacking position only — later changes go through moveLayer below.
  const beforeIdRef = useRef(beforeId)

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

  useEffect(() => {
    if (!map || !isMountedRef.current) return
    const source = map.getSource(sourceId)
    if (source && source.type === 'geojson') {
      source.setData(data)
    }
  }, [map, sourceId, data])

  // Diffed key-by-key so an update only issues the setPaintProperty calls it needs.
  useEffect(() => {
    if (!map || !isMountedRef.current || !map.getLayer(id)) return
    for (const key of diffKeys(prevPaintRef.current, paint)) {
      map.setPaintProperty(id, key, paint[key])
    }
    prevPaintRef.current = paint
  }, [map, id, paint])

  useEffect(() => {
    if (!map || !isMountedRef.current || !map.getLayer(id)) return
    for (const key of diffKeys(prevLayoutRef.current, layout)) {
      map.setLayoutProperty(id, key, layout[key])
    }
    prevLayoutRef.current = layout
  }, [map, id, layout])

  useEffect(() => {
    if (!map || !isMountedRef.current || !map.getLayer(id)) return
    if (beforeIdRef.current === beforeId) return
    map.moveLayer(id, beforeId)
    beforeIdRef.current = beforeId
  }, [map, id, beforeId])

  return null
}
