import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import { useState, useContext, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import LunchBreak from './LunchBreak'
import { ColorModeContext } from '../App'
import { api } from '../api'
import { Menu, MenuItem } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as T from '../api/types/api.types'
import { useCalendarEvents } from '../hooks/useQueries'
import './Calendar.css'
import Box from '@mui/material/Box'
import { Tooltip, FormControl, InputLabel, Select, Typography } from '@mui/material'

interface FCResource {
  id: string;
  title: string;
}

export default function Calendar({ teacherId, hideFilters }: { teacherId?: number; hideFilters?: boolean }) {
  const { darkMode } = useContext(ColorModeContext)

  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const { data: rawEvents = [] } = useCalendarEvents(teacherId)

  const queryClient = useQueryClient()
  const deleteEventMutation = useMutation({
  mutationFn: (id: string) => api.calendar.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
  }
})
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  

  const results = useQueries({
    queries: [
      { queryKey: ['rooms'], queryFn: api.rooms.getAll },
      { queryKey: ['teachers'], queryFn: api.teachers.getAll },
      { queryKey: ['groups'], queryFn: api.groups.getAll },
      { queryKey: ['courses'], queryFn: api.courses.getAll },
    ]
  })

  const rooms = (results[0].data ?? []) as T.Classroom[]
  const teachers = (results[1].data ?? []) as T.Teacher[]
  const groups = (results[2].data ?? []) as T.StudentGroup[]
  const courses = (results[3].data ?? []) as T.Course[]

  const resources: FCResource[] = useMemo(() =>
    rooms.map(h => ({ id: String(h.id), title: h.huoneenNumero })),
    [rooms]
  )

  const events = useMemo(() =>
    rawEvents.map(e => {
      const rawId = e.huoneId || e.tila?.id
      const resId = rawId ? String(rawId) : 'unassigned'

      if (resId === 'unassigned') {
        console.error(`MISSING ID for Event ${e.id}. Object structure:`, e)
      }

      let teacherShort = ''
      if (e.opettaja) {
        const firstPart = e.opettaja.nimi ? e.opettaja.nimi.substring(0, 2) : ''
        const lastPart = e.opettaja.sukunimi ? e.opettaja.sukunimi.substring(0, 2) : ''
        const formatPart = (str: string) => str
          ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
          : ''
        teacherShort = `${formatPart(firstPart)}${formatPart(lastPart)}`
      }

      return {
        id: String(e.id),
        resourceId: resId,
        title: e.kurssi?.nimi || 'Tapahtuma',
        start: e.alkaa,
        end: e.paattyy,
        backgroundColor: e.opettaja && (e.opettaja as any).color
          ? (e.opettaja as any).color
          : (darkMode ? '#1976d2' : '#3788d8'),
        extendedProps: {
          ryhmaId: e.ryhmaId,
          opettaja: e.opettaja ? `${e.opettaja.nimi} ${e.opettaja.sukunimi}` : '',
          opettajaLyhyt: teacherShort,
          kurssi: e.kurssi?.nimi || ''
        }
      }
    }),
    
    [rawEvents, darkMode]
  )

  const filteredEvents = useMemo(() => {
    let filtered = [...events]
    if (selectedRoom) filtered = filtered.filter(e => e.resourceId === selectedRoom)
    if (selectedTeacher) filtered = filtered.filter(e => e.extendedProps.opettaja === selectedTeacher)
    if (selectedGroup !== '') filtered = filtered.filter(e => e.extendedProps.ryhmaId === selectedGroup)
    if (selectedCourse) filtered = filtered.filter(e => e.extendedProps.kurssi === selectedCourse)
    return filtered
  }, [events, selectedRoom, selectedTeacher, selectedGroup, selectedCourse])

  return (
    <Box sx={{ p: 2 }}>
      {!hideFilters && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Huone</InputLabel>
            <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} label="Huone">
              <MenuItem value="">Kaikki</MenuItem>
              {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Opettaja</InputLabel>
            <Select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} label="Opettaja">
              <MenuItem value="">Kaikki</MenuItem>
              {teachers.map(t => (
                <MenuItem key={t.id} value={`${t.nimi} ${t.sukunimi}`}>{t.nimi} {t.sukunimi}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Ryhmä</InputLabel>
            <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value as number)} label="Ryhmä">
              <MenuItem value="">Kaikki</MenuItem>
              {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.ryhmatunnus}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Kurssi</InputLabel>
            <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} label="Kurssi">
              <MenuItem value="">Kaikki</MenuItem>
              {courses.map(c => <MenuItem key={c.id} value={c.nimi}>{c.nimi}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      )}
      
      <div className={darkMode ? 'calendar-dark' : ''}>
        <FullCalendar
          plugins={[resourceTimelinePlugin, timeGridPlugin, dayGridPlugin, multiMonthPlugin]}
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          initialView="timeGridWeek"
          weekends={false}
          selectOverlap={false}
          filterResourcesWithEvents={true}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          contentHeight="auto"
          locale={fiLocale}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimelineDay,timeGridWeek,dayGridMonth,multiMonthYear'
          }}
          eventDidMount={(info) => {
  info.el.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    setSelectedEventId(info.event.id)
    setMenuAnchor(info.el as HTMLElement)
  })
}}
          resources={resources}
          events={[...filteredEvents, LunchBreak]}
          resourceAreaHeaderContent='Tilat'
          resourceAreaWidth="200px"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventContent={(eventInfo) => {
            const fullName = eventInfo.event.extendedProps.opettaja
            const shortName = eventInfo.event.extendedProps.opettajaLyhyt
            const title = eventInfo.event.title

            return (
              <Tooltip title={fullName || ''} arrow placement="top" disableInteractive>
                <div style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  padding: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px'
                }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {title}
                  </Typography>
                  {shortName && (
                    <Typography variant="caption" sx={{
                      lineHeight: 1.2,
                      opacity: 0.85,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {shortName}
                    </Typography>
                  )}
                </div>
              </Tooltip>
            )
          }}
        />
        <Menu
  anchorEl={menuAnchor}
  open={Boolean(menuAnchor)}
  onClose={() => setMenuAnchor(null)}
>
  <MenuItem
    onClick={() => {
      if (selectedEventId) {
        deleteEventMutation.mutate(selectedEventId)
      }
      setMenuAnchor(null)
    }}
  >
    Poista
  </MenuItem>

  <MenuItem onClick={() => setMenuAnchor(null)}>
    Peruuta
  </MenuItem>
</Menu>
      </div>
    </Box>
  )
}