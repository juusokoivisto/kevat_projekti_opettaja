import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert
} from '@mui/material';

interface GroupFormDialogProps {
  open: boolean;
  onClose: () => void;
  data?: any | null;

}

const GroupFormDialog: React.FC<GroupFormDialogProps> = ({ open, onClose, data }) => {
  const [groupId, setGroupId] = useState('');
  const [startingYear, setStartingYear] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setGroupId('');
    setStartingYear('');
    setStudentCount('');
    setDegreeProgram('');
    setError(null);
  };

  useEffect(() => {
    if (data) {
      setGroupId(data.ryhmatunnus || '');
      setStartingYear(String(data.aloitusvuosi || ''));
      setStudentCount(String(data.opiskelijamaara || ''));
      setDegreeProgram(data.tutkintoOhjelma || '');
    } else {
      reset();
    }
  }, [data, open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        ryhmatunnus: groupId,
        aloitusvuosi: Number(startingYear),
        opiskelijamaara: Number(studentCount),
        tutkintoOhjelma: degreeProgram
      };

      if (data) {
        await api.groups.update(data.id, payload);
      } else {
        await api.groups.create(payload);
      }
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.error || 'Tallennus epäonnistui');
    }
  };



  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '');
      setter(value);
    };


  const handleClose = () => {
    setGroupId('');
    setStartingYear('');
    setStudentCount('');
    setDegreeProgram('');
    setError(null);
    onClose();
  };
  const isInvalid =
    !groupId || !startingYear || !studentCount || !degreeProgram;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data ? 'Muokkaa opiskelijaryhmää' : 'Lisää opiskelijaryhmä'}
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
            inputProps={{ maxLength: 4 }}
            onChange={handleNumericChange(setStartingYear)}
            fullWidth
            required
          />
          <TextField
            label="Opiskelijamäärä"
            variant="outlined"
            value={studentCount}
            inputProps={{ maxLength: 2 }}
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
          onClick={handleSubmit}
          disabled={isInvalid}
        >
          {data ? 'Tallenna' : 'Lisää'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupFormDialog;