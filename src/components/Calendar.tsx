import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import EditIcon from '@mui/icons-material/Edit';
import { useState, useContext, useMemo, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import LunchBreak from './LunchBreak'
import { ColorModeContext, UserContext } from '../App'
import { useCalendarEvents, useCalendarFilters } from '../hooks/useQueries'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { formatCalendarEvent } from '../utils/calendarHelpers'
import './Calendar.css'
import type { EventContentArg } from '@fullcalendar/core'

interface FCResource {
  id: string;
  title: string;
}

const renderEventContent = (eventInfo: EventContentArg) => {
  const {
    opettaja,
    opettajaLyhyt,
    ryhmaTunnus,
    huoneNumero,
    opettajaId
  } = eventInfo.event.extendedProps
  const title = eventInfo.event.title

  return (
    <Tooltip title={opettaja || ''} arrow placement="top" disableInteractive>
      <Box sx={{
        width: '100%',
        height: '100%',
        padding: '2px 4px',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <Typography variant="caption" sx={{
          fontWeight: 'bold',
          lineHeight: 1.1,
          fontSize: '0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </Typography>

        <Typography variant="caption" sx={{
          fontSize: '0.65rem',
          lineHeight: 1,
          opacity: 0.9
        }}>
          {ryhmaTunnus}
        </Typography>

        <Typography variant="caption" sx={{
          fontSize: '0.65rem',
          lineHeight: 1,
          opacity: 0.9
        }}>
          {huoneNumero}
        </Typography>

        {opettajaLyhyt && (
          <Typography
            variant="caption"
            component="a"
            href={`/teachers/${opettajaId}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              mt: 'auto',
              alignSelf: 'flex-end',
              fontWeight: 'bold',
              fontSize: '0.7rem',
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {opettajaLyhyt}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}

export default function Calendar({ teacherId, hideFilters, onEdit, }: { teacherId?: number; hideFilters?: boolean; onEdit?: (id: string) => void; }) {
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
        if (filters.room && e.resourceId !== filters.room) return false
        if (filters.teacher && e.extendedProps.opettaja !== filters.teacher) return false
        if (filters.group !== '' && e.extendedProps.ryhmaId !== filters.group) return false
        if (filters.course && e.extendedProps.kurssi !== filters.course) return false
        return true
      })
  }, [rawEvents, filters, darkMode])

  const sortedResources = useMemo(() =>
    resources.slice().sort((a, b) =>
      a.title.localeCompare(b.title, 'fi')
    ),
    [resources]
  )

  const sortedTeachers = useMemo(() =>
    teachers.slice().sort((a, b) =>
      `${a.nimi} ${a.sukunimi}`.localeCompare(
        `${b.nimi} ${b.sukunimi}`,
        'fi'
      )
    ),
    [teachers]
  )

  const sortedGroups = useMemo(() =>
    groups.slice().sort((a, b) =>
      a.ryhmatunnus.localeCompare(b.ryhmatunnus, 'fi')
    ),
    [groups]
  )

  const sortedCourses = useMemo(() =>
    courses.slice().sort((a, b) =>
      a.nimi.localeCompare(b.nimi, 'fi')
    ),
    [courses]
  )

  const handleEventDidMount = useCallback((info: any) => {
    const bgColor = info.event.backgroundColor
    if (bgColor) {
      info.el.style.borderColor = bgColor
      info.el.style.backgroundColor = bgColor
    }

    const handler = (e: MouseEvent) => {
      e.preventDefault()
      setSelectedEventId(info.event.id)
      setMenuAnchor(info.el as HTMLElement)
    }

    info.el.addEventListener('contextmenu', handler)

    return () => info.el.removeEventListener('contextmenu', handler)
  }, [])

  return (
    <Box sx={{ p: 1 }}>
      {!hideFilters && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            mb: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: 14,
              color: 'text.secondary',
            }}
          >
            Filtterit
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Huone</InputLabel>
              <Select value={filters.room} onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))} label="Huone">
                <MenuItem value="">Kaikki</MenuItem>
                {sortedResources.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Opettaja</InputLabel>
              <Select value={filters.teacher} onChange={(e) => setFilters(prev => ({ ...prev, teacher: e.target.value }))} label="Opettaja">
                <MenuItem value="">Kaikki</MenuItem>
                {sortedTeachers.map(t => (
                  <MenuItem key={t.id} value={`${t.nimi} ${t.sukunimi}`}>
                    {t.nimi} {t.sukunimi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Ryhmä</InputLabel>
              <Select value={filters.group} onChange={(e) => setFilters(prev => ({ ...prev, group: e.target.value }))} label="Ryhmä">
                <MenuItem value="">Kaikki</MenuItem>
                {sortedGroups.map(g => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.ryhmatunnus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Kurssi</InputLabel>
              <Select value={filters.course} onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))} label="Kurssi">
                <MenuItem value="">Kaikki</MenuItem>
                {sortedCourses.map(c => (
                  <MenuItem key={c.id} value={c.nimi}>
                    {c.nimi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
          eventDidMount={handleEventDidMount}
          resources={resources}
          events={[...filteredEvents, LunchBreak]}
          resourceAreaHeaderContent='Tilat'
          resourceAreaWidth="200px"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventContent={renderEventContent}
        />

        {user && menuAnchor && (
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}

          >
            <MenuItem
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => {
                if (onEdit && selectedEventId) {
                  onEdit(selectedEventId)
                }
                setMenuAnchor(null)
              }}
            >
              <EditIcon sx={{ color: '#90caf9', mr: 1 }} />
              Muokkaa
            </MenuItem>
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
                if (selectedEventId) deleteEventMutation.mutate(selectedEventId)
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