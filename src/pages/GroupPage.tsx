import { useState, useContext } from 'react'
import { Button, Box, Paper, CircularProgress, Alert } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { UserContext } from '../App'
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

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  )
  if (isError) return <Alert severity="error">Lataus epäonnistui</Alert>

  return (
    <>
      {user && (
        <>
          <Box sx={{ pl: 4 }}>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Lisää ryhmä
            </Button>
          </Box>
          <GroupFormDialog
            open={open}
            onClose={() => {
              setOpen(false)
              invalidate('groups')
            }}
          />
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
            onDeleteRows={handleDelete}
          />
        </Paper>
      </Box>
    </>
  )
}