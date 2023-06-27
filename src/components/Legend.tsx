import { useMapStore } from '../store/useMapStore'

/**
 * A purely presentational readout of the same store values <CitiesLayer/>
 * consumes — proof that arbitrary parts of the UI can subscribe to the same
 * "layer config" slice without knowing anything about Mapbox.
 */
export function Legend() {
  const { visible, color, radius } = useMapStore((s) => s.citiesLayer)

  if (!visible) return null

  return (
    <div className="legend">
      <span className="legend-swatch" style={{ backgroundColor: color, width: radius, height: radius }} />
      Cities (population)
    </div>
  )
}
