import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { TeacherBody, DeleteRequest } from '../types';

export const getTeachers = async (_req: Request, res: Response) => {
  try {
    const opettajat = await prisma.opettaja.findMany({
      include: { opettajaKurssit: { include: { kurssi: true } } }
    });

    const mapped = opettajat.map(o => {
      // @ts-ignore
      const kurssit = (o.opettajaKurssit || []).map((r: any) => r.kurssi);
      // @ts-ignore
      return { ...o, kurssit };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createTeacher = async (req: Request<{}, {}, TeacherBody>, res: Response) => {
  const { nimi, sukunimi, sahkoposti, sopimustunnit = 0, vapaaResurssi = 0, vari, courseIds = [] } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const opettaja = await tx.opettaja.create({
        data: { nimi, sukunimi, sahkoposti, sopimustunnit, vapaaResurssi, vari }
      });

      if (Array.isArray(courseIds) && courseIds.length > 0) {
        const relationData = courseIds.map((kurssiId) => ({ opettajaId: opettaja.id, kurssiId }));
        for (const d of relationData) {
          try {
            // create individually; ignore duplicate errors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await tx.opettajaKurssi.create({ data: d as any });
          } catch (e: any) {
            // ignore unique constraint errors (duplicate pairs)
            if (e?.code && String(e.code).startsWith('P2')) continue;
            throw e;
          }
        }
      }

      const full = await tx.opettaja.findUnique({
        where: { id: opettaja.id },
        include: { opettajaKurssit: { include: { kurssi: true } } }
      });

      
      if (full) {
        
        const kurssit = full.opettajaKurssit.map((r: any) => r.kurssi);
        
        return { ...full, kurssit };
      }

      return opettaja;
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteTeachers = async (req: Request<{}, {}, DeleteRequest>, res: Response) => {
  const numericIds = req.body.ids.map(Number);
  try {
    await prisma.$transaction([
      prisma.tyojarjestys.deleteMany({ where: { opettajaId: { in: numericIds } } }),
      prisma.resurssivaraus.deleteMany({ where: { opettajaId: { in: numericIds } } }),
      prisma.opettaja.deleteMany({ where: { id: { in: numericIds } } }),
    ]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getTeacherById = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    const opettaja = await prisma.opettaja.findUnique({
      where: { id: Number(id) },
      include: { opettajaKurssit: { include: { kurssi: true } } }
    });

    if (!opettaja) {
      return res.status(404).json({ error: 'Opettajaa ei löytynyt' });
    }

    // map relation to kurssit for frontend convenience
    // @ts-ignore
    const kurssit = (opettaja.opettajaKurssit || []).map((r: any) => r.kurssi);
    // @ts-ignore
    res.json({ ...opettaja, kurssit });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateTeacher = async (
  req: Request<{ id: string }, {}, TeacherBody>,
  res: Response
) => {
  const { id } = req.params;
  const { nimi, sukunimi, sahkoposti, sopimustunnit, vari, courseIds = [] } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.opettaja.update({
        where: { id: Number(id) },
        data: {
          nimi,
          sukunimi,
          sahkoposti,
          sopimustunnit: Number(sopimustunnit),
          vari: vari ?? undefined,
        }
      });

    
      await tx.opettajaKurssi.deleteMany({ where: { opettajaId: Number(id) } });
      if (Array.isArray(courseIds) && courseIds.length > 0) {
        const relationData = courseIds.map((kurssiId) => ({ opettajaId: Number(id), kurssiId }));
        for (const d of relationData) {
          try {
            await tx.opettajaKurssi.create({ data: d as any });
          } catch (e: any) {
            if (e?.code && String(e.code).startsWith('P2')) continue;
            throw e;
          }
        }
      }

      const full = await tx.opettaja.findUnique({
        where: { id: Number(id) },
        include: { opettajaKurssit: { include: { kurssi: true } } }
      });

      if (full) {
        
        const kurssit = full.opettajaKurssit.map((r: any) => r.kurssi);
       
        return { ...full, kurssit };
      }

      return updated;
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};