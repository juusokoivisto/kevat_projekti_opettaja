import { useContext, useState } from 'react'
import Calendar from './../components/Calendar.tsx'
import { Box, Button } from '@mui/material'
import CalendarEventFormDialog from '../components/dialogs/CalendarEventFormDialog'
import { UserContext } from '../App';

export default function MainPage() {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useContext(UserContext);

  const handleDialogClose = (refresh?: boolean) => {
    setOpen(false)

    if (refresh) {
      setRefreshKey(prev => prev + 1 )
    }
  }

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
          <CalendarEventFormDialog 
            open={open}
            onClose={handleDialogClose}
          />
        </>
      )}
      <Calendar refreshKey={refreshKey} />
    </>
  )
}