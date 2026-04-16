import { useState, useContext } from 'react'
import {
  Button,
  Box,
  Paper,
  Container
} from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { UserContext } from '../App'
import { api } from '../api'
import { useCourses, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import CourseFormDialog from '../components/dialogs/CourseFormDialog'

export default function CoursePage() {
  const { user } = useContext(UserContext)
  const { data: rows = [] } = useCourses()
  const invalidate = useInvalidate()

  const [open, setOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any | null>(null)

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Kurssi', flex: 1 },
    { field: 'koodi', headerName: 'Koodi', width: 140 },
    { field: 'opintopisteet', headerName: 'Opintopisteet', width: 140 },
    { field: 'suunnitellutTunnit', headerName: 'Tuntimäärä', width: 140 }

  ]

  const handleDelete = async (ids: any[]) => {
    await api.courses.deleteMany(ids)
    invalidate('courses')
  }

  const handleEditRow = (id: any) => {
    const row = rows.find(r => r.id === id)
    setEditingRow(row)
    setOpen(true)
  }

  return (
    <Container>
      {user && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingRow(null)
              setOpen(true)
            }}
          >
            Lisää kurssi
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
          onDeleteRows={handleDelete}
          onEditRow={handleEditRow}
          sx={{ height: '100%', border: 'none' }}
        />
      </Paper>

      <CourseFormDialog
        open={open}
        data={editingRow}
        onClose={() => {
          setOpen(false)
          setEditingRow(null)
          invalidate('courses')
        }}
      />
    </Container>
  )
}