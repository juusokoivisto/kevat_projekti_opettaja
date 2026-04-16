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

  const conflict = await tx.tyojarjestys.findFirst({
    where: {
      OR: [
        { tilaId: huoneId },
        { opettajaId: opettajaId },
        { ryhmaId: ryhmaId }
      ],
      alkaa: { lt: end },
      paattyy: { gt: start }
    }
  });

  if (conflict) {
    const dateStr = start.toLocaleDateString('fi-FI');
    if (conflict.tilaId === huoneId) throw new Error(`Huone on jo varattu päivänä ${dateStr}`);
    if (conflict.opettajaId === opettajaId) throw new Error(`Opettajalla on jo varaus päivänä ${dateStr}`);
    if (conflict.ryhmaId === ryhmaId) throw new Error(`Ryhmällä on jo varaus päivänä ${dateStr}`);
  }
};