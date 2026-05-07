import express from 'express'
import 'express-async-errors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import authRouter from './routes/auth.js'
import chatRouter from './routes/chat.js'
import summaryRouter from './routes/summary.js'
import usersRouter from './routes/users.js'
import entriesRouter from './routes/entries.js'

const app = express()
const PORT = process.env.PORT || 3001

app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток, попробуйте через минуту' },
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authLimiter, authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/summary', summaryRouter)
app.use('/api/users', usersRouter)
app.use('/api/entries', entriesRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal' })
})

app.listen(PORT, () => console.log(`Backend running on :${PORT}`))
