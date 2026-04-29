import * as React from 'react'
import { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
import Login from './components/Login.tsx'

const MainPage = lazy(() => import('./pages/MainPage.tsx'))
const AdminPanel = lazy(() => import('./pages/AdminPage.tsx'))
const TeachersPage = lazy(() => import('./pages/TeachersPage.tsx'))
const ClassroomPage = lazy(() => import('./pages/ClassroomPage.tsx'))
const GroupPage = lazy(() => import('./pages/GroupPage.tsx'))
const CoursePage = lazy(() => import('./pages/CoursePage.tsx'))
const TeacherDetailPage = lazy(() => import('./pages/TeacherDetailPage'))
const ManagementPage = lazy(() => import('./pages/Management.tsx'))

import type { AuthUser } from './api/types/api.types'
import { getDesignTokens } from './Theme.tsx'
import { jwtDecode } from 'jwt-decode'
import { UserContext } from './context/UserContext.tsx'

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
    <CircularProgress color="inherit" />
  </Box>
)

function App() {
  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.remove();
    }
  }, []);

  const theme = React.useMemo(() => createTheme(getDesignTokens()), []);

  const [user, setUserState] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!savedUser || !token) return null;
    try {
      const decoded: { exp: number } = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
      return JSON.parse(savedUser);
    } catch (_e) {
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

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar onLoginClick={() => setLoginOpen(true)} />

          <Box component="main" sx={{ flexGrow: 1, pt: { xs: 8, sm: 9 }, pb: 4 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/classrooms" element={<ClassroomPage />} />
                <Route path="/group" element={<GroupPage />} />
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/teachers/:id" element={<TeacherDetailPage />} />
                <Route path="/management" element={<ManagementPage />} />
              </Routes>
            </Suspense>
          </Box>
          <Footer />
        </Box>
        <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
      </ThemeProvider>
    </UserContext.Provider>
  )
}

export default App