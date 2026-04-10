import React, { useState } from 'react';

import { api } from '../../api';
import * as T from '../../api/types/api.types';

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
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
  const [error, setError] = useState<string | null>(null);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setHoursPerYear(value);
  };

  const handleAdd = async () => {
    if (!teacherFirstName || !teacherLastName || !email) {
      setError("Täytä kaikki pakolliset kentät.");
      return;
    }

    try {
      await api.teachers.create({
        nimi: teacherFirstName,
        sukunimi: teacherLastName,
        sahkoposti: email,
        sopimustunnit: Number(hoursPerYear) || 0,
        vapaaResurssi: Number(hoursPerYear) || 0
      });

      handleClose();
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error);
    }
  };

  const handleClose = () => {
    setTeacherFirstName('');
    setTeacherLastName('');
    setEmail('');
    setHoursPerYear('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisää uusi opettaja</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Etunimi"
            variant="outlined"
            value={teacherFirstName}
            onChange={(e) => setTeacherFirstName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Sukunimi"
            variant="outlined"
            value={teacherLastName}
            onChange={(e) => setTeacherLastName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Sähköposti"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Sopimustunnit (h/vuosi)"
            variant="outlined"
            value={hoursPerYear}
            onChange={handleHoursChange}
            fullWidth
            helperText="Syötä vain numeroita"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Peruuta</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!teacherFirstName || !teacherLastName || !email}
        >
          Lisää opettaja
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherFormDialog;