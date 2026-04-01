import React, { useState } from 'react';
import { createClassroom } from '../../api'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
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

  const resetForm = () => {
    setHuoneenNumero('');
    setKapasiteetti('');
    setTyyppi('');
  };

  const handleAdd = async () => {
    try {
      await createClassroom({
        huoneenNumero,
        kapasiteetti: parseInt(kapasiteetti, 10),
        tyyppi
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error('Virhe luokkahuoneen luonnissa:', err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Luokkahuoneen tiedot</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Huoneen numero"
            variant="outlined"
            value={huoneenNumero}
            onChange={(e) => setHuoneenNumero(e.target.value)}
            fullWidth
          />
          <TextField
            label="Kapasiteetti"
            variant="outlined"
            value={kapasiteetti}
            onChange={handleIntChange(setKapasiteetti)}
            fullWidth
          />
          <TextField
            label="Tyyppi"
            variant="outlined"
            value={tyyppi}
            onChange={(e) => setTyyppi(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Peruuta</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!huoneenNumero || !kapasiteetti || !tyyppi}
        >
          Lisää
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassroomFormDialog;