import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Autocomplete, Chip, CircularProgress
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
  data?: any | null;
}

const TeacherFormDialog: React.FC<TeacherFormDialogProps> = ({ open, onClose, data }) => {
  const [teacherFirstName, setTeacherFirstName] = useState('');
  const [teacherLastName, setTeacherLastName] = useState('');
  const [email, setEmail] = useState('');
  const [hoursPerYear, setHoursPerYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<string>('#1976d2');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const reset = () => {
    setTeacherFirstName('');
    setTeacherLastName('');
    setEmail('');
    setHoursPerYear('');
    setError(null);
    setColor('#1976d2');
  };

  useEffect(() => {
    if (data) {
      setTeacherFirstName(data.nimi || '');
      setTeacherLastName(data.sukunimi || '');
      setEmail(data.sahkoposti || '');
      setHoursPerYear(String(data.sopimustunnit || ''));
      setColor(data.vari || '#1976d2');
      // set selected courses if provided by server
      if (data.kurssit && Array.isArray(data.kurssit)) {
        setSelectedCourses(data.kurssit);
      } else if (data.opettajaKurssit && Array.isArray(data.opettajaKurssit)) {
        setSelectedCourses(data.opettajaKurssit.map((r: any) => r.kurssi));
      } else {
        setSelectedCourses([]);
      }
    } else {
      reset();
    }
  }, [data, open]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingCourses(true);
        const res = await api.courses.getAll();
        if (!mounted) return;
        setCourses(res || []);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoadingCourses(false);
      }
    })();
    return () => { mounted = false };
  }, [open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        nimi: teacherFirstName,
        sukunimi: teacherLastName,
        sahkoposti: email,
        sopimustunnit: Number(hoursPerYear),
        vari: color,
        courseIds: selectedCourses.map(c => c.id),
      };

      if (data) {
        await api.teachers.update(data.id, payload);
      } else {
        await api.teachers.create(payload as any);
      }

      reset();
      onClose();
    } catch (err: any) {
      setError(err?.error || 'Tallennus epäonnistui');
    }
  };

  const isInvalid =
    !teacherFirstName || !teacherLastName || !email || !hoursPerYear;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data ? 'Muokkaa opettajaa' : 'Lisää opettaja'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

          {error && (
            <Box sx={{ color: 'red' }}>
              {error}
            </Box>
          )}

          <TextField
            label="Etunimi"
            value={teacherFirstName}
            onChange={(e) => setTeacherFirstName(e.target.value)}
          />

          <TextField
            label="Sukunimi"
            value={teacherLastName}
            onChange={(e) => setTeacherLastName(e.target.value)}
          />

          <TextField
            label="Sähköposti"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Sopimustunnit (h/vuosi)"
            value={hoursPerYear}
            onChange={(e) => setHoursPerYear(e.target.value)}
            helperText="Syötä vain numeroita"
          />

          <Autocomplete
            multiple
            options={courses}
            getOptionLabel={(o: any) => o.nimi}
            value={selectedCourses}
            onChange={(_, val) => setSelectedCourses(val)}
            isOptionEqualToValue={(a: any, b: any) => a.id === b.id}
            renderTags={(value: any[], getTagProps) =>
              value.map((option, index) => (
                <Chip label={option.nimi} {...getTagProps({ index })} key={option.id} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Kurssit"
                placeholder="Valitse kurssit"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCourses ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />

            <Box>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 28, height: 28, background: color, borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)' }} />
                <Box>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)' }}>Väri</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>{color}</div>
                </Box>
              </Box>
              <Box sx={{ maxWidth: 320 }}>
                <HexColorPicker color={color} onChange={setColor} />
              </Box>
            </Box>

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

export default TeacherFormDialog;