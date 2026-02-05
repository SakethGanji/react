import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // Exclude POC code from production builds
      external: mode === 'production'
        ? (id: string) => id.includes('/src/poc/')
        : undefined,
    },
  },
}))
