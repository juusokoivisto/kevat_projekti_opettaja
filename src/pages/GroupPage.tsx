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
import { UserContext } from '../context/UserContext'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { useGroups, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import GroupFormDialog from '../components/dialogs/GroupFormDialog'

export default function GroupPage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext)
  const { data: rows = [], isLoading, isError } = useGroups()
  const invalidate = useInvalidate()

  const [editingRow, setEditingRow] = useState<any | null>(null)


  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'ryhmatunnus', headerName: 'Ryhmatunnus', flex: 1 },
    { field: 'aloitusvuosi', headerName: 'Aloitusvuosi', width: 140 },
    { field: 'opiskelijamaara', headerName: 'Opiskelijamäärä', width: 160 },
    { field: 'tutkintoOhjelma', headerName: 'Tutkinto-ohjelma', flex: 1 }
  ]

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      await api.groups.deleteMany(ids as number[])
      invalidate('groups')
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
            Lisää kurssi
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

      <GroupFormDialog
        open={open}
        data={editingRow}
        onClose={() => {
          setOpen(false)
          setEditingRow(null)
          invalidate('groups')
        }}
      />
    </Container>
  )
}