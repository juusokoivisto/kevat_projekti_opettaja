import { useState, useContext } from 'react'
import {
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Container
} from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { UserContext } from '../App'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { useCourses, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import CourseFormDialog from '../components/dialogs/CourseFormDialog'

export default function CoursePage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext)
  const { data: rows = [], isLoading, isError } = useCourses()
  const invalidate = useInvalidate()

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Kurssi', flex: 1 },
    { field: 'koodi', headerName: 'Koodi', width: 140 },
    { field: 'opintopisteet', headerName: 'Opintopisteet', width: 140 },
    { field: 'suunnitellutTunnit', headerName: 'Tuntimäärä', width: 140 }
  ]

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      await api.courses.deleteMany(ids as number[])
      invalidate('courses')
    } catch (err) {
      const apiErr = err as T.ApiError
      alert(`Poisto epäonnistui: ${apiErr.error}`)
    }
  }

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  )
  if (isError) return <Alert severity="error">Lataus epäonnistui</Alert>

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {user && (
        <>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Lisää kurssi
            </Button>
          </Box>
          <CourseFormDialog
            open={open}
            onClose={() => {
              setOpen(false)
              invalidate('courses')
            }}
          />
        </>
      )}
      <Paper elevation={2} sx={{ height: '100%', width: '100%', p: 1 }}>
        <DatagridComponent
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          autoHeight={false}
          onDeleteRows={handleDelete}
          sx={{ height: '100%', border: 'none' }}
        />
      </Paper>
    </Container>
  )
}