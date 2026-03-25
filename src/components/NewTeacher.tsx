import React, { useState } from 'react';
import { Container, TextField, Typography, Box, Button } from '@mui/material';

const TeacherForm: React.FC = () => {
  const [teacherName, setTeacherName] = useState('');
  const [email, setEmail] = useState('');
  const [hoursPerYear, setHoursPerYear] = useState('');

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setHoursPerYear(value);
  };

  const handleAdd = () => {
    // Tallennetaan consoliin (raaka versio)
    console.log('Lisätty opettaja:', {
      teacherName,
      email,
      hoursPerYear,
    });

    // Tyhjennetään kentät lisäyksen jälkeen
    setTeacherName('');
    setEmail('');
    setHoursPerYear('');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Opettajan tiedot
      </Typography>
      <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Opettajan nimi"
          variant="outlined"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Sähköposti"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Tunnit vuodessa"
          variant="outlined"
          value={hoursPerYear}
          onChange={handleHoursChange}
          fullWidth
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAdd}
        >
          Lisää
        </Button>
      </Box>
    </Container>
  );
};

export default TeacherForm;