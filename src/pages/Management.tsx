import { useState, useContext, useMemo, useEffect, type JSX } from 'react'
import {
  Box, Paper, Container, Tabs, Tab,
  CircularProgress
} from '@mui/material'
import {
  School, Group, MeetingRoom, Book
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { api } from '../api'
import { useCourses, useGroups, useTeachers, useRooms, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import type { GridColDef, GridRowId } from '@mui/x-data-grid'
import { lazy, Suspense } from 'react'

const CourseFormDialog = lazy(() => import('../components/dialogs/CourseFormDialog'))
const GroupFormDialog = lazy(() => import('../components/dialogs/GroupFormDialog'))
const TeacherFormDialog = lazy(() => import('../components/dialogs/TeacherFormDialog'))
const ClassroomFormDialog = lazy(() => import('../components/dialogs/ClassroomFormDialog'))

interface ManagementConfig {
  label: string;
  singularLabel: string;
  key: string;
  icon: JSX.Element;
  data: any[];
  deleteApi: (ids: any[]) => Promise<any>;
  Dialog: React.ComponentType<any>;
  columns: GridColDef[];
  detailPath?: string;
}

export default function UnifiedManagementPage() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const invalidate = useInvalidate()

  const [activeTab, setActiveTab] = useState(0)
  const [open, setOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any | null>(null)
  const location = useLocation()

  const courses = useCourses()
  const groups = useGroups()
  const teachers = useTeachers()
  const rooms = useRooms()

  const configs: ManagementConfig[] = useMemo(() => [
    {
      label: 'Kurssit',
      singularLabel: 'kurssi',
      key: 'courses',
      icon: <Book />,
      data: courses.data || [],
      deleteApi: (ids) => api.courses.deleteMany(ids),
      Dialog: CourseFormDialog,
      columns: [
        { field: 'nimi', headerName: 'Kurssi', flex: 1 },
        { field: 'koodi', headerName: 'Koodi', width: 120 },
        { field: 'opintopisteet', headerName: 'OP', width: 80 },
      ]
    },
    {
      label: 'Ryhmät',
      singularLabel: 'ryhmä',
      key: 'groups',
      icon: <Group />,
      data: groups.data || [],
      deleteApi: (ids) => api.groups.deleteMany(ids as number[]),
      Dialog: GroupFormDialog,
      columns: [
        { field: 'ryhmatunnus', headerName: 'Ryhmatunnus', flex: 1 },
        { field: 'tutkintoOhjelma', headerName: 'Tutkinto-ohjelma', flex: 1 },
        { field: 'opiskelijamaara', headerName: 'Opiskelijoita', width: 120 }
      ]
    },
    {
      label: 'Opettajat',
      singularLabel: 'opettaja',
      key: 'teachers',
      icon: <School />,
      data: teachers.data || [],
      deleteApi: (ids) => api.teachers.deleteMany(ids as number[]),
      Dialog: TeacherFormDialog,
      detailPath: '/teachers',
      columns: [
        { field: 'nimi', headerName: 'Etunimi', flex: 1 },
        { field: 'sukunimi', headerName: 'Sukunimi', flex: 1 },
        { field: 'sahkoposti', headerName: 'Sähköposti', flex: 1 },
      ]
    },
    {
      label: 'Luokkahuoneet',
      singularLabel: 'luokkahuone',
      key: 'rooms',
      icon: <MeetingRoom />,
      data: rooms.data || [],
      deleteApi: (ids) => api.rooms.deleteMany(ids),
      Dialog: ClassroomFormDialog,
      columns: [
        { field: 'huoneenNumero', headerName: 'Huone', flex: 1 },
        { field: 'kapasiteetti', headerName: 'Kapasiteetti', width: 130 },
        { field: 'tyyppi', headerName: 'Tyyppi', width: 200 }
      ]
    }
  ], [courses.data, groups.data, teachers.data, rooms.data])

  const current = configs[activeTab]

  useEffect(() => {
    const search = new URLSearchParams(location.search)
    const tabParam = search.get('tab') || (location.state as { tab?: string } | null)?.tab
    if (!tabParam) return
    const idx = configs.findIndex(c => c.key === tabParam || c.label?.toLowerCase() === String(tabParam).toLowerCase())
    if (idx >= 0) setActiveTab(idx)
  }, [location.search, location.state, configs])

  if (courses.isLoading || groups.isLoading || teachers.isLoading || rooms.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: 'action.hover',
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { py: 2, minHeight: 64, fontWeight: 'bold' }
          }}
        >
          {configs.map((tab, i) => (
            <Tab key={i} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>

        <Box sx={{ height: 650, width: '100%', p: 1 }}>
          <DatagridComponent
            rows={current.data}
            columns={current.columns}
            checkboxSelection
            onAddRow={user ? () => { setEditingRow(null); setOpen(true); } : undefined}
            addButtonLabel={`Lisää uusi ${current.singularLabel}`}
            showOpenButton={Boolean(current.detailPath)}
            onRowClick={current.detailPath ? (id: GridRowId) => navigate(`${current.detailPath}/${id}`) : undefined}
            onOpenRow={current.detailPath ? (id: GridRowId) => navigate(`${current.detailPath}/${id}`) : undefined}
            onDeleteRows={async (ids: GridRowId[]) => {
              try {
                await current.deleteApi(ids);
                invalidate(current.key);
              } catch (err) {
                console.error("Delete failed", err);
              }
            }}
            onEditRow={(id: GridRowId) => {
              setEditingRow(current.data.find((r: any) => r.id === id))
              setOpen(true)
            }}
            sx={{ border: 'none' }}
          />
        </Box>
      </Paper>

      {user && (
        <Suspense fallback={null}>
          <current.Dialog
            open={open}
            data={editingRow}
            onClose={() => {
              setOpen(false)
              setEditingRow(null)
              invalidate(current.key)
            }}
          />
        </Suspense>
      )}
    </Container>
  )
}