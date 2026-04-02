import { useState, useContext, useEffect } from 'react'
import { getClassrooms } from '../api'
import { Button, Box, Paper } from '@mui/material'
import ClassroomFormDialog from '../components/dialogs/ClassroomFormDialog'
import { UserContext } from '../App';
import DatagridComponent from '../components/DatagridComponent';

export default function ClassroomPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'huoneenNumero', headerName: 'Huone', flex: 1 },
    { field: 'kapasiteetti', headerName: 'Kapasiteetti', width: 140 },
    { field: 'tyyppi', headerName: 'Tyyppi', width: 140 },
  ]

  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getClassrooms()
        setRows(data)
      } catch (err) {
        console.error('Error loading classrooms:', err)
      }
    }

    load()
  }, [open])

  return (
    <>
      {user && (
        <>
          <Button onClick={() => setOpen(true)}>Lisää luokkahuone</Button>
          <ClassroomFormDialog open={open} onClose={() => setOpen(false)} />
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