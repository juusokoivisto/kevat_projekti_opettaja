export const getDesignTokens = () => ({
  palette: {
    mode: 'dark' as const,
    primary: { main: '#90caf9' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: { fontFamily: '"Roboto", sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Roboto", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Roboto", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: '0.01em' },
  },
});