import React, { useState } from 'react';

import { api } from '../../api';
import * as T from '../../api/types/api.types';

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
} from '@mui/material';

interface ClassroomFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const handleIntChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setter(e.target.value.replace(/\D/g, ''));
};

const ClassroomFormDialog: React.FC<ClassroomFormDialogProps> = ({ open, onClose }) => {
  const [huoneenNumero, setHuoneenNumero] = useState('');
  const [kapasiteetti, setKapasiteetti] = useState('');
  const [tyyppi, setTyyppi] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setHuoneenNumero('');
    setKapasiteetti('');
    setTyyppi('');
    setError(null);
  };

  const handleAdd = async () => {
    try {
      await api.rooms.create({
        huoneenNumero,
        kapasiteetti: parseInt(kapasiteetti, 10),
        tyyppi
      });
      resetForm();
      onClose();
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error || 'Virhe luokkahuoneen luonnissa');
      console.error('Virhe luokkahuoneen luonnissa:', err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 4. Derived validation state
  const isInvalid = !huoneenNumero || !kapasiteetti || !tyyppi;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisää uusi tila</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Huoneen numero (esim. A102)"
            variant="outlined"
            value={huoneenNumero}
            onChange={(e) => setHuoneenNumero(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Kapasiteetti (henkilömäärä)"
            variant="outlined"
            value={kapasiteetti}
            onChange={handleIntChange(setKapasiteetti)}
            fullWidth
            required
          />
          <TextField
            label="Tyyppi (esim. Luokka, Labra, Auditorio)"
            variant="outlined"
            value={tyyppi}
            onChange={(e) => setTyyppi(e.target.value)}
            fullWidth
            required
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Peruuta</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={isInvalid}
        >
          Lisää tila
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassroomFormDialog;