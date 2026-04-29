import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { login } from '../controllers/auth.controller';
import { getTeachers, createTeacher, deleteTeachers, getTeacherById, updateTeacher } from '../controllers/teacher.controller';
import { getRooms, createRoom, deleteRooms, updateRoom } from '../controllers/room.controller';
import { getCourses, createCourse, deleteCourses, updateCourse } from '../controllers/course.controller';
import { getGroups, createGroup, deleteGroups, updateGroups } from '../controllers/group.controller';
import { getAllEvents, getTeacherEvents, createEvent, createManyEvents, deleteEvent, updateEvent } from '../controllers/calendar.controller';
import { exportToExcel, exportToIcs } from '../controllers/export.controller';
import {
  validateCreateTeacher,
  validateUpdateTeacher,
  validateGetTeacherById,
  validateDeleteTeachers,
} from '../validations/teacher.validation';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.post('/login', loginRateLimiter, login);

router.route('/opettajat')
  .get(getTeachers)
  .post(authenticateToken, validateCreateTeacher, createTeacher)
  .delete(authenticateToken, validateDeleteTeachers, deleteTeachers);
router.put('/opettajat/:id', authenticateToken, validateUpdateTeacher, updateTeacher);
router.get('/opettajat/:id', validateGetTeacherById, getTeacherById);

router.route('/luokkahuoneet')
  .get(getRooms)
  .post(authenticateToken, createRoom)
  .delete(authenticateToken, deleteRooms);
router.put('/luokkahuoneet/:id', authenticateToken, updateRoom);

router.route('/kurssit')
  .get(getCourses)
  .post(authenticateToken, createCourse)
  .delete(authenticateToken, deleteCourses);
router.put('/kurssit/:id', authenticateToken, updateCourse);

router.route('/opiskelijaryhmat')
  .get(getGroups)
  .post(authenticateToken, createGroup)
  .delete(authenticateToken, deleteGroups);
router.put('/opiskelijaryhmat/:id', authenticateToken, updateGroups);

router.route('/kalenteri')
  .get(getAllEvents)
  .post(authenticateToken, createEvent);
router.post('/kalenteri/batch', authenticateToken, createManyEvents);
router.get('/kalenteri/opettaja/:id', getTeacherEvents);
router.delete('/kalenteri/:id', authenticateToken, deleteEvent);
router.put('/kalenteri/:id', authenticateToken, updateEvent);

router.get('/export/excel', authenticateToken, exportToExcel);
router.get('/export/ics', authenticateToken, exportToIcs);
//router.get('/calendar/feed', calendarFeed);

router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({ message: 'You are authenticated!', user: (req as any).user });
});

export default router;