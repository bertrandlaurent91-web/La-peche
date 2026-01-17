import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/La-peche/',  // ← AJOUTE CETTE LIGNE
  plugins: [react()],
})