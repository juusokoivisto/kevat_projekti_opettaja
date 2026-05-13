import { prisma } from '../config/prisma';
import { TeacherBody } from '../types';

const includeKurssit = {
  opettajaKurssit: { include: { kurssi: true } },
} as const;

const mapKurssit = (o: any) => ({
  ...o,
  kurssit: (o.opettajaKurssit || []).map((r: any) => r.kurssi),
});

export const findAllTeachers = async () => {
  const opettajat = await prisma.opettaja.findMany({ include: includeKurssit });
  return opettajat.map(mapKurssit);
};

export const findTeacherById = async (id: number) => {
  const opettaja = await prisma.opettaja.findUnique({ where: { id }, include: includeKurssit });
  return opettaja ? mapKurssit(opettaja) : null;
};

export const createTeacher = async (body: TeacherBody) => {
  const { nimi, sukunimi, sahkoposti, sopimustunnit = 0, vapaaResurssi, vari, courseIds = [] } = body;

  // If vapaaResurssi not provided, initialize it equal to sopimustunnit
  const initialVapaa = typeof vapaaResurssi === 'number' ? vapaaResurssi : sopimustunnit;

  return prisma.$transaction(async (tx) => {
    const opettaja = await tx.opettaja.create({
      data: { nimi, sukunimi, sahkoposti, sopimustunnit, vapaaResurssi: initialVapaa, vari },
    });

    for (const kurssiId of courseIds) {
      await tx.opettajaKurssi.create({ data: { opettajaId: opettaja.id, kurssiId } as any });
    }

    const full = await tx.opettaja.findUnique({ where: { id: opettaja.id }, include: includeKurssit });
    return full ? mapKurssit(full) : opettaja;
  });
};

export const updateTeacher = async (id: number, body: TeacherBody) => {
  const {
    nimi,
    sukunimi,
    sahkoposti,
    sopimustunnit,
    vari,
    courseIds = []
  } = body;

  return prisma.$transaction(async (tx) => {

    const existing = await tx.opettaja.findUnique({
      where: { id }
    });

    if (!existing) return null;

    const events = await tx.tyojarjestys.findMany({
      where: { opettajaId: id },
    });

    const usedHours = events.reduce((sum, e) => {
      const start = new Date(e.alkaa);
      const end = new Date(e.paattyy);

      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const newHours = Number(sopimustunnit);

    if (newHours < usedHours) {
      throw new Error(
        `Sopimustunnit eivät voi olla alle käytettyjen tuntien (${usedHours.toFixed(1)} h)`
      );
    }

    const oldHours = Number(existing.sopimustunnit);
    const oldFree = Number(existing.vapaaResurssi);

    const diff = newHours - oldHours;
    const newFree = Math.max(0, oldFree + diff);

    await tx.opettaja.update({
      where: { id },
      data: {
        nimi,
        sukunimi,
        sahkoposti,
        sopimustunnit: newHours,
        vapaaResurssi: newFree,
        vari: vari ?? undefined,
      },
    });

    await tx.opettajaKurssi.deleteMany({
      where: { opettajaId: id }
    });

    for (const kurssiId of courseIds) {
      await tx.opettajaKurssi.create({
        data: {
          opettajaId: id,
          kurssiId
        } as any
      });
    }

    const full = await tx.opettaja.findUnique({
      where: { id },
      include: includeKurssit
    });

    return full ? mapKurssit(full) : null;
  });
};

export const deleteTeachers = async (ids: number[]) => {
  await prisma.$transaction([
    prisma.tyojarjestys.deleteMany({ where: { opettajaId: { in: ids } } }),
    prisma.resurssivaraus.deleteMany({ where: { opettajaId: { in: ids } } }),
    prisma.opettajaKurssi.deleteMany({ where: { opettajaId: { in: ids } } }),
    prisma.opettaja.deleteMany({ where: { id: { in: ids } } }),
  ]);
};