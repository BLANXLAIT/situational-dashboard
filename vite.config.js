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
      },
      '/api/commodities': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getCommodityData',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/commodities/, '')
      },
      '/api/health/alerts': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getHealthAlerts',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/health\/alerts/, '')
      },
      '/api/health/influenza': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getInfluenzaData',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/health\/influenza/, '')
      },
      '/api/analyst/config': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getAnalystConfig',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analyst\/config/, '')
      },
      '/api/analyst/narrative': {
        target: 'http://127.0.0.1:5001/saam-dashboard-1772190712/us-central1/getSituationNarrative',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analyst\/narrative/, '')
      }
    }
  }
})
