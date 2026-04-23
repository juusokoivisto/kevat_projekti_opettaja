import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import * as T from '../../api/types/api.types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Autocomplete, Alert,
  ToggleButton, ToggleButtonGroup, FormControlLabel,
  Switch, Typography, Divider, Box, InputAdornment
} from '@mui/material';
import { School, Person, Room, Book, AccessTime } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/fi';
import {
  SLOTS, type SlotKey,
  saveDefaults, loadDefaults,
  isWeekday, getWeekdaysBetween, getSlotTimes, buildEventsToCreate,
} from '../../utils/calendarEventFormHelpers';

dayjs.extend(isSameOrBefore);

interface CalendarEventFormDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  data?: T.CalendarEvent | null;
}

const CalendarEventFormDialog: React.FC<CalendarEventFormDialogProps> = ({ open, onClose, data }) => {
  const [classrooms, setClassrooms] = useState<T.Classroom[]>([]);
  const [teachers, setTeachers] = useState<T.Teacher[]>([]);
  const [courses, setCourses] = useState<T.Course[]>([]);
  const [allCourses, setAllCourses] = useState<T.Course[]>([]);
  const [groups, setGroups] = useState<T.StudentGroup[]>([]);

  const [classroom, setClassroom] = useState<T.Classroom | null>(null);
  const [teacher, setTeacher] = useState<T.Teacher | null>(null);
  const [course, setCourse] = useState<T.Course | null>(null);
  const [group, setGroup] = useState<T.StudentGroup | null>(null);

  const [useDateRange, setUseDateRange] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [dateRangeStart, setDateRangeStart] = useState<Dayjs | null>(dayjs());
  const [dateRangeEnd, setDateRangeEnd] = useState<Dayjs | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<SlotKey | null>(null);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customStart, setCustomStart] = useState<Dayjs | null>(null);
  const [customEnd, setCustomEnd] = useState<Dayjs | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeDate = useDateRange ? dateRangeStart : date;
  const isMonday = activeDate?.day() === 1;

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const [roomsRes, teachersRes, coursesRes, groupsRes] = await Promise.all([
          api.rooms.getAll(), api.teachers.getAll(), api.courses.getAll(), api.groups.getAll(),
        ]);
        setClassrooms(roomsRes); setTeachers(teachersRes);
        setCourses(coursesRes); setAllCourses(coursesRes); setGroups(groupsRes);

        if (data) {
          applyEditDefaults(roomsRes, teachersRes, coursesRes, groupsRes);
        } else {
          applyStoredDefaults(teachersRes, coursesRes, groupsRes, roomsRes);
        }
      } catch (err) {
        setError('Lomaketietojen haku epäonnistui: ' + (err as T.ApiError).error);
      }
    };

    load();
  }, [open, data]);

  const applyEditDefaults = (
    rooms: T.Classroom[], teachersRes: T.Teacher[],
    coursesRes: T.Course[], groupsRes: T.StudentGroup[],
  ) => {
    if (!data) return;
    setClassroom(rooms.find((r) => r.id === data.tilaId) ?? null);
    const selTeacher = teachersRes.find((t) => t.id === data.opettajaId) ?? null;
    setTeacher(selTeacher);
    const teacherCourses = (selTeacher as any)?.kurssit;
    if (teacherCourses?.length) {
      setCourses(teacherCourses);
      setCourse(teacherCourses.find((c: any) => c.id === data.kurssiId) ?? null);
    } else {
      setCourse(coursesRes.find((c) => c.id === data.kurssiId) ?? null);
    }
    setGroup(groupsRes.find((g) => g.id === data.ryhmaId) ?? null);
    setDate(dayjs(data.alkaa));
    setUseDateRange(false);
  };

  const applyStoredDefaults = (
    teachersRes: T.Teacher[], coursesRes: T.Course[],
    groupsRes: T.StudentGroup[], roomsRes: T.Classroom[],
  ) => {
    const d = loadDefaults();
    if (d.classroomId) setClassroom(roomsRes.find((r) => r.id === d.classroomId) ?? null);
    if (d.teacherId) {
      const t = teachersRes.find((t) => t.id === d.teacherId) ?? null;
      setTeacher(t);
      const tc = (t as any)?.kurssit;
      if (tc?.length) {
        setCourses(tc);
        if (d.courseId) setCourse(tc.find((c: any) => c.id === d.courseId) ?? null);
      } else if (d.courseId) {
        setCourse(coursesRes.find((c) => c.id === d.courseId) ?? null);
      }
    } else if (d.courseId) {
      setCourse(coursesRes.find((c) => c.id === d.courseId) ?? null);
    }
    if (d.groupId) setGroup(groupsRes.find((g) => g.id === d.groupId) ?? null);
    if (d.slotKey) setSelectedSlot(d.slotKey);
  };

  // ── Form actions ──────────────────────────────────────────────────────────
  const resetForm = () => {
    setClassroom(null); setTeacher(null); setCourse(null); setGroup(null);
    setDate(dayjs()); setUseDateRange(false); setDateRangeStart(dayjs()); setDateRangeEnd(null);
    setSelectedSlot(null); setUseCustomTime(false); setCustomStart(null); setCustomEnd(null);
    setError(null);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleTeacherChange = (val: T.Teacher | null) => {
    setTeacher(val);
    setError(null);
    const tc = (val as any)?.kurssit;
    setCourses(tc?.length ? tc : allCourses);
  };

  const handleCourseChange = (val: T.Course | null) => {
    setCourse(val);
    setError(null);
    if (!val || teacher) return;
    const found = teachers.find((t) => (t as any).kurssit?.some((c: any) => c.id === val.id));
    if (found) setTeacher(found);
  };

  const handleAdd = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    const days = useDateRange ? getWeekdaysBetween(dateRangeStart!, dateRangeEnd!) : [date!];
    const events = buildEventsToCreate({
      days, classroom: classroom!, teacher: teacher!,
      course: course!, group: group!,
      useCustomTime, customStart, customEnd, selectedSlot,
    });

    try {
      if (data) {
        await api.calendar.update(data.id, events[0]);
      } else {
        await api.calendar.createBatch(events);
      }
      saveDefaults({ classroomId: classroom!.id, teacherId: teacher!.id, courseId: course!.id, groupId: group!.id, slotKey: selectedSlot ?? undefined });
      resetForm();
      onClose(true);
    } catch (err) {
      setError((err as T.ApiError).error || 'Tapahtumien luonti epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const isCustomTimeValid = !!(customStart && customEnd && customEnd.isAfter(customStart));
  const isDateRangeValid = !!(dateRangeStart && dateRangeEnd && dateRangeEnd.isAfter(dateRangeStart));
  const isValid = !!(classroom && teacher && course && group
    && (useDateRange ? isDateRangeValid : date)
    && (useCustomTime ? isCustomTimeValid : selectedSlot));

  const eventCount = (() => {
    if (!isValid) return 1;
    const slotCount = selectedSlot === 'molemmat' ? 2 : 1;
    const dayCount = useDateRange ? getWeekdaysBetween(dateRangeStart!, dateRangeEnd!).length : 1;
    return dayCount * slotCount;
  })();

  const addButtonLabel = loading ? 'Lisätään...' : eventCount > 1 ? `Lisää ${eventCount} tapahtumaa` : 'Lisää tapahtuma';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{data ? 'Muokkaa tapahtumaa' : 'Uusi kalenteritapahtuma'}</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </Alert>
            )}

            {/* ── Basic info ── */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                Perustiedot
              </Typography>
              <Stack spacing={2}>
                <Autocomplete
                  options={groups} value={group}
                  onChange={(_, val) => { setGroup(val); setError(null); }}
                  getOptionLabel={(o) => o.ryhmatunnus}
                  renderInput={(params) => (
                    <TextField {...params} label="Opiskelijaryhmä" slotProps={{ input: { ...params.InputProps, startAdornment: <InputAdornment position="start"><School fontSize="small" /></InputAdornment> } }} />
                  )}
                />
                <Autocomplete
                  options={courses} value={course}
                  onChange={(_, val) => handleCourseChange(val)}
                  getOptionLabel={(o) => `${o.koodi} - ${o.nimi}`}
                  renderInput={(params) => (
                    <TextField {...params} label="Kurssi" slotProps={{ input: { ...params.InputProps, startAdornment: <InputAdornment position="start"><Book fontSize="small" /></InputAdornment> } }} />
                  )}
                />
                <Autocomplete
                  options={teachers} value={teacher}
                  onChange={(_, val) => handleTeacherChange(val)}
                  getOptionLabel={(o) => `${o.nimi} ${o.sukunimi}`}
                  renderInput={(params) => (
                    <TextField {...params} label="Opettaja" slotProps={{ input: { ...params.InputProps, startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> } }} />
                  )}
                />
                <Autocomplete
                  options={classrooms} value={classroom}
                  onChange={(_, val) => { setClassroom(val); setError(null); }}
                  getOptionLabel={(o) => `${o.huoneenNumero} (${o.tyyppi})`}
                  renderInput={(params) => (
                    <TextField {...params} label="Huone" slotProps={{ input: { ...params.InputProps, startAdornment: <InputAdornment position="start"><Room fontSize="small" /></InputAdornment> } }} />
                  )}
                />
              </Stack>
            </Box>

            <Divider />

            {/* ── Timing ── */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>Ajoitus</Typography>
                <FormControlLabel
                  control={<Switch checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} size="small" />}
                  label={<Typography variant="body2">Päiväväli</Typography>}
                />
              </Stack>

              {!useDateRange ? (
                <DatePicker
                  label="Päivämäärä" value={date}
                  onChange={(val) => { setDate(val); setError(null); }}
                  shouldDisableDate={(day) => !isWeekday(day)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              ) : (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Alkaa" value={dateRangeStart}
                      onChange={(val) => { setDateRangeStart(val); setDateRangeEnd(null); setError(null); }}
                      shouldDisableDate={(day) => !isWeekday(day)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    <DatePicker
                      label="Asti" value={dateRangeEnd}
                      onChange={(val) => { setDateRangeEnd(val); setError(null); }}
                      shouldDisableDate={(day) => !isWeekday(day) || (dateRangeStart ? day.isSameOrBefore(dateRangeStart) : false)}
                      minDate={dateRangeStart ?? undefined}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Stack>
                  {isDateRangeValid && (
                    <Typography variant="caption" color="primary" sx={{ px: 1 }}>
                      {getWeekdaysBetween(dateRangeStart!, dateRangeEnd!).length} arkipäivää valittuna
                    </Typography>
                  )}
                </Stack>
              )}

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="inherit" /> Kellonaika
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={useCustomTime} onChange={() => { setUseCustomTime(p => !p); setSelectedSlot(null); setCustomStart(null); setCustomEnd(null); setError(null); }} size="small" />}
                    label={<Typography variant="body2">Oma aika</Typography>}
                  />
                </Stack>

                {!useCustomTime ? (
                  <ToggleButtonGroup value={selectedSlot} exclusive onChange={(_, val) => { setSelectedSlot(val); setError(null); }} fullWidth color="primary">
                    {(Object.entries(SLOTS) as [keyof typeof SLOTS, typeof SLOTS[keyof typeof SLOTS]][]).map(([key, slot]) => (
                      <ToggleButton key={key} value={key} sx={{ py: 1, textTransform: 'none' }}>
                        <Stack alignItems="center">
                          <Typography variant="body2" fontWeight="medium">{slot.label}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>{getSlotTimes(key, isMonday ?? false)}</Typography>
                        </Stack>
                      </ToggleButton>
                    ))}
                    <ToggleButton value="molemmat" sx={{ py: 1, textTransform: 'none' }}>
                      <Stack alignItems="center">
                        <Typography variant="body2" fontWeight="medium">Molemmat</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>8:00 - 14:45 (Ma klo 9:00)</Typography>
                      </Stack>
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <TimePicker label="Alkaa" value={customStart} onChange={(val) => { setCustomStart(val); setError(null); }} ampm={false} slotProps={{ textField: { fullWidth: true } }} />
                    <TimePicker label="Päättyy" value={customEnd} onChange={(val) => { setCustomEnd(val); setError(null); }} ampm={false} minTime={customStart ?? undefined} slotProps={{ textField: { fullWidth: true } }} />
                  </Stack>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {isValid && !loading ? `${eventCount} tapahtumaa luodaan` : 'Täytä vaaditut kentät'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleClose} color="inherit">Peruuta</Button>
            <Button variant="contained" onClick={handleAdd} disabled={!isValid || loading} disableElevation>
              {addButtonLabel}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CalendarEventFormDialog;