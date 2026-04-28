import { useState, lazy, Suspense } from 'react'
import {
  Container, Paper, Box, CircularProgress,
} from '@mui/material'
import { useInvalidate, useCalendarEvents } from '../hooks/useQueries'
import * as T from '../api/types/api.types'
const CalendarEventFormDialog = lazy(() => import('../components/dialogs/CalendarEventFormDialog'))
const Calendar = lazy(() => import('./../components/Calendar.tsx'))

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const invalidate = useInvalidate()
  const { data: calendarData, isLoading } = useCalendarEvents()
  const [editingEvent, setEditingEvent] = useState<T.CalendarEvent | null>(null);

  const handleDialogClose = async (shouldRefresh?: boolean) => {
    setOpen(false);
    setEditingEvent(null);
    if (shouldRefresh === true) await invalidate('calendar');
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ p: 1 }}>
          <Suspense fallback={<CircularProgress sx={{ m: 2 }} />}>
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
          </Suspense>
        </Box>
      </Paper>

      <Suspense fallback={null}>
        {open && (
          <CalendarEventFormDialog
            open={open}
            data={editingEvent}
            onClose={handleDialogClose}
          />
        )}
      </Suspense>
    </Container>
  )
}