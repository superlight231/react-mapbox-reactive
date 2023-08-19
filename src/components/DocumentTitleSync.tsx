import { useEffect } from 'react'
import { useMapStore } from '../store/useMapStore'

const BASE_TITLE = 'react-mapbox-reactive'

/**
 * The same "render null, useEffect owns a side effect" shape as Marker/Layer,
 * just pointed at `document.title` instead of the Mapbox API — a reminder
 * that this pattern isn't Mapbox-specific, it's just how to wrap *any*
 * imperative browser API reactively.
 */
export function DocumentTitleSync() {
  const markerCount = useMapStore((s) => s.markers.length)

  useEffect(() => {
    document.title = markerCount > 0 ? `(${markerCount}) ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [markerCount])

  return null
}
