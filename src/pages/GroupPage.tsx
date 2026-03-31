import { useState } from 'react'
import { Button } from '@mui/material'
import GroupFormDialog from '../components/dialogs/GroupFormDialog'

export default function GroupPage() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Lisää ryhmä</Button>
      <GroupFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}