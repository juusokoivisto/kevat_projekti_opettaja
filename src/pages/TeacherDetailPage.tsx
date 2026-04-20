import { useParams, useNavigate } from 'react-router-dom'
import { Button, Box, Typography, CircularProgress, Container, Divider } from '@mui/material'
import { useContext, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UserContext } from '../App'
import TeacherFormDialog from '../components/dialogs/TeacherFormDialog'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import Calendar from '../components/Calendar'

export default function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const { data: teacher, isLoading, isError } = useQuery({
    queryKey: ['teachers', id],
    queryFn: () => api.teachers.getOne(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0
  })

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress color="inherit" />
    </Box>
  )

  if (isError || !teacher) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="error">Opettajaa ei löytynyt.</Typography>
      <Button onClick={() => navigate('/teachers')}>Palaa listaan</Button>
    </Box>
  )

  const handleCloseEdit = () => {
    setEditOpen(false)
    qc.invalidateQueries({ queryKey: ['teachers'] })
    qc.invalidateQueries({ queryKey: ['calendar', Number(id)] })
    qc.invalidateQueries({ queryKey: ['calendar'] })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/teachers')}
        sx={{ mb: 3, color: 'text.primary' }}
      >
        Takaisin
      </Button>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        {teacher.nimi} {teacher.sukunimi}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, mb: 4, mt: 2 }}>
        <Box
          onClick={() => { if (user?.username === 'ADMIN') setEditOpen(true) }}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: teacher.vari || '#1976d2',
            boxShadow: 2,
            cursor: user?.username === 'ADMIN' ? 'pointer' : 'default',
            flexShrink: 0
          }}
          title={user?.username === 'ADMIN' ? 'Muokkaa opettajan väriä' : ''}
        />

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>SÄHKÖPOSTI</Typography>
          <Typography variant="body1">{teacher.sahkoposti}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>SOPIMUSTUNNIT</Typography>
          <Typography variant="body1">{teacher.sopimustunnit} h</Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>VAPAA RESURSSI</Typography>
          <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
            {teacher.vapaaResurssi} h
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 5, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
        Kalenteri
      </Typography>

      <Box sx={{ maxWidth: '900px' }}>
        <Calendar teacherId={Number(id)} hideFilters />
      </Box>

      <TeacherFormDialog open={editOpen} data={teacher} onClose={handleCloseEdit} />
    </Container>
  )
}