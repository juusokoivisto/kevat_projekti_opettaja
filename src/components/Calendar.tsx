import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import fiLocale from '@fullcalendar/core/locales/fi'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { ColorModeContext } from '../App'
import './Calendar.css'
import Box from '@mui/material/Box'

interface Huone {
  id: number
  huoneenNumero: string
  kapasiteetti: number
  tyyppi: string
}

export default function Calendar() {
  const { darkMode } = React.useContext(ColorModeContext)

  const [resources, setRows] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:4000/luokkahuoneet')
        if (!res.ok) throw new Error('Failed to fetch classrooms')
        const huoneet: Huone[] = await res.json()

        const resources = huoneet.map(h => ({
          id: String(h.id),
          title: h.huoneenNumero
        }))

        setRows(resources)
      } catch (err) {
        console.error('Error loading classrooms:', err)
      }
    }

    load()
  }, [open])

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
          resources={resources}
          resourceAreaWidth="200px"
        />
      </div>
    </Box>
  )
}