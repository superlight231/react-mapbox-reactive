import { useMemo } from 'react'
import { Layer } from '../map/Layer'
import { CITIES } from '../data/cities'
import { useMapStore } from '../store/useMapStore'

/**
 * A second, differently-typed layer sharing the same dataset as
 * <CitiesLayer/>. Rendered with `beforeId="cities"` so it always stacks
 * underneath the circle layer, no matter which one mounts first.
 */
export function CitiesHeatmapLayer() {
  const visible = useMapStore((s) => s.heatmapVisible)

  const layout = useMemo(
    () => ({ visibility: visible ? 'visible' : 'none' }) as const,
    [visible],
  )

  const paint = useMemo(
    () => ({
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'population'], 0, 0, 1_000_000, 1],
      'heatmap-intensity': 1,
      'heatmap-radius': 30,
      'heatmap-opacity': 0.6,
    }),
    [],
  )

  return (
    <Layer id="cities-heatmap" type="heatmap" data={CITIES} paint={paint} layout={layout} beforeId="cities" />
  )
}
