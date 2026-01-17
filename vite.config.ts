import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/La-peche/',
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' https://cdn.tailwindcss.com https://api.anthropic.com"
    }
  }
})