import { useState } from 'react'
import { Box, Typography, Paper, Divider, Button, CircularProgress } from '@mui/material'
import { api } from '../../api'
import { useInvalidate } from '../../hooks/useQueries'

export default function AdminSettingsPanel() {
  const [loading, setLoading] = useState(false)
  const invalidate = useInvalidate()

  const handleClearCalendar = async () => {
    if (!window.confirm('Haluatko varmasti tyhjentää koko kalenterin? Tämä poistaa kaikki tapahtumat.')) return
    try {
      setLoading(true)
      const events = await api.calendar.getAll()
      await Promise.all(events.map(e => api.calendar.delete(String((e as any).id))))
      invalidate('calendar')
      window.alert('Kalenteri tyhjennetty.')
    } catch (err) {
      console.error('Failed clearing calendar', err)
      window.alert('Kalenterin tyhjennys epäonnistui.')
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
          <Button color="error" variant="contained" onClick={handleClearCalendar} disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Tyhjennä kalenteri'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
