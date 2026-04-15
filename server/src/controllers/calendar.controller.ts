import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CalendarBody } from '../types';

export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const tapahtumat = await prisma.tyojarjestys.findMany({
      include: { tila: true, opettaja: true, kurssi: true },
    });
    res.json(tapahtumat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getTeacherEvents = async (req: Request<{ id: string }>, res: Response) => {
  const teacherId = Number(req.params.id);
  try {
    const tapahtumat = await prisma.tyojarjestys.findMany({
      where: { opettajaId: teacherId },
      include: { tila: true, opettaja: true, kurssi: true },
      orderBy: { alkaa: 'asc' }
    });
    res.json(tapahtumat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createEvent = async (req: Request<{}, {}, CalendarBody>, res: Response) => {
  const { huoneId, opettajaId, kurssiId, ryhmaId, alkaa, paattyy } = req.body;

  if (!huoneId || !opettajaId || !kurssiId || !ryhmaId || !alkaa || !paattyy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const start = new Date(alkaa);
  const end = new Date(paattyy);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ error: 'Invalid time range' });
  }


  const lunchStart = new Date(start);
  lunchStart.setHours(11, 0, 0, 0);

  const lunchEnd = new Date(start);
  lunchEnd.setHours(11, 45, 0, 0);

  const overlapsLunch = start < lunchEnd && end > lunchStart;

  if (overlapsLunch) {
    return res.status(400).json({
      error: 'Varauksia ei voi tehdä lounastauon aikana (11:00 - 11:45).'
    });
  }


  try {
    const roomConflict = await prisma.tyojarjestys.findFirst({
      where: { tilaId: Number(huoneId), alkaa: { lt: end }, paattyy: { gt: start } },
    });
    if (roomConflict) return res.status(409).json({ error: 'Room is already booked' });

    const teacherConflict = await prisma.tyojarjestys.findFirst({
      where: { opettajaId: Number(opettajaId), alkaa: { lt: end }, paattyy: { gt: start } },
    });
    if (teacherConflict) return res.status(409).json({ error: 'Teacher already has an event' });

    const tapahtuma = await prisma.tyojarjestys.create({
      data: {
        tilaId: Number(huoneId),
        opettajaId: Number(opettajaId),
        kurssiId: Number(kurssiId),
        ryhmaId: Number(ryhmaId),
        alkaa: start,
        paattyy: end,
      },
      include: { tila: true, opettaja: true, kurssi: true },
    });

    res.status(201).json(tapahtuma);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};