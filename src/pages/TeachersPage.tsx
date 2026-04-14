import { useState, useContext } from 'react'
import { Button, Box, Paper, CircularProgress, Alert } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { useTeachers, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import TeacherFormDialog from '../components/dialogs/TeacherFormDialog'

export default function TeachersPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { data: rows = [], isLoading, isError } = useTeachers()
  const invalidate = useInvalidate()

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Etunimi', flex: 1 },
    { field: 'sukunimi', headerName: 'Sukunimi', flex: 1 },
    { field: 'sahkoposti', headerName: 'Sähköposti', width: 220 },
    { field: 'sopimustunnit', headerName: 'Sopimustunnit', width: 160 },
    { field: 'vapaaResurssi', headerName: 'Vapaa resurssi', width: 160 }
  ]

  const handleDialogClose = () => {
    setOpen(false)
    invalidate('teachers')
  }

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      await api.teachers.deleteMany(ids as number[]);
      invalidate('teachers')
    } catch (err) {
      const apiErr = err as T.ApiError;
      alert(`Poisto epäonnistui: ${apiErr.error}`);
    }
  }

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress color="inherit" />
    </Box>
  )
  if (isError) return <Alert severity="error">Lataus epäonnistui</Alert>

  return (
    <>
      {user && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ pl: 4 }}>
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Lisää opettaja
            </Button>
          </Box>
          <TeacherFormDialog open={open} onClose={handleDialogClose} />
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
            onOpenRow={(id) => navigate(`/teachers/${id}`)}
          />
        </Paper>
      </Box>
    </>
  )
}