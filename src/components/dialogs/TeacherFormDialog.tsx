import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material';

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
  data?: any | null;
}

const TeacherFormDialog: React.FC<TeacherFormDialogProps> = ({ open, onClose, data }) => {
  const [teacherFirstName, setTeacherFirstName] = useState('');
  const [teacherLastName, setTeacherLastName] = useState('');
  const [email, setEmail] = useState('');
  const [hoursPerYear, setHoursPerYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTeacherFirstName('');
    setTeacherLastName('');
    setEmail('');
    setHoursPerYear('');
    setError(null);
  };

  useEffect(() => {
    if (data) {
      setTeacherFirstName(data.teacherFirstName || '');
      setTeacherLastName(data.teacherLastName || '');
      setEmail(data.email || '');
      setHoursPerYear(String(data.hoursPerYear || ''));
    } else {
      reset();
    }
  }, [data, open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        nimi: teacherFirstName,
        sukunimi: teacherLastName,
        sahkoposti: email,
        sopimustunnit: Number(hoursPerYear),
      };

      if (data) {
        await api.teachers.update(data.id, payload);
      } else {
        await api.teachers.create(payload as any);
      }

      reset();
      onClose();
    } catch (err: any) {
      setError(err?.error || 'Tallennus epäonnistui');
    }
  };

  const isInvalid =
    !teacherFirstName || !teacherLastName || !email || !hoursPerYear;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data ? 'Muokkaa opettajaa' : 'Lisää opettaja'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && (
            <Box sx={{ color: 'red' }}>
              {error}
            </Box>
          )}

          <TextField
            label="Etunimi"
            value={teacherFirstName}
            onChange={(e) => setTeacherFirstName(e.target.value)}
          />

          <TextField
            label="Sukunimi"
            value={teacherLastName}
            onChange={(e) => setTeacherLastName(e.target.value)}
          />

          <TextField
            label="Sähköposti"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Sopimustunnit (h/vuosi)"
            value={hoursPerYear}
            onChange={(e) => setHoursPerYear(e.target.value)}
            helperText="Syötä vain numeroita"
          />

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isInvalid}
        >
          {data ? 'Tallenna' : 'Lisää'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherFormDialog;