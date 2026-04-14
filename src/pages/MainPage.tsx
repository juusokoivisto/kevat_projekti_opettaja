import { useContext, useState } from 'react'
import Calendar from './../components/Calendar.tsx'
import { Box, Button } from '@mui/material'
import CalendarEventFormDialog from '../components/dialogs/CalendarEventFormDialog'
import { UserContext } from '../App'
import { useInvalidate } from '../hooks/useQueries'

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext)
  const invalidate = useInvalidate()

  const handleDialogClose = (shouldRefresh?: boolean) => {
    setOpen(false)
    if (shouldRefresh === true) invalidate('calendar')
  }

  return (
    <>
      {user && (
        <>
          <Box sx={{ pl: 2 }}>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Lisää tapahtuma
            </Button>
          </Box>
          <CalendarEventFormDialog open={open} onClose={handleDialogClose} />
        </>
      )}
      <Calendar teacherId={undefined} />
    </>
  )
}