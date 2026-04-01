import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { getClassrooms, getCalendarEvents } from '../api'
import type { Classroom as ApiClassroom } from '../api'
import { ColorModeContext } from '../App'
import './Calendar.css'
import Box from '@mui/material/Box'

export default function Calendar() {
  const { darkMode } = React.useContext(ColorModeContext)
  const [resources, setResources] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [huoneet, tapahtumat] = await Promise.all([
          getClassrooms(),
          getCalendarEvents()
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
            ryhma: e.opiskelijaryhma?.ryhmatunnus,
            opettaja: `${e.opettaja?.nimi} ${e.opettaja?.sukunimi}`
          }
        }))

        setResources(mappedResources)
        setEvents(mappedEvents)
      } catch (err) {
        console.error('Error loading calendar data:', err)
      }
    }
    load()
  }, [darkMode])

  return (
    <Box sx={{ p: 2 }}>
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
          events={events}
          resourceAreaWidth="200px"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      </div>
    </Box>
  )
}