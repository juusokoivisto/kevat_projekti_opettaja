import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
} from '@mui/material';

interface ClassroomFormDialogProps {
  open: boolean;
  onClose: () => void;
  data?: any | null;
}

const ClassroomFormDialog: React.FC<ClassroomFormDialogProps> = ({ open, onClose, data }) => {
  const [huoneenNumero, setHuoneenNumero] = useState('');
  const [kapasiteetti, setKapasiteetti] = useState('');
  const [tyyppi, setTyyppi] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setHuoneenNumero('');
    setKapasiteetti('');
    setTyyppi('');
    setError(null);
  };

  useEffect(() => {
    if (data) {
      setHuoneenNumero(data.huoneenNumero || '');
      setKapasiteetti(String(data.kapasiteetti || ''));
      setTyyppi(data.tyyppi || '');
    } else {
      reset();
    }
  }, [data, open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        huoneenNumero,
        kapasiteetti: Number(kapasiteetti),
        tyyppi
      };

      if (data) {
        await api.rooms.update(data.id, payload);
      } else {
        await api.rooms.create(payload);
      }

      reset();
      onClose();
    } catch (err: any) {
      setError(err?.error || 'Tallennus epäonnistui');
    }
  };

  const isInvalid =
    !huoneenNumero || !kapasiteetti || !tyyppi;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data ? 'Muokkaa huonetta' : 'Lisää huone'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && (
            <Alert severity="error">
              {error.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </Alert>
          )}

          <TextField
            label="Huoneen numero"
            value={huoneenNumero}
            onChange={(e) => setHuoneenNumero(e.target.value)}
          />

          <TextField
            label="Kapasiteetti"
            value={kapasiteetti}
            onChange={(e) => setKapasiteetti(e.target.value)}
          />

          <TextField
            label="Tyyppi"
            value={tyyppi}
            onChange={(e) => setTyyppi(e.target.value)}
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

export default ClassroomFormDialog;