import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Development credential stays out of VITE_ variables and production bundles.
  const debugToken = command === 'serve' && mode === 'development'
    ? loadEnv(mode, '.', 'MEMSTACK_').MEMSTACK_APPCHECK_DEBUG_TOKEN
    : undefined
  if (debugToken && !/^[a-f0-9-]{36}$/i.test(debugToken)) {
    throw new Error('Invalid local App Check debug token')
  }
  return {
    plugins: [react(), ...(debugToken ? [{
      name: 'local-app-check',
      transformIndexHtml() {
        return [{ tag: 'script', injectTo: 'head-prepend' as const, children:
          `if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) self.FIREBASE_APPCHECK_DEBUG_TOKEN = ${JSON.stringify(debugToken)}` }]
      },
    }] : [])],
    server: { host: '127.0.0.1', port: 3000, strictPort: true },
  }
})
