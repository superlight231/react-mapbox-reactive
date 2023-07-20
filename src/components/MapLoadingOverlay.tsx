import { useMapContext } from '../map/MapContext'

/**
 * A visible React component that nonetheless follows the same rule as the
 * invisible ones: it only *reads* map state (`isStyleLoaded`) through
 * context, it never reaches into `mapboxgl` itself.
 */
export function MapLoadingOverlay() {
  const { isStyleLoaded } = useMapContext()

  if (isStyleLoaded) return null

  return (
    <div className="map-loading">
      <div className="spinner" />
    </div>
  )
}
