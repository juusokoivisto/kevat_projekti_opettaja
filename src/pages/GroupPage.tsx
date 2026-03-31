import { useState, useContext } from 'react'
import { Button } from '@mui/material'
import GroupFormDialog from '../components/dialogs/GroupFormDialog'
import { UserContext } from '../App';

export default function GroupPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  return (
    <>
      {user && (
        <>
          <Button onClick={() => setOpen(true)}>Lisää ryhmä</Button>
          <GroupFormDialog open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </>
  )
}