import type { PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        primary: { main: '#1976d2' },
        background: { default: '#f5f5f5', paper: '#fff' },
      }
      : {
        primary: { main: '#90caf9' },
        background: { default: '#121212', paper: '#1e1e1e' },
      }),
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default getDesignTokens;