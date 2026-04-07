import { useContext, useState } from 'react'
import Calendar from './../components/Calendar.tsx'
import { Button, } from '@mui/material'
import CalendarEventFormDialog from '../components/dialogs/CalendarEventFormDialog'
import { UserContext } from '../App';

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  return (
    <>
      {user && (
        <>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Lisää tapahtuma
          </Button>          
          <CalendarEventFormDialog open={open} onClose={() => setOpen(false)} />
        </>
      )}
      <Calendar />
    </>
  )
}