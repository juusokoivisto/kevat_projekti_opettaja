export interface Classroom {
  id: number;
  huoneenNumero: string;
  kapasiteetti: number;
  tyyppi: string;
}

export interface TeacherPayload {
  nimi: string;
  sukunimi: string;
  sahkoposti: string;
  sopimustunnit: number;
  vapaaResurssi?: number;
  vari?: string;
  courseIds?: number[];
}

export interface Teacher {
  id: number;
  nimi: string;
  sukunimi: string;
  sahkoposti: string;
  sopimustunnit: number;
  vapaaResurssi: number;
  vari?: string;
  kurssit?: Course[];
}

export interface StudentGroup {
  id: number;
  ryhmatunnus: string;
  aloitusvuosi: number;
  opiskelijamaara: number;
  tutkintoOhjelma: string;
}

export interface Course {
  id: number;
  nimi: string;
  koodi: string;
  opintopisteet: number;
  suunnitellutTunnit: number;
}

export interface CalendarBody {
  huoneId: number;
  opettajaId: number;
  kurssiId: number;
  ryhmaId: number;
  alkaa: string;
  paattyy: string;
}

export interface CalendarEvent {
  id: number;
  tilaId: number;
  opettajaId: number;
  kurssiId: number;
  ryhmaId: number;
  alkaa: string;
  paattyy: string;

  tila?: Classroom;
  opettaja?: Teacher;
  kurssi?: Course;
  ryhma?: StudentGroup;
}

export interface AuthUser {
  id: number;
  username: string;
  nimi: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ApiError {
  error: string;
  status?: number;
}