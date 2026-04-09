import { useState, useContext, useEffect } from 'react'
import { Button, Box, Paper } from '@mui/material'
import TeacherFormDialog from '../components/dialogs/TeacherFormDialog'
import { UserContext } from '../App';
import DatagridComponent from '../components/DatagridComponent'
import { get, deleteTeachers } from '../api'

export default function TeachersPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);
  const [rows, setRows] = useState<any[]>([])

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Etunimi', flex: 1 },
    { field: 'sukunimi', headerName: 'Sukunimi', flex: 1 },
    { field: 'sahkoposti', headerName: 'Sähköposti', width: 220 },
    { field: 'sopimustunnit', headerName: 'Sopimustunnit', width: 160 },
    { field: 'vapaaResurssi', headerName: 'Vapaa resurssi', width: 160 }
  ]

  const load = async () => {
    try {
      const data = await get('/opettajat')
      setRows(data)
    } catch (err) {
      console.error('Error loading teachers:', err)
    }
  }

  useEffect(() => {
    load()
  }, [open])

  const handleDelete = async (ids: (string | number)[]) => {
    await deleteTeachers(ids as number[]);
  }

  return (
    <>
      {user && (
        <Box sx={{ mb: 2 }}>
        <Box sx={{ pl: 4}}>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
        >
          Lisää opettaja
        </Button>
        </Box>
          <TeacherFormDialog open={open} onClose={() => setOpen(false)} />
        </Box>
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
            onDeleteRows={handleDelete}
            showOpenButton={true}
            //Tää on kesken
            //onOpenRow={(id) => {
            //console.log("Avaa opettaja ID:", id);
            //}}  
          />
        </Paper>
      </Box>
    </>
  )
}