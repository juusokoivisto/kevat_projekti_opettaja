import React, { useState, useEffect } from 'react';
import { getClassrooms, getTeachers, getCourses, getGroups, createCalendarEvent } from '../../api';
import type { Classroom, Teacher, Course, StudentGroup } from '../../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/fi';

interface CalendarEventFormDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const CalendarEventFormDialog: React.FC<CalendarEventFormDialogProps> = ({ open, onClose }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [group, setGroup] = useState<StudentGroup | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (!open) return;
    getClassrooms().then(setClassrooms).catch(console.error);
    getTeachers().then(setTeachers).catch(console.error);
    getCourses().then(setCourses).catch(console.error);
    getGroups().then(setGroups).catch(console.error);
  }, [open]);

  const resetForm = () => {
    setClassroom(null);
    setTeacher(null);
    setCourse(null);
    setGroup(null);
    setStartDate(null);
    setEndDate(null);
  };

  const handleAdd = async () => {
    if (!classroom?.id || !teacher?.id || !course?.id || !group?.id || !startDate || !endDate) {
      return;
    }

    try {
      await createCalendarEvent({
        huoneId: classroom.id,
        opettajaId: teacher.id,
        kurssiId: course.id,
        ryhmaId: group.id,
        alkaa: startDate.toISOString(),
        paattyy: endDate.toISOString()
      });

      resetForm();
      onClose(true);
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Virhe luotaessa tapahtumaa: " + (err as Error).message);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = !!(classroom && teacher && course && group && startDate && endDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Uusi kalenteritapahtuma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={groups}
              value={group}
              onChange={(_, val) => setGroup(val)}
              getOptionLabel={(o) => o.ryhmatunnus}
              renderInput={(params) => <TextField {...params} label="Opiskelijaryhmä" />}
              fullWidth
            />

            <Autocomplete
              options={courses}
              value={course}
              onChange={(_, val) => setCourse(val)}
              getOptionLabel={(o) => o.nimi}
              renderInput={(params) => <TextField {...params} label="Kurssi" />}
              fullWidth
            />

            <Autocomplete
              options={teachers}
              value={teacher}
              onChange={(_, val) => setTeacher(val)}
              getOptionLabel={(o) => `${o.nimi} ${o.sukunimi}`}
              renderInput={(params) => <TextField {...params} label="Opettaja" />}
              fullWidth
            />

            <Autocomplete
              options={classrooms}
              value={classroom}
              onChange={(_, val) => setClassroom(val)}
              getOptionLabel={(o) => o.huoneenNumero}
              renderInput={(params) => <TextField {...params} label="Huoneen numero" />}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <DateTimePicker
                label="Alkaa"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="Päättyy"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Peruuta</Button>
          <Button variant="contained" onClick={handleAdd} disabled={!isValid}>
            Lisää tapahtuma
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CalendarEventFormDialog;