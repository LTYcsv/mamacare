import express from 'express'
import chatRouter from './routes/chat.js'
import summaryRouter from './routes/summary.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/chat', chatRouter)
app.use('/api/summary', summaryRouter)

app.listen(PORT, () => console.log(`Backend running on :${PORT}`))
