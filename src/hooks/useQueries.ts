import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query'
import { api } from '../api'

export const useTeachers = () => useQuery({ queryKey: ['teachers'], queryFn: api.teachers.getAll })
export const useGroups = () => useQuery({ queryKey: ['groups'], queryFn: api.groups.getAll })
export const useCourses = () => useQuery({ queryKey: ['courses'], queryFn: api.courses.getAll })
export const useCalendar = () => useQuery({ queryKey: ['calendar'], queryFn: api.calendar.getAll })
export const useRooms = () => useQuery({ queryKey: ['rooms'], queryFn: api.rooms.getAll })

export const useInvalidate = () => {
  const qc = useQueryClient()
  return (key: string) => qc.invalidateQueries({ queryKey: [key] })
}

export const useCalendarEvents = (teacherId?: number) => useQuery({
  queryKey: teacherId ? ['calendar', teacherId] : ['calendar'],
  queryFn: () => teacherId ? api.calendar.getByTeacher(teacherId) : api.calendar.getAll()
})

export const useCalendarFilters = () => useQueries({
  queries: [
    { queryKey: ['rooms'], queryFn: api.rooms.getAll },
    { queryKey: ['teachers'], queryFn: api.teachers.getAll },
    { queryKey: ['groups'], queryFn: api.groups.getAll },
    { queryKey: ['courses'], queryFn: api.courses.getAll },
  ]
})