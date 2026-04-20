import { useContext, useState, lazy } from 'react'
import { Box, Button, Container, Paper } from '@mui/material'
import CalendarEventFormDialog from '../components/dialogs/CalendarEventFormDialog'
import { UserContext } from '../App'
import { useInvalidate } from '../hooks/useQueries'

const Calendar = lazy(() => import('./../components/Calendar.tsx'))

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext)
  const invalidate = useInvalidate()

  const handleDialogClose = (shouldRefresh?: boolean) => {
    setOpen(false)
    if (shouldRefresh === true) invalidate('calendar')
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {user && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Lisää tapahtuma
          </Button>
          <CalendarEventFormDialog open={open} onClose={handleDialogClose} />
        </Box>
      )}

      <Paper elevation={2}>
        <Calendar teacherId={undefined} />
      </Paper>
    </Container>
  )
}