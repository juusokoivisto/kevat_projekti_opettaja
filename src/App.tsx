import * as React from 'react'
import { useState, lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Navbar = lazy(() => import('./components/Navbar.tsx'))
const Footer = lazy(() => import('./components/Footer.tsx'))
const Login = lazy(() => import('./components/Login.tsx'))
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
import UnifiedManagementPage from './pages/Management.tsx'

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
  const theme = React.useMemo(() => createTheme(getDesignTokens()), []);

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

  const PageLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  )

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