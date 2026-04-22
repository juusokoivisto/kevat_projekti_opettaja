import { useState, useContext, useMemo, type JSX } from 'react'
import {
  Button, Box, Paper, Container, Tabs, Tab, 
  Typography, Stack, CircularProgress, Chip
} from '@mui/material'
import { 
  School, Group, MeetingRoom, Book, Add 
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import { api } from '../api'
import { useCourses, useGroups, useTeachers, useRooms, useInvalidate } from '../hooks/useQueries'
import DatagridComponent from '../components/DatagridComponent'
import type { GridColDef } from '@mui/x-data-grid'

// Form Dialogs
import CourseFormDialog from '../components/dialogs/CourseFormDialog'
import GroupFormDialog from '../components/dialogs/GroupFormDialog'
import TeacherFormDialog from '../components/dialogs/TeacherFormDialog'
import ClassroomFormDialog from '../components/dialogs/ClassroomFormDialog'

// Type definition to satisfy TypeScript for the dynamic API calls
interface ManagementConfig {
  label: string;
  key: string;
  icon: JSX.Element;
  data: any[];
  deleteApi: (ids: any[]) => Promise<any>;
  Dialog: React.ComponentType<any>;
  columns: GridColDef[];
  detailPath?: string; // Optional path for "Open" button navigation
}

export default function UnifiedManagementPage() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const invalidate = useInvalidate()
  
  const [activeTab, setActiveTab] = useState(0)
  const [open, setOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any | null>(null)

  // Fetching all resources
  const courses = useCourses()
  const groups = useGroups()
  const teachers = useTeachers()
  const rooms = useRooms()

  const configs: ManagementConfig[] = useMemo(() => [
    {
      label: 'Kurssit',
      key: 'courses',
      icon: <Book />,
      data: courses.data || [],
      deleteApi: (ids) => api.courses.deleteMany(ids),
      Dialog: CourseFormDialog,
      columns: [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'nimi', headerName: 'Kurssi', flex: 1 },
        { field: 'koodi', headerName: 'Koodi', width: 120 },
        { field: 'opintopisteet', headerName: 'OP', width: 80 },
      ]
    },
    {
      label: 'Ryhmät',
      key: 'groups',
      icon: <Group />,
      data: groups.data || [],
      deleteApi: (ids) => api.groups.deleteMany(ids as number[]),
      Dialog: GroupFormDialog,
      columns: [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'ryhmatunnus', headerName: 'Ryhmatunnus', flex: 1 },
        { field: 'tutkintoOhjelma', headerName: 'Tutkinto-ohjelma', flex: 1 },
        { field: 'opiskelijamaara', headerName: 'Määrä', width: 100 }
      ]
    },
    {
      label: 'Opettajat',
      key: 'teachers',
      icon: <School />,
      data: teachers.data || [],
      deleteApi: (ids) => api.teachers.deleteMany(ids as number[]),
      Dialog: TeacherFormDialog,
      detailPath: '/teachers',
      columns: [
        { field: 'nimi', headerName: 'Etunimi', flex: 1 },
        { field: 'sukunimi', headerName: 'Sukunimi', flex: 1 },
        { field: 'sahkoposti', headerName: 'Sähköposti', flex: 1.5 },
        { 
          field: 'vapaaResurssi', 
          headerName: 'Resurssi', 
          width: 120,
          renderCell: (params) => (
            <Chip 
              label={`${params.value}h`} 
              color={params.value > 10 ? "success" : "warning"} 
              variant="outlined" 
              size="small" 
            />
          )
        }
      ]
    },
    {
      label: 'Luokkahuoneet',
      key: 'rooms',
      icon: <MeetingRoom />,
      data: rooms.data || [],
      deleteApi: (ids) => api.rooms.deleteMany(ids),
      Dialog: ClassroomFormDialog,
      columns: [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'huoneenNumero', headerName: 'Huone', flex: 1 },
        { field: 'kapasiteetti', headerName: 'Kapasiteetti', width: 130 },
        { 
          field: 'tyyppi', 
          headerName: 'Tyyppi', 
          flex: 1,
          renderCell: (params) => (
            <Chip label={params.value} size="small" color="primary" />
          )
        }
      ]
    }
  ], [courses.data, groups.data, teachers.data, rooms.data])

  const current = configs[activeTab]

  if (courses.isLoading || groups.isLoading || teachers.isLoading || rooms.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
            Hallintapaneeli
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hallitse oppilaitoksen resursseja yhdessä näkymässä
          </Typography>
        </Box>
        
        {user && (
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => { setEditingRow(null); setOpen(true); }}
            sx={{ borderRadius: '8px', px: 3, py: 1.2, textTransform: 'none', fontWeight: 'bold' }}
          >
            Lisää uusi {current.label.toLowerCase()}
          </Button>
        )}
      </Stack>

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
            disableRowSelectionOnClick
            showOpenButton={Boolean(current.detailPath)}
            onOpenRow={current.detailPath ? (id) => navigate(`${current.detailPath}/${id}`) : undefined}
            onDeleteRows={async (ids: (string | number)[]) => {
              try {
                await current.deleteApi(ids);
                invalidate(current.key);
              } catch (err) {
                console.error("Delete failed", err);
              }
            }}
            onEditRow={(id) => {
              setEditingRow(current.data.find((r: any) => r.id === id))
              setOpen(true)
            }}
            sx={{ border: 'none' }}
          />
        </Box>
      </Paper>

      <current.Dialog
        open={open}
        data={editingRow}
        onClose={() => {
          setOpen(false)
          setEditingRow(null)
          invalidate(current.key)
        }}
      />
    </Container>
  )
}