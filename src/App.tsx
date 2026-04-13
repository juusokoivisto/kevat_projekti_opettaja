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
import TeacherDetailPage from './pages/TeacherDetailPage';
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import type { AuthUser } from './api/types/api.types'
import { api } from './api'
export const ColorModeContext = React.createContext({
  toggleDarkMode: () => { },
  darkMode: false,
})

export const UserContext = React.createContext<{
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
}>({
  user: null,
  setUser: () => { },
})

function App() {
  const [backendError, setBackendError] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  })

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkConnection = async () => {
      try {
        await api.health.check();
        setBackendError(false);
      } catch (err: any) {
        if (!err.status) {
          setBackendError(true);
        }
      }
    };

    checkConnection();

    interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  const setUser = (u: AuthUser | null) => {
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUserState(u);
  }

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
            <Collapse in={backendError}>
              <Alert severity="error" variant="filled" sx={{ borderRadius: 0 }}>
                Palvelimeen ei saada yhteyttä.
              </Alert>
            </Collapse>

            <Navbar onLoginClick={() => setLoginOpen(true)} />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/classrooms" element={<ClassroomPage />} />
                <Route path="/group" element={<GroupPage />} />
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/teachers/:id" element={<TeacherDetailPage />} />
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