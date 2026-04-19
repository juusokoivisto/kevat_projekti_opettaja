export interface AuthUser {
  id: number;
  username: string;
  nimi: string;
}

export interface TeacherBody {
  nimi: string;
  sukunimi: string;
  sahkoposti: string;
  sopimustunnit?: number;
  vapaaResurssi?: number;
  vari?: string | null;
}

export interface RoomBody {
  huoneenNumero: string;
  kapasiteetti: number;
  tyyppi: string;
}

export interface CourseBody {
  nimi: string;
  koodi: string;
  opintopisteet: number;
  suunnitellutTunnit: number;
}

export interface GroupBody {
  ryhmatunnus: string;
  aloitusvuosi: number;
  opiskelijamaara: number;
  tutkintoOhjelma: string;
}

export interface CalendarBody {
  huoneId: number;
  opettajaId: number;
  kurssiId: number;
  ryhmaId: number;
  alkaa: string;
  paattyy: string;
}

export interface DeleteRequest {
  ids: (string | number)[];
}