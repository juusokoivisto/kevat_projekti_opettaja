import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { login } from '../controllers/auth.controller';
import { getTeachers, createTeacher, deleteTeachers, getTeacherById, updateTeacher } from '../controllers/teacher.controller';
import { getRooms, createRoom, deleteRooms, updateRoom } from '../controllers/room.controller';
import { getCourses, createCourse, deleteCourses, updateCourse } from '../controllers/course.controller';
import { getGroups, createGroup, deleteGroups, updateGroups } from '../controllers/group.controller';
import { getAllEvents, getTeacherEvents, createEvent, createManyEvents, deleteEvent } from '../controllers/calendar.controller';
import { exportToExcel } from '../controllers/export.controller';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.post('/login', login);

router.route('/opettajat')
  .get(getTeachers)
  .post(authenticateToken, createTeacher)
  .delete(authenticateToken, deleteTeachers);
router.put('/opettajat/:id', authenticateToken, updateTeacher);
router.get('/opettajat/:id', getTeacherById);

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

router.get('/kalenteri/export', authenticateToken, exportToExcel);

router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: (req as any).user
  });
});

export default router;