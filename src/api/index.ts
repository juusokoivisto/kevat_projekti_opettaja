const BASE: string = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4000'

async function handleRes(res: Response) {
  const text = await res.text()
  try {
    const json = text ? JSON.parse(text) : null
    if (!res.ok) throw json || { error: res.statusText }
    return json
  } catch (e) {
    if (!res.ok) throw { error: res.statusText }
    return text
  }
}

export async function get<T = any>(path: string) {
  const res = await fetch(`${BASE}${path}`)
  return handleRes(res) as Promise<T>
}

export async function post<T = any>(path: string, body?: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  return handleRes(res) as Promise<T>
}

export interface Classroom {
  id?: number
  huoneenNumero: string
  kapasiteetti: number | string
  tyyppi: string
}

export async function getClassrooms(): Promise<Classroom[]> {
  return get<Classroom[]>('/luokkahuoneet')
}

export async function createClassroom(payload: Partial<Classroom>) {
  return post('/luokkahuoneet', payload)
}

export async function login(username: string, password: string) {
  return post('/login', { username, password })
}

export default { get, post, getClassrooms, createClassroom, login }
