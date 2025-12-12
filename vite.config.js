import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Ensure relative asset paths for Capacitor iOS WebView
  base: './',
  // Allow LAN access so you can open the dev server on iPhone
  server: { host: true },
})
