import { PrismaClient } from '@prisma/client';
import { fakerFI as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const tilat = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.tila.create({
        data: {
          huoneenNumero: faker.helpers.replaceSymbols('###'),
          kapasiteetti: faker.number.int({ min: 15, max: 60 }),
          tyyppi: faker.helpers.arrayElement(['Luentosali', 'Laboratorio', 'Pienryhmätila']),
        },
      })
    )
  );

  // 2. Teachers (Opettaja)
  const opettajat = await Promise.all(
    Array.from({ length: 15 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return prisma.opettaja.create({
        data: {
          nimi: firstName,
          sukunimi: lastName,
          sahkoposti: faker.internet.email({ firstName, lastName }).toLowerCase(),
          sopimustunnit: faker.number.int({ min: 800, max: 1600 }),
          vapaaResurssi: faker.number.int({ min: 0, max: 200 }),
        },
      });
    })
  );

  // 3. Courses (Kurssi)
  const kurssit = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.kurssi.create({
        data: {
          nimi: faker.company.catchPhrase(), // Or a custom list of school subjects
          koodi: faker.helpers.replaceSymbols('???-####').toUpperCase(),
          opintopisteet: faker.helpers.arrayElement([3, 5, 10]),
          suunnitellutTunnit: faker.number.int({ min: 20, max: 60 }),
        },
      })
    )
  );

  // 4. Groups (Opiskelijaryhma)
  const ryhmat = await Promise.all(
    Array.from({ length: 8 }).map(() =>
      prisma.opiskelijaryhma.create({
        data: {
          ryhmatunnus: `RYH${faker.string.numeric(2)}${faker.string.alpha(1).toUpperCase()}`,
          aloitusvuosi: faker.number.int({ min: 2022, max: 2025 }),
          opiskelijamaara: faker.number.int({ min: 10, max: 40 }),
          tutkintoOhjelma: faker.helpers.arrayElement([
            'Tietotekniikka',
            'Liiketalous',
            'Sairaanhoito',
            'Konetekniikka'
          ]),
        },
      })
    )
  );

  console.log({
    tilat: tilat.length,
    opettajat: opettajat.length,
    kurssit: kurssit.length,
    ryhmat: ryhmat.length,
  });
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });