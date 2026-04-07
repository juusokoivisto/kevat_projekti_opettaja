const BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function tryParseJSON(text: string): unknown {
  try { return JSON.parse(text) } catch { return null }
}

async function handleRes(res: Response) {
  const text = await res.text()
  const json = text ? tryParseJSON(text) : null

  if (!res.ok) throw json ?? { error: res.statusText }
  return json ?? text
}

export async function get<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  return handleRes(res) as Promise<T>
}

export async function post<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleRes(res) as Promise<T>
}

export async function del<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleRes(res) as Promise<T>
}

export interface Classroom {
  id?: number
  huoneenNumero: string
  kapasiteetti: number
  tyyppi: string
}

export interface Teacher {
  id?: number
  nimi: string
  sukunimi: string
  sahkoposti: string
  sopimustunnit?: number
  vapaaResurssi?: number
}

export interface StudentGroup {
  id?: number
  ryhmatunnus: string
  aloitusvuosi: number
  opiskelijamaara: number
  tutkintoOhjelma: string
}

export interface Course {
  id?: number
  nimi: string
  koodi: string
  opintopisteet: number
  suunnitellutTunnit?: number
}

export interface CalendarEvent {
  id?: number
  huoneId: number
  opettajaId: number
  kurssiId: number
  ryhmaId: number
  alkaa: string
  paattyy: string
}

export async function getClassrooms() { return get<Classroom[]>('/luokkahuoneet') }
export async function createClassroom(payload: Omit<Classroom, 'id'>) { return post('/luokkahuoneet', payload) }
export async function deleteClassrooms(ids: number[]) { return del('/luokkahuoneet', { ids }) }

export async function getTeachers() { return get<Teacher[]>('/opettajat') }
export async function createTeacher(payload: Omit<Teacher, 'id'>) { return post('/opettajat', payload) }
export async function deleteTeachers(ids: number[]) { return del('/opettajat', { ids }) }

export async function getGroups() { return get<StudentGroup[]>('/opiskelijaryhmat') }
export async function createGroup(payload: Omit<StudentGroup, 'id'>) { return post('/opiskelijaryhmat', payload) }
export async function deleteGroups(ids: number[]) { return del('/opiskelijaryhmat', { ids }) }

export async function getCourses() { return get<Course[]>('/kurssit') }
export async function createCourse(payload: Omit<Course, 'id'>) { return post('/kurssit', payload) }
export async function deleteCourses(ids: number[]) { return del('/kurssit', { ids }) }

export async function getCalendarEvents() { return get<CalendarEvent[]>('/kalenteri') }
export async function createCalendarEvent(payload: Omit<CalendarEvent, 'id'>) { return post('/kalenteri', payload) }
export async function login(username: string, password: string) { return post('/login', { username, password }) }