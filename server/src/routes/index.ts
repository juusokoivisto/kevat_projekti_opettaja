import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { login } from '../controllers/auth.controller';
import { getTeachers, createTeacher, deleteTeachers, getTeacherById } from '../controllers/teacher.controller';
import { getRooms, createRoom, deleteRooms } from '../controllers/room.controller';
import { getCourses, createCourse, deleteCourses } from '../controllers/course.controller';
import { getGroups, createGroup, deleteGroups } from '../controllers/group.controller';
import {
  getAllEvents,
  getTeacherEvents,
  createEvent,
  createManyEvents,
  deleteEvent
} from '../controllers/calendar.controller';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.post('/login', login);

router.route('/opettajat')
  .get(getTeachers)
  .post(authenticateToken, createTeacher)
  .delete(authenticateToken, deleteTeachers);

router.get('/opettajat/:id', getTeacherById);

router.route('/luokkahuoneet')
  .get(getRooms)
  .post(authenticateToken, createRoom)
  .delete(authenticateToken, deleteRooms);

router.route('/kurssit')
  .get(getCourses)
  .post(authenticateToken, createCourse)
  .delete(authenticateToken, deleteCourses);

router.route('/opiskelijaryhmat')
  .get(getGroups)
  .post(authenticateToken, createGroup)
  .delete(authenticateToken, deleteGroups);

router.route('/kalenteri')
  .get(getAllEvents)
  .post(authenticateToken, createEvent);

router.post('/kalenteri/batch', authenticateToken, createManyEvents);

router.get('/kalenteri/opettaja/:id', getTeacherEvents);

router.delete('/kalenteri/:id', authenticateToken, deleteEvent);

router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: (req as any).user
  });
});

export default router;