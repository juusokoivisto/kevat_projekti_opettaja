import bcrypt from 'bcryptjs'
import { prisma } from '../prismaClient'

export async function seedAdmin() {
  const username = 'ADMIN'
  const password = '12345'
  const nimi = 'Admin'

  const existing = await prisma.yllapitaja.findUnique({ where: { kayttajatunnus: username } })
  if (existing) {
    console.log('Admin already exists:', existing.kayttajatunnus)
    return existing
  }

  const salasanaHash = await bcrypt.hash(password, 10)
  const created = await prisma.yllapitaja.create({
    data: { kayttajatunnus: username, salasanaHash, nimi }
  })

  console.log('Created admin:', { id: created.id, kayttajatunnus: created.kayttajatunnus })
  return created
}

if (require.main === module) {
  seedAdmin()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}