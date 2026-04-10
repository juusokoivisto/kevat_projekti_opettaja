import React, { useState } from 'react';

import { api } from '../../api';
import * as T from '../../api/types/api.types';

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
} from '@mui/material';

interface CourseFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const handleIntChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setter(e.target.value.replace(/\D/g, ''));
};

const CourseFormDialog: React.FC<CourseFormDialogProps> = ({ open, onClose }) => {
  const [nimi, setKurssiNimi] = useState('');
  const [koodi, setKoodi] = useState('');
  const [opintopisteet, setOpintopisteet] = useState('');
  const [suunnitellutTunnit, setSuunnitellutTunnit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setKurssiNimi('');
    setKoodi('');
    setOpintopisteet('');
    setSuunnitellutTunnit('');
    setError(null);
  };

  const handleAdd = async () => {
    try {
      await api.courses.create({
        nimi,
        koodi,
        opintopisteet: Number(opintopisteet),
        suunnitellutTunnit: Number(suunnitellutTunnit)
      });

      resetForm();
      onClose();
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error || 'Virhe kurssin luonnissa');
      console.error('Virhe kurssin luonnissa:', err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isInvalid = !nimi || !koodi || !opintopisteet || !suunnitellutTunnit;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisää uusi kurssi</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Kurssin nimi"
            variant="outlined"
            value={nimi}
            onChange={(e) => setKurssiNimi(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Kurssin koodi"
            variant="outlined"
            value={koodi}
            onChange={(e) => setKoodi(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Opintopisteet"
            variant="outlined"
            value={opintopisteet}
            onChange={handleIntChange(setOpintopisteet)}
            fullWidth
            required
          />
          <TextField
            label="Suunniteltu tuntimäärä"
            variant="outlined"
            value={suunnitellutTunnit}
            onChange={handleIntChange(setSuunnitellutTunnit)}
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
          Lisää kurssi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseFormDialog;