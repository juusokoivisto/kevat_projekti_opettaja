import * as T from '../api/types/api.types';

export interface FormattedCalendarEvent {
  id: string;
  resourceId: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  extendedProps: {
    ryhmaId: number;
    ryhmaTunnus: string;
    opettaja: string;
    opettajaLyhyt: string;
    opettajaId?: number;
    kurssi: string;
    kurssiId?: number;
    kurssiKoodi: string;
    huoneNumero: string;
    tilaId?: number
  };
}

export const getTeacherShortName = (teacher?: T.Teacher) => {
  if (!teacher) return '';
  const first = (teacher.nimi?.substring(0, 3) || '').toLowerCase();
  const last = (teacher.sukunimi?.substring(0, 2) || '').toLowerCase();

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${capitalize(first)}${capitalize(last)}`;
};

export const formatCalendarEvent = (
  e: T.CalendarEvent,
  darkMode: boolean
): FormattedCalendarEvent => {
  const resId = String(e.huoneId || e.tila?.id || 'unassigned');

  return {
    id: String(e.id),
    resourceId: resId,
    title: e.kurssi?.nimi || 'Tapahtuma',
    start: e.alkaa,
    end: e.paattyy,
    backgroundColor: e.opettaja?.vari || (darkMode ? '#1976d2' : '#3788d8'),
    extendedProps: {
      ryhmaId: e.ryhmaId,
      ryhmaTunnus: e.ryhma?.ryhmatunnus || 'N/A',
      opettaja: e.opettaja ? `${e.opettaja.nimi} ${e.opettaja.sukunimi}` : '',
      opettajaLyhyt: getTeacherShortName(e.opettaja),
      opettajaId: e.opettaja?.id,
      kurssi: e.kurssi?.nimi || '',
      kurssiId: e.kurssi?.id,   
      kurssiKoodi: e.kurssi?.koodi || '',
      huoneNumero: e.tila?.huoneenNumero || '?',
      tilaId: e.huoneId || e.tila?.id,

    }
  };
};