import './App.css'
import * as React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import MainPage from './pages/MainPage.tsx'
import AdminPanel from './pages/AdminPanel.tsx'
import Navbar from './components/Navbar.tsx'
import NewTeacherPanel from './pages/NewTeacherPanel.tsx'
import Footer from './components/Footer.tsx'
import Box from '@mui/material/Box';

export const ColorModeContext = React.createContext({ toggleDarkMode: () => {} })

function App() {
  const [darkMode, setDarkMode] = React.useState(false)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode && {
        background: {
          default: '#1a1a1a',
          paper: '#242424',
        },
      }),
    },
  })

  return (
    <ColorModeContext.Provider value={{ toggleDarkMode: () => setDarkMode(p => !p) }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/newteacher" element={<NewTeacherPanel />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App