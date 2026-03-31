import { useState } from 'react'
import { Button } from '@mui/material'
import ClassroomFormDialog from '../components/dialogs/ClassroomFormDialog'

export default function ClassroomPage() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Lisää luokkahuone</Button>
      <ClassroomFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}