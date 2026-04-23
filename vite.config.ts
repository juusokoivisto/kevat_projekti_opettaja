import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      '@fullcalendar/react',
      '@fullcalendar/core',
      '@fullcalendar/timegrid',
      '@fullcalendar/daygrid',
      '@fullcalendar/multimonth',
      '@fullcalendar/resource-timeline',
    ],
  },
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
          'mui-x': ['@mui/x-data-grid', '@mui/x-date-pickers'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          dayjs: ['dayjs'],
        }
      }
    }
  },
})