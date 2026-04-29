import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          fullcalendar: [
            '@fullcalendar/react',
            '@fullcalendar/core',
            '@fullcalendar/timegrid',
            '@fullcalendar/daygrid',
          ],
          mui: ['@mui/material', '@mui/icons-material'],
          'mui-x': ['@mui/x-data-grid', '@mui/x-date-pickers'],
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
        }
      }
    }
  },
})