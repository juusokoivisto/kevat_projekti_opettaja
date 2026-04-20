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
            '@fullcalendar/multimonth',
            '@fullcalendar/resource-timeline',
          ],
          mui: ['@mui/material', '@mui/icons-material'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})