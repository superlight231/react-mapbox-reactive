import { useEffect } from 'react'
import { useMapStore } from '../store/useMapStore'

/**
 * Renders nothing — same "lifecycle as the side effect" idea as Marker/Layer,
 * just applied to a plain DOM event instead of a Mapbox one.
 */
export function KeyboardShortcuts() {
  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId)
  const selectMarker = useMapStore((s) => s.selectMarker)

  useEffect(() => {
    if (!selectedMarkerId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectMarker(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMarkerId, selectMarker])

  return null
}
