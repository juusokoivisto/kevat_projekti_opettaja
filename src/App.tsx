import './App.css'
import { Route, Routes } from 'react-router-dom'

import MainPage from './pages/MainPage.tsx'
import AdminPanel from './pages/AdminPanel.tsx'
import Footer from './components/Footer.tsx'

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<MainPage/>}></Route>
      <Route path="/admin" element={<AdminPanel/>}></Route>
    </Routes>
    <Footer/>
    </>
  )
}

export default App
