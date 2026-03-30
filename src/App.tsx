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
}

export default App
