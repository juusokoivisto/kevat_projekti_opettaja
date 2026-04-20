import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import * as T from '../../api/types/api.types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Autocomplete, Alert,
  ToggleButton, ToggleButtonGroup, FormControlLabel,
  Switch, Typography, Divider, Box, InputAdornment
} from '@mui/material';
import {
  School, Person, Room, Book, AccessTime
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/fi';

dayjs.extend(isSameOrBefore);

interface CalendarEventFormDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const SLOTS = {
  aamu: { label: 'Aamutunnit', start: { h: 8, m: 0 }, end: { h: 11, m: 0 } },
  iltapaiva: { label: 'Iltapäivätunnit', start: { h: 11, m: 45 }, end: { h: 14, m: 45 } },
} as const;

type SlotKey = keyof typeof SLOTS | 'molemmat';

const STORAGE_KEY = 'calendarEventFormDefaults';

const saveDefaults = (data: { classroomId?: number; teacherId?: number; courseId?: number; groupId?: number; slotKey?: SlotKey; }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const loadDefaults = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const isWeekday = (day: Dayjs) => day.day() !== 0 && day.day() !== 6;

const getWeekdaysBetween = (start: Dayjs, end: Dayjs): Dayjs[] => {
  const days: Dayjs[] = [];
  let current = start.startOf('day');
  const last = end.startOf('day');
  while (current.isSameOrBefore(last)) {
    if (isWeekday(current)) days.push(current);
    current = current.add(1, 'day');
  }
  return days;
};

const CalendarEventFormDialog: React.FC<CalendarEventFormDialogProps> = ({ open, onClose }) => {
  const [classrooms, setClassrooms] = useState<T.Classroom[]>([]);
  const [teachers, setTeachers] = useState<T.Teacher[]>([]);
  const [courses, setCourses] = useState<T.Course[]>([]);
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

  const getSlotTimes = (key: keyof typeof SLOTS) => {
    const slot = SLOTS[key];
    const startH = key === 'aamu' && isMonday ? 9 : slot.start.h;
    return `${startH}:${String(slot.start.m).padStart(2, '0')} – ${slot.end.h}:${String(slot.end.m).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!open) return;
    const loadFormData = async () => {
      try {
        const [roomsRes, teachersRes, coursesRes, groupsRes] = await Promise.all([
          api.rooms.getAll(), api.teachers.getAll(), api.courses.getAll(), api.groups.getAll()
        ]);
        setClassrooms(roomsRes); setTeachers(teachersRes); setCourses(coursesRes); setGroups(groupsRes);
        const defaults = loadDefaults();
        if (defaults.classroomId) setClassroom(roomsRes.find((r: T.Classroom) => r.id === defaults.classroomId) ?? null);
        if (defaults.teacherId) setTeacher(teachersRes.find((t: T.Teacher) => t.id === defaults.teacherId) ?? null);
        if (defaults.courseId) setCourse(coursesRes.find((c: T.Course) => c.id === defaults.courseId) ?? null);
        if (defaults.groupId) setGroup(groupsRes.find((g: T.StudentGroup) => g.id === defaults.groupId) ?? null);
        if (defaults.slotKey) setSelectedSlot(defaults.slotKey);
      } catch (err) {
        const apiErr = err as T.ApiError;
        setError("Lomaketietojen haku epäonnistui: " + apiErr.error);
      }
    };
    loadFormData();
  }, [open]);

  const resetForm = () => {
    setClassroom(null); setTeacher(null); setCourse(null); setGroup(null);
    setDate(dayjs()); setUseDateRange(false); setDateRangeStart(dayjs()); setDateRangeEnd(null);
    setSelectedSlot(null); setUseCustomTime(false); setCustomStart(null); setCustomEnd(null);
    setError(null);
  };

  const handleSlotChange = (_: React.MouseEvent<HTMLElement>, val: SlotKey | null) => {
    setSelectedSlot(val);
    setError(null);
  };

  const handleCustomTimeToggle = () => {
    setUseCustomTime((prev) => !prev);
    setSelectedSlot(null);
    setCustomStart(null);
    setCustomEnd(null);
    setError(null);
  };

  const buildSlotTimesForDay = (day: Dayjs, key: keyof typeof SLOTS): { start: Dayjs; end: Dayjs } => {
    const slot = SLOTS[key];
    const isDayMonday = day.day() === 1;
    const startHour = key === 'aamu' && isDayMonday ? 9 : slot.start.h;
    return {
      start: day.hour(startHour).minute(slot.start.m).second(0).millisecond(0),
      end: day.hour(slot.end.h).minute(slot.end.m).second(0).millisecond(0),
    };
  };

  const handleAdd = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    const days: Dayjs[] = useDateRange ? getWeekdaysBetween(dateRangeStart!, dateRangeEnd!) : [date!];

    const eventsToCreate: T.CalendarBody[] = [];

    days.forEach((day) => {
      const slotsForDay: Array<{ start: Dayjs; end: Dayjs }> = [];

      if (useCustomTime) {
        slotsForDay.push({
          start: day.hour(customStart!.hour()).minute(customStart!.minute()).second(0).millisecond(0),
          end: day.hour(customEnd!.hour()).minute(customEnd!.minute()).second(0).millisecond(0),
        });
      } else if (selectedSlot === 'molemmat') {
        slotsForDay.push(buildSlotTimesForDay(day, 'aamu'));
        slotsForDay.push(buildSlotTimesForDay(day, 'iltapaiva'));
      } else {
        slotsForDay.push(buildSlotTimesForDay(day, selectedSlot as keyof typeof SLOTS));
      }

      slotsForDay.forEach(({ start, end }) => {
        eventsToCreate.push({
          huoneId: classroom!.id,
          opettajaId: teacher!.id,
          kurssiId: course!.id,
          ryhmaId: group!.id,
          alkaa: start.toISOString(),
          paattyy: end.toISOString(),
        });
      });
    });

    try {
      await api.calendar.createBatch(eventsToCreate);

      saveDefaults({
        classroomId: classroom!.id,
        teacherId: teacher!.id,
        courseId: course!.id,
        groupId: group!.id,
        slotKey: selectedSlot ?? undefined
      });

      resetForm();
      onClose(true);
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error || "Tapahtumien luonti epäonnistui");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { resetForm(); onClose(); };

  const isCustomTimeValid = !!(customStart && customEnd && customEnd.isAfter(customStart));
  const isDateRangeValid = !!(dateRangeStart && dateRangeEnd && dateRangeEnd.isAfter(dateRangeStart));
  const isValid = !!(classroom && teacher && course && group && (useDateRange ? isDateRangeValid : date) && (useCustomTime ? isCustomTimeValid : selectedSlot));

  const eventCount = (() => {
    if (!isValid) return 1;
    const slotCount = selectedSlot === 'molemmat' ? 2 : 1;
    const dayCount = useDateRange ? getWeekdaysBetween(dateRangeStart!, dateRangeEnd!).length : 1;
    return dayCount * slotCount;
  })();

  const addButtonLabel = loading ? 'Lisätään...' : eventCount > 1 ? `Lisää ${eventCount} tapahtumaa` : 'Lisää tapahtuma';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>Uusi kalenteritapahtuma</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </Alert>
            )}

            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                Perustiedot
              </Typography>
              <Stack spacing={2}>
                <Autocomplete
                  options={groups}
                  value={group}
                  onChange={(_, val) => { setGroup(val); setError(null); }}
                  getOptionLabel={(o) => o.ryhmatunnus}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Opiskelijaryhmä"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><School fontSize="small" /></InputAdornment>
                        }
                      }}
                    />
                  )}
                />

                <Autocomplete
                  options={courses}
                  value={course}
                  onChange={(_, val) => { setCourse(val); setError(null); }}
                  getOptionLabel={(o) => `${o.koodi} - ${o.nimi}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kurssi"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><Book fontSize="small" /></InputAdornment>
                        }
                      }}
                    />
                  )}
                />

                <Autocomplete
                  options={teachers}
                  value={teacher}
                  onChange={(_, val) => { setTeacher(val); setError(null); }}
                  getOptionLabel={(o) => `${o.nimi} ${o.sukunimi}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Opettaja"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment>
                        }
                      }}
                    />
                  )}
                />

                <Autocomplete
                  options={classrooms}
                  value={classroom}
                  onChange={(_, val) => { setClassroom(val); setError(null); }}
                  getOptionLabel={(o) => `${o.huoneenNumero} (${o.tyyppi})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Huone"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><Room fontSize="small" /></InputAdornment>
                        }
                      }}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Ajoitus
                </Typography>
                <FormControlLabel
                  control={<Switch checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} size="small" />}
                  label={<Typography variant="body2">Päiväväli</Typography>}
                />
              </Stack>

              <Box sx={{ position: 'relative' }}>
                {!useDateRange ? (
                  <DatePicker
                    label="Päivämäärä"
                    value={date}
                    onChange={(val) => { setDate(val); setError(null); }}
                    shouldDisableDate={(day) => !isWeekday(day)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                ) : (
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2}>
                      <DatePicker
                        label="Alkaa"
                        value={dateRangeStart}
                        onChange={(val) => { setDateRangeStart(val); setDateRangeEnd(null); setError(null); }}
                        shouldDisableDate={(day) => !isWeekday(day)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                      <DatePicker
                        label="Asti"
                        value={dateRangeEnd}
                        onChange={(val) => { setDateRangeEnd(val); setError(null); }}
                        shouldDisableDate={(day) => !isWeekday(day) || (dateRangeStart ? day.isSameOrBefore(dateRangeStart) : false)}
                        minDate={dateRangeStart ?? undefined}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Stack>
                    {isDateRangeValid && (
                      <Box sx={{ minHeight: '20px' }}>
                        <Typography variant="caption" color="primary" sx={{ px: 1 }}>
                          {getWeekdaysBetween(dateRangeStart!, dateRangeEnd!).length} arkipäivää valittuna
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="inherit" /> Kellonaika
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={useCustomTime} onChange={handleCustomTimeToggle} size="small" />}
                    label={<Typography variant="body2">Oma aika</Typography>}
                  />
                </Stack>

                <Box>
                  {!useCustomTime ? (
                    <ToggleButtonGroup
                      value={selectedSlot}
                      exclusive
                      onChange={handleSlotChange}
                      fullWidth
                      color="primary"
                    >
                      {(Object.entries(SLOTS) as [keyof typeof SLOTS, typeof SLOTS[keyof typeof SLOTS]][]).map(([key, slot]) => (
                        <ToggleButton key={key} value={key} sx={{ py: 1, textTransform: 'none' }}>
                          <Stack alignItems="center">
                            <Typography variant="body2" fontWeight="medium">{slot.label}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{getSlotTimes(key)}</Typography>
                          </Stack>
                        </ToggleButton>
                      ))}
                      <ToggleButton key="molemmat" value="molemmat" sx={{ py: 1, textTransform: 'none' }}>
                        <Stack alignItems="center">
                          <Typography variant="body2" fontWeight="medium">Molemmat</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            8:00 - 14:45 (Ma klo 9:00)
                          </Typography>
                        </Stack>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : (
                    <Stack direction="row" spacing={2}>
                      <TimePicker
                        label="Alkaa"
                        value={customStart}
                        onChange={(val) => { setCustomStart(val); setError(null); }}
                        ampm={false}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                      <TimePicker
                        label="Päättyy"
                        value={customEnd}
                        onChange={(val) => { setCustomEnd(val); setError(null); }}
                        ampm={false}
                        minTime={customStart ?? undefined}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Stack>
                  )}
                </Box>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: '150px' }}>
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