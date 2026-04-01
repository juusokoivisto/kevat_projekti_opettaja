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

export interface Classroom {
  id?: number
  huoneenNumero: string
  kapasiteetti: number
  tyyppi: string
}

export async function getClassrooms(): Promise<Classroom[]> {
  return get<Classroom[]>('/luokkahuoneet')
}

export async function createClassroom(payload: Omit<Classroom, 'id'>) {
  return post('/luokkahuoneet', payload)
}

export interface Teacher {
  id?: number
  nimi: string
  sukunimi: string
  sahkoposti: string
  sopimustunnit?: number
  vapaaResurssi?: number
}

export async function getTeachers(): Promise<Teacher[]> {
  return get<Teacher[]>('/opettajat')
}

export async function createTeacher(payload: Omit<Teacher, 'id'>) {
  return post('/opettajat', payload)
}

export interface StudentGroup {
  id?: number
  ryhmatunnus: string
  aloitusvuosi: number
  opiskelijamaara: number
  tutkintoOhjelma: string
}

export async function getGroups(): Promise<StudentGroup[]> {
  return get<StudentGroup[]>('/opiskelijaryhmat')
}

export async function createGroup(payload: Omit<StudentGroup, 'id'>) {
  return post('/opiskelijaryhmat', payload)
}

export interface Course {
  id?: number
  nimi: string
  koodi: string
  opintopisteet: number
  suunnitellutTunnit?: number
}

export async function getCourses(): Promise<Course[]> {
  return get<Course[]>('/kurssit')
}

export async function createCourse(payload: Omit<Course, 'id'>) {
  return post('/kurssit', payload)
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

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return get<CalendarEvent[]>('/kalenteri')
}

export async function createCalendarEvent(payload: Omit<CalendarEvent, 'id'>) {
  return post('/kalenteri', payload)
}

export async function login(username: string, password: string) {
  return post('/login', { username, password })
}