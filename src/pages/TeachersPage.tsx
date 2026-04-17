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
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { useTeachers, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import TeacherFormDialog from '../components/dialogs/TeacherFormDialog'

export default function TeachersPage() {

  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const { data: rows = [], isLoading, isError } = useTeachers()
  const invalidate = useInvalidate()

  const [open, setOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any | null>(null)

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Etunimi', flex: 1 },
    { field: 'sukunimi', headerName: 'Sukunimi', flex: 1 },
    { field: 'sahkoposti', headerName: 'Sähköposti', width: 220 },
    { field: 'sopimustunnit', headerName: 'Sopimustunnit', width: 160 },
    { field: 'vapaaResurssi', headerName: 'Vapaa resurssi', width: 160 }
  ]

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      await api.teachers.deleteMany(ids as number[])
      invalidate('teachers')
    } catch (err) {
      const apiErr = err as T.ApiError
      alert(`Poisto epäonnistui: ${apiErr.error}`)
    }
  }

  const handleEditRow = (id: any) => {
    const row = rows.find(r => r.id === id)
    setEditingRow(row)
    setOpen(true)
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
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingRow(null)
              setOpen(true)
            }}
          >
            Lisää opettaja
          </Button>
        </Box>
      )}

      <Paper elevation={2} sx={{ height: '100%', width: '100%', p: 1 }}>
        <DatagridComponent
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          autoHeight={false}
          showOpenButton={true}
          onOpenRow={(id) => navigate(`/teachers/${id}`)}
          onDeleteRows={handleDelete}
          onEditRow={handleEditRow}
          sx={{ height: '100%', border: 'none' }}
        />
      </Paper>

      <TeacherFormDialog
        open={open}
        data={editingRow}
        onClose={() => {
          setOpen(false)
          setEditingRow(null)
          invalidate('teachers')
        }}
      />
    </Container>
  )
}