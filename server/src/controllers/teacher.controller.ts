import { Request, Response } from 'express';
import { TeacherBody, DeleteRequest } from '../types';
import * as teacherService from '../services/teacher.service';
import { Prisma } from '@prisma/client';

export const getTeachers = async (_req: Request, res: Response) => {
  try {
    res.json(await teacherService.findAllTeachers());
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getTeacherById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const teacher = await teacherService.findTeacherById(Number(req.params.id));
    if (!teacher) return res.status(404).json({ error: 'Opettajaa ei löytynyt' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createTeacher = async (req: Request<{}, {}, TeacherBody>, res: Response) => {
  try {
    const teacher = await teacherService.createTeacher(req.body);
    res.status(201).json(teacher);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          error: 'Sähköposti on jo käytössä'
        });
      }
    }
    res.status(400).json({ error: (err as Error).message });
  }
};

export const updateTeacher = async (req: Request<{ id: string }, {}, TeacherBody>, res: Response) => {
  try {
    const teacher = await teacherService.updateTeacher(Number(req.params.id), req.body);
    if (!teacher) return res.status(404).json({ error: 'Opettajaa ei löytynyt' });
    res.json(teacher);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'Sähköposti on jo käytössä' });
      }
    }
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteTeachers = async (req: Request<{}, {}, DeleteRequest>, res: Response) => {
  try {
    await teacherService.deleteTeachers(req.body.ids.map(Number));
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};