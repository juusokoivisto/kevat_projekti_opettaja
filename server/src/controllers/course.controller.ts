import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CourseBody, DeleteRequest } from '../types';

export const getCourses = async (_req: Request, res: Response) => {
  try {
    const kurssit = await prisma.kurssi.findMany();
    res.json(kurssit);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createCourse = async (req: Request<{}, {}, CourseBody>, res: Response) => {
  const { nimi, koodi, opintopisteet, suunnitellutTunnit } = req.body;
  try {
    const kurssi = await prisma.kurssi.create({
      data: { nimi, koodi, opintopisteet: Number(opintopisteet), suunnitellutTunnit: Number(suunnitellutTunnit) }
    });
    res.status(201).json(kurssi);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteCourses = async (req: Request<{}, {}, DeleteRequest>, res: Response) => {
  const numericIds = req.body.ids.map(Number);
  try {
    await prisma.$transaction([
      prisma.tyojarjestys.deleteMany({ where: { kurssiId: { in: numericIds } } }),
      prisma.resurssivaraus.deleteMany({ where: { kurssiId: { in: numericIds } } }),
      prisma.kurssi.deleteMany({ where: { id: { in: numericIds } } }),
    ]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateCourse = async (
  req: Request<{ id: string }, {}, CourseBody>,
  res: Response
) => {
  const { id } = req.params;
  const { nimi, koodi, opintopisteet, suunnitellutTunnit } = req.body;

  try {
    const updated = await prisma.kurssi.update({
      where: { id: Number(id) },
      data: {
        nimi,
        koodi,
        opintopisteet: Number(opintopisteet),
        suunnitellutTunnit: Number(suunnitellutTunnit)
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};