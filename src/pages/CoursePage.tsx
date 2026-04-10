import { useState, useContext, useEffect } from 'react'
import { Button, Box, Paper } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import CourseFormDialog from '../components/dialogs/CourseFormDialog'
import { UserContext } from '../App';

import { api } from '../api'
import * as T from '../api/types/api.types'

import DatagridComponent from '../components/DatagridComponent';

export default function CoursePage() {
  const [open, setOpen] = useState(false)
  const { user } = useContext(UserContext);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nimi', headerName: 'Kurssi', flex: 1 },
    { field: 'koodi', headerName: 'Koodi', width: 140 },
    { field: 'opintopisteet', headerName: 'Opintopisteet', width: 140 },
    { field: 'suunnitellutTunnit', headerName: 'Tuntimäärä', width: 140 }
  ]

  const [rows, setRows] = useState<T.Course[]>([])

  const loadData = async () => {
    try {
      const data = await api.courses.getAll()
      setRows(data)
    } catch (err) {
      const apiErr = err as T.ApiError;
      console.error('Error loading courses:', apiErr.error)
    }
  }

  useEffect(() => {
    loadData()
  }, [open])

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      await api.courses.deleteMany(ids as number[]);
      await loadData();
    } catch (err) {
      const apiErr = err as T.ApiError;
      alert(`Poisto epäonnistui: ${apiErr.error}`);
    }
  }

  return (
    <>
      {user && (
        <>
          <Box sx={{ pl: 4 }}>
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Lisää kurssi
            </Button>
          </Box>
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
            onDeleteRows={handleDelete}
          />
        </Paper>
      </Box>
    </>
  )
}