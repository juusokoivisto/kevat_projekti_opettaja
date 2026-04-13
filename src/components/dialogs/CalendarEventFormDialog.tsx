import React, { useState, useEffect } from 'react';

import { api } from '../../api';
import * as T from '../../api/types/api.types';

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Autocomplete, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/fi';

interface CalendarEventFormDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const CalendarEventFormDialog: React.FC<CalendarEventFormDialogProps> = ({ open, onClose }) => {
  const [classrooms, setClassrooms] = useState<T.Classroom[]>([]);
  const [teachers, setTeachers] = useState<T.Teacher[]>([]);
  const [courses, setCourses] = useState<T.Course[]>([]);
  const [groups, setGroups] = useState<T.StudentGroup[]>([]);

  const [classroom, setClassroom] = useState<T.Classroom | null>(null);
  const [teacher, setTeacher] = useState<T.Teacher | null>(null);
  const [course, setCourse] = useState<T.Course | null>(null);
  const [group, setGroup] = useState<T.StudentGroup | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadFormData = async () => {
      try {
        const [roomsRes, teachersRes, coursesRes, groupsRes] = await Promise.all([
          api.rooms.getAll(),
          api.teachers.getAll(),
          api.courses.getAll(),
          api.groups.getAll()
        ]);

        setClassrooms(roomsRes);
        setTeachers(teachersRes);
        setCourses(coursesRes);
        setGroups(groupsRes);
      } catch (err) {
        const apiErr = err as T.ApiError;
        setError("Lomaketietojen haku epäonnistui: " + apiErr.error);
      }
    };

    loadFormData();
  }, [open]);

  const resetForm = () => {
    setClassroom(null);
    setTeacher(null);
    setCourse(null);
    setGroup(null);
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setError(null);
  };

  const buildDateTime = (day: Dayjs, time: Dayjs): Dayjs =>
    day.hour(time.hour()).minute(time.minute()).second(0).millisecond(0);

  const handleAdd = async () => {
    if (!classroom?.id || !teacher?.id || !course?.id || !group?.id || !date || !startTime || !endTime) {
      return;
    }

    try {
      await api.calendar.create({
        huoneId: classroom.id,
        opettajaId: teacher.id,
        kurssiId: course.id,
        ryhmaId: group.id,
        alkaa: buildDateTime(date, startTime).toISOString(),
        paattyy: buildDateTime(date, endTime).toISOString()
      });

      resetForm();
      onClose(true);
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = !!(classroom && teacher && course && group && date && startTime && endTime);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Uusi kalenteritapahtuma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>

            {error && <Alert severity="error">{error}</Alert>}

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
              getOptionLabel={(o) => `${o.koodi} - ${o.nimi}`}
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
              getOptionLabel={(o) => `${o.huoneenNumero} (${o.tyyppi})`}
              renderInput={(params) => <TextField {...params} label="Huone" />}
              fullWidth
            />

            <DatePicker
              label="Päivämäärä"
              value={date}
              onChange={setDate}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <Stack direction="row" spacing={2}>
              <TimePicker
                label="Alkaa"
                value={startTime}
                onChange={setStartTime}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="Päättyy"
                value={endTime}
                onChange={setEndTime}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>

          </Stack>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleClose}>Peruuta</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!isValid}
          >
            Lisää tapahtuma
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CalendarEventFormDialog;