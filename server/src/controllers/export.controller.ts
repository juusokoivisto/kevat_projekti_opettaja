import { Request, Response } from 'express';
import { Workbook } from 'exceljs';
import { prisma } from '../config/prisma';
import { createEvents } from 'ics';

const toArr = (d: Date): [number, number, number, number, number] => [
  d.getFullYear(),
  d.getMonth() + 1,
  d.getDate(),
  d.getHours(),
  d.getMinutes(),
];

const fmt = (d: Date) =>
  d.toLocaleString('fi-FI', {
    timeZone: 'Europe/Helsinki',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const parseOpettajaId = (req: Request): number | undefined =>
  req.query.opettajaId ? parseInt(req.query.opettajaId as string) : undefined;

export const exportAllToExcel = async (req: Request, res: Response) => {
  const [opettajat, kurssit, ryhmat, varaukset, tyojarjestykset] = await Promise.all([
    prisma.opettaja.findMany({
      include: { opettajaKurssit: { include: { kurssi: true } } },
    }),
    prisma.kurssi.findMany(),
    prisma.opiskelijaryhma.findMany(),
    prisma.resurssivaraus.findMany({
      include: { opettaja: true, kurssi: true, ryhma: true },
    }),
    prisma.tyojarjestys.findMany({
      include: { opettaja: true, kurssi: true, ryhma: true, tila: true },
    }),
  ]);

  const workbook = new Workbook();

  const opettajatSheet = workbook.addWorksheet('Opettajat');
  opettajatSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Nimi', key: 'nimi' },
    { header: 'Sukunimi', key: 'sukunimi' },
    { header: 'Sähköposti', key: 'sahkoposti' },
    { header: 'Sopimustunnit', key: 'sopimustunnit' },
    { header: 'Vapaa resurssi', key: 'vapaaResurssi' },
    { header: 'Kurssit', key: 'kurssit' },
  ];
  opettajatSheet.addRows(
    opettajat.map((o) => ({
      ...o,
      kurssit: o.opettajaKurssit.map((ok) => ok.kurssi.nimi).join(', '),
    }))
  );

  const kurssitSheet = workbook.addWorksheet('Kurssit');
  kurssitSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Nimi', key: 'nimi' },
    { header: 'Koodi', key: 'koodi' },
    { header: 'Opintopisteet', key: 'opintopisteet' },
    { header: 'Suunnitellut tunnit', key: 'suunnitellutTunnit' },
  ];
  kurssitSheet.addRows(kurssit);

  const ryhmatSheet = workbook.addWorksheet('Opiskelijaryhmät');
  ryhmatSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Ryhmätunnus', key: 'ryhmatunnus' },
    { header: 'Aloitusvuosi', key: 'aloitusvuosi' },
    { header: 'Opiskelijamäärä', key: 'opiskelijamaara' },
    { header: 'Tutkinto-ohjelma', key: 'tutkintoOhjelma' },
  ];
  ryhmatSheet.addRows(ryhmat);

  const varauksetSheet = workbook.addWorksheet('Resurssivaraukset');
  varauksetSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Opettaja', key: 'opettaja' },
    { header: 'Kurssi', key: 'kurssi' },
    { header: 'Ryhmä', key: 'ryhma' },
    { header: 'Varatut tunnit', key: 'varatutTunnit' },
    { header: 'Rooli', key: 'rooli' },
  ];
  varauksetSheet.addRows(
    varaukset.map((v) => ({
      id: v.id,
      opettaja: `${v.opettaja.nimi} ${v.opettaja.sukunimi}`,
      kurssi: v.kurssi.nimi,
      ryhma: v.ryhma.ryhmatunnus,
      varatutTunnit: v.varatutTunnit,
      rooli: v.rooli,
    }))
  );

  const tyojarjestysSheet = workbook.addWorksheet('Työjärjestys');
  tyojarjestysSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Kurssi', key: 'kurssi' },
    { header: 'Opettaja', key: 'opettaja' },
    { header: 'Ryhmä', key: 'ryhma' },
    { header: 'Tila', key: 'tila' },
    { header: 'Alkaa', key: 'alkaa' },
    { header: 'Päättyy', key: 'paattyy' },
  ];
  tyojarjestysSheet.addRows(
    tyojarjestykset.map((t) => ({
      id: t.id,
      kurssi: t.kurssi.nimi,
      opettaja: `${t.opettaja.nimi} ${t.opettaja.sukunimi}`,
      ryhma: t.ryhma.ryhmatunnus,
      tila: t.tila.huoneenNumero,
      alkaa: fmt(t.alkaa),
      paattyy: fmt(t.paattyy),
    }))
  );

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="export.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

export const exportTeacherCalendarToExcel = async (req: Request, res: Response) => {
  const opettajaId = parseOpettajaId(req);

  if (!opettajaId) {
    res.status(400).json({ error: 'opettajaId is required' });
    return;
  }

  const where = { opettajaId };

  const [opettaja, varaukset, tyojarjestykset] = await Promise.all([
    prisma.opettaja.findUnique({
      where: { id: opettajaId },
      include: { opettajaKurssit: { include: { kurssi: true } } },
    }),
    prisma.resurssivaraus.findMany({
      where,
      include: { opettaja: true, kurssi: true, ryhma: true },
    }),
    prisma.tyojarjestys.findMany({
      where,
      include: { opettaja: true, kurssi: true, ryhma: true, tila: true },
    }),
  ]);

  if (!opettaja) {
    res.status(404).json({ error: 'Opettajaa ei löydy' });
    return;
  }

  const workbook = new Workbook();

  const tyojarjestysSheet = workbook.addWorksheet('Työjärjestys');
  tyojarjestysSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Kurssi', key: 'kurssi' },
    { header: 'Opettaja', key: 'opettaja' },
    { header: 'Ryhmä', key: 'ryhma' },
    { header: 'Tila', key: 'tila' },
    { header: 'Alkaa', key: 'alkaa' },
    { header: 'Päättyy', key: 'paattyy' },
  ];
  tyojarjestysSheet.addRows(
    tyojarjestykset.map((t) => ({
      id: t.id,
      kurssi: t.kurssi.nimi,
      opettaja: `${t.opettaja.nimi} ${t.opettaja.sukunimi}`,
      ryhma: t.ryhma.ryhmatunnus,
      tila: t.tila.huoneenNumero,
      alkaa: fmt(t.alkaa),
      paattyy: fmt(t.paattyy),
    }))
  );

  const varauksetSheet = workbook.addWorksheet('Resurssivaraukset');
  varauksetSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Kurssi', key: 'kurssi' },
    { header: 'Ryhmä', key: 'ryhma' },
    { header: 'Varatut tunnit', key: 'varatutTunnit' },
    { header: 'Rooli', key: 'rooli' },
  ];
  varauksetSheet.addRows(
    varaukset.map((v) => ({
      id: v.id,
      kurssi: v.kurssi.nimi,
      ryhma: v.ryhma.ryhmatunnus,
      varatutTunnit: v.varatutTunnit,
      rooli: v.rooli,
    }))
  );

  const filename = `kalenteri-${opettaja.sukunimi}-${opettaja.nimi}.xlsx`.toLowerCase().replace(/\s+/g, '-');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

export const exportToIcs = async (req: Request, res: Response) => {
  const opettajaId = parseOpettajaId(req);

  const tyojarjestykset = await prisma.tyojarjestys.findMany({
    where: opettajaId ? { opettajaId } : undefined,
    include: { opettaja: true, kurssi: true, ryhma: true, tila: true },
  });

  const { error, value } = createEvents(
    tyojarjestykset.map((t) => ({
      uid: `tyojarjestys-${t.id}@kalenteri`,
      title: `${t.kurssi.koodi} - ${t.kurssi.nimi}`,
      start: toArr(t.alkaa),
      end: toArr(t.paattyy),
      startInputType: 'utc' as const,
      endInputType: 'utc' as const,
      description: `Opettaja: ${t.opettaja.nimi} ${t.opettaja.sukunimi}\nRyhmä: ${t.ryhma.ryhmatunnus}`,
      location: `${t.tila.huoneenNumero} (${t.tila.tyyppi})`,
    }))
  );

  if (error || !value) {
    res.status(500).json({ error: 'Failed to generate calendar' });
    return;
  }

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="kalenteri.ics"');
  res.send(value);
};