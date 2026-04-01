import { useState, useContext, useEffect } from 'react'
import { Button, Box, Paper } from '@mui/material'
import GroupFormDialog from '../components/dialogs/GroupFormDialog'
import { UserContext } from '../App';
import DatagridComponent from '../components/DatagridComponent'
import { get } from '../api'

export default function GroupPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'ryhmatunnus', headerName: 'Ryhmatunnus', flex: 1 },
    { field: 'aloitusvuosi', headerName: 'Aloitusvuosi', width: 140 },
    { field: 'opiskelijamaara', headerName: 'Opiskelijamäärä', width: 160 },
    { field: 'tutkintoOhjelma', headerName: 'Tutkinto-ohjelma', flex: 1 }
  ]

  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await get('/opiskelijaryhmat')
        setRows(data)
      } catch (err) {
        console.error('Error loading groups:', err)
      }
    }

    load()
  }, [open])

  return (
    <>
      {user && (
        <>
          <Button onClick={() => setOpen(true)}>Lisää ryhmä</Button>
          <GroupFormDialog open={open} onClose={() => setOpen(false)} />
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, px: 2 }}>
        <Paper sx={{ height: 500, width: '100%', maxWidth: 1200, p: 1 }}>
          <DatagridComponent
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            autoHeight={false}
            sx={{ height: '100%' }}
          />
        </Paper>
      </Box>
    </>
  )
}