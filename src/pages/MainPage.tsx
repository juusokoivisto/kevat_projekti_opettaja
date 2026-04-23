import { useState, useEffect, lazy, Suspense } from 'react'
import { Container, Paper } from '@mui/material'
import { useInvalidate, useCalendarEvents } from '../hooks/useQueries'
import * as T from '../api/types/api.types'

const CalendarEventFormDialog = lazy(() => import('../components/dialogs/CalendarEventFormDialog'))
const Calendar = lazy(() => import('./../components/Calendar.tsx'))

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const invalidate = useInvalidate()
  const { data: calendarData } = useCalendarEvents()
  const [editingEvent, setEditingEvent] = useState<T.CalendarEvent | null>(null);

  useEffect(() => {
    import('../components/dialogs/CalendarEventFormDialog');
  }, []);

  const handleDialogClose = async (shouldRefresh?: boolean) => {
    setOpen(false);
    setEditingEvent(null);
    if (shouldRefresh === true) await invalidate('calendar');
  }

  return (
    <Container maxWidth="xl" disableGutters sx={{ mt: 1, px: { xs: 0, sm: 1 } }}>
      <Suspense fallback={null}>
        {open && (
          <CalendarEventFormDialog
            open={open}
            data={editingEvent}
            onClose={handleDialogClose}
          />
        )}
      </Suspense>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 0,
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Calendar
          teacherId={undefined}
          onEdit={(id) => {
            const fresh = calendarData?.find(e => e.id === Number(id)) ?? null;
            setEditingEvent(fresh);
            setOpen(true);
          }}
          onAdd={() => {
            setEditingEvent(null);
            setOpen(true);
          }}
        />
      </Paper>
    </Container>
  )
}