import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Split stable third-party code into its own long-term-cacheable chunks.
    // This shrinks the route bundles and shortens the critical request chain
    // for repeat visits (vendor chunks rarely change between deploys).
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return 'vendor-react'
          }
          if (/node_modules\/(@tanstack|axios|zustand)\//.test(id)) return 'vendor-query'
          if (/node_modules\/(formik|yup|property-expr|tiny-case|toposort|lodash|lodash-es)\//.test(id)) {
            return 'vendor-forms'
          }
          return undefined
        },
      },
    },
  },
})
