# react-mapbox-reactive

A small proof-of-concept for driving [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) entirely from React state, using ordinary component lifecycle (mount / update / unmount) instead of a bespoke imperative API.

## The idea

Mapbox GL JS is imperative: you call `new mapboxgl.Marker()`, `map.addLayer()`, `marker.remove()` yourself whenever data changes. This repo treats Mapbox entities (markers, layers, sources) as if they were DOM nodes, letting React's reconciler drive them instead:

- Render `<Marker lngLat={...} />` → a `mapboxgl.Marker` is created and added to the map.
- Change its `lngLat` prop → the existing marker is moved, not recreated.
- Stop rendering it → the marker is removed from the map.

The components render `null`. Their only job is to be a reactive handle to an imperative Mapbox entity, synced via `useEffect`. State lives in [zustand](https://github.com/pmndrs/zustand), completely decoupled from Mapbox — UI controls only call store actions and never import `mapbox-gl`.

## Architecture

- **`MapProvider`** (`src/map/MapContext.tsx`) — boots the map once, exposes it via context, keeps the store's viewport synced with the camera.
- **`Marker`** (`src/map/Marker.tsx`) — one `useEffect` per reactive prop (position, draggable, color, popup).
- **`Layer`** (`src/map/Layer.tsx`) — owns one GeoJSON source + style layer; diffs `paint`/`layout` key-by-key instead of recreating the layer.
- **`useMapStore`** (`src/store/useMapStore.ts`) — the single zustand store; nothing in it knows Mapbox exists.

## Usage

```tsx
<MapProvider accessToken={import.meta.env.VITE_MAPBOX_TOKEN}>
  <Marker lngLat={[-122.4194, 37.7749]} color="#3fb1ce" popupText="Hello!" />
  <Layer id="cities" type="circle" data={citiesGeoJson} paint={{ 'circle-color': '#f43f5e' }} />
</MapProvider>
```

## Gotchas

- `paint`/`layout` objects are diffed by reference per key — memoize them with `useMemo` if they're usually unchanged.
- `mapboxgl.Marker` has no public `setColor`; `<Marker>` patches the SVG fill directly ([mapbox-gl-js#9820](https://github.com/mapbox/mapbox-gl-js/issues/9820)).
- `map.setStyle()` wipes runtime sources/layers — every `<Layer>` tears down and remounts on `style.load`.

## Running it

1. Get a free token at [account.mapbox.com](https://account.mapbox.com/access-tokens/).
2. `cp .env.example .env.local` and set `VITE_MAPBOX_TOKEN`.
3. `npm install && npm run dev`

## Why components, not hooks?

Lists are free with components — `markers.map((m) => <Marker key={m.id} ... />)` gets correct add/remove/reorder from React's own reconciliation, which a `useMarker()` hook can't replicate since hooks can't be called conditionally or in a loop. For a single one-off entity, a hook is simpler; this pattern pulls ahead once you have many entities driven by a list in state.

[`react-map-gl`](https://github.com/visgl/react-map-gl) is the real, maintained version of this idea — this repo exists to show how that kind of wrapper works under the hood.

## Known limitations

- One `mapboxgl.Map` instance per `<MapProvider>`.
- The URL hash view eases in a moment after first paint rather than applying immediately (see `UrlViewportSync.tsx`).
- No clustering on the cities layer — every point renders directly.
