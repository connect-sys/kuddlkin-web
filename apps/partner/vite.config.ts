import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// The monorepo root — the SINGLE source of truth for env vars.
const ROOT = path.resolve(__dirname, '../../')

// Copy face-api.js models into dist/ after build (they live in public/models).
const copyModels = () => ({
  name: 'copy-models',
  closeBundle() {
    const modelsSource = path.resolve(__dirname, 'public/models')
    const modelsDest = path.resolve(__dirname, 'dist/models')
    if (fs.existsSync(modelsSource)) {
      if (!fs.existsSync(modelsDest)) fs.mkdirSync(modelsDest, { recursive: true })
      for (const file of fs.readdirSync(modelsSource)) {
        fs.copyFileSync(path.join(modelsSource, file), path.join(modelsDest, file))
      }
      console.log('✅ Copied face-api.js models to dist/models')
    }
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Read every VITE_* var from the single root .env.
  const env = loadEnv(mode, ROOT, '')

  // API base auto-switches: `pnpm dev` (mode=development) → local backend on :5050;
  // production build → api.kuddlkin.co (override with VITE_API_BASE_URL in root .env).
  const apiBase =
    mode === 'development'
      ? 'http://localhost:5050'
      : env.VITE_API_BASE_URL || env.VITE_API_URL || 'https://api.kuddlkin.co'

  return {
    // Load .env from the monorepo root instead of this app folder.
    envDir: ROOT,
    plugins: [react(), copyModels()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    // Inject the resolved API base for the ~15 files that read these directly.
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase),
      'import.meta.env.VITE_API_URL': JSON.stringify(apiBase),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiBase, changeOrigin: true, secure: false },
      },
    },
  }
})
