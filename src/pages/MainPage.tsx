import { useContext, useState } from 'react'
import Calendar from './../components/Calendar.tsx'
import { Box, Button, } from '@mui/material'
import CalendarEventFormDialog from '../components/dialogs/CalendarEventFormDialog'
import { UserContext } from '../App';

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  return (
    <>
      {user && (
        <>
        <Box sx={{ pl: 2}}>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
        >
          Lisää tapahtuma
        </Button>
        </Box>
          <CalendarEventFormDialog open={open} onClose={() => setOpen(false)} />
        </>
      )}
      <Calendar />
    </>
  )
}