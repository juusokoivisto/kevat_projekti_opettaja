import { useContext, useState, lazy, Suspense } from 'react'
import { Box, Button, Container, Paper } from '@mui/material'
import { UserContext } from '../App'
import { useInvalidate, useCalendarEvents } from '../hooks/useQueries'
import * as T from '../api/types/api.types'

const CalendarEventFormDialog = lazy(() => import('../components/dialogs/CalendarEventFormDialog'))
const Calendar = lazy(() => import('./../components/Calendar.tsx'))

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext)
  const invalidate = useInvalidate()
  const { data: calendarData } = useCalendarEvents()
  const [editingEvent, setEditingEvent] = useState<T.CalendarEvent | null>(null);

  const handleDialogClose = async (shouldRefresh?: boolean) => {
    setOpen(false);
    setEditingEvent(null);
    if (shouldRefresh === true) await invalidate('calendar');
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {user && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingEvent(null);
              setOpen(true);
            }}
          >
            Lisää tapahtuma
          </Button>
          <Suspense fallback={null}>
            {open && (
              <CalendarEventFormDialog
                open={open}
                data={editingEvent}
                onClose={handleDialogClose}
              />
            )}
          </Suspense>
        </Box>
      )}

      <Paper elevation={2}>
        <Calendar
          teacherId={undefined}
          onEdit={(id) => {
            const fresh = calendarData?.find(e => e.id === Number(id)) ?? null;
            setEditingEvent(fresh);
            setOpen(true);
          }}
        />
      </Paper>
    </Container>
  )
}