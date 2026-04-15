import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query'
import { api } from '../api'
import * as T from '../api/types/api.types';

export const useTeachers = () => useQuery({ queryKey: ['teachers'], queryFn: api.teachers.getAll })
export const useGroups = () => useQuery({ queryKey: ['groups'], queryFn: api.groups.getAll })
export const useCourses = () => useQuery({ queryKey: ['courses'], queryFn: api.courses.getAll })
export const useCalendar = () => useQuery({ queryKey: ['calendar'], queryFn: api.calendar.getAll })
export const useRooms = () => useQuery({ queryKey: ['rooms'], queryFn: api.rooms.getAll })

export const useInvalidate = () => {
  const qc = useQueryClient()
  return (key: string) => qc.invalidateQueries({ queryKey: [key] })
}

export const useCalendarFilters = () => {
  const results = useQueries({
    queries: [
      { queryKey: ['rooms'], queryFn: api.rooms.getAll },
      { queryKey: ['teachers'], queryFn: api.teachers.getAll },
      { queryKey: ['groups'], queryFn: api.groups.getAll },
      { queryKey: ['courses'], queryFn: api.courses.getAll },
    ]
  })

  return {
    rooms: (results[0].data ?? []) as T.Classroom[],
    teachers: (results[1].data ?? []) as T.Teacher[],
    groups: (results[2].data ?? []) as T.StudentGroup[],
    courses: (results[3].data ?? []) as T.Course[],
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError)
  }
}

export const useCalendarEvents = (teacherId?: number) => useQuery({
  queryKey: teacherId ? ['calendar', teacherId] : ['calendar'],
  queryFn: () => teacherId ? api.calendar.getByTeacher(teacherId) : api.calendar.getAll()
})