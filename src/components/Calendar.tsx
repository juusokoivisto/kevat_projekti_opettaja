import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { getClassrooms, getCalendarEvents, getTeachers, getGroups, get } from '../api'
import type { Classroom as ApiClassroom } from '../api'
import { ColorModeContext } from '../App'
import './Calendar.css'
import Box from '@mui/material/Box'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

export default function Calendar({ refreshKey }: { refreshKey: number }) {
  const { darkMode } = React.useContext(ColorModeContext)
  const [resources, setResources] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])

  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const [teachers, setTeachers] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [huoneet, tapahtumat, opettajat, opiskelijaryhmat, kurssit] = await Promise.all([
          getClassrooms(),
          getCalendarEvents(),
          getTeachers(),
          getGroups(),
          get('/kurssit')
        ])

      
        const mappedResources = huoneet.map((h: ApiClassroom) => ({
          id: String(h.id),
          title: h.huoneenNumero
        }))

      
        const mappedEvents = tapahtumat.map((e: any) => ({
          id: String(e.id),
          resourceId: String(e.tilaId),
          title: `${e.kurssi?.nimi || 'Tapahtuma'} (${e.opettaja?.sukunimi || ''})`,
          start: e.alkaa,
          end: e.paattyy,
          backgroundColor: darkMode ? '#1976d2' : '#3788d8',
          extendedProps: {
            ryhmaId: e.ryhmaId,
            opettaja: `${e.opettaja?.nimi} ${e.opettaja?.sukunimi}`,
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
        console.error('Error loading calendar data:', err)
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
      filtered = filtered.filter(e =>
        e.extendedProps.ryhmaId === selectedGroup
      )
    }
    if (selectedCourse) {
      filtered = filtered.filter(e => e.extendedProps.kurssi === selectedCourse)
    }
    setFilteredEvents(filtered)
  }, [selectedRoom, selectedTeacher, selectedGroup, selectedCourse, events])

  return (
    <Box sx={{ p: 2 }}>
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
            onChange={(e) => setSelectedGroup(e.target.value)}
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

      <div className={darkMode ? 'calendar-dark' : ''}>
        <FullCalendar
          plugins={[resourceTimelinePlugin, timeGridPlugin, dayGridPlugin, multiMonthPlugin]}
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          initialView="timeGridWeek"
          weekends={false}
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
          dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
          titleFormat={{ day: 'numeric', month: 'long', year: 'numeric' }}
          views={{
            multiMonthYear: {
              dayHeaderFormat: { weekday: 'short' }
            },
            dayGridMonth: {
              dayHeaderFormat: { weekday: 'long' }
            },
            resourceTimelineDay: {
              slotMinTime: '07:00:00',
              slotMaxTime: '20:00:00',
              slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
              buttonText: 'Päivä',
            }
          }}
          resourceAreaHeaderContent='Tilat'
          resources={resources}
          events={filteredEvents}
          resourceAreaWidth="200px"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      </div>
    </Box>
  )
}