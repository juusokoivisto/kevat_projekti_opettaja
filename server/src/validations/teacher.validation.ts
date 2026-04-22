import { Request, Response, NextFunction } from 'express';
import { TeacherBody, DeleteRequest } from '../types';

export const validateCreateTeacher = (
  req: Request<{}, {}, TeacherBody>,
  res: Response,
  next: NextFunction
) => {
  const { nimi, sukunimi, sahkoposti } = req.body;
  if (!nimi?.trim()) return res.status(400).json({ error: 'nimi is required' });
  if (!sukunimi?.trim()) return res.status(400).json({ error: 'sukunimi is required' });
  if (!sahkoposti?.trim()) return res.status(400).json({ error: 'sahkoposti is required' });
  next();
};

export const validateUpdateTeacher = (
  req: Request<{ id: string }, {}, TeacherBody>,
  res: Response,
  next: NextFunction
) => {
  const { nimi, sukunimi, sahkoposti, sopimustunnit } = req.body;
  if (isNaN(Number(req.params.id))) return res.status(400).json({ error: 'id must be numeric' });
  if (!nimi?.trim()) return res.status(400).json({ error: 'nimi is required' });
  if (!sukunimi?.trim()) return res.status(400).json({ error: 'sukunimi is required' });
  if (!sahkoposti?.trim()) return res.status(400).json({ error: 'sahkoposti is required' });
  if (sopimustunnit !== undefined && isNaN(Number(sopimustunnit))) return res.status(400).json({ error: 'sopimustunnit must be a number' });
  next();
};

export const validateGetTeacherById = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  if (isNaN(Number(req.params.id))) return res.status(400).json({ error: 'id must be numeric' });
  next();
};

export const validateDeleteTeachers = (
  req: Request<{}, {}, DeleteRequest>,
  res: Response,
  next: NextFunction
) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids must be a non-empty array' });
  if (ids.some(id => isNaN(Number(id)))) return res.status(400).json({ error: 'all ids must be numeric' });
  next();
};