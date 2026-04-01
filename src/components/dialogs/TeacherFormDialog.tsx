import React, { useState } from 'react';
import { createTeacher } from '../../api'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material';

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const TeacherFormDialog: React.FC<TeacherFormDialogProps> = ({ open, onClose }) => {
  const [teacherFirstName, setTeacherFirstName] = useState('');
  const [teacherLastName, setTeacherLastName] = useState('');
  const [email, setEmail] = useState('');
  const [hoursPerYear, setHoursPerYear] = useState('');

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setHoursPerYear(value);
  };

  const handleAdd = () => {
    (async () => {
      try {
        await createTeacher({ nimi: teacherFirstName, sukunimi: teacherLastName, sahkoposti: email, sopimustunnit: Number(hoursPerYear) })
        setTeacherFirstName('');
        setTeacherLastName('');
        setEmail('');
        setHoursPerYear('');
        onClose();
      } catch (err) {
        console.error('Virhe opettajan luomisessa:', err)
      }
    })()
  };

  const handleClose = () => {
    setTeacherFirstName('');
    setTeacherLastName('');
    setEmail('');
    setHoursPerYear('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Opettajan tiedot</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Opettajan etunimi"
            variant="outlined"
            value={teacherFirstName}
            onChange={(e) => setTeacherFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Opettajan sukunimi"
            variant="outlined"
            value={teacherLastName}
            onChange={(e) => setTeacherLastName(e.target.value)}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Peruuta</Button>
        <Button variant="contained" color="primary" onClick={handleAdd}>Lisää</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherFormDialog;