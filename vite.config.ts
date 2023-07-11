/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // 'node' would leave `localStorage` undefined, which the store's
    // persist middleware (see src/store/useMapStore.ts) needs at import time.
    environment: 'jsdom',
  },
})
