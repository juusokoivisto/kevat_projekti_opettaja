import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import * as T from '../../api/types/api.types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Autocomplete, Alert,
  ToggleButton, ToggleButtonGroup, Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fi';

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

const saveDefaults = (data: {
  classroomId?: number;
  teacherId?: number;
  courseId?: number;
  groupId?: number;
  slotKey?: SlotKey;
}) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const loadDefaults = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
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
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<SlotKey | null>(null);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customStart, setCustomStart] = useState<Dayjs | null>(null);
  const [customEnd, setCustomEnd] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMonday = date?.day() === 1;

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
          api.rooms.getAll(),
          api.teachers.getAll(),
          api.courses.getAll(),
          api.groups.getAll()
        ]);

        setClassrooms(roomsRes);
        setTeachers(teachersRes);
        setCourses(coursesRes);
        setGroups(groupsRes);

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
    setClassroom(null);
    setTeacher(null);
    setCourse(null);
    setGroup(null);
    setDate(dayjs());
    setSelectedSlot(null);
    setUseCustomTime(false);
    setCustomStart(null);
    setCustomEnd(null);
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

  const buildSlotTimes = (key: keyof typeof SLOTS): { start: Dayjs; end: Dayjs } => {
    const slot = SLOTS[key];
    const startHour = key === 'aamu' && isMonday ? 9 : slot.start.h;
    return {
      start: date!.hour(startHour).minute(slot.start.m).second(0).millisecond(0),
      end: date!.hour(slot.end.h).minute(slot.end.m).second(0).millisecond(0),
    };
  };

  const handleAdd = async () => {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    const slots: Array<{ start: Dayjs; end: Dayjs }> = useCustomTime
      ? [{
        start: date!.hour(customStart!.hour()).minute(customStart!.minute()).second(0).millisecond(0),
        end: date!.hour(customEnd!.hour()).minute(customEnd!.minute()).second(0).millisecond(0),
      }]
      : selectedSlot === 'molemmat'
        ? [buildSlotTimes('aamu'), buildSlotTimes('iltapaiva')]
        : [buildSlotTimes(selectedSlot as keyof typeof SLOTS)];

    try {
      for (const { start, end } of slots) {
        await api.calendar.create({
          huoneId: classroom!.id,
          opettajaId: teacher!.id,
          kurssiId: course!.id,
          ryhmaId: group!.id,
          alkaa: start.toISOString(),
          paattyy: end.toISOString(),
        });
      }

      saveDefaults({
        classroomId: classroom!.id,
        teacherId: teacher!.id,
        courseId: course!.id,
        groupId: group!.id,
        slotKey: selectedSlot ?? undefined,
      });

      resetForm();
      onClose(true);
    } catch (err) {
      const apiErr = err as T.ApiError;
      setError(apiErr.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isCustomTimeValid = !!(
    customStart && customEnd &&
    customEnd.isAfter(customStart)
  );

  const isValid = !!(
    classroom && teacher && course && group && date &&
    (useCustomTime ? isCustomTimeValid : selectedSlot)
  );

  const addButtonLabel = loading
    ? 'Lisätään...'
    : selectedSlot === 'molemmat'
      ? 'Lisää 2 tapahtumaa'
      : 'Lisää tapahtuma';

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
              onChange={(_, val) => { setGroup(val); setError(null); }}
              getOptionLabel={(o) => o.ryhmatunnus}
              renderInput={(params) => <TextField {...params} label="Opiskelijaryhmä" />}
              fullWidth
            />

            <Autocomplete
              options={courses}
              value={course}
              onChange={(_, val) => { setCourse(val); setError(null); }}
              getOptionLabel={(o) => `${o.koodi} - ${o.nimi}`}
              renderInput={(params) => <TextField {...params} label="Kurssi" />}
              fullWidth
            />

            <Autocomplete
              options={teachers}
              value={teacher}
              onChange={(_, val) => { setTeacher(val); setError(null); }}
              getOptionLabel={(o) => `${o.nimi} ${o.sukunimi}`}
              renderInput={(params) => <TextField {...params} label="Opettaja" />}
              fullWidth
            />

            <Autocomplete
              options={classrooms}
              value={classroom}
              onChange={(_, val) => { setClassroom(val); setError(null); }}
              getOptionLabel={(o) => `${o.huoneenNumero} (${o.tyyppi})`}
              renderInput={(params) => <TextField {...params} label="Huone" />}
              fullWidth
            />

            <DatePicker
              label="Päivämäärä"
              value={date}
              onChange={(val) => { setDate(val); setError(null); }}
              shouldDisableDate={(day) => day.day() === 0 || day.day() === 6}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />

            <Collapse in={!useCustomTime}>
              <ToggleButtonGroup
                value={selectedSlot}
                exclusive
                onChange={handleSlotChange}
                fullWidth
              >
                {(Object.entries(SLOTS) as [keyof typeof SLOTS, typeof SLOTS[keyof typeof SLOTS]][]).map(([key, slot]) => (
                  <ToggleButton key={key} value={key} sx={{ py: 1.5 }}>
                    <Stack alignItems="center">
                      <span>{slot.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {getSlotTimes(key)}
                      </span>
                    </Stack>
                  </ToggleButton>
                ))}
                <ToggleButton key="molemmat" value="molemmat" sx={{ py: 1.5 }}>
                  <Stack alignItems="center">
                    <span>Molemmat</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getSlotTimes('aamu')}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {getSlotTimes('iltapaiva')}
                    </span>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Collapse>

            <Collapse in={useCustomTime}>
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
            </Collapse>

            <Button
              variant="text"
              size="small"
              onClick={handleCustomTimeToggle}
              sx={{ alignSelf: 'flex-start' }}
            >
              {useCustomTime ? '← Käytä vakioaikoja' : 'Määritä oma aika'}
            </Button>

          </Stack>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleClose}>Peruuta</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!isValid || loading}
          >
            {addButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CalendarEventFormDialog;