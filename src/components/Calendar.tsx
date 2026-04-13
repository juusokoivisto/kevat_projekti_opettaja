import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import { useState, useEffect, useContext } from 'react'
import LunchBreak from './LunchBreak'

import { api } from '../api'
import * as T from '../api/types/api.types'

import { ColorModeContext } from '../App'
import './Calendar.css'
import Box from '@mui/material/Box'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

interface FCResource {
  id: string;
  title: string;
}

export default function Calendar({ refreshKey }: { refreshKey: number }) {
  const { darkMode } = useContext(ColorModeContext)

  const [resources, setResources] = useState<FCResource[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])

  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const [teachers, setTeachers] = useState<T.Teacher[]>([])
  const [groups, setGroups] = useState<T.StudentGroup[]>([])
  const [courses, setCourses] = useState<T.Course[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [huoneet, tapahtumat, opettajat, opiskelijaryhmat, kurssit] = await Promise.all([
          api.rooms.getAll(),
          api.calendar.getAll(),
          api.teachers.getAll(),
          api.groups.getAll(),
          api.courses.getAll()
        ])

        const mappedResources: FCResource[] = huoneet.map(h => ({
          id: String(h.id),
          title: h.huoneenNumero
        }))

        const mappedEvents = tapahtumat.map(e => ({
          id: String(e.id),
          resourceId: String(e.huoneId),
          title: `${e.kurssi?.nimi || 'Tapahtuma'} (${e.opettaja?.sukunimi || ''})`,
          start: e.alkaa,
          end: e.paattyy,
          backgroundColor: darkMode ? '#1976d2' : '#3788d8',
          extendedProps: {
            ryhmaId: e.ryhmaId,
            opettaja: e.opettaja ? `${e.opettaja.nimi} ${e.opettaja.sukunimi}` : '',
            kurssi: e.kurssi?.nimi || ''
          }
        }))

        setResources(mappedResources)
        setEvents(mappedEvents)
        setFilteredEvents(mappedEvents)
        setTeachers(opettajat)
        setGroups(opiskelijaryhmat)
        setCourses(kurssit)
      } catch (err) {
        const apiErr = err as T.ApiError;
        console.error('Calendar Load Failed:', apiErr.error)
      }
    }
    load()
  }, [darkMode, refreshKey])

  useEffect(() => {
    let filtered = [...events]
    if (selectedRoom) {
      filtered = filtered.filter(e => e.resourceId === selectedRoom)
    }
    if (selectedTeacher) {
      filtered = filtered.filter(e => e.extendedProps.opettaja === selectedTeacher)
    }
    if (selectedGroup !== '') {
      filtered = filtered.filter(e => e.extendedProps.ryhmaId === selectedGroup)
    }
    if (selectedCourse) {
      filtered = filtered.filter(e => e.extendedProps.kurssi === selectedCourse)
    }
    setFilteredEvents(filtered)
  }, [selectedRoom, selectedTeacher, selectedGroup, selectedCourse, events])

  return (
    <Box sx={{ p: 2 }}>
      {/* Filter UI */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Huone</InputLabel>
          <Select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            label="Huone"
          >
            <MenuItem value="">Kaikki</MenuItem>
            {resources.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Opettaja</InputLabel>
          <Select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            label="Opettaja"
          >
            <MenuItem value="">Kaikki</MenuItem>
            {teachers.map(t => (
              <MenuItem key={t.id} value={`${t.nimi} ${t.sukunimi}`}>
                {t.nimi} {t.sukunimi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Ryhmä</InputLabel>
          <Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value as number)}
            label="Ryhmä"
          >
            <MenuItem value="">Kaikki</MenuItem>
            {groups.map(g => (
              <MenuItem key={g.id} value={g.id}>
                {g.ryhmatunnus}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Kurssi</InputLabel>
          <Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            label="Kurssi"
          >
            <MenuItem value="">Kaikki</MenuItem>
            {courses.map(c => (
              <MenuItem key={c.id} value={c.nimi}>{c.nimi}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendar View */}
      <div className={darkMode ? 'calendar-dark' : ''}>
        <FullCalendar
          plugins={[resourceTimelinePlugin, timeGridPlugin, dayGridPlugin, multiMonthPlugin]}
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          initialView="timeGridWeek"
          weekends={false}
          selectOverlap={false}
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
          resources={resources}
          events={[...filteredEvents, LunchBreak]}
          resourceAreaHeaderContent='Tilat'
          resourceAreaWidth="200px"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      </div>
    </Box>
  )
}