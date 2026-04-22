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
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
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

export default function Calendar({ teacherId, hideFilters, onEdit, onAdd }: { teacherId?: number; hideFilters?: boolean; onEdit?: (id: string) => void; onAdd?: () => void; }) {
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
              mb: 2,
              fontSize: 14,
              color: 'text.secondary',
            }}
          >
            Filtterit
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Huone Autocomplete */}
            <Autocomplete
              sx={{ width: 200 }}
              options={sortedResources}
              getOptionLabel={(option) => option.title || ''}
              value={sortedResources.find((r) => r.id === filters.room) || null}
              onChange={(_, newValue) => {
                setFilters((prev) => ({ ...prev, room: newValue ? newValue.id : '' }));
              }}
              renderInput={(params) => <TextField {...params} label="Huone" />}
            />

            {/* Opettaja Autocomplete */}
            <Autocomplete
              sx={{ width: 200 }}
              options={sortedTeachers}
              getOptionLabel={(option) => `${option.nimi} ${option.sukunimi}`}
              value={
                sortedTeachers.find(
                  (t) => `${t.nimi} ${t.sukunimi}` === filters.teacher
                ) || null
              }
              onChange={(_, newValue) => {
                setFilters((prev) => ({
                  ...prev,
                  teacher: newValue ? `${newValue.nimi} ${newValue.sukunimi}` : '',
                }));
              }}
              renderInput={(params) => <TextField {...params} label="Opettaja" />}
            />

            {/* Ryhmä Autocomplete */}
            <Autocomplete
              sx={{ width: 200 }}
              options={sortedGroups}
              getOptionLabel={(option) => option.ryhmatunnus || ''}
              value={sortedGroups.find((g) => g.id === filters.group) || null}
              onChange={(_, newValue) => {
                setFilters((prev) => ({ ...prev, group: newValue ? newValue.id : '' }));
              }}
              renderInput={(params) => <TextField {...params} label="Ryhmä" />}
            />

            {/* Kurssi Autocomplete */}
            <Autocomplete
              sx={{ width: 200 }}
              options={sortedCourses}
              getOptionLabel={(option) => option.nimi || ''}
              value={sortedCourses.find((c) => c.nimi === filters.course) || null}
              onChange={(_, newValue) => {
                setFilters((prev) => ({ ...prev, course: newValue ? newValue.nimi : '' }));
              }}
              renderInput={(params) => <TextField {...params} label="Kurssi" />}
            />
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
          headerToolbar={user ? {
            left: 'prev,next today addEventButton',
            center: 'title',
            right: 'resourceTimelineDay,timeGridWeek,dayGridMonth,multiMonthYear'
          } : {
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
          customButtons={{
            addEventButton: {
              text: 'Lisää tapahtuma',
              click: () => {
                if (onAdd) onAdd();
              },
            },
          }}
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