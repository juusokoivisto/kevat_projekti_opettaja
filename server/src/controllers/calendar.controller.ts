import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CalendarBody } from '../types';
import * as CalendarService from '../services/calendar.service';

export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const tapahtumat = await prisma.tyojarjestys.findMany({
      include: { tila: true, opettaja: true, kurssi: true, ryhma: true },
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
      include: { tila: true, opettaja: true, kurssi: true, ryhma: true },
      orderBy: { alkaa: 'asc' }
    });
    res.json(tapahtumat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const deleteEvent = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.tyojarjestys.findUnique({ where: { id } });
      if (!existing) return null;

      await tx.tyojarjestys.delete({ where: { id } });

      const hours = CalendarService.durationHours(existing.alkaa, existing.paattyy);
      await CalendarService.adjustTeacherHours(tx, existing.opettajaId, +hours);

      return existing;
    });

    if (!result) return res.status(404).json({ error: 'Tapahtumaa ei löydy' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateEvent = async (
  req: Request<{ id: string }, {}, CalendarBody>,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const start = new Date(req.body.alkaa);
    const end = new Date(req.body.paattyy);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.tyojarjestys.findUnique({ where: { id } });
      if (!existing) return null;

      await CalendarService.validateEvent(tx, {
        id,
        huoneId: req.body.huoneId,
        opettajaId: req.body.opettajaId,
        ryhmaId: req.body.ryhmaId,
        start,
        end
      });

      const updated = await tx.tyojarjestys.update({
        where: { id },
        data: {
          tilaId: Number(req.body.huoneId),
          opettajaId: Number(req.body.opettajaId),
          kurssiId: Number(req.body.kurssiId),
          ryhmaId: Number(req.body.ryhmaId),
          alkaa: start,
          paattyy: end,
        }
      });

      const oldHours = CalendarService.durationHours(existing.alkaa, existing.paattyy);
      const newHours = CalendarService.durationHours(start, end);

      if (existing.opettajaId !== updated.opettajaId) {
        await CalendarService.adjustTeacherHours(tx, existing.opettajaId, +oldHours);
        await CalendarService.adjustTeacherHours(tx, updated.opettajaId, -newHours);
      } else {
        await CalendarService.adjustTeacherHours(tx, updated.opettajaId, oldHours - newHours);
      }

      return updated;
    });

    if (!result) return res.status(404).json({ error: 'Tapahtumaa ei löydy' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const createEvent = async (req: Request<{}, {}, CalendarBody>, res: Response) => {
  try {
    const start = new Date(req.body.alkaa);
    const end = new Date(req.body.paattyy);

    const result = await prisma.$transaction(async (tx) => {
      await CalendarService.validateEvent(tx, {
        huoneId: req.body.huoneId,
        opettajaId: req.body.opettajaId,
        ryhmaId: req.body.ryhmaId,
        start,
        end
      });

      const created = await tx.tyojarjestys.create({
        data: {
          tilaId: Number(req.body.huoneId),
          opettajaId: Number(req.body.opettajaId),
          kurssiId: Number(req.body.kurssiId),
          ryhmaId: Number(req.body.ryhmaId),
          alkaa: start,
          paattyy: end,
        },
        include: { tila: true, opettaja: true, kurssi: true },
      });

      const hours = CalendarService.durationHours(start, end);
      await CalendarService.adjustTeacherHours(tx, created.opettajaId, -hours);

      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const createManyEvents = async (req: Request<{}, {}, CalendarBody[]>, res: Response) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const event of req.body) {
        const start = new Date(event.alkaa);
        const end = new Date(event.paattyy);

        await CalendarService.validateEvent(tx, {
          huoneId: event.huoneId,
          opettajaId: event.opettajaId,
          ryhmaId: event.ryhmaId,
          start,
          end
        });

        const newEvent = await tx.tyojarjestys.create({
          data: {
            tilaId: Number(event.huoneId),
            opettajaId: Number(event.opettajaId),
            kurssiId: Number(event.kurssiId),
            ryhmaId: Number(event.ryhmaId),
            alkaa: start,
            paattyy: end,
          }
        });

        const hours = CalendarService.durationHours(start, end);
        await CalendarService.adjustTeacherHours(tx, newEvent.opettajaId, -hours);

        created.push(newEvent);
      }
      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};