import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/La-peche/',
  plugins: [react()],
  server: {
    headers: {
      // Ajout de aistudiocdn.com pour React/Lucide et googleapis pour l'IA
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com https://aistudiocdn.com; connect-src 'self' https://generativelanguage.googleapis.com"
    }
  }
})
