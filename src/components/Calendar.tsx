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
import { Tooltip } from '@mui/material'
import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material'

interface FCResource {
  id: string;
  title: string;
}

export default function Calendar({ refreshKey, teacherId, hideFilters }: { refreshKey: number; teacherId?: number; hideFilters?: boolean }) {
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
      console.group(`[Calendar] Initial Load (refreshKey: ${refreshKey})`);

      try {
        const roomsPromise = api.rooms.getAll();
        const eventsPromise = teacherId ? api.calendar.getByTeacher(Number(teacherId)) : api.calendar.getAll();
        const teachersPromise = api.teachers.getAll();
        const groupsPromise = api.groups.getAll();
        const coursesPromise = api.courses.getAll();

        const [huoneet, tapahtumat, opettajat, opiskelijaryhmat, kurssit] = await Promise.all([
          roomsPromise,
          eventsPromise,
          teachersPromise,
          groupsPromise,
          coursesPromise
        ]) as [T.Classroom[], T.CalendarEvent[], T.Teacher[], T.StudentGroup[], T.Course[]];

        const mappedResources: FCResource[] = huoneet.map(h => ({
          id: String(h.id),
          title: h.huoneenNumero
        }));

        const mappedEvents = tapahtumat.map(e => {
          const rawId = e.huoneId || e.tila?.id;
          const resId = rawId ? String(rawId) : 'unassigned';

          if (resId === 'unassigned') {
            console.error(`MISSING ID for Event ${e.id}. Object structure:`, e);
          }

          let teacherShort = '';
          if (e.opettaja) {
            const firstPart = e.opettaja.nimi ? e.opettaja.nimi.substring(0, 2) : '';
            const lastPart = e.opettaja.sukunimi ? e.opettaja.sukunimi.substring(0, 2) : '';

            const formatPart = (str: string) => str
              ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
              : '';

            teacherShort = `${formatPart(firstPart)}${formatPart(lastPart)}`;
          }

          return {
            id: String(e.id),
            resourceId: resId,
            title: e.kurssi?.nimi || 'Tapahtuma',
            start: e.alkaa,
            end: e.paattyy,
            backgroundColor: e.opettaja && (e.opettaja as any).color ? (e.opettaja as any).color : (darkMode ? '#1976d2' : '#3788d8'),
            extendedProps: {
              ryhmaId: e.ryhmaId,
              opettaja: e.opettaja ? `${e.opettaja.nimi} ${e.opettaja.sukunimi}` : '',
              opettajaLyhyt: teacherShort,
              kurssi: e.kurssi?.nimi || ''
            }
          };
        });

        setResources(mappedResources);
        setEvents(mappedEvents);
        setFilteredEvents(mappedEvents);
        setTeachers(opettajat);
        setGroups(opiskelijaryhmat);
        setCourses(kurssit);

        console.log('Data Load Complete. Events mapped:', mappedEvents.length);
      } catch (err) {
        console.error('Data Fetch Error:', err);
      } finally {
        console.groupEnd();
      }
    };
    load();
  }, [darkMode, refreshKey]);

  useEffect(() => {
    let filtered = [...events];
    if (selectedRoom) filtered = filtered.filter(e => e.resourceId === selectedRoom);
    if (selectedTeacher) filtered = filtered.filter(e => e.extendedProps.opettaja === selectedTeacher);
    if (selectedGroup !== '') filtered = filtered.filter(e => e.extendedProps.ryhmaId === selectedGroup);
    if (selectedCourse) filtered = filtered.filter(e => e.extendedProps.kurssi === selectedCourse);
    setFilteredEvents(filtered);
  }, [selectedRoom, selectedTeacher, selectedGroup, selectedCourse, events]);

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
          allDaySlot={false}
          filterResourcesWithEvents={true}
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

          eventContent={(eventInfo) => {
            const fullName = eventInfo.event.extendedProps.opettaja;
            const shortName = eventInfo.event.extendedProps.opettajaLyhyt;
            const title = eventInfo.event.title;

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
            );
          }}
        />
      </div>
    </Box>
  )
}