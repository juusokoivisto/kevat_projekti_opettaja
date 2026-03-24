const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
console.log('Prisma client keys:', Object.keys(p))
process.exit(0)
