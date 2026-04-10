import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { getTeachers, createTeacher, deleteTeachers, getTeacherById } from '../controllers/teacher.controller';
import { getRooms, createRoom, deleteRooms } from '../controllers/room.controller';
import { getCourses, createCourse, deleteCourses } from '../controllers/course.controller';
import { getGroups, createGroup, deleteGroups } from '../controllers/group.controller';
import { getAllEvents, getTeacherEvents, createEvent } from '../controllers/calendar.controller';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.post('/login', login);

router.route('/opettajat')
  .get(getTeachers)
  .post(createTeacher)
  .delete(deleteTeachers);

router.get('/opettajat/:id', getTeacherById);

router.route('/luokkahuoneet')
  .get(getRooms)
  .post(createRoom)
  .delete(deleteRooms);

router.route('/kurssit')
  .get(getCourses)
  .post(createCourse)
  .delete(deleteCourses);

router.route('/opiskelijaryhmat')
  .get(getGroups)
  .post(createGroup)
  .delete(deleteGroups);

router.route('/kalenteri')
  .get(getAllEvents)
  .post(createEvent);

router.get('/kalenteri/opettaja/:id', getTeacherEvents);

export default router;