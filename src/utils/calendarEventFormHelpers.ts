import { Dayjs } from 'dayjs';
import * as T from '../api/types/api.types'

export const SLOTS = {
  aamu: { label: 'Aamutunnit', start: { h: 8, m: 0 }, end: { h: 11, m: 0 } },
  iltapaiva: { label: 'Iltapäivätunnit', start: { h: 11, m: 45 }, end: { h: 14, m: 45 } },
} as const;

export type SlotKey = keyof typeof SLOTS | 'molemmat';

const STORAGE_KEY = 'calendarEventFormDefaults';

export const saveDefaults = (data: {
  classroomId?: number;
  teacherId?: number;
  courseId?: number;
  groupId?: number;
  slotKey?: SlotKey;
}) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export const loadDefaults = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

export const isWeekday = (day: Dayjs) => day.day() !== 0 && day.day() !== 6;

export const getWeekdaysBetween = (start: Dayjs, end: Dayjs): Dayjs[] => {
  const days: Dayjs[] = [];
  let current = start.startOf('day');
  const last = end.startOf('day');
  while (current.isSameOrBefore(last)) {
    if (isWeekday(current)) days.push(current);
    current = current.add(1, 'day');
  }
  return days;
};

export const buildSlotTimesForDay = (day: Dayjs, key: keyof typeof SLOTS) => {
  const slot = SLOTS[key];
  const startHour = key === 'aamu' && day.day() === 1 ? 9 : slot.start.h;
  return {
    start: day.hour(startHour).minute(slot.start.m).second(0).millisecond(0),
    end: day.hour(slot.end.h).minute(slot.end.m).second(0).millisecond(0),
  };
};

export const getSlotTimes = (key: keyof typeof SLOTS, isMonday: boolean) => {
  const slot = SLOTS[key];
  const startH = key === 'aamu' && isMonday ? 9 : slot.start.h;
  return `${startH}:${String(slot.start.m).padStart(2, '0')} – ${slot.end.h}:${String(slot.end.m).padStart(2, '0')}`;
};

export const buildEventsToCreate = ({
  days,
  classroom,
  teacher,
  course,
  group,
  useCustomTime,
  customStart,
  customEnd,
  selectedSlot,
}: {
  days: Dayjs[];
  classroom: T.Classroom;
  teacher: T.Teacher;
  course: T.Course;
  group: T.StudentGroup;
  useCustomTime: boolean;
  customStart: Dayjs | null;
  customEnd: Dayjs | null;
  selectedSlot: SlotKey | null;
}): T.CalendarBody[] => {
  const events: T.CalendarBody[] = [];

  days.forEach((day) => {
    const slots: Array<{ start: Dayjs; end: Dayjs }> = [];

    if (useCustomTime) {
      slots.push({
        start: day.hour(customStart!.hour()).minute(customStart!.minute()).second(0).millisecond(0),
        end: day.hour(customEnd!.hour()).minute(customEnd!.minute()).second(0).millisecond(0),
      });
    } else if (selectedSlot === 'molemmat') {
      slots.push(buildSlotTimesForDay(day, 'aamu'));
      slots.push(buildSlotTimesForDay(day, 'iltapaiva'));
    } else {
      slots.push(buildSlotTimesForDay(day, selectedSlot as keyof typeof SLOTS));
    }

    slots.forEach(({ start, end }) => {
      events.push({
        huoneId: classroom.id,
        opettajaId: teacher.id,
        kurssiId: course.id,
        ryhmaId: group.id,
        alkaa: start.toISOString(),
        paattyy: end.toISOString(),
      });
    });
  });

  return events;
};