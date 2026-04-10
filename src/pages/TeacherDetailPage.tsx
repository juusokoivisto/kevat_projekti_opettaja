import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';

import { api } from '../api';
import * as T from '../api/types/api.types';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!teacher) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Opettajaa ei löytynyt.</Typography>
        <Button onClick={() => navigate('/teachers')}>Palaa listaan</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button
        variant="contained"
        onClick={() => navigate('/teachers')}
        sx={{ mb: 3 }}
      >
        ← Takaisin
      </Button>

      <Typography variant="h4" gutterBottom>
        {teacher.nimi} {teacher.sukunimi}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography><strong>Sähköposti:</strong> {teacher.sahkoposti}</Typography>
        <Typography><strong>Sopimustunnit:</strong> {teacher.sopimustunnit} h</Typography>
        <Typography><strong>Vapaa resurssi:</strong> {teacher.vapaaResurssi} h</Typography>
      </Box>
    </Box>
  );
}