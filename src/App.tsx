import './App.css'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Calendar from './components/Calendar.tsx'
import Login from './components/Login.tsx'

function App() {
  const [user, setUser] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)

  const handleLogin = async (username: string, password: string) => {
    if (!username.trim()) {
      alert('Syötä käyttäjätunnus')
      return
    }

    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || res.statusText)
      }

      const data = await res.json()
      const displayName = data.user?.username || data.user?.nimi || data.user?.sahkoposti || username
      setUser(displayName)
      setLoginOpen(false)
    } catch (err: any) {
      alert('Kirjautuminen epäonnistui: ' + (err?.message || err))
    }
  }

  const handleLogout = () => setUser(null)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Kevätprojekti</h1>
        <div>
          {user ? (
            <>
              <span className="welcome" style={{ marginRight: 12 }}>Tervetuloa, {user}</span>
              <Button variant="outlined" onClick={handleLogout}>Kirjaudu ulos</Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setLoginOpen(true)}>Kirjaudu</Button>
          )}
        </div>
      </div>

      <Calendar />

      <Login open={loginOpen} onLogin={handleLogin} />
    </>
  )
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

export const ColorModeContext = React.createContext({
  toggleDarkMode: () => {},
  darkMode: false,         
})

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
    <ColorModeContext.Provider value={{ toggleDarkMode: () => setDarkMode(p => !p), darkMode }}>
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