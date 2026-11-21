import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { lingui } from '@lingui/vite-plugin'

export default defineConfig({
  // same plugins as vite.config.js, so components using Lingui macros compile
  plugins: [
    react({
      babel: {
        plugins: ['macros']
      }
    }),
    lingui()
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js']
  }
})
