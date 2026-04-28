import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import chatRouter from './routes/chat.js'
import summaryRouter from './routes/summary.js'
import usersRouter from './routes/users.js'
import entriesRouter from './routes/entries.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/summary', summaryRouter)
app.use('/api/users', usersRouter)
app.use('/api/entries', entriesRouter)

app.listen(PORT, () => console.log(`Backend running on :${PORT}`))
