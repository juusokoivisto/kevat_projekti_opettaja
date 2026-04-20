export const validateEvent = async (
  tx: any,
  data: {
    huoneId: number;
    opettajaId: number;
    ryhmaId: number;
    start: Date;
    end: Date;
  }
) => {
  const { huoneId, opettajaId, ryhmaId, start, end } = data;

  const lunchStart = new Date(start);
  lunchStart.setHours(11, 0, 0, 0);
  const lunchEnd = new Date(start);
  lunchEnd.setHours(11, 45, 0, 0);

  if (start < lunchEnd && end > lunchStart) {
    throw new Error(`Lounastauon päällekkäisyys päivänä ${start.toLocaleDateString('fi-FI')}`);
  }

  const [roomConflict, teacherConflict, groupConflict] = await Promise.all([
    tx.tyojarjestys.findFirst({ where: { tilaId: huoneId, alkaa: { lt: end }, paattyy: { gt: start } } }),
    tx.tyojarjestys.findFirst({ where: { opettajaId, alkaa: { lt: end }, paattyy: { gt: start } } }),
    tx.tyojarjestys.findFirst({ where: { ryhmaId, alkaa: { lt: end }, paattyy: { gt: start } } }),
  ]);

  const dateStr = start.toLocaleDateString('fi-FI');
  const errors: string[] = [];

  if (roomConflict) errors.push(`Huone on jo varattu päivänä ${dateStr}`);
  if (teacherConflict) errors.push(`Opettajalla on jo varaus päivänä ${dateStr}`);
  if (groupConflict) errors.push(`Ryhmällä on jo varaus päivänä ${dateStr}`);

  if (errors.length > 0) throw new Error(errors.join('\n'));
};