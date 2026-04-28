import React, { useState, useContext } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert, Collapse
} from '@mui/material'
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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(UserContext)

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    onLogin(username, password)
  }

  const onLogin = async (username: string, password: string) => {
    if (!username.trim()) {
      setError('Syötä käyttäjätunnus')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await api.auth.login(username, password)

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setUser(data.user);

      setUsername('')
      setPassword('')
      onClose?.()
    } catch (err) {
      const apiErr = err as T.ApiError;

      if (apiErr.error === 'Invalid credentials') {
        setError('Väärä käyttäjätunnus tai salasana');
      } else {
        setError(apiErr.error || 'Kirjautuminen epäonnistui');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setError(null)
    onClose?.()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>Kirjaudu sisään</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

            <Collapse in={!!error}>
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            </Collapse>

            <TextField
              label="Käyttäjätunnus"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              autoFocus
              fullWidth
              variant="outlined"
              disabled={loading}
            />
            <TextField
              label="Salasana"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              fullWidth
              variant="outlined"
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Kirjaudutaan...' : 'Kirjaudu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}