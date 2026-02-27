import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/alerts/geology': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getGeologicAlerts',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alerts\/geology/, '')
      },
      '/api/alerts/intelligence': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getIntelligenceStream',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alerts\/intelligence/, '')
      },
      '/api/alerts/space': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getSpaceWeather',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alerts\/space/, '')
      },
      '/api/alerts/gdacs': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getGdacsAlerts',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alerts\/gdacs/, '')
      },
      '/api/macro': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getMacroData',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/macro/, '')
      }
    }
  }
})
