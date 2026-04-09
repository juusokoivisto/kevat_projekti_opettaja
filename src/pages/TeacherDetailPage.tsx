import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { get } from '../api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Box } from '@mui/material';

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
        const data = await get(`/opettajat?id=${id}`);

        const found = data.find((t: any) => String(t.id) === String(id));
        setTeacher(found);
    };

    if (id) load();
  }, [id]);

  if (!teacher) return <div>Ladataan...</div>;

  return (
    <div>
    <Box sx={{ ml: 2 }}>
        <Button
            variant="contained"
            onClick={() => navigate('/teachers')}
        >
            ← Takaisin
        </Button>
      <h2>{teacher.nimi} {teacher.sukunimi}</h2>
      <p>Email: {teacher.sahkoposti}</p>
      <p>Sopimustunnit: {teacher.sopimustunnit}</p>
      <p>Vapaa resurssi: {teacher.vapaaResurssi}</p>
      
      </Box>
    </div>
  );
}