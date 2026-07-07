import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Custom plugin to generate Cloudflare Pages _headers file
const cloudflareHeaders = () => ({
  name: 'cloudflare-headers',
  closeBundle() {
    const headersContent = `/*
  Permissions-Policy: camera=(self), microphone=(self)
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY

/models/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  Content-Type: application/json

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
    fs.writeFileSync(path.resolve(__dirname, 'dist/_headers'), headersContent);
    console.log('✅ Generated _headers file for Cloudflare Pages');
  }
});

// Custom plugin to copy models folder to dist
const copyModels = () => ({
  name: 'copy-models',
  closeBundle() {
    const modelsSource = path.resolve(__dirname, 'public/models');
    const modelsDest = path.resolve(__dirname, 'dist/models');
    
    if (fs.existsSync(modelsSource)) {
      if (!fs.existsSync(modelsDest)) {
        fs.mkdirSync(modelsDest, { recursive: true });
      }
      
      const files = fs.readdirSync(modelsSource);
      files.forEach(file => {
        fs.copyFileSync(
          path.join(modelsSource, file),
          path.join(modelsDest, file)
        );
      });
      console.log('✅ Copied face-api.js models to dist/models');
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflareHeaders(), copyModels()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
