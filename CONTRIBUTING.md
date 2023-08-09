# Contributing

This is a small demo repo, but issues and PRs are welcome — especially more
examples of "renderless, reactive" wrappers around other imperative Mapbox
APIs (e.g. `mapboxgl.Popup` standalone, terrain/fog, custom controls).

## Getting set up

```bash
npm install
cp .env.example .env.local   # add your own Mapbox token
npm run dev
```

## Before opening a PR

```bash
npm run lint
npm run test
npm run build
```

All three also run in CI (`.github/workflows/ci.yml`) on every push.

## Conventions

- No semicolons, single quotes — see `.prettierrc.json`. Run `npm run format`
  before committing if you're not using an editor integration.
- New reactive Mapbox entities (a hypothetical `<Popup>`, `<Control>`, ...)
  should follow the same shape as `Marker`/`Layer`: render `null`, one
  `useEffect` per prop that can change independently, and a single
  mount/unmount effect for creating/destroying the underlying instance.
- Store logic belongs in `src/store/useMapStore.ts` and should stay free of
  any `mapbox-gl` imports — that boundary is the whole point of the
  architecture (see the README).
