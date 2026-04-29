import { request, downloadFile } from './client';
import * as T from './types/api.types';

export const api = {
  health: {
    check: () => request<{ status: string }>('/health', { method: 'GET' }),
  },
  auth: {
    login: (username: string, password: string) =>
      request<T.AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }),
  },
  teachers: {
    getAll: () => request<T.Teacher[]>('/opettajat', { method: 'GET' }),
    create: (data: T.TeacherPayload) =>
      request<T.Teacher>('/opettajat', { method: 'POST', body: JSON.stringify(data) }),
    deleteMany: (ids: number[]) =>
      request<void>('/opettajat', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    getOne: (id: string | number) =>
      request<T.Teacher>(`/opettajat/${id}`, { method: 'GET' }),
    update: (id: number, data: T.TeacherPayload) =>
      request<T.Teacher>(`/opettajat/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  rooms: {
    getAll: () => request<T.Classroom[]>('/luokkahuoneet', { method: 'GET' }),
    create: (data: Omit<T.Classroom, 'id'>) =>
      request<T.Classroom>('/luokkahuoneet', { method: 'POST', body: JSON.stringify(data) }),
    deleteMany: (ids: number[]) =>
      request<void>('/luokkahuoneet', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    update: (id: number, data: any) =>
      request<T.Classroom>(`/luokkahuoneet/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  courses: {
    getAll: () => request<T.Course[]>('/kurssit', { method: 'GET' }),
    create: (data: Omit<T.Course, 'id'>) =>
      request<T.Course>('/kurssit', { method: 'POST', body: JSON.stringify(data) }),
    deleteMany: (ids: number[]) =>
      request<void>('/kurssit', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    update: (id: number, data: any) =>
      request<T.Course>(`/kurssit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  groups: {
    getAll: () => request<T.StudentGroup[]>('/opiskelijaryhmat', { method: 'GET' }),
    create: (data: Omit<T.StudentGroup, 'id'>) =>
      request<T.StudentGroup>('/opiskelijaryhmat', { method: 'POST', body: JSON.stringify(data) }),
    deleteMany: (ids: number[]) =>
      request<void>('/opiskelijaryhmat', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    update: (id: number, data: any) =>
      request<T.StudentGroup>(`/opiskelijaryhmat/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  calendar: {
    getAll: () => request<T.CalendarEvent[]>('/kalenteri', { method: 'GET' }),
    getByTeacher: (id: number) =>
      request<T.CalendarEvent[]>(`/kalenteri/opettaja/${id}`, { method: 'GET' }),
    create: (data: Omit<T.CalendarEvent, 'id'>) =>
      request<T.CalendarEvent>('/kalenteri', { method: 'POST', body: JSON.stringify(data) }),
    createBatch: (data: T.CalendarBody[]) =>
      request<T.CalendarEvent[]>('/kalenteri/batch', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/kalenteri/${id}`, { method: 'DELETE' }),
    update: (id: number, data: any) =>
      request<T.CalendarEvent>(`/kalenteri/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  export: {
    excel: (opettajaId?: number) =>
      downloadFile(
        `/export/excel${opettajaId ? `?opettajaId=${opettajaId}` : ''}`,
        `kalenteri-export-${Date.now()}.xlsx`
      ),
    ics: (opettajaId?: number) =>
      downloadFile(
        `/export/ics${opettajaId ? `?opettajaId=${opettajaId}` : ''}`,
        `kalenteri-export-${Date.now()}.ics`
      ),
  },
};