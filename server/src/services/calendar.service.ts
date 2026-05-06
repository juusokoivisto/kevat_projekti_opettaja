export const adjustTeacherHours = async (
  tx: any,
  opettajaId: number,
  delta: number
) => {
  const teacher = await tx.opettaja.findUnique({ where: { id: opettajaId } });
  if (!teacher) return;
  const updated = Math.max(0, (teacher.vapaaResurssi ?? 0) + delta);
  await tx.opettaja.update({ where: { id: opettajaId }, data: { vapaaResurssi: updated } });
};

export const durationHours = (start: Date, end: Date): number =>
  Math.ceil(Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60)));

export const validateEvent = async (
  tx: any,
  data: {
    id?: number;
    huoneId: number;
    opettajaId: number;
    ryhmaId: number;
    start: Date;
    end: Date;
  }
) => {
  const { id, huoneId, opettajaId, ryhmaId, start, end } = data;

  const notSelf = id ? { NOT: { id } } : {};

  const lunchStart = new Date(start);
  lunchStart.setHours(11, 0, 0, 0);
  const lunchEnd = new Date(start);
  lunchEnd.setHours(11, 45, 0, 0);

  if (start < lunchEnd && end > lunchStart) {
    throw new Error(`Lounastauon päällekkäisyys päivänä ${start.toLocaleDateString('fi-FI')}`);
  }

  const [roomConflict, teacherConflict, groupConflict] = await Promise.all([
    tx.tyojarjestys.findFirst({ where: { ...notSelf, tilaId: huoneId, alkaa: { lt: end }, paattyy: { gt: start } } }),
    tx.tyojarjestys.findFirst({ where: { ...notSelf, opettajaId, alkaa: { lt: end }, paattyy: { gt: start } } }),
    tx.tyojarjestys.findFirst({ where: { ...notSelf, ryhmaId, alkaa: { lt: end }, paattyy: { gt: start } } }),
  ]);

  const dateStr = start.toLocaleDateString('fi-FI');
  const errors: string[] = [];

  const teacher = await tx.opettaja.findUnique({
    where: { id: opettajaId }
  });

  const newHours = durationHours(start, end);

  if (!id) {
    if ((teacher.vapaaResurssi ?? 0) < newHours) {
      errors.push('Opettajalla ei ole riittävästi vapaita tunteja');
    }
  }

  
  if (id) {
    const existing = await tx.tyojarjestys.findUnique({
      where: { id }
    });

    const oldHours = durationHours(existing.alkaa, existing.paattyy);
    const diff = newHours - oldHours;

    if (diff > 0 && (teacher.vapaaResurssi ?? 0) < diff) {
      errors.push('Opettajalla ei ole riittävästi vapaita tunteja tähän muutokseen');
    }
  }

  if (roomConflict) errors.push(`Huone on jo varattu päivänä ${dateStr}`);
  if (teacherConflict) errors.push(`Opettajalla on jo varaus päivänä ${dateStr}`);
  if (groupConflict) errors.push(`Ryhmällä on jo varaus päivänä ${dateStr}`);

  if (errors.length > 0) throw new Error(errors.join('\n'));
};