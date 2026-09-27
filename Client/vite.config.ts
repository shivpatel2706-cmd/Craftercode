import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const clientRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: clientRoot,
  envDir: clientRoot,
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true
  }
})