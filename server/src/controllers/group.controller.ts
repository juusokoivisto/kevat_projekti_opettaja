import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { GroupBody, DeleteRequest } from '../types';

const validateYear = (value: any) => {
  if (typeof value !== 'number') {
    return 'Aloitusvuosi täytyy olla numero';
  }

  if (!Number.isFinite(value)) {
    return 'Aloitusvuosi ei ole kelvollinen';
  }

  if (!Number.isInteger(value)) {
    return 'Aloitusvuosi täytyy olla kokonaisluku';
  }

  if (value < 1000 || value > 9999) {
    return 'Aloitusvuosi täytyy olla yli 1000';
  }

  return null;
};

const validateStudentCount = (value: any) => {
  if (typeof value !== 'number') {
    return 'Opiskelijamäärä täytyy olla numero';
  }

  if (!Number.isFinite(value)) {
    return 'Opiskelijamäärä ei ole kelvollinen';
  }

  if (!Number.isInteger(value)) {
    return 'Opiskelijamäärä täytyy olla kokonaisluku';
  }

  if (value <= 0) {
    return 'Opiskelijamäärä täytyy olla positiivinen';
  }

  if (value > 99) {
    return 'Opiskelijamäärä max 99';
  }

  return null;
};

export const getGroups = async (_req: Request, res: Response) => {
  try {
    const ryhmat = await prisma.opiskelijaryhma.findMany();
    res.json(ryhmat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createGroup = async (req: Request<{}, {}, GroupBody>, res: Response) => {
  const { ryhmatunnus, aloitusvuosi, opiskelijamaara, tutkintoOhjelma } = req.body;

  const vuosi = Number(aloitusvuosi);
  const maara = Number(opiskelijamaara);

  const yearError = validateYear(vuosi);
  if (yearError) {
    return res.status(400).json({ error: yearError });
  }

  const countError = validateStudentCount(maara);
  if (countError) {
    return res.status(400).json({ error: countError });
  }

  try {
    const ryhma = await prisma.opiskelijaryhma.create({
      data: {
        ryhmatunnus,
        aloitusvuosi: Number(aloitusvuosi),
        opiskelijamaara: Number(opiskelijamaara),
        tutkintoOhjelma
      }
    });
    res.status(201).json(ryhma);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteGroups = async (req: Request<{}, {}, DeleteRequest>, res: Response) => {
  const numericIds = req.body.ids.map(Number);
  try {
    await prisma.$transaction([
      prisma.tyojarjestys.deleteMany({ where: { ryhmaId: { in: numericIds } } }),
      prisma.resurssivaraus.deleteMany({ where: { ryhmaId: { in: numericIds } } }),
      prisma.opiskelijaryhma.deleteMany({ where: { id: { in: numericIds } } }),
    ]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateGroups = async (
  req: Request<{ id: string }, {}, GroupBody>,
  res: Response
) => {
  const { id } = req.params;
  const { ryhmatunnus, aloitusvuosi, opiskelijamaara, tutkintoOhjelma } = req.body;
  const vuosi = Number(aloitusvuosi);
  const maara = Number(opiskelijamaara);
  const yearError = validateYear(vuosi);
  if (yearError) {
    return res.status(400).json({ error: yearError });
  }

  const countError = validateStudentCount(maara);
  if (countError) {
    return res.status(400).json({ error: countError });
  }
  try {
    const updated = await prisma.opiskelijaryhma.update({
      where: { id: Number(id) },
      data: {
        ryhmatunnus,
        aloitusvuosi: Number(aloitusvuosi),
        opiskelijamaara: Number(opiskelijamaara),
        tutkintoOhjelma
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};