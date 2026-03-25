import './App.css'
import MainPage from './pages/MainPage.tsx'
import AdminPanel from './pages/AdminPanel.tsx'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/navbar.tsx'

function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<MainPage/>}></Route>
      <Route path="/admin" element={<AdminPanel/>}></Route>
    </Routes>
    </>
  )
}

export default App
