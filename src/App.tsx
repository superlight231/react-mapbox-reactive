import { MapProvider } from './map/MapContext'
import { ViewportHud } from './components/ViewportHud'
import { MarkerLayer } from './components/MarkerLayer'
import { ClickToAddMarker } from './components/ClickToAddMarker'
import { CitiesLayer } from './components/CitiesLayer'
import { CitiesHeatmapLayer } from './components/CitiesHeatmapLayer'
import { ControlPanel } from './components/ControlPanel'
import { Legend } from './components/Legend'
import { AnimatedMarker } from './components/AnimatedMarker'
import { useMapStore } from './store/useMapStore'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  const showAnimatedMarker = useMapStore((s) => s.showAnimatedMarker)

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <MapProvider accessToken={MAPBOX_TOKEN}>
        <CitiesLayer />
        <CitiesHeatmapLayer />
        <MarkerLayer />
        <ClickToAddMarker />
        {showAnimatedMarker && <AnimatedMarker />}
        <ViewportHud />
        <ControlPanel />
        <Legend />
      </MapProvider>
    </div>
  )
}

export default App
