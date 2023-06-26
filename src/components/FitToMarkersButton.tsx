import mapboxgl from 'mapbox-gl'
import { useMapContext } from '../map/MapContext'
import { useMapStore } from '../store/useMapStore'

/**
 * Not reactive by itself — just a button — but it's a good example of a
 * component reading the store and reaching into the map only in response to
 * a user action, rather than owning any map state of its own.
 */
export function FitToMarkersButton() {
  const { map } = useMapContext()
  const markers = useMapStore((s) => s.markers)

  const handleClick = () => {
    if (!map || markers.length === 0) return

    const bounds = markers.reduce(
      (acc, marker) => acc.extend(marker.lngLat),
      new mapboxgl.LngLatBounds(markers[0].lngLat, markers[0].lngLat),
    )
    map.fitBounds(bounds, { padding: 64, duration: 600 })
  }

  return (
    <button className="fit-markers" onClick={handleClick} disabled={markers.length === 0}>
      Fit view to markers
    </button>
  )
}
