import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { prisma } from './prismaClient'
import { Request, Response } from 'express'

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }))

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  try {
    // Only admin (Yllapitaja) logins are supported
    const admin = await prisma.yllapitaja.findUnique({ where: { kayttajatunnus: username } })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, admin.salasanaHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    return res.json({ user: { id: admin.id, username: admin.kayttajatunnus, nimi: admin.nimi } })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// Admin accounts must be created directly in the database; no account-creation endpoint is provided.

// No JWT authentication yet — simple stateless responses are returned from /login

app.get('/opettajat', async (_req: Request, res: Response) => {
  try {
    const opettajat = await prisma.opettaja.findMany()
    res.json(opettajat)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

app.post('/opettajat', async (req: Request, res: Response) => {
  const { nimi, sukunimi, sahkoposti, sopimustunnit = 0, vapaaResurssi = 0 } = req.body
  try {
    const opettaja = await prisma.opettaja.create({
      data: { nimi, sukunimi, sahkoposti, sopimustunnit, vapaaResurssi }
    })
    res.status(201).json(opettaja)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

app.get('/luokkahuoneet', async (_req: Request, res: Response) => {
  try {
    const tilat = await prisma.tila.findMany()
    res.json(tilat)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

app.post('/luokkahuoneet', async (req: Request, res: Response) => {
  const { huoneenNumero, kapasiteetti, tyyppi } = req.body
  try {
    const luokkahuone = await prisma.tila.create({
      data: { huoneenNumero: huoneenNumero, kapasiteetti: Number(kapasiteetti), tyyppi }
    })
    res.status(201).json(luokkahuone)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

app.get('/kurssit', async (_req: Request, res: Response) => {
  try {
    const kurssit = await prisma.kurssi.findMany()
    res.json(kurssit)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

app.post('/kurssit', async (req: Request, res: Response) => {
  const { nimi, koodi, opintopisteet, suunnittelutunnit } = req.body
  try {
    const kurssi = await prisma.kurssi.create({
      data: { nimi, koodi, opintopisteet: Number(opintopisteet), suunnitellutTunnit: Number(suunnittelutunnit) }
    })
    res.status(201).json(kurssi)
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
