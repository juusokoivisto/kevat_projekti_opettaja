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
  const { nimi, sukunimi, sahkoposti, sopimustunnit = 0, vapaaResurssi = 0, vari, courseIds = [] } = body;

  return prisma.$transaction(async (tx) => {
    const opettaja = await tx.opettaja.create({
      data: { nimi, sukunimi, sahkoposti, sopimustunnit, vapaaResurssi, vari },
    });

    for (const kurssiId of courseIds) {
      await tx.opettajaKurssi.create({ data: { opettajaId: opettaja.id, kurssiId } as any });
    }

    const full = await tx.opettaja.findUnique({ where: { id: opettaja.id }, include: includeKurssit });
    return full ? mapKurssit(full) : opettaja;
  });
};

export const updateTeacher = async (id: number, body: TeacherBody) => {
  const { nimi, sukunimi, sahkoposti, sopimustunnit, vari, courseIds = [] } = body;

  return prisma.$transaction(async (tx) => {
    await tx.opettaja.update({
      where: { id },
      data: { nimi, sukunimi, sahkoposti, sopimustunnit: Number(sopimustunnit), vari: vari ?? undefined },
    });

    await tx.opettajaKurssi.deleteMany({ where: { opettajaId: id } });

    for (const kurssiId of courseIds) {
      await tx.opettajaKurssi.create({ data: { opettajaId: id, kurssiId } as any });
    }

    const full = await tx.opettaja.findUnique({ where: { id }, include: includeKurssit });
    return full ? mapKurssit(full) : null;
  });
};

export const deleteTeachers = async (ids: number[]) => {
  await prisma.$transaction([
    prisma.tyojarjestys.deleteMany({ where: { opettajaId: { in: ids } } }),
    prisma.resurssivaraus.deleteMany({ where: { opettajaId: { in: ids } } }),
    prisma.opettaja.deleteMany({ where: { id: { in: ids } } }),
  ]);
};