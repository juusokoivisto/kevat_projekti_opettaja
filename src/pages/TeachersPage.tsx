import { useState, useContext } from 'react'
import { Button } from '@mui/material'
import TeacherFormDialog from '../components/dialogs/TeacherFormDialog'
import { UserContext } from '../App';

export default function TeachersPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  return (
    <>
      {user && (
        <>
          <Button onClick={() => setOpen(true)}>Lisää opettaja</Button>
          <TeacherFormDialog open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </>
  )
}