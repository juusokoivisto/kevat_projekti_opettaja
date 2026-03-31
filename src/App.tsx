import './App.css'
import * as React from 'react'
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import MainPage from './pages/MainPage.tsx'
import AdminPanel from './pages/AdminPage.tsx'
import TeachersPage from './pages/TeachersPage.tsx'
import ClassroomPage from './pages/ClassroomPage.tsx'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
import Login from './components/Login.tsx'
import GroupPage from './pages/GroupPage.tsx'
import CoursePage from './pages/CoursePage.tsx'

export const ColorModeContext = React.createContext({
  toggleDarkMode: () => { },
  darkMode: false,
})

export const UserContext = React.createContext<{
  user: string | null
  setUser: (u: string | null) => void
}>({
  user: null,
  setUser: () => { },
})

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [user, setUser] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)

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
    <ColorModeContext.Provider value={{
      toggleDarkMode: () => setDarkMode(p => {
        localStorage.setItem('darkMode', String(!p))
        return !p
      }), darkMode
    }}>
      <UserContext.Provider value={{ user, setUser }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setLoginOpen(true)} />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/classrooms" element={<ClassroomPage />} />
                <Route path="/group" element={<GroupPage />} />
                <Route path="/courses" element={<CoursePage />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
          <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
        </ThemeProvider>
      </UserContext.Provider>
    </ColorModeContext.Provider>
  )
}

export default App