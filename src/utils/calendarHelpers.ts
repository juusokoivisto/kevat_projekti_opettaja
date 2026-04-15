import * as T from '../api/types/api.types';

export const getTeacherShortName = (teacher?: T.Teacher) => {
  if (!teacher) return '';
  const first = (teacher.nimi?.substring(0, 2) || '').toLowerCase();
  const last = (teacher.sukunimi?.substring(0, 2) || '').toLowerCase();

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${capitalize(first)}${capitalize(last)}`;
};

export const formatCalendarEvent = (e: any, darkMode: boolean) => {
  const resId = String(e.huoneId || e.tila?.id || 'unassigned');

  return {
    id: String(e.id),
    resourceId: resId,
    title: e.kurssi?.nimi || 'Tapahtuma',
    start: e.alkaa,
    end: e.paattyy,
    backgroundColor: e.opettaja?.color || (darkMode ? '#1976d2' : '#3788d8'),
    extendedProps: {
      ryhmaId: e.ryhmaId,
      opettaja: e.opettaja ? `${e.opettaja.nimi} ${e.opettaja.sukunimi}` : '',
      opettajaLyhyt: getTeacherShortName(e.opettaja),
      kurssi: e.kurssi?.nimi || ''
    }
  };
};