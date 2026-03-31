import { useState, useContext } from 'react'
import { Button } from '@mui/material'
import ClassroomFormDialog from '../components/dialogs/ClassroomFormDialog'
import { UserContext } from '../App';

export default function ClassroomPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  return (
    <>
      {user && (
        <>
          <Button onClick={() => setOpen(true)}>Lisää luokkahuone</Button>
          <ClassroomFormDialog open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </>
  )
}