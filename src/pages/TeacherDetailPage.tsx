import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Box, Typography, CircularProgress, Container, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { api } from '../api';
import * as T from '../api/types/api.types';
import Calendar from '../components/Calendar';

export default function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<T.Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.teachers.getOne(id);
        setTeacher(data);
      } catch (err) {
        console.error('Failed to load teacher details:', err);
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (!teacher) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Opettajaa ei löytynyt.</Typography>
        <Button onClick={() => navigate('/teachers')}>Palaa listaan</Button>
      </Box>
    );
  }

  return (
    // maxWidth="lg" keeps the page from getting too wide, 
    // but doesn't force a background color.
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

      <Box sx={{ display: 'flex', gap: 6, mb: 4, mt: 2 }}>
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
        <Calendar refreshKey={0} teacherId={Number(id)} hideFilters />
      </Box>
    </Container>
  );
}