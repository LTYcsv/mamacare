import { Router } from 'express'

const router = Router()

router.post('/', async (req, res) => {
  const { input } = req.body
  if (!input?.trim()) return res.status(400).json({ error: 'input required' })

  const response = await fetch('https://ai.api.cloud.yandex.net/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
      'x-folder-id': process.env.YANDEX_FOLDER_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: { id: process.env.YANDEX_CHAT_AGENT_ID },
      input,
    }),
  })

  const data = await response.json()
  const msg = data?.output?.filter(b => b.type === 'message').pop()
  const reply = msg?.content?.[0]?.text

  res.json({ reply: reply || 'Не удалось получить ответ.' })
})

export default router
