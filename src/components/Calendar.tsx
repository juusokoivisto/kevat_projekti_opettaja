import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import { useState, useContext, useMemo } from 'react'
import LunchBreak from './LunchBreak'
import { ColorModeContext, UserContext } from '../App'
import { useCalendarEvents, useCalendarFilters } from '../hooks/useQueries'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCalendarEvent } from '../utils/calendarHelpers'
import './Calendar.css'
import Box from '@mui/material/Box'
import { 
  Tooltip, FormControl, InputLabel, Select, MenuItem, Typography, 
  Menu, Dialog, DialogTitle, DialogContent, DialogActions, Button 
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface FCResource {
  id: string;
  title: string;
}

export default function Calendar({ teacherId, hideFilters }: { teacherId?: number; hideFilters?: boolean }) {
  const { darkMode } = useContext(ColorModeContext)
  const { user } = useContext(UserContext)

  const [filters, setFilters] = useState({
    room: '',
    teacher: '',
    group: '' as number | '',
    course: ''
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  
  const { data: rawEvents = [] } = useCalendarEvents(teacherId)
  const { rooms = [], teachers = [], groups = [], courses = [] } = useCalendarFilters()

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => api.calendar.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    }
  })

  const resources: FCResource[] = useMemo(() =>
    rooms.map((h: T.Classroom) => ({ id: String(h.id), title: h.huoneenNumero })),
    [rooms]
  )

  const filteredEvents = useMemo(() => {
    return rawEvents
      .map(e => formatCalendarEvent(e, darkMode))
      .filter(e => {
        if (filters.room && e.resourceId !== filters.room) return false;
        if (filters.teacher && e.extendedProps.opettaja !== filters.teacher) return false;
        if (filters.group !== '' && e.extendedProps.ryhmaId !== filters.group) return false;
        if (filters.course && e.extendedProps.kurssi !== filters.course) return false;
        return true;
      });
  }, [rawEvents, filters, darkMode]);

  return (
    <Box sx={{ p: 2 }}>
      {!hideFilters && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Huone</InputLabel>
            <Select value={filters.room} onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))} label="Huone">
              <MenuItem value="">Kaikki</MenuItem>
              {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Opettaja</InputLabel>
            <Select value={filters.teacher} onChange={(e) => setFilters(prev => ({ ...prev, teacher: e.target.value }))} label="Opettaja">
              <MenuItem value="">Kaikki</MenuItem>
              {teachers.map(t => (
                <MenuItem key={t.id} value={`${t.nimi} ${t.sukunimi}`}>{t.nimi} {t.sukunimi}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Ryhmä</InputLabel>
            <Select value={filters.group} onChange={(e) => setFilters(prev => ({ ...prev, group: e.target.value }))} label="Ryhmä">
              <MenuItem value="">Kaikki</MenuItem>
              {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.ryhmatunnus}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Kurssi</InputLabel>
            <Select value={filters.course} onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))} label="Kurssi">
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
                  padding: '2px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  boxSizing: 'border-box',
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
        {user && menuAnchor && (
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setConfirmOpen(true)
                setMenuAnchor(null)
              }}
              sx={{
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <DeleteIcon sx={{ color: 'error.main', mr: 1 }} />
              Poista
            </MenuItem>
          </Menu>
        )}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Vahvista poisto</DialogTitle>

          <DialogContent>
            Haluatko varmasti poistaa tämän tapahtuman?
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>
              Peruuta
            </Button>

            <Button
              color="error"
              onClick={() => {
                if (selectedEventId) {
                  deleteEventMutation.mutate(selectedEventId)
                }
                setConfirmOpen(false)
                setSelectedEventId(null)
              }}
            >
              Poista
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  )
}