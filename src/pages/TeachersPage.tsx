import { useState } from 'react'
import { Button } from '@mui/material'
import TeacherFormDialog from '../components/NewTeacher'

export default function TeachersPage() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Lisää opettaja</Button>
      <TeacherFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}