import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material';

interface GroupFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const GroupFormDialog: React.FC<GroupFormDialogProps> = ({ open, onClose }) => {
  const [GroupId, setGroupId] = useState('');
  const [StartingYear, setStartingYear] = useState('');
  const [StudentCount, setStudentCount] = useState('');
  const [DegreeProgram, setDegreeProgram] = useState('');

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setStartingYear(value);
  };
  const handleStudentCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setStudentCount(value);
  };

  const handleAdd = () => {
    console.log('Lisätty ryhmä:', { GroupId, StartingYear, StudentCount, DegreeProgram });
    setGroupId('');
    setStartingYear('');
    setStudentCount('');
    setDegreeProgram('');
    onClose();
  };

  const handleClose = () => {
    setGroupId('');
    setStartingYear('');
    setStudentCount('');
    setDegreeProgram('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Ryhmän tiedot</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Ryhmätunnus"
            variant="outlined"
            value={GroupId}
            onChange={(e) => setGroupId(e.target.value)}
            fullWidth
          />
          <TextField
            label="Aloitusvuosi"
            variant="outlined"
            value={StartingYear}
            onChange={handleYearChange}
            fullWidth
          />
          <TextField
            label="Opiskelijamäärä"
            variant="outlined"
            value={StudentCount}
            onChange={handleStudentCountChange}
            fullWidth
          />
          <TextField
            label="Tutkinto-ohjelma"
            variant="outlined"
            value={DegreeProgram}
            onChange={(e) => setDegreeProgram(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Peruuta</Button>
        <Button variant="contained" color="primary" onClick={handleAdd}>Lisää</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupFormDialog;