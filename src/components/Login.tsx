import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

type LoginProps = {
  open?: boolean
  onClose?: () => void
}

export default function Login({ open = true, onClose }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    onLogin(username, password)
  }

  const onLogin = async (username: string, password: string) => {
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
      //setUser(displayName)
      onClose?.()
    } catch (err: any) {
      alert('Kirjautuminen epäonnistui: ' + (err?.message || err))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Kirjaudu sisään</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Käyttäjätunnus"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              fullWidth
            />
            <TextField
              label="Salasana"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <Button type="submit" variant="contained">Kirjaudu</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
