import React, { useState } from 'react';
import { api } from '../../api';
import * as T from '../../api/types/api.types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert, Collapse
} from '@mui/material';

interface ClassroomFormDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void; // Added refresh param for consistency
}

const handleIntChange = (setter: (v: string) => void, clearError: () => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setter(e.target.value.replace(/\D/g, ''));
  clearError();
};

const ClassroomFormDialog: React.FC<ClassroomFormDialogProps> = ({ open, onClose }) => {
  const [huoneenNumero, setHuoneenNumero] = useState('');
  const [kapasiteetti, setKapasiteetti] = useState('');
  const [tyyppi, setTyyppi] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setHuoneenNumero('');
    setKapasiteetti('');
    setTyyppi('');
    setError(null);
    setLoading(false);
  };

  const handleAdd = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.rooms.create({
        huoneenNumero,
        kapasiteetti: parseInt(kapasiteetti, 10),
        tyyppi
      });
      resetForm();
      onClose(true); // Pass true to trigger a list refresh
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error || 'Virhe luokkahuoneen luonnissa');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isInvalid = !huoneenNumero || !kapasiteetti || !tyyppi;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisää uusi tila</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {/* Consistent animated error popup */}
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          </Collapse>

          <TextField
            label="Huoneen numero (esim. A102)"
            variant="outlined"
            value={huoneenNumero}
            onChange={(e) => { setHuoneenNumero(e.target.value); setError(null); }}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label="Kapasiteetti (henkilömäärä)"
            variant="outlined"
            value={kapasiteetti}
            onChange={handleIntChange(setKapasiteetti, () => setError(null))}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label="Tyyppi (esim. Luokka, Labra, Auditorio)"
            variant="outlined"
            value={tyyppi}
            onChange={(e) => { setTyyppi(e.target.value); setError(null); }}
            fullWidth
            required
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Peruuta</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={isInvalid || loading}
        >
          {loading ? 'Lisätään...' : 'Lisää tila'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassroomFormDialog;