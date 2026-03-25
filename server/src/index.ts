import 'dotenv/config'
import express from 'express'
import { prisma } from './prismaClient'
import { Request, Response } from 'express'

const app = express()
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }))

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

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
