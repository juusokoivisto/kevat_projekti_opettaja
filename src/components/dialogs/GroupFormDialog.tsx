import React, { useState } from 'react';

import { api } from '../../api';
import * as T from '../../api/types/api.types';

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
} from '@mui/material';

interface GroupFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const GroupFormDialog: React.FC<GroupFormDialogProps> = ({ open, onClose }) => {
  const [groupId, setGroupId] = useState('');
  const [startingYear, setStartingYear] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '');
      setter(value);
    };

  const handleAdd = async () => {
    if (!groupId || !startingYear || !studentCount || !degreeProgram) {
      setError("Täytä kaikki pakolliset kentät.");
      return;
    }

    try {
      await api.groups.create({
        ryhmatunnus: groupId,
        aloitusvuosi: Number(startingYear),
        opiskelijamaara: Number(studentCount),
        tutkintoOhjelma: degreeProgram
      });

      handleClose();
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error);
    }
  };

  const handleClose = () => {
    setGroupId('');
    setStartingYear('');
    setStudentCount('');
    setDegreeProgram('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisää uusi opiskelijaryhmä</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Ryhmätunnus (esim. TiVi22S1)"
            variant="outlined"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Aloitusvuosi"
            variant="outlined"
            value={startingYear}
            onChange={handleNumericChange(setStartingYear)}
            fullWidth
            required
          />
          <TextField
            label="Opiskelijamäärä"
            variant="outlined"
            value={studentCount}
            onChange={handleNumericChange(setStudentCount)}
            fullWidth
            required
          />
          <TextField
            label="Tutkinto-ohjelma"
            variant="outlined"
            value={degreeProgram}
            onChange={(e) => setDegreeProgram(e.target.value)}
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
          disabled={!groupId || !startingYear || !studentCount || !degreeProgram}
        >
          Lisää ryhmä
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupFormDialog;