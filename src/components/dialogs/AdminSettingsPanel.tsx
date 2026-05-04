import { useState } from 'react'
import { Box, Typography, Paper, Divider, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { api } from '../../api'
import { useInvalidate } from '../../hooks/useQueries'

export default function AdminSettingsPanel() {
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const invalidate = useInvalidate()

  const handleClearCalendar = () => {
    console.log('AdminSettingsPanel: handleClearCalendar invoked')
    setConfirmOpen(true)
  }

  const performClearCalendar = async () => {
    setConfirmOpen(false)
    const token = localStorage.getItem('token')
    if (!token) {
      window.alert('Toiminto vaatii kirjautumisen. Kirjaudu sisään ja yritä uudelleen.')
      return
    }
    try {
      setLoading(true)
      const events = await api.calendar.getAll()
      for (const e of events) {
        const id = String((e as any).id)
        try {
          await api.calendar.delete(id)
        } catch (err: any) {
          console.error('Failed deleting event', id, err)
          throw err
        }
      }
      invalidate('calendar')
      window.alert('Kalenteri tyhjennetty.')
    } catch (err) {
      console.error('Failed clearing calendar', err)
      const msg = (err as any)?.error || (err as any)?.message || String(err)
      window.alert('Kalenterin tyhjennys epäonnistui: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }} elevation={0}>
      <Typography variant="h6" gutterBottom>Admin asetukset</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box>
        <Typography>Hallintavalikon asetukset ja konfiguraatiot näkyvät tässä.</Typography>
        <Box sx={{ mt: 3 }}>
          <Button type="button" color="error" variant="contained" onClick={handleClearCalendar} disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Tyhjennä kalenteri'}
          </Button>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Vahvista tyhjennys</DialogTitle>
        <DialogContent>
          Haluatko varmasti tyhjentää koko kalenterin? Tämä poistaa kaikki tapahtumat.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Peruuta</Button>
          <Button color="error" onClick={performClearCalendar} autoFocus disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Tyhjennä'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
