import { DEFAULT_VIEWPORT } from '../map/types'
import { useMapStore } from '../store/useMapStore'

/**
 * Store -> map, the "other" direction from the moveend sync in MapContext.
 * This never touches mapboxgl directly; it just writes a new viewport to
 * the store, and MapProvider's reactive effect (see MapContext.tsx) is what
 * actually calls `map.easeTo(...)`.
 */
export function ResetViewButton() {
  const setViewport = useMapStore((s) => s.setViewport)

  return (
    <button className="fit-markers" onClick={() => setViewport(DEFAULT_VIEWPORT)}>
      Reset view
    </button>
  )
}
