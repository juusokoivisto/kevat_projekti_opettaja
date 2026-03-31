import { useState, useContext, useEffect } from 'react'
import { Button, Box, Paper } from '@mui/material'
import CourseFormDialog from '../components/dialogs/CourseFormDialog'
import { UserContext } from '../App';
import DatagridComponent from '../components/DatagridComponent';

export default function CoursePage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Kurssi', flex: 1 },
    { field: 'koodi', headerName: 'Koodi', width: 140 },
    { field: 'opintopisteet', headerName: 'Opintopisteet', width: 140 },
    { field: 'suunnitellutTunnit', headerName: 'Tuntimäärä', width: 140 }
  ]

  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:4000/kurssit')
        if (!res.ok) throw new Error('Failed to fetch courses')
        const data = await res.json()
        setRows(data)
      } catch (err) {
        console.error('Error loading courses:', err)
      }
    }

    load()
  }, [open])

  return (
    <>
      {user && (
        <>
          <Button onClick={() => setOpen(true)}>Lisää kurssi</Button>
          <CourseFormDialog open={open} onClose={() => setOpen(false)} />
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