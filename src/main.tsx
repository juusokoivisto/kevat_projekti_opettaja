import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.tsx'
import { Box, Typography, Button, Paper } from '@mui/material'

/**
 * This is what the user sees if the ENTIRE app crashes.
 * It's better than a white screen!
 */
function GlobalErrorFallback({ error }: { error: Error }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center', elevation: 3 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Sovellus kaatui odottamattomaan virheeseen
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error.message}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.assign('/')}
        >
          Yritä uudelleen
        </Button>
      </Paper>
    </Box>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)