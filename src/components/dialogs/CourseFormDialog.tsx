import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  data?: any | null;
}

const CourseFormDialog: React.FC<Props> = ({ open, onClose, data }) => {
  const [nimi, setNimi] = useState('');
  const [koodi, setKoodi] = useState('');
  const [op, setOp] = useState('');
  const [suunnitellutTunnit, setSuunnitellutTunnit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setNimi('');
    setKoodi('');
    setOp('');
    setSuunnitellutTunnit('');
    setError(null);
  };

  useEffect(() => {
    if (data) {
      setNimi(data.nimi || '');
      setKoodi(data.koodi || '');
      setOp(String(data.opintopisteet || ''));
      setSuunnitellutTunnit(String(data.suunnitellutTunnit || ''));
    } else {
      reset();
    }
  }, [data, open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        nimi,
        koodi,
        opintopisteet: Number(op),
        suunnitellutTunnit: Number(suunnitellutTunnit)
      };

      if (data) {
        await api.courses.update(data.id, payload);
      } else {
        await api.courses.create(payload);
      }

      reset();
      onClose();
    } catch (err: any) {
      setError(err?.error || 'Tallennus epäonnistui');
    }
  };

  const isInvalid =
    !nimi || !koodi || !op || !suunnitellutTunnit;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data ? 'Muokkaa kurssia' : 'Lisää kurssi'}
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
            label="Nimi"
            value={nimi}
            onChange={(e) => setNimi(e.target.value)}
          />

          <TextField
            label="Koodi"
            value={koodi}
            onChange={(e) => setKoodi(e.target.value)}
          />

          <TextField
            label="Opintopisteet"
            value={op}
            onChange={(e) => setOp(e.target.value)}
          />

          <TextField
            label="Suunnitellut tunnit"
            value={suunnitellutTunnit}
            onChange={(e) => setSuunnitellutTunnit(e.target.value)}
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

export default CourseFormDialog;