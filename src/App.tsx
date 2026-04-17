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
import type { AuthUser } from './api/types/api.types'
import getDesignTokens from './Theme.tsx'
import { jwtDecode } from 'jwt-decode';

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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const theme = React.useMemo(
    () => createTheme(getDesignTokens(darkMode ? 'dark' : 'light')),
    [darkMode]
  );

  const colorMode = React.useMemo(() => ({
    toggleDarkMode: () => {
      setDarkMode((prev) => {
        const next = !prev;
        localStorage.setItem('darkMode', String(next));
        return next;
      });
    },
    darkMode,
  }), [darkMode]);

  const [user, setUserState] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) return null;

    try {
      const decoded: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }

      return JSON.parse(savedUser);
    } catch (e) {
      return null;
    }
  });

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

  return (
    <ColorModeContext.Provider value={colorMode}>
      <UserContext.Provider value={{ user, setUser }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setLoginOpen(true)} />
            <Box component="main" sx={{
              flexGrow: 1,
              pt: { xs: 8, sm: 9 },
              pb: 4
            }}>
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