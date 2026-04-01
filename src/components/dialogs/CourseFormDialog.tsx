import React, { useState } from 'react';
import { createCourse } from '../../api'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
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
  const [suunnitellutTunnit , setSuunnitellutTunnit] = useState('');

  const resetForm = () => {
    setKurssiNimi('');
    setKoodi('');
    setOpintopisteet('');
    setSuunnitellutTunnit('');
  };

  const handleAdd = async () => {
    try {
      await createCourse({ nimi, koodi, opintopisteet: Number(opintopisteet), suunnitellutTunnit: Number(suunnitellutTunnit) })
      resetForm()
      onClose()
    } catch (err) {
      console.error('Virhe kurssin luonnissa:', err)
    }
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Kurssin tiedot</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Kurssin nimi"
            variant="outlined"
            value={nimi}
            onChange={(e) => setKurssiNimi(e.target.value)}
            fullWidth
          />
          <TextField
            label="Kurssin koodi"
            variant="outlined"
            value={koodi}
            onChange={(e) => setKoodi(e.target.value)}
            fullWidth
          />
          <TextField
            label="Opintopisteet"
            variant="outlined"
            value={opintopisteet}
            onChange={handleIntChange(setOpintopisteet)}
            fullWidth
          />
          <TextField
            label="Tuntien määrä"
            variant="outlined"
            value={suunnitellutTunnit}
            onChange={handleIntChange(setSuunnitellutTunnit)}
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
          disabled={!nimi || !koodi || !opintopisteet || !suunnitellutTunnit }
        >
          Lisää
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseFormDialog;