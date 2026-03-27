import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import fiLocale from '@fullcalendar/core/locales/fi'
import * as React from 'react'
import { ColorModeContext } from '../App'
import './Calendar.css'

export default function Calendar() {
  const { darkMode } = React.useContext(ColorModeContext)

  return (
    <div className={darkMode ? 'calendar-dark' : ''}>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, multiMonthPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        contentHeight="auto"
        locale={fiLocale}
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth,multiMonthYear'
        }}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
        titleFormat={{ day: 'numeric', month: 'long', year: 'numeric' }}
        events={[
          { title: 'event 1', date: '2026-04-01' },
          { title: 'event 2', date: '2026-04-02' }
        ]}
      />
    </div>
  )
}