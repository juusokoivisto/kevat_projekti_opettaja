import { request } from './client';
import * as T from './types/api.types';

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<T.AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }),
  },

  teachers: {
    getAll: () => request<T.Teacher[]>('/opettajat', { method: 'GET' }),
    create: (data: Omit<T.Teacher, 'id'>) =>
      request<T.Teacher>('/opettajat', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteMany: (ids: number[]) =>
      request<void>('/opettajat', {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      }),
  },

  rooms: {
    getAll: () => request<T.Classroom[]>('/luokkahuoneet', { method: 'GET' }),
    create: (data: Omit<T.Classroom, 'id'>) =>
      request<T.Classroom>('/luokkahuoneet', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteMany: (ids: number[]) =>
      request<void>('/luokkahuoneet', {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      }),
  },

  courses: {
    getAll: () => request<T.Course[]>('/kurssit', { method: 'GET' }),
    create: (data: Omit<T.Course, 'id'>) =>
      request<T.Course>('/kurssit', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteMany: (ids: number[]) =>
      request<void>('/kurssit', {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      }),
  },

  groups: {
    getAll: () => request<T.StudentGroup[]>('/opiskelijaryhmat', { method: 'GET' }),
    create: (data: Omit<T.StudentGroup, 'id'>) =>
      request<T.StudentGroup>('/opiskelijaryhmat', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteMany: (ids: number[]) =>
      request<void>('/opiskelijaryhmat', {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      }),
  },

  calendar: {
    getAll: () => request<T.CalendarEvent[]>('/kalenteri', { method: 'GET' }),
    getByTeacher: (id: number) =>
      request<T.CalendarEvent[]>(`/kalenteri/opettaja/${id}`, { method: 'GET' }),
    create: (data: Omit<T.CalendarEvent, 'id'>) =>
      request<T.CalendarEvent>('/kalenteri', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
  }
};