import { useState } from 'react'
import { Box, Typography, Paper, Divider, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material'
import { api } from '../../api'
import { useInvalidate } from '../../hooks/useQueries'

export default function AdminSettingsPanel() {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const invalidate = useInvalidate()

  const handleExportToExcel = async () => {
    try {
      setExporting(true)
      await api.export.excelAll()
    } catch (err) {
      console.error('Export failed', err)
      window.alert('Vienti epäonnistui.')
    } finally {
      setExporting(false)
    }
  }

  const handleClearCalendar = () => {
    console.log('AdminSettingsPanel: handleClearCalendar invoked')
    setConfirmOpen(true)
  }

  const performClearCalendar = async () => {
    setConfirmOpen(false)
    const token = localStorage.getItem('token')
    if (!token) {
      window.alert('Toiminto vaatii kirjautumisen.')
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Hallintavalikon asetukset ja konfiguraatiot.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleExportToExcel}
            disabled={exporting || loading}
          >
            {exporting ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Vie Exceliin
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleClearCalendar}
            disabled={loading || exporting}
          >
            {loading ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : 'Tyhjennä kalenteri'}
          </Button>
        </Stack>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Vahvista tyhjennys</DialogTitle>
        <DialogContent>
          Haluatko varmasti tyhjentää koko kalenterin? Tätä toimintoa ei voi kumota.
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