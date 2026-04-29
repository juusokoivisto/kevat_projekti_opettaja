import { useState, useContext } from 'react'
import { Button, Box, Paper } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { UserContext } from '../context/UserContext'
import { api } from '../api'
import { useRooms, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import ClassroomFormDialog from '../components/dialogs/ClassroomFormDialog'
import { Container } from '@mui/material'

export default function ClassroomPage() {
  const { user } = useContext(UserContext)
  const { data: rows = [] } = useRooms()
  const invalidate = useInvalidate()

  const [open, setOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any | null>(null)

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'huoneenNumero', headerName: 'Huone', flex: 1 },
    { field: 'kapasiteetti', headerName: 'Kapasiteetti', width: 140 },
    { field: 'tyyppi', headerName: 'Tyyppi', width: 140 },
  ]

  const handleDelete = async (ids: any[]) => {
    await api.rooms.deleteMany(ids)
    invalidate('rooms')
  }

  const handleEditRow = (id: any) => {
    const row = rows.find(r => r.id === id)
    setEditingRow(row)
    setOpen(true)
  }

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
            Lisää luokkahuone
          </Button>
        </Box>
      )}
      <Paper elevation={2} sx={{ height: '100%', width: '100%', p: 1 }}>
        <DatagridComponent
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[
            5,
            10,
            { value: rows.length, label: 'Kaikki' }
          ]}
          checkboxSelection
          autoHeight={false}
          onDeleteRows={handleDelete}
          onEditRow={handleEditRow}
          sx={{ height: '100%', border: 'none' }}
        />
      </Paper>
      <ClassroomFormDialog
        open={open}
        data={editingRow}
        onClose={() => {
          setOpen(false)
          setEditingRow(null)
          invalidate('rooms')
        }}
      />
    </Container>
  )
}