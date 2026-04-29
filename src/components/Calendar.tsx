import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import fiLocale from '@fullcalendar/core/locales/fi'
import type { EventContentArg } from '@fullcalendar/core'
import { useState, useContext, useMemo, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Tooltip, Autocomplete, TextField, MenuItem, Typography,
  Menu, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Popover, Badge, Chip, Divider
} from '@mui/material'
import {
  Edit as EditIcon, Tune as TuneIcon,
  Close as CloseIcon, Delete as DeleteIcon
} from '@mui/icons-material'
import LunchBreak from './LunchBreak'
import { UserContext } from '../context/UserContext'
import { useCalendarEvents, useCalendarFilters } from '../hooks/useQueries'
import { api } from '../api'
import * as T from '../api/types/api.types'
import { formatCalendarEvent } from '../utils/calendarHelpers'
import './Calendar.css'

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
    <Tooltip title={`${title} | ${opettaja}`} arrow placement="top" disableInteractive>
      <Box sx={{
        width: '100%',
        height: '100%',
        padding: '1px 3px',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        overflow: 'hidden',
        boxSizing: 'border-box',
        gap: '0.5px'
      }}>
        <Typography sx={{
          fontWeight: 'bold',
          lineHeight: 1.1,
          fontSize: '0.65rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-all'
        }}>
          {title}
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 0.1
        }}>
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {ryhmaTunnus}
          </Typography>
          <Typography sx={{ fontSize: '0.55rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {huoneNumero}
          </Typography>
          {opettajaLyhyt && (
            <Typography
              component="a"
              href={`/teachers/${opettajaId}`}
              onClick={(e) => e.stopPropagation()}
              sx={{
                fontSize: '0.55rem',
                fontWeight: 600,
                color: 'inherit',
                textDecoration: 'none',
                opacity: 0.95,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {opettajaLyhyt}
            </Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  )
}

export default function Calendar({ teacherId, hideFilters, onEdit, onAdd }: { teacherId?: number; hideFilters?: boolean; onEdit?: (id: string) => void; onAdd?: () => void; }) {
  const { user } = useContext(UserContext)

  const [filters, setFilters] = useState({
    room: '',
    teacher: '',
    group: '' as number | '',
    course: ''
  })

  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
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
      .map(e => formatCalendarEvent(e))
      .filter(e => {
        if (filters.room && e.resourceId !== filters.room) return false
        if (filters.teacher && e.extendedProps.opettaja !== filters.teacher) return false
        if (filters.group !== '' && e.extendedProps.ryhmaId !== filters.group) return false
        if (filters.course && e.extendedProps.kurssi !== filters.course) return false
        return true
      })
  }, [rawEvents, filters])

  const sortedResources = useMemo(() =>
    resources.slice().sort((a, b) => a.title.localeCompare(b.title, 'fi')),
    [resources]
  )

  const sortedTeachers = useMemo(() =>
    teachers.slice().sort((a, b) =>
      `${a.nimi} ${a.sukunimi}`.localeCompare(`${b.nimi} ${b.sukunimi}`, 'fi')
    ),
    [teachers]
  )

  const sortedGroups = useMemo(() =>
    groups.slice().sort((a, b) => a.ryhmatunnus.localeCompare(b.ryhmatunnus, 'fi')),
    [groups]
  )

  const sortedCourses = useMemo(() =>
    courses.slice().sort((a, b) => a.nimi.localeCompare(b.nimi, 'fi')),
    [courses]
  )

  const activeFilterCount = [
    filters.room,
    filters.teacher,
    filters.group !== '' ? filters.group : '',
    filters.course
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setFilters({ room: '', teacher: '', group: '', course: '' })
  }

  const handleEventDidMount = useCallback((info: any) => {
    const bgColor = info.event.backgroundColor
    if (bgColor) {
      info.el.style.backgroundColor = bgColor
    }

    const handler = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedEventId(info.event.id)
      setMenuAnchor(info.el as HTMLElement)
    }

    info.el.addEventListener('contextmenu', handler)
  }, [])

  const filterOpen = Boolean(filterAnchor)

  return (
    <Box sx={{ p: 1 }}>
      {!hideFilters && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {filters.room && (
            <Chip
              size="small"
              label={`Huone: ${sortedResources.find(r => r.id === filters.room)?.title ?? filters.room}`}
              onDelete={() => setFilters(f => ({ ...f, room: '' }))}
              sx={{ height: 26 }}
            />
          )}
          {filters.teacher && (
            <Chip
              size="small"
              label={`Opettaja: ${filters.teacher}`}
              onDelete={() => setFilters(f => ({ ...f, teacher: '' }))}
              sx={{ height: 26 }}
            />
          )}
          {filters.group !== '' && (
            <Chip
              size="small"
              label={`Ryhmä: ${sortedGroups.find(g => g.id === filters.group)?.ryhmatunnus ?? filters.group}`}
              onDelete={() => setFilters(f => ({ ...f, group: '' }))}
              sx={{ height: 26 }}
            />
          )}
          {filters.course && (
            <Chip
              size="small"
              label={`Kurssi: ${filters.course}`}
              onDelete={() => setFilters(f => ({ ...f, course: '' }))}
              sx={{ height: 26 }}
            />
          )}

          <Tooltip title="Filtterit" placement="left">
            <IconButton
              onClick={(e) => setFilterAnchor(e.currentTarget)}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                px: 1,
                gap: 0.5,
                color: activeFilterCount > 0 ? 'primary.main' : 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
              }}
            >
              <Badge badgeContent={activeFilterCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <TuneIcon fontSize="small" />
              </Badge>
              <Typography variant="caption" sx={{ fontWeight: 500, ml: 0.25 }}>
                Filtterit
              </Typography>
            </IconButton>
          </Tooltip>

          <Popover
            open={filterOpen}
            anchorEl={filterAnchor}
            onClose={() => setFilterAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.75,
                  width: 280,
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 6,
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Filtterit
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {activeFilterCount > 0 && (
                  <Button
                    size="small"
                    onClick={clearAllFilters}
                    sx={{ fontSize: 11, py: 0.25, px: 1, minWidth: 0, color: 'text.secondary' }}
                  >
                    Tyhjennä
                  </Button>
                )}
                <IconButton size="small" onClick={() => setFilterAnchor(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Autocomplete
                size="small"
                options={sortedResources}
                getOptionLabel={(option) => option.title || ''}
                value={sortedResources.find((r) => r.id === filters.room) || null}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, room: newValue ? newValue.id : '' }))}
                renderInput={(params) => <TextField {...params} label="Huone" />}
              />

              <Autocomplete
                size="small"
                options={sortedTeachers}
                getOptionLabel={(option) => `${option.nimi} ${option.sukunimi}`}
                value={sortedTeachers.find(t => `${t.nimi} ${t.sukunimi}` === filters.teacher) || null}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, teacher: newValue ? `${newValue.nimi} ${newValue.sukunimi}` : '' }))}
                renderInput={(params) => <TextField {...params} label="Opettaja" />}
              />

              <Autocomplete
                size="small"
                options={sortedGroups}
                getOptionLabel={(option) => option.ryhmatunnus || ''}
                value={sortedGroups.find((g) => g.id === filters.group) || null}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, group: newValue ? newValue.id : '' }))}
                renderInput={(params) => <TextField {...params} label="Ryhmä" />}
              />

              <Autocomplete
                size="small"
                options={sortedCourses}
                getOptionLabel={(option) => option.nimi || ''}
                value={sortedCourses.find((c) => c.nimi === filters.course) || null}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, course: newValue ? newValue.nimi : '' }))}
                renderInput={(params) => <TextField {...params} label="Kurssi" />}
              />
            </Box>
          </Popover>
        </Box>
      )}

      <div>
        <FullCalendar
          plugins={[resourceTimelinePlugin, timeGridPlugin, dayGridPlugin, multiMonthPlugin]}
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          initialView="timeGridWeek"
          weekends={false}
          selectOverlap={false}
          filterResourcesWithEvents={true}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
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
              click: () => { if (onAdd) onAdd() },
            },
          }}
        />

        {user && (
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => {
              setMenuAnchor(null)
              setSelectedEventId(null)
            }}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <MenuItem
              sx={{ display: 'flex', alignItems: 'center' }}
              onClick={() => {
                if (onEdit && selectedEventId) onEdit(selectedEventId)
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
              sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}
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
            <Button onClick={() => setConfirmOpen(false)}>Peruuta</Button>
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