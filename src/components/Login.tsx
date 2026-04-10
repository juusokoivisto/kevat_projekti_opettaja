import React, { useState, useContext } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { UserContext } from '../App'

import { api } from '../api'
import * as T from '../api/types/api.types'

type LoginProps = {
  open?: boolean
  onClose?: () => void
}

export default function Login({ open = true, onClose }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useContext(UserContext)

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
      const data = await api.auth.login(username, password)

      const displayName = data.user?.nimi || data.user?.username || username

      setUser(displayName)
      onClose?.()
    } catch (err) {
      const apiErr = err as T.ApiError;
      alert(`Kirjautuminen epäonnistui: ${apiErr.error}`)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>Kirjaudu sisään</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Käyttäjätunnus"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Salasana"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
          >
            Kirjaudu
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}