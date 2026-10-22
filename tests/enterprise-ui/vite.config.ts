import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Separate, local-only test entry. These aliases never participate in the application build.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  plugins: [react()],
  resolve: { alias: [
    { find: /.*\/firebase\/enterprise$/, replacement: fileURLToPath(new URL('adapter.ts', import.meta.url)) },
    { find: /.*\/components\/AccountBar$/, replacement: fileURLToPath(new URL('AccountBar.tsx', import.meta.url)) },
  ] },
  server: { host: '127.0.0.1', port: 3002, strictPort: true, fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
})
